import { expect, it, vi } from 'vitest'
import { createEmitter } from '../core'
import { withOnce } from './once'

it('should only fire handlers only once', () => {
	let { once, emit } = createEmitter().use(withOnce)

	const foo = vi.fn()
	once('foo', foo)

	emit('foo', 'foo')
	emit('foo', 'foo')

	expect(foo).toHaveBeenCalledTimes(1)
})
