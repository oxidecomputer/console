/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import {
  QueryClient as QueryClientOrig,
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query'

import { Api } from './__generated__/Api'
import { type ApiError } from './errors'
import {
  ensurePrefetched,
  getApiQueryOptions,
  getApiQueryOptionsErrorsAllowed,
  getListQueryOptionsFn,
  getUseApiMutation,
  getUseApiQuery,
  getUsePrefetchedApiQuery,
  wrapQueryClient,
} from './hooks'

export const api = new Api({
  // unit tests run in Node, whose fetch implementation requires a full URL
  host: process.env.NODE_ENV === 'test' ? 'http://testhost' : '',
})

export type ApiMethods = typeof api.methods

/** API-specific query options helper. */
export const apiq = getApiQueryOptions(api.methods)
/**
 * Variant of `apiq` that allows error responses as a valid result,
 * which importantly means they can be cached by RQ. This means we can prefetch
 * an endpoint that might error (see `prefetchQueryErrorsAllowed`) and use this
 * hook to retrieve the error result.
 *
 * Concretely, the difference from the usual query function is that we turn all
 * errors into successes. Instead of throwing the error, we return it as a valid
 * result. This means `data` has a type that includes the possibility of error,
 * plus a discriminant to let us handle both sides properly in the calling code.
 *
 * We also use a special query key to distinguish these from normal API queries.
 * If we hit a given endpoint twice on the same page, once the normal way and
 * once with errors allowed, the responses have different shapes, so we do not
 * want to share the cache and mix them up.
 */
export const apiqErrorsAllowed = getApiQueryOptionsErrorsAllowed(api.methods)
/**
 * Query options helper that only supports list endpoints. Returns
 * a function `(limit, pageToken) => QueryOptions` for use with
 * `useQueryTable`.
 */
export const getListQFn = getListQueryOptionsFn(api.methods)
export const useApiQuery = getUseApiQuery(api.methods)
/**
 * Same as `useApiQuery`, except we use `invariant(data)` to ensure the data is
 * already there in the cache at request time, which means it has been
 * prefetched in a loader. Whenever this hook is used, there should be an e2e
 * test loading the page to exercise the invariant in CI.
 */
export const usePrefetchedApiQuery = getUsePrefetchedApiQuery(api.methods)
export const useApiMutation = getUseApiMutation(api.methods)

export const usePrefetchedQuery = <TData>(options: UseQueryOptions<TData, ApiError>) =>
  ensurePrefetched(useQuery(options), options.queryKey)

/**
 * Extends React Query's `QueryClient` with a couple of API-specific methods.
 * Existing methods are never modified.
 */
class QueryClient extends QueryClientOrig {
  /**
   * Invalidate all cached queries for a given endpoint.
   *
   * Note that we only take a single argument, `method`, rather than allowing
   * the full query key `[query, params]` to be specified. This is to avoid
   * accidentally overspecifying and therefore failing to match the desired query.
   * The params argument can be added in if we ever have a use case for it.
   */
  invalidateEndpoint(method: keyof typeof api.methods) {
    this.invalidateQueries({ queryKey: [method] })
  }
}

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
