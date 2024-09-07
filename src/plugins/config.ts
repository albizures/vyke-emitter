import type { EmitterHandler, EventName, Events, Unsubscribe, WithOn } from '../core'
import type { InferEvents, Simplify } from '../types'
import { type MaybeWithOnce, type WithOnce, hasOnce } from './once'
import { type MaybeWithWatcher, type WatcherHandler, type WithWatcher, hasWatcher } from './watcher'

type MaybeWithOnceAndConfig<
	TEvents extends Events,
	TEmitter, TConfig,
> = TEmitter extends WithOnce<TEvents>
	? WithOnce<TEvents, TConfig>
	: object

type MaybeWithWatcherAndConfig<
	TEvents extends Events,
	TEmitter,
	TConfig,
> = TEmitter extends WithWatcher<TEvents>
	? WithWatcher<TEvents, TConfig>
	: object

export type ConfigHandlerContext<TEmitter> = {
	name?: EventName
	handler: EmitterHandler<any> | WatcherHandler<any>
	emitter: TEmitter
	off: Unsubscribe
}

export type ConfigHandler<TConfig, TEmitter> = (value: TConfig, context: ConfigHandlerContext<TEmitter>) => void

type InferConfigValues<TConfigHandler> = TConfigHandler extends ConfigHandler<infer TConfigValues, any> ? TConfigValues : never

export type WithConfig<TEmitter, TConfig, TEvents extends Events = InferEvents<TEmitter>> = Simplify<
	& TEmitter
	& WithOn<TEvents, TConfig>
	& MaybeWithWatcherAndConfig<TEvents, TEmitter, TConfig>
	& MaybeWithOnceAndConfig<TEvents, TEmitter, TConfig>
>

type EmitterToExtend<TEvents extends Events> = WithOn<TEvents>
	& MaybeWithWatcher<TEvents>
	& MaybeWithOnce<TEvents>

export type WihtConfigPlugin<TConfig> = <
	TEmitter extends EmitterToExtend<TEvents>,
	TEvents extends Events = InferEvents<TEmitter>,
>(source: TEmitter) => WithConfig<TEmitter, TConfig, TEvents>

/**
 * Plugin that allows for adding configuration to event handlers.
 *
 * @param configHandler a function that will be called with the config object and the context
 * @example
 * ```ts
 * const withLog = withConfig((config, { name, handler }) => {
 * 	if (config.log) {
 * 		console.log(`Adding handler for ${name}`)
 * 	}
 * })
 *
 * const emitter = createEmitter().use(withLog)
 *
 * emitter.on('foo', () => {})
 * // Logs: Adding handler for foo
 * ```
 */
export function withConfig<
	TConfigHandler extends ConfigHandler<any, any>,
>(configHandler: TConfigHandler): WihtConfigPlugin<InferConfigValues<TConfigHandler>> {
	type TConfig = InferConfigValues<TConfigHandler>

	const plugin: WihtConfigPlugin<TConfig> = <
		TEmitter extends EmitterToExtend<TEvents>,
		TEvents extends Events = InferEvents<TEmitter>,
	>(source: TEmitter) => {
		const { on } = source

		let emitter = {
			...source,
			on<TName extends keyof TEvents>(name: TName, handler: EmitterHandler<TEvents[TName]>, config?: TConfig): Unsubscribe {
				const off = on(name, handler)
				if (config) {
					configHandler(config, {
						name,
						handler,
						emitter: source,
						off,
					})
				}

				return off
			},
		}

		if (hasOnce(emitter)) {
			const { once } = emitter
			emitter = {
				...emitter,
				once<TName extends keyof TEvents>(name: TName, handler: EmitterHandler<TEvents[TName]>, config?: TConfig): Unsubscribe {
					const off = once(name, handler)
					if (config) {
						configHandler(config, {
							name,
							handler,
							emitter: source,
							off,
						})
					}

					return off
				},
			}

			if (hasWatcher(emitter)) {
				const { watch } = emitter
				emitter = {
					...emitter,
					watch(handler: WatcherHandler<TEvents>, config?: TConfig): Unsubscribe {
						const off = watch(handler)
						if (config) {
							configHandler(config, {
								handler,
								emitter: source,
								off,
							})
						}

						return off
					},
				}
			}
		}

		return emitter as WithConfig<TEmitter, TConfig, TEvents>
	}
	return plugin
}

export type Group = {
	off(): void
	add(unsubscribe: Unsubscribe): void
}

export function createGroup(): Group {
	const unsubscribes = new Set<Unsubscribe>()
	return {
		add(unsubscribe: Unsubscribe) {
			unsubscribes.add(unsubscribe)
		},
		off() {
			unsubscribes.forEach((unsubscribe) => unsubscribe())
		},
	}
}

export type MaybeWithGroups = {
	group?: Group
}

export function withGroups(values: MaybeWithGroups, context: ConfigHandlerContext<unknown>) {
	values.group?.add(context.off)
}
