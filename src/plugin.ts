export type EmitterPlugin<TIn, TOut> = (emitter: TIn) => TOut

export type UseFn<TIn, TOut> = (plugin: EmitterPlugin<TIn, TOut>) => TOut

export function use<TIn, TOut>(this: TIn, plugin: EmitterPlugin<TIn, TOut>): TOut {
	return plugin(this as unknown as TIn)
}
