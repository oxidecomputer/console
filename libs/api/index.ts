// for convenience so we can do `import type { ApiTypes } from '@oxide/api'`
import { QueryClient } from '@tanstack/react-query'

import type * as ApiTypes from './__generated__/Api'
import { Api } from './__generated__/Api'
import { handleErrors } from './errors'
import {
  getUseApiMutation,
  getUseApiQuery,
  getUseApiQueryClient,
  wrapQueryClient,
} from './hooks'

const api = new Api({
  baseUrl: process.env.API_URL,
})

export type ApiMethods = typeof api.methods

export const useApiQuery = getUseApiQuery(api.methods, handleErrors)
export const useApiMutation = getUseApiMutation(api.methods, handleErrors)

// Needs to be defined here instead of in app so we can use it to define
// `apiQueryClient`, which provides API-typed versions of QueryClient methods
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 10000,
    },
  },
})

// to be used in loaders, which are outside the component tree and therefore
// don't have access to context
export const apiQueryClient = wrapQueryClient(api.methods, queryClient)

// to be used to retrieve the typed query client in components
export const useApiQueryClient = getUseApiQueryClient(api.methods)

export * from './roles'
export * from './util'
export * from './__generated__/Api'

export type { ApiTypes }

export type { Params, Result, ResultItem } from './hooks'
export { navToLogin } from './nav-to-login'
