import type { Emitter, EmitterHandler, EventName, Events, Unsubscribe } from '../core'
import { type EmitterPlugin, use } from '../plugin'
import type { InferEvents, Simplify } from '../types'
import type { WithOnce } from './once'
import type { WatcherHandler, WithWatcher } from './watcher'

type MaybeWithOnce<TEvents extends Events, TEmitter extends Emitter<TEvents>> = {
	once?: WithOnce<TEvents, TEmitter>['once']
}

type MaybeWithWatcher<TEvents extends Events, TEmitter extends Emitter<TEvents>> = {
	watch?: WithWatcher<TEvents, TEmitter>['watch']
}

type WithOnceAndConfig<
	TEvents extends Events,
	TWithOnce extends Emitter<TEvents>,
	TConfig,
> = TWithOnce extends WithOnce<TEvents, infer TEmitter extends Emitter<TEvents>>
	? Simplify<Omit<WithOnce<TEvents, TEmitter>, 'once'> & {
		/**
		 * Register an event handler with the given name that will only be called once
		 * @param name Name of event to listen for
		 * @param handler Function to call in response to given event
		 */
		once<TName extends keyof TEvents>(name: TName, handler: EmitterHandler<TEvents[TName]>, config: TConfig): Unsubscribe
	}>
	: object

/**
 * Replace the `watch` method with a version that accepts a config object.
 */
type WithWatcherAndConfig<
	TEvents extends Events,
	TWithWatcher extends Emitter<TEvents>,
	TConfig,
> = TWithWatcher extends WithWatcher<TEvents, infer TEmitter extends Emitter<TEvents>>
	? Simplify<Omit<WithWatcher<TEvents, TEmitter>, 'watch'> & {
		/**
		 * Register an event handler for all events
		 * @param handler Function to call in response to any event
		 */
		watch?(handler: WatcherHandler<TEvents>, config?: TConfig): Unsubscribe
	}>
	: object

/**
 * Replace the `on` method with a version that accepts a config object.
 * And in case the emitter has a `watch` method, replace it with a version that accepts a config object.
 */
export type WithConfig<
	TEvents extends Events,
	TEmitter extends Emitter<TEvents>,
	TConfig,
> = Simplify<
	Omit<TEmitter, 'on'>
	& WithWatcherAndConfig<TEvents, TEmitter, TConfig>
	& WithOnceAndConfig<TEvents, TEmitter, TConfig>
	& {
		/**
		 * Register an event handler for the given type.
		 * @param name Name of event to listen for
		 * @param handler Function to call in response to given event
		 * @memberOf mitt
		 */
		on<TName extends keyof TEvents>(name: TName, handler: EmitterHandler<TEvents[TName]>, config?: TConfig): Unsubscribe
		/**
		 * Extend the emitter with a plugin
		 */
		use<TOut>(plugin: EmitterPlugin<WithConfig<TEvents, TEmitter, TConfig>, TOut>): TOut
	}
>

export type ConfigHandlerContext = {
	name?: EventName
	handler: EmitterHandler<any> | WatcherHandler<any>
	emitter: Emitter<any>
	off: Unsubscribe
}

export type ConfigHandler<TConfig> = (value: TConfig, context: ConfigHandlerContext) => void

type InferConfigValues<TConfigHandler> = TConfigHandler extends ConfigHandler<infer TConfigValues> ? TConfigValues : never

export type WihtConfigPlugin<TConfigHandler> = <
	TEmitter extends Emitter<TEvents>
	& MaybeWithWatcher<TEvents, TEmitter>
	& MaybeWithOnce<TEvents, TEmitter>,
	TEvents extends Events = InferEvents<TEmitter>,
>(source: TEmitter) => WithConfig<TEvents, TEmitter, InferConfigValues<TConfigHandler>>
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
	TConfigHandler extends ConfigHandler<any>,
>(configHandler: TConfigHandler): WihtConfigPlugin<TConfigHandler> {
	return <
		TEmitter extends Emitter<TEvents> & MaybeWithWatcher<TEvents, TEmitter> & MaybeWithOnce<TEvents, TEmitter>,
		TEvents extends Events = InferEvents<TEmitter>,
	>(source: TEmitter): WithConfig<TEvents, TEmitter, InferConfigValues<TConfigHandler>> => {
		const { on, watch, once } = source

		const emitter = {
			...source,
			on<TName extends keyof TEvents>(name: TName, handler: EmitterHandler<TEvents[TName]>, config?: InferConfigValues<TConfigHandler>): Unsubscribe {
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
			watch(handler: WatcherHandler<TEvents>, config?: InferConfigValues<TConfigHandler>): Unsubscribe {
				const off = watch!(handler)

				if (config) {
					configHandler(config, {
						handler,
						emitter: source,
						off,
					})
				}

				return off
			},
			once<TName extends keyof TEvents>(name: TName, handler: EmitterHandler<TEvents[TName]>, config?: InferConfigValues<TConfigHandler>): Unsubscribe {
				const off = once!(name, handler)
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
			use,
		}

		return emitter as WithConfig<TEvents, TEmitter, InferConfigValues<TConfigHandler>>
	}
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

type MaybeWithGroups = {
	group?: Group
}

export function withGroups(values: MaybeWithGroups, context: ConfigHandlerContext) {
	values.group?.add(context.off)
}
