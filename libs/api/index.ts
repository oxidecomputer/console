import type { ResultItem } from './hooks'
import { getUseApiMutation, getUseApiQuery, getUseApiQueryClient } from './hooks'
import { handleErrors } from './errors'
import { Api } from './__generated__/Api'

export const api = new Api({
  baseUrl: process.env.API_URL,
})

export type ApiMethods = typeof api.methods

/**
 * API methods that return a list of items.
 */
export type ApiListMethods = {
  // Only never extends never. If ResultItem extends never, that means we
  // couldn't pull out an item, which means it's not a list endpoint. If we can
  // infer an item, that means it's a list endpoint, so include its M.
  [M in keyof ApiMethods as ResultItem<ApiMethods[M]> extends never
    ? never
    : M]: ApiMethods[M]
}

export const useApiQuery = getUseApiQuery(api.methods, handleErrors)
export const useApiMutation = getUseApiMutation(api.methods, handleErrors)
export const useApiQueryClient = getUseApiQueryClient<ApiMethods>()

export * from './util'
export * from './__generated__/Api'

// for convenience so we can do `import type { ApiTypes } from '@oxide/api'`
import type * as ApiTypes from './__generated__/Api'
export type { ApiTypes }

export type { Params, Result, ResultItem } from './hooks'
export { navToLogin } from './nav-to-login'
