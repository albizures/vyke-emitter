import type { EmitterHandler, Events, Unsubscribe, WithOff, WithOn } from '../core'
import type { InferEvents, Simplify } from '../types'

export type WithOnce<TEvents extends Events, TOptions = never> = {
	/**
	 * Register an event handler with the given name that will only be called once
	 * @param name Name of event to listen for
	 * @param handler Function to call in response to given event
	 */
	once<TName extends keyof TEvents>(name: TName, handler: EmitterHandler<TEvents[TName]>, options?: TOptions): Unsubscribe
}

export type MaybeWithOnce<TEvents extends Events> = Partial<WithOnce<TEvents>>

export function withOnce<
	TEmitter extends WithOn<TEvents> & WithOff<TEvents>,
	TEvents extends Events = InferEvents<TEmitter>,
>(source: TEmitter): Simplify<TEmitter & WithOnce<TEvents>> {
	const { on, off } = source
	const emitter = {
		...source,
		once<TName extends keyof TEvents>(name: TName, handler: EmitterHandler<TEvents[TName]>): Unsubscribe {
			const unsubscribe = on(name, handler)

			on(name, function onceHandler() {
				unsubscribe()
				off(name, onceHandler)
			})

			return unsubscribe
		},
	}

	return emitter
}

export function hasOnce(emitter: any): emitter is WithOnce<Events> {
	return emitter && typeof emitter.once === 'function'
}
