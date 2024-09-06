import type { Emitter, EmitterHandler, Events, Unsubscribe } from '../core'
import { type EmitterPlugin, use } from '../plugin'
import type { InferEvents, Simplify } from '../types'

export type WithOnce<
	TEvents extends Events,
	TEmitter extends Emitter<TEvents>,
> = Simplify<Omit<TEmitter, 'use'> & {
	/**
	 * Register an event handler with the given name that will only be called once
	 * @param name Name of event to listen for
	 * @param handler Function to call in response to given event
	 */
	once<TName extends keyof TEvents>(name: TName, handler: EmitterHandler<TEvents[TName]>): Unsubscribe

	/**
	 * Extend the emitter with a plugin
	 */
	use<TOut>(plugin: EmitterPlugin<WithOnce<TEvents, TEmitter>, TOut>): TOut
}>

export function withOnce<
	TEmitter extends Emitter<TEvents>,
	TEvents extends Events = InferEvents<TEmitter>,
>(source: TEmitter): WithOnce<TEvents, TEmitter> {
	const { on, off } = source
	const emitter: WithOnce<TEvents, TEmitter> = {
		...source,
		once<TName extends keyof TEvents>(name: TName, handler: EmitterHandler<TEvents[TName]>): Unsubscribe {
			const unsubscribe = on(name, handler)

			on(name, function onceHandler() {
				unsubscribe()
				off(name, onceHandler)
			})

			return unsubscribe
		},
		use,
	}

	return emitter
}
