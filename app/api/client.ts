/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { QueryClient } from '@tanstack/react-query'

import { Api } from './__generated__/Api'
import {
  getApiQueryOptions,
  getListQueryOptionsFn,
  getUseApiMutation,
  getUseApiQueries,
  getUseApiQuery,
  getUseApiQueryErrorsAllowed,
  getUsePrefetchedApiQuery,
  wrapQueryClient,
} from './hooks'

export {
  ensurePrefetched,
  usePrefetchedQuery,
  PAGE_SIZE,
  type PaginatedQuery,
} from './hooks'

export const api = new Api({
  // unit tests run in Node, whose fetch implementation requires a full URL
  host: process.env.NODE_ENV === 'test' ? 'http://testhost' : '',
})

export type ApiMethods = typeof api.methods

/** API-specific query options helper. */
export const apiq = getApiQueryOptions(api.methods)
/**
 * Query options helper that only supports list endpoints. Returns
 * a function `(limit, pageToken) => QueryOptions` for use with
 * `useQueryTable`.
 */
export const getListQFn = getListQueryOptionsFn(api.methods)
export const useApiQuery = getUseApiQuery(api.methods)
export const useApiQueries = getUseApiQueries(api.methods)
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
      staleTime: 2000,
      refetchOnWindowFocus: false,
    },
  },
})

// to be used in loaders, which are outside the component tree and therefore
// don't have access to context
export const apiQueryClient = wrapQueryClient(api.methods, queryClient)

// used to retrieve the typed query client in components. doesn't need to exist:
// we could import apiQueryClient directly everywhere, but the change is noisy
export const useApiQueryClient = () => apiQueryClient
