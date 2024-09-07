import type { EmitterHandler, EventName, Events, Unsubscribe, WithOn } from '../core'
import type { InferEvents, Simplify } from '../types'
import { type MaybeWithOnce, type WithOnce, hasOnce } from './once'
import { type MaybeWithWatcher, type WatcherHandler, type WithWatcher, hasWatcher } from './watcher'

type MaybeWithOnceAndOptions<
	TEvents extends Events,
	TEmitter, TOptions,
> = TEmitter extends WithOnce<TEvents>
	? WithOnce<TEvents, TOptions>
	: object

type MaybeWithWatcherAndOptions<
	TEvents extends Events,
	TEmitter,
	TOptions,
> = TEmitter extends WithWatcher<TEvents>
	? WithWatcher<TEvents, TOptions>
	: object

export type OptionsHandlerContext<TEmitter> = {
	name?: EventName
	handler: EmitterHandler<any> | WatcherHandler<any>
	emitter: TEmitter
	off: Unsubscribe
}

export type OptionsHandler<TOptions, TEmitter> = (value: TOptions, context: OptionsHandlerContext<TEmitter>) => void

type InferOptions<TOptionsHandler> = TOptionsHandler extends OptionsHandler<infer TOptionsValues, any>
	? TOptionsValues
	: never

export type WithOptions<TEmitter, TOptions, TEvents extends Events = InferEvents<TEmitter>> = Simplify<
	& TEmitter
	& WithOn<TEvents, TOptions>
	& MaybeWithWatcherAndOptions<TEvents, TEmitter, TOptions>
	& MaybeWithOnceAndOptions<TEvents, TEmitter, TOptions>
>

type EmitterToExtend<TEvents extends Events> = WithOn<TEvents>
	& MaybeWithWatcher<TEvents>
	& MaybeWithOnce<TEvents>

export type WihtOptionsPlugin<TOptions> = <
	TEmitter extends EmitterToExtend<TEvents>,
	TEvents extends Events = InferEvents<TEmitter>,
>(source: TEmitter) => WithOptions<TEmitter, TOptions, TEvents>

/**
 * Plugin that allows for adding options to event handlers.
 *
 * @param optionHandler a function that will be called with the options object and the context
 * @example
 * ```ts
 * const withLog = withOptions((options, { name, handler }) => {
 * 	if (options.log) {
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
export function withOptions<
	THandler extends OptionsHandler<any, any>,
>(optionHandler: THandler): WihtOptionsPlugin<InferOptions<THandler>> {
	type TOptions = InferOptions<THandler>

	const plugin: WihtOptionsPlugin<TOptions> = <
		TEmitter extends EmitterToExtend<TEvents>,
		TEvents extends Events = InferEvents<TEmitter>,
	>(source: TEmitter) => {
		const { on } = source

		let emitter = {
			...source,
			on<TName extends keyof TEvents>(name: TName, handler: EmitterHandler<TEvents[TName]>, options?: TOptions): Unsubscribe {
				const off = on(name, handler)
				if (options) {
					optionHandler(options, {
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
				once<TName extends keyof TEvents>(name: TName, handler: EmitterHandler<TEvents[TName]>, options?: TOptions): Unsubscribe {
					const off = once(name, handler)
					if (options) {
						optionHandler(options, {
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
					watch(handler: WatcherHandler<TEvents>, options?: TOptions): Unsubscribe {
						const off = watch(handler)
						if (options) {
							optionHandler(options, {
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

		return emitter as WithOptions<TEmitter, TOptions, TEvents>
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

export function withGroups(options: MaybeWithGroups, context: OptionsHandlerContext<unknown>) {
	options.group?.add(context.off)
}
