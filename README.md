<div align="center">
	<h1>
		@vyke/emitter
	</h1>
</div>
Small and easy event emitter/pubsub without dependencies and type-friendly with plugin support.

- With a small core
- Plugin support
- Typescript friendly
- No dependencies

## Installation
```sh
npm i @vyke/emitter
```

## Examples
```ts
import { createEmitter } from '@vyke/emitter'

const emitter = createEmitter()

function onLogin(session: { username: string }) {
	console.log('logged in', session.username)
}

const offLogin = emitter.on('login', onLogin)

emitter.emit('login', { username: 'albizures' })

offFoo()
// or
emitter.off('login', onLogin)
```
### Typescript
```ts
import { createEmitter } from '@vyke/emitter'

type Events = {
	login: { username: string }
}

const emitter = createEmitter<Events>()

emitter.on('login', (session) => {
	console.log('logged in', session.username) // session.username is inferred as string
})

emitter.emit('login', { username: 'albizures' })
```

## Plugins
```ts
import { createEmitter } from '@vyke/emitter'

const emitter = createEmitter().use((emitter) => {
	emitter.on('login', () => {
		console.log('login event')
	})
}).use((emitter) => {
	return {
		...emitter,
		onLogin: (cb: () => void) => emitter.on('login', cb),
	}
})
```

### watcher
Plugin to watch all events emitted.

```ts
import { createEmitter } from '@vyke/emitter'
import { withWatcher } from '@vyke/emitter/watcher'

const emitter = createEmitter().use(withWatcher)

emitter.watch((name, value) => {
	console.log('event', name, 'emitted with', value)
})
```

### unique handlers
Plugin to ensure that a handler is only added once.

```ts
import { createEmitter } from '@vyke/emitter'
import { withUniqueHandlers } from '@vyke/emitter/unique-handlers'

const emitter = createEmitter().use(withUniqueHandlers)

const onLogin = () => {
	console.log('login event')
}

emitter.on('login', onLogin)
emitter.on('login', onLogin) // this will not be added
```

### once
Plugin to listen to an event only once.

```ts
import { createEmitter } from '@vyke/emitter'
import { withOnce } from '@vyke/emitter/once'

const emitter = createEmitter().use(withOnce)

emitter.once('login', () => {
	console.log('login event') // this will be emitted only once
})

emitter.emit('login')
emitter.emit('login') // this will be emitted but not listened anymore
```

### watcher
Plugin to watch all events emitted.

```ts
import { createEmitter } from '@vyke/emitter'
import { withWatcher } from '@vyke/emitter/watcher'

const emitter = createEmitter().use(withWatcher)

emitter.watch((name, value) => {
	console.log('event', name, 'emitted with', value)
})

emitter.emit('login', { username: 'albizures' })
```

### withConfig
Plugin to add a config object when listening to events.
This plugin accepts a config handler that will be called when the handler is added.

Built-in config handlers options:
- `withGroups`: to group events by a string. This will be useful to remove all events from a group.

```ts
import { createEmitter } from '@vyke/emitter'
import { createGroup, withConfig, withGroups } from '@vyke/emitter/config'

const authGroup = createGroup()

const emitter = createEmitter()
	.use(withConfig(withGroups))

emitter.on('login', () => {
	console.log('login event')
}, { group: authGroup })
emitter.on('logout', () => {
	console.log('logout event')
}, { group: authGroup })

authGroup.off()

emitter.emit('login')
emitter.emit('logout')
// nothing will be logged
```

## API
### createEmitter
functional event emitter / pubsub.

### withConfig
Plugin that allows for adding configuration to event handlers.

```ts
const withLog = withConfig((config, { name, handler }) => {
	if (config.log) {
		console.log(`Adding handler for ${name}`)
	}
})

const emitter = createEmitter().use(withLog)

emitter.on('foo', () => {})
// Logs: Adding handler for foo
```

## Others vyke projects
- [Flowmodoro app by vyke](https://github.com/albizures/vyke-flowmodoro)
- [@vyke/results](https://github.com/albizures/vyke-results)
- [@vyke/val](https://github.com/albizures/vyke-val)
- [@vyke/tsdocs](https://github.com/albizures/vyke-tsdocs)
