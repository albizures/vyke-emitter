import type { Emitter, Events } from '../core'
import type { InferEvents } from '../types'

type WithOnAndAll<TEvents extends Events> = {
	on: Emitter<TEvents>['on']
	all: Emitter<TEvents>['all']
}

export function withUniqueHandlers<
	TEmitter extends WithOnAndAll<TEvents>,
	TEvents extends Events = InferEvents<TEmitter>,
>(emitter: TEmitter): TEmitter {
	const { on, all } = emitter
	return {
		...emitter,
		on(name, handler) {
			const handlers = all[name]

			if (!handlers?.includes(handler)) {
				return on(name, handler)
			}

			return () => {}
		},
	}
}
