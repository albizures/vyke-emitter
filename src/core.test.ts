import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Emitter, EventHandlerMap } from './core'
import { createEmitter } from './core'

const eventType: unique symbol = Symbol('eventType')
type Events = {
	'foo': number
	'constructor': 'arrow' | 'function'
	'FOO': { a: string }
	'bar': unknown
	'Bar': unknown
	'baz:bat!': unknown
	'baz:baT!': unknown
	'Foo': unknown
	[eventType]: unknown
}
let events: EventHandlerMap<any>, emitter: Emitter<Events>

beforeEach(() => {
	emitter = createEmitter()
	events = emitter.all
})

describe('properties', () => {
	it('should expose the event handler map', () => {
		expect(emitter).to.have.property('all')
	})
})

describe('on()', () => {
	it('should register handler for new type', () => {
		const foo = () => {}
		emitter.on('foo', foo)

		expect(events.foo).to.include(foo)
	})

	it('should register handlers for any type strings', () => {
		const foo = () => {}
		emitter.on('constructor', foo)

		expect(events.constructor).to.include(foo)
	})

	it('should append handler for existing type', () => {
		const foo = () => {}
		const bar = () => {}
		emitter.on('foo', foo)
		emitter.on('foo', bar)

		expect(events.foo).to.include(foo)
		expect(events.foo).to.include(bar)
	})

	it('should NOT normalize case', () => {
		const foo = () => {}
		emitter.on('FOO', foo)
		emitter.on('Bar', foo)
		emitter.on('baz:baT!', foo)

		expect(events.FOO).to.includes(foo)
		expect(events.foo).to.equal(undefined)

		expect(events.Bar).to.includes(foo)

		expect(events.bar).to.equal(undefined)

		expect(events['baz:baT!']).to.includes(foo)
	})

	it('can take symbols for event types', () => {
		const foo = () => {}
		emitter.on(eventType, foo)
		expect(events[eventType as unknown as string]).to.include(foo)
	})

	it('should add duplicate listeners', () => {
		const foo = vi.fn()
		emitter.on('foo', foo)
		emitter.on('foo', foo)

		emitter.emit('foo', 2)

		expect(foo).toHaveBeenCalledTimes(2)
	})
})

describe('off()', () => {
	it('should remove handler for type', () => {
		const foo = () => {}
		emitter.on('foo', foo)
		emitter.off('foo', foo)

		expect(events.foo).to.have.lengthOf(0)
	})

	it('should NOT normalize case', () => {
		const foo = () => {}
		emitter.on('FOO', foo)
		emitter.on('Bar', foo)
		emitter.on('baz:bat!', foo)

		emitter.off('FOO', foo)
		emitter.off('Bar', foo)
		emitter.off('baz:baT!', foo)

		expect(events.FOO).to.have.lengthOf(0)

		expect(events.foo).to.equal(undefined)

		expect(events.Bar).to.have.lengthOf(0)

		expect(events.bar).to.equal(undefined)

		expect(events['baz:bat!']).to.have.lengthOf(1)
	})

	it('should remove all handlers of the given type', () => {
		emitter.on('foo', () => {})
		emitter.on('foo', () => {})
		emitter.on('bar', () => {})
		emitter.off('foo')
		expect(events.foo).to.have.length(0)
		expect(events.bar).to.have.length(1)
		emitter.off('bar')
		expect(events.bar).to.have.length(0)
	})
})

describe('emit()', () => {
	it('should invoke handler for type', () => {
		const event = { a: 'b' }

		emitter.on('FOO', (one, two?: unknown) => {
			expect(one).to.deep.equal(event)
			expect(two).to.be.an('undefined')
		})

		emitter.emit('FOO', event)
	})

	it('should NOT ignore case', () => {
		const onFoo = vi.fn()
		const onFOO = vi.fn()
		events.Foo = [onFoo]
		events.FOO = [onFOO]

		const arg = { a: 'FOO arg' }

		emitter.emit('Foo', 'Foo arg')
		emitter.emit('FOO', arg)

		expect(onFoo).toHaveBeenCalledOnce()
		expect(onFoo).toHaveBeenCalledWith('Foo arg')
		expect(onFOO).toHaveBeenCalledOnce()
		expect(onFOO).toHaveBeenCalledWith(arg)
	})
})
