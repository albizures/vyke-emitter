import type { Events, Unsubscribe, WithEmit } from '../core'
import type { InferEvents } from '../types'

export type WatcherHandler<TEvents = Record<string, unknown>> = (...args: {
	[TName in keyof TEvents]: [name: TName, eventValue: TEvents[TName]]
}[keyof TEvents]) => void

export type WithWatcher<TEvents extends Events, TOptions = never> = {
	/**
	 * Register an event handler for all events
	 * @param handler Function to call in response to any event
	 */
	watch(handler: WatcherHandler<TEvents>, options?: TOptions): Unsubscribe
	/**
	 * Remove an event handler for all events or all handlers
	 * @param [handler] Handler function to remove or omit to remove all handlers
	 */
	unwatch(handler?: WatcherHandler<TEvents>): void
}

export type MaybeWithWatcher<TEvents extends Events> = Partial<WithWatcher<TEvents>>

export function withWatcher<
	TEmitter extends WithEmit<TEvents>,
	TEvents extends Events = InferEvents<TEmitter>,
>(source: TEmitter): WithWatcher<TEvents> & TEmitter {
	let handlers = new Set<WatcherHandler<TEvents>>()

	const { emit } = source
	const emitter = {
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
	}

	return emitter
}

export function hasWatcher(emitter: any): emitter is WithWatcher<Events> {
	return emitter && typeof emitter.watch === 'function'
}
