import { describe, expect, it, vi } from 'vitest'
import { createEmitter } from '../core'
import { withWatcher } from './watcher'
import { createGroup, withConfig, withGroups } from './config'

describe('with groups', () => {
	it('should group handlers', () => {
		const emitter = createEmitter()
			.use(withWatcher)
			.use(withConfig(withGroups))

		const group = createGroup()
		const onFoo = vi.fn()
		const onBar = vi.fn()
		const onBaz = vi.fn()
		const onAll = vi.fn()

		emitter.on('foo', onFoo, { group })
		emitter.on('bar', onBar, { group })
		emitter.on('baz', onBaz)
		emitter.watch(onAll, { group })

		group.off()

		emitter.emit('baz', 'value')
		emitter.emit('foo', 'value')
		emitter.emit('bar', 'value')

		expect(onFoo).toHaveBeenCalledTimes(0)
		expect(onBar).toHaveBeenCalledTimes(0)
		expect(onBaz).toHaveBeenCalledTimes(1)
		expect(onAll).toHaveBeenCalledTimes(0)
	})
})
