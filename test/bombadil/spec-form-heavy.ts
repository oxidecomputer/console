import { makeActionMix } from './profiles.ts'

export {
  noUncaughtExceptions,
  noUnhandledPromiseRejections,
  noErrorBoundary,
  noNotFound,
  loadingResolves,
  mainContentAppears,
  toastsClear,
  noDuplicateToasts,
  menuSurvivesWait,
} from './spec-shared.ts'

export const defaultActions = makeActionMix('form-heavy')
