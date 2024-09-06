import { type EmitterPlugin, use } from './plugin'

export type Unsubscribe = () => void

export type EventName = string | symbol | number
export type Events = Record<EventName, unknown>

// An event handler can take an optional event argument
// and should not return a value
export type EmitterHandler<TEvent> = (event: TEvent) => void

// An array of all currently registered event handlers for a type
export type EventHandlerList<TEvent> = Array<EmitterHandler<TEvent>>

// A map of event types and their corresponding event handlers.
export type EventHandlerMap<TEvents extends Events> = {
	[key in keyof TEvents]?: EventHandlerList<TEvents[key]>
}

export type Emitter<TEvents extends Events> = {
	all: EventHandlerMap<TEvents>
	/**
	 * Register an event handler with the given name
	 * @param name Name of event to listen for
	 * @param handler Function to call in response to given event
	 * @memberOf mitt
	 */
	on<TName extends keyof TEvents>(name: TName, handler: EmitterHandler<TEvents[TName]>): Unsubscribe
	/**
	 * Remove an event handler with the given name.
	 * If `handler` is omitted, all handlers of the given type are removed.
	 * @param name Name of event to unregister `handler` from
	 * @param [handler] Handler function to remove
	 */
	off<TName extends keyof TEvents>(name: TName, handler?: EmitterHandler<TEvents[TName]>): void
	/**
	 * Invoke all handlers with the given name.
	 * @param name The event type to invoke
	 * @param [event] Any value (object is recommended and powerful), passed to each handler
	 * @memberOf mitt
	 */
	emit<TName extends keyof TEvents>(name: TName, event: TEvents[TName]): void

	use<TOut>(plugin: EmitterPlugin<Emitter<TEvents>, TOut>): TOut
}

/**
 * functional event emitter / pubsub.
 */
export function createEmitter<TEvents extends Events>(): Emitter<TEvents> {
	let all: EventHandlerMap<TEvents> = Object.create(null)

	let emitter: Emitter<TEvents> = {
		all,
		on<TName extends keyof TEvents>(name: TName, handler: EmitterHandler<TEvents[TName]>) {
			let handlers: Array<EmitterHandler<TEvents[TName]>> = all[name] ?? []

			handlers.push(handler)

			all[name] = handlers

			return () => {
				removeItem(handlers, handler)
			}
		},
		off<TName extends keyof TEvents>(name: TName, handler?: EmitterHandler<TEvents[TName]>) {
			let handlers = all[name]

			if (handlers) {
				if (handler) {
					removeItem(handlers, handler)
				}
				else {
					all[name] = []
				}
			}
		},
		emit<TName extends keyof TEvents>(name: TName, eventValue: TEvents[TName]) {
			let handlers = all[name]
			if (handlers) {
				for (let handler of handlers) {
					handler(eventValue)
				}
			}
		},
		use,
	}

	return emitter
}

function removeItem<TItem>(list: Array<TItem>, item: TItem) {
	list.splice(list.indexOf(item) >>> 0, 1)
}
