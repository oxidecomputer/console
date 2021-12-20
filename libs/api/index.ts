import type { ResultItem } from './hooks'
import {
  getUseApiMutation,
  getUseApiQuery,
  getUseApiQueryClient,
} from './hooks'
import { Api } from './__generated__/Api'

export * from './__generated__/Api'
export type { ErrorResponse, Params, Result, ResultItem } from './hooks'

const basePath = process.env.API_URL ?? '/api'

const api = new Api({ baseUrl: basePath })

type A = typeof api.methods

/**
 * API methods that return a list of items.
 */
export type ApiListMethods = {
  // Only never extends never. If ResultItem extends never, that means we
  // couldn't pull out an item, which means it's not a list endpoint. If we can
  // infer an item, that means it's a list endpoint, so include its M.
  [M in keyof A as ResultItem<A[M]> extends never ? never : M]: A[M]
}

export const useApiQuery = getUseApiQuery(api.methods)
export const useApiMutation = getUseApiMutation(api.methods)
export const useApiQueryClient = getUseApiQueryClient<A>()
