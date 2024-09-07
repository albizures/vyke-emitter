import type { Events, WithEmit } from '../core'
import type { InferEvents } from '../types'

export type WithBatch<TEvents> = {
	batch<TName extends keyof TEvents>(name: TName, event: TEvents[TName]): void
	processBatch(): void
}

type Entries<T> = {
	[K in keyof T]: [K, T[K]]
}[keyof T]

export function withBatch<
	TEmitter extends WithEmit<TEvents>,
	TEvents extends Events = InferEvents<TEmitter>,
>(source: TEmitter): TEmitter & WithBatch<TEvents> {
	const { emit } = source

	let batched: Array<Entries<TEvents>> = []

	const emitter = {
		...source,
		batch<TName extends keyof TEvents>(name: TName, event: TEvents[TName]) {
			batched.push([name, event])
		},

		processBatch() {
			for (const [name, event] of batched) {
				emit(name, event)
			}

			batched = []
		},
	}

	return emitter
}
