// for convenience so we can do `import type { ApiTypes } from '@oxide/api'`
import type * as ApiTypes from './__generated__/Api'
import { Api } from './__generated__/Api'
import { handleErrors } from './errors'
import { getUseApiMutation, getUseApiQuery, getUseApiQueryClient } from './hooks'

const api = new Api({
  baseUrl: process.env.API_URL,
})

export type ApiMethods = typeof api.methods

export { ApiListMethods, ApiViewByIdMethods } from './__generated__/Api'

export const useApiQuery = getUseApiQuery(api.methods, handleErrors)
export const useApiMutation = getUseApiMutation(api.methods, handleErrors)
export const useApiQueryClient = getUseApiQueryClient<ApiMethods>()

export * from './roles'
export * from './util'
export * from './__generated__/Api'

export type { ApiTypes }

export type { Params, Result, ResultItem } from './hooks'
export { navToLogin } from './nav-to-login'
