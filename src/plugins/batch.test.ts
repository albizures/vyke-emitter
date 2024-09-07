import { expect, it, vi } from 'vitest'
import { createEmitter } from '../core'
import { withBatch } from './batch'

it('should batch events', () => {
	type MyEvents = {
		foo: string
		bar: number
	}

	const emitter = createEmitter<MyEvents>()
		.use(withBatch)

	const onFoo = vi.fn()
	const onBar = vi.fn()

	emitter.on('foo', onFoo)
	emitter.on('bar', onBar)

	emitter.batch('foo', 'hello')
	emitter.batch('bar', 123)

	expect(onFoo).not.toHaveBeenCalled()
	expect(onBar).not.toHaveBeenCalled()

	emitter.processBatch()

	expect(onFoo).toHaveBeenCalledWith('hello')
	expect(onBar).toHaveBeenCalledWith(123)
})
