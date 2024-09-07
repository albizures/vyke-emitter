export {
	type Events,
	type Emitter,
	type EmitterHandler,
	type WithEmit,
	type WithStore,
	type WithOn,
	type WithOff,
	createEmitter,
} from './core'

export {
	type EmitterPlugin,
	type WithUse,
	use,
} from './plugin'

export {
	type WithWatcher,
	type WatcherHandler,
	withWatcher,
	hasWatcher,
} from './plugins/watcher'

export {
	withUniqueHandlers,
} from './plugins/unique-handlers'

export {
	type Group,
	type WithOptions,
	type OptionsHandler,
	type OptionsHandlerContext,
	withOptions,
	withGroups,
	createGroup,
} from './plugins/options'

export {
	type WithOnce,
	withOnce,
	hasOnce,
} from './plugins/once'

export {
	type WithBatch,
	withBatch,
} from './plugins/batch'
