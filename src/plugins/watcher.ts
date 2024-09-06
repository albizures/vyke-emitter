import type { Emitter, Events, Unsubscribe } from '../core'
import { type EmitterPlugin, use } from '../plugin'
import type { InferEvents, Simplify } from '../types'

export type WatcherHandler<TEvents = Record<string, unknown>> = (...args: {
	[TName in keyof TEvents]: [name: TName, eventValue: TEvents[TName]]
}[keyof TEvents]) => void

export type WithWatcher<
	TEvents extends Events,
	TEmitter extends Emitter<TEvents>,
> = Simplify<Omit<TEmitter, 'use'> & {
	/**
	 * Register an event handler for all events
	 * @param handler Function to call in response to any event
	 */
	watch(handler: WatcherHandler<TEvents>): Unsubscribe
	/**
	 * Remove an event handler for all events or all handlers
	 * @param [handler] Handler function to remove or omit to remove all handlers
	 */
	unwatch(handler?: WatcherHandler<TEvents>): void

	/**
	 * Extend the emitter with a plugin
	 */
	use<TOut>(plugin: EmitterPlugin<WithWatcher<TEvents, TEmitter>, TOut>): TOut
}>

export function withWatcher<
	TEmitter extends Emitter<TEvents>,
	TEvents extends Events = InferEvents<TEmitter>,
>(source: TEmitter): WithWatcher<TEvents, TEmitter> {
	let handlers = new Set<WatcherHandler<TEvents>>()

	const { emit } = source
	const emitter: WithWatcher<TEvents, TEmitter> = {
		...source,
		watch(handler: WatcherHandler<TEvents>) {
			handlers.add(handler)
			return () => {
				handlers.delete(handler)
			}
		},
		unwatch(handler?: WatcherHandler<TEvents>) {
			if (handler) {
				handlers.delete(handler)
			}
			else {
				handlers.clear()
			}
		},

		emit<TName extends keyof TEvents>(name: TName, eventValue: TEvents[TName]) {
			emit(name, eventValue)
			handlers.forEach((handler) => handler(name, eventValue))
		},
		use,
	}

	return emitter
}
