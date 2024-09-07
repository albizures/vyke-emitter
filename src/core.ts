import type { WithUse } from './plugin'
import { use } from './plugin'
import type { Simplify } from './types'

export type EventName = string | symbol | number
export type Events = Record<EventName, unknown>

// An event handler can take an optional event argument
// and should not return a value
export type EmitterHandler<TEvent> = (event: TEvent) => void

// An array of all currently registered event handlers for a type
type EventHandlerStore<TEvent> = Array<EmitterHandler<TEvent>>

// A map of event types and their corresponding event handlers.
export type EventStore<TEvents extends Events> = {
	[key in keyof TEvents]?: EventHandlerStore<TEvents[key]>
}

export type WithStore<TEvents extends Events> = {
	store: EventStore<TEvents>
}

export type Unsubscribe = () => void

export type WithOn<TEvents extends Events, TOptions = never> = {
	/**
	 * Register an event handler with the given name
	 * @param name Name of event to listen for
	 * @param handler Function to call in response to given event
	 */
	on<TName extends keyof TEvents>(name: TName, handler: EmitterHandler<TEvents[TName]>, options?: TOptions): Unsubscribe
}

export type WithOff<TEvents extends Events> = {
	/**
	 * Remove an event handler with the given name.
	 * If `handler` is omitted, all handlers of the given type are removed.
	 * @param name Name of event to unregister `handler` from
	 * @param [handler] Handler function to remove
	 */
	off<TName extends keyof TEvents>(name: TName, handler?: EmitterHandler<TEvents[TName]>): void
}

export type WithEmit<TEvents extends Events> = {
	/**
	 * Invoke all handlers with the given name.
	 * @param name The event type to invoke
	 * @param [event] Any value (object is recommended and powerful), passed to each handler
	 */
	emit<TName extends keyof TEvents>(name: TName, event: TEvents[TName]): void
}

export type Emitter<TEvents extends Events> = Simplify<
	& WithStore<TEvents>
	& WithOn<TEvents>
	& WithOff<TEvents>
	& WithEmit<TEvents>
	& WithUse
>

/**
 * functional event emitter / pubsub.
 */
export function createEmitter<TEvents extends Events>(): Emitter<TEvents> {
	let store: EventStore<TEvents> = Object.create(null)

	let emitter: Emitter<TEvents> = {
		store,
		on<TName extends keyof TEvents>(name: TName, handler: EmitterHandler<TEvents[TName]>) {
			let handlers: Array<EmitterHandler<TEvents[TName]>> = store[name] ?? []

			handlers.push(handler)

			store[name] = handlers

			return () => {
				removeItem(handlers, handler)
			}
		},
		off<TName extends keyof TEvents>(name: TName, handler?: EmitterHandler<TEvents[TName]>) {
			let handlers = store[name]

			if (handlers) {
				if (handler) {
					removeItem(handlers, handler)
				}
				else {
					store[name] = []
				}
			}
		},
		emit<TName extends keyof TEvents>(name: TName, eventValue: TEvents[TName]) {
			store[name]?.forEach((handler) => handler(eventValue))
		},
		use,
	}

	return emitter
}

function removeItem<TItem>(list: Array<TItem>, item: TItem) {
	list.splice(list.indexOf(item) >>> 0, 1)
}
