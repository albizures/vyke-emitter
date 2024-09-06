import { expect, it, vi } from 'vitest'
import { createEmitter } from '../core'
import { withUniqueHandlers } from './unique-handlers'

it('should only register handlers only once', () => {
	let { on, emit } = createEmitter().use(withUniqueHandlers)

	const foo = vi.fn()
	on('foo', foo)
	on('foo', foo)

	emit('foo', 'foo')

	expect(foo).toHaveBeenCalledTimes(1)
})
