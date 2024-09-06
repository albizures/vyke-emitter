<div align="center">
	<h1>
		@vyke/emitter
	</h1>
</div>
Small and easy event emitter/pubsub without dependencies and type-friendly with plugin support.

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

Querying inside an specific element
```ts
import { query, selectIn } from '@vyke/dom'

const [submitBtn] = selectIn(
	form,
	query<HTMLButtonElement>('#submit'),
)

console.log(submitBtn)
//             ^? HTMLButtonElement
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

###

## API
### createEmitter
functional event emitter / pubsub.

## Others vyke projects
- [Flowmodoro app by vyke](https://github.com/albizures/vyke-flowmodoro)
- [@vyke/results](https://github.com/albizures/vyke-results)
- [@vyke/val](https://github.com/albizures/vyke-val)
- [@vyke/tsdocs](https://github.com/albizures/vyke-tsdocs)
