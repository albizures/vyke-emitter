import type { Emitter } from './core'

export type Simplify<T> = { [KeyType in keyof T]: T[KeyType] } & {}

export type InferEvents<T> = T extends Emitter<infer TEvents> ? TEvents : never
