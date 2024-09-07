import type { Events, WithOn, WithStore } from '../core'
import type { InferEvents } from '../types'

export function withUniqueHandlers<
	TEmitter extends WithOn<TEvents> & WithStore<TEvents>,
	TEvents extends Events = InferEvents<TEmitter>,
>(emitter: TEmitter): TEmitter {
	const { on, store } = emitter
	return {
		...emitter,
		on(name, handler) {
			const handlers = store[name]

			if (!handlers?.includes(handler)) {
				return on(name, handler)
			}

			return () => {}
		},
	}
}
