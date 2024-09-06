import { assertType, expect, it, vi } from 'vitest'
import { createEmitter } from './core'
import { withWatcher } from './plugins/watcher'
import { withOnce } from './plugins/once'
import { withUniqueHandlers } from './plugins/unique-handlers'
import { createGroup, withConfig, withGroups } from './plugins/config'

it('should work with all plugins', () => {
	type MyEvents = {
		foo: 'foo-value'
		bar: 'bar-value'
		baz: 'baz-value'
	}

	const emitter = createEmitter<MyEvents>()
		.use(withOnce)
		.use(withUniqueHandlers)
		.use(withWatcher)
		.use(withConfig(withGroups()))

	const group = createGroup()
	const onFoo = vi.fn()
	const onFooOnce = vi.fn()
	const onBar = vi.fn()
	const onBaz = vi.fn()
	const onAll = vi.fn()

	emitter.on('foo', onFoo, { group })
	emitter.on('foo', onFoo, { group }) // a second time
	emitter.on('bar', onBar, { group })
	emitter.on('baz', onBaz)
	emitter.watch(onAll, { group })
	emitter.once('foo', onFooOnce, { group })

	group.off()

	emitter.emit('baz', 'baz-value')
	emitter.emit('foo', 'foo-value')
	emitter.emit('bar', 'bar-value')

	expect(onFoo).toHaveBeenCalledTimes(0)
	expect(onBar).toHaveBeenCalledTimes(0)
	expect(onBaz).toHaveBeenCalledTimes(1)
	expect(onAll).toHaveBeenCalledTimes(0)
	expect(onFooOnce).toHaveBeenCalledTimes(0)

	emitter.on('foo', (name) => {
		assertType<'foo-value'>(name)
	})

	emitter.once('bar', (name) => {
		assertType<'bar-value'>(name)
	})

	emitter.watch((name, value) => {
		if (name === 'bar') {
			assertType<'bar'>(name)
		}

		if (value === 'bar-value') {
			assertType<'bar-value'>(value)
		}

		if (name === 'foo') {
			assertType<'foo'>(name)
		}
	})
})
