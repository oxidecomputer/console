/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
// for convenience so we can do `import type { ApiTypes } from '@oxide/api'`
import { QueryClient } from '@tanstack/react-query'

import type * as ApiTypes from './__generated__/Api'
import { Api } from './__generated__/Api'
import {
  getUseApiMutation,
  getUseApiQuery,
  getUseApiQueryClient,
  getUseApiQueryErrorsAllowed,
  getUsePrefetchedApiQuery,
  wrapQueryClient,
} from './hooks'

// unit tests run in Node, whose fetch implementation requires a full URL
const baseUrl = process.env.NODE_ENV === 'test' ? 'http://testhost' : ''
export const api = new Api({ baseUrl })

export type ApiMethods = typeof api.methods

export const useApiQuery = getUseApiQuery(api.methods)
/**
 * Same as `useApiQuery`, except we use `invariant(data)` to ensure the data is
 * already there in the cache at request time, which means it has been
 * prefetched in a loader. Whenever this hook is used, there should be an e2e
 * test loading the page to exercise the invariant in CI.
 */
export const usePrefetchedApiQuery = getUsePrefetchedApiQuery(api.methods)
export const useApiQueryErrorsAllowed = getUseApiQueryErrorsAllowed(api.methods)
export const useApiMutation = getUseApiMutation(api.methods)

// Needs to be defined here instead of in app so we can use it to define
// `apiQueryClient`, which provides API-typed versions of QueryClient methods
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 10000,
      refetchOnWindowFocus: false,
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
// export * as ZVal from './__generated__/validate'

export type { ApiTypes }

export * as PathParams from './path-params'

export type { Params, Result, ResultItem } from './hooks'
export type { ApiError } from './errors'
export { navToLogin } from './nav-to-login'
