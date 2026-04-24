import { makeActionMix } from './profiles.ts'

export * from './spec-shared.ts'
export const defaultActions = makeActionMix('form-pinned')
