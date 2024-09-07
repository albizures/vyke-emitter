import { assertType, describe, expect, it, vi } from 'vitest'
import { createEmitter } from '../core'
import type { WithWatcher } from './watcher'
import { hasWatcher, withWatcher } from './watcher'
import type { MaybeWithGroups } from './options'
import { createGroup, withGroups, withOptions } from './options'
import { hasOnce, withOnce } from './once'

type MyEvents = {
	login: { username: string }
	logout: string
	error: number
}

describe('with groups', () => {
	it('should group handlers', () => {
		const emitter = createEmitter<MyEvents>()
			.use(withOptions(withGroups))

		const group = createGroup()
		const onLogin = vi.fn()
		const onLogout = vi.fn()
		const onError = vi.fn()

		emitter.on('login', onLogin, { group })
		emitter.on('logout', onLogout, { group })
		emitter.on('error', onError)
		emitter.on('login', (value) => {
			assertType<{ username: string }>(value)
		}, { group })

		expect(hasWatcher(emitter)).toBe(false)
		expect(hasOnce(emitter)).toBe(false)

		group.off()

		emitter.emit('login', { username: 'user' })
		emitter.emit('logout', 'value')
		emitter.emit('error', 401)

		expect(onLogin).toHaveBeenCalledTimes(0)
		expect(onLogout).toHaveBeenCalledTimes(0)
		expect(onError).toHaveBeenCalledTimes(1)
	})

	it('should support once and watcher', () => {
		const emitter = createEmitter<MyEvents>()
			.use(withOnce)
			.use(withWatcher)
			.use(withOptions(withGroups))

		expect(hasWatcher(emitter)).toBe(true)
		expect(hasOnce(emitter)).toBe(true)
		assertType<WithWatcher<MyEvents, MaybeWithGroups>>(emitter)

		const group = createGroup()

		const onWatch = vi.fn()
		const onLogin = vi.fn()
		const onLogout = vi.fn()

		emitter.watch(onWatch, { group })
		emitter.once('login', onLogin, { group })
		emitter.on('logout', onLogout, { group })

		emitter.emit('login', { username: 'user' })

		expect(onLogin).toHaveBeenCalledTimes(1)
		expect(onWatch).toHaveBeenCalledTimes(1)
		expect(onLogout).toHaveBeenCalledTimes(0)

		group.off()

		emitter.emit('logout', 'value')

		expect(onLogin).toHaveBeenCalledTimes(1)
		expect(onWatch).toHaveBeenCalledTimes(1)
		expect(onLogout).toHaveBeenCalledTimes(0)
	})
})
