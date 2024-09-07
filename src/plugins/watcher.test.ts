import { assertType, expect, it, vi } from 'vitest'
import { createEmitter } from '../core'
import { withWatcher } from './watcher'

it('should emit events to watchers', () => {
	type Events = {
		foo: 'foo'
		bar: string
	}
	let { emit, watch } = createEmitter<Events>().use(withWatcher)

	const watcher = vi.fn()
	watch(watcher)

	watch((name, event) => {
		if (name === 'foo') {
			assertType<'foo'>(event)
		}

		if (name === 'bar') {
			assertType<string>(event)
		}
	})

	emit('foo', 'foo')
	emit('bar', 'bar')

	expect(watcher).toHaveBeenCalledTimes(2)
})

it('should unwatch events', () => {
	let { emit, watch } = createEmitter().use(withWatcher)

	const watcher = vi.fn()
	const unwatcher = watch(watcher)

	emit('foo', 'foo')
	unwatcher()
	emit('bar', 'bar')

	expect(watcher).toHaveBeenCalledTimes(1)
})

it('should be called after specific handlers', () => {
	let { emit, watch, on } = createEmitter().use(withWatcher)

	const order: Array<string> = []
	const watcher = vi.fn(() => order.push('watcher'))
	const handler = vi.fn(() => order.push('handler'))
	watch(watcher)
	on('foo', handler)

	emit('foo', 'foo')

	expect(order).toEqual(['handler', 'watcher'])
})

it('should extendable', () => {
	let origin = createEmitter().use(withWatcher)

	function test<T>(emitter: T) {
		return {
			...emitter,
			foo: 'bar',
		}
	}

	const extended = origin.use(test)

	expect(extended).toHaveProperty('foo', 'bar')
	expect(extended).not.toBe(origin)

	expect(extended).toMatchObject(origin)

	expect(origin).not.toHaveProperty('foo')

	assertType<typeof origin>(extended)
})
