export type Params<F> = F extends (p: infer P) => any ? P : never
export type Result<F> = F extends (p: any) => Promise<infer R> ? R : never
export type Items = 'items'
