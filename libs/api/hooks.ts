/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type {
  FetchQueryOptions,
  InvalidateQueryFilters,
  QueryClient,
  QueryFilters,
  QueryKey,
  UseMutationOptions,
  UseQueryOptions,
} from '@tanstack/react-query'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { invariant } from '@oxide/util'

import type { ApiResult } from './__generated__/Api'
import { type ApiError, processServerError } from './errors'
import { navToLogin } from './nav-to-login'

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Params<F> = F extends (p: infer P) => any ? P : never
export type Result<F> = F extends (p: any) => Promise<ApiResult<infer R>> ? R : never
export type ResultItem<F> = Result<F> extends { items: (infer R)[] }
  ? R extends Record<string, unknown>
    ? R
    : never
  : never

type ApiClient = Record<string, (...args: any) => Promise<ApiResult<any>>>
/* eslint-enable @typescript-eslint/no-explicit-any */

// method: keyof Api would be strictly more correct, but making it a string
// means we can call this directly in all the spots below instead of having to
// make it generic over Api, which requires passing it as an argument to
// getUseApiQuery, etc. This is fine because it is only being called inside
// functions where `method` is already required to be an API method.
const handleResult =
  (method: string) =>
  <Data>(result: ApiResult<Data>) => {
    if (result.type === 'success') return result.data

    // if logged out, hit /login to trigger login redirect
    // Exception: 401 on password login POST needs to be handled in-page
    if (result.statusCode === 401 && method !== 'loginLocal') {
      // TODO-usability: for background requests, a redirect to login without
      // warning could come as a surprise to the user, especially because
      // sometimes background requests are not directly triggered by a user
      // action, e.g., polling or refetching when window regains focus
      navToLogin({ includeCurrent: true })
    }
    // we need to rethrow because that's how react-query knows it's an error
    throw processServerError(method, result)
  }

export const getUseApiQuery =
  <A extends ApiClient>(api: A) =>
  <M extends string & keyof A>(
    method: M,
    params: Params<A[M]>,
    options: UseQueryOptions<Result<A[M]>, ApiError> = {}
  ) => {
    return useQuery(
      [method, params] as QueryKey,
      ({ signal }) => api[method](params, { signal }).then(handleResult(method)),
      // no catch, let unexpected errors bubble up
      {
        // In the case of 404s, let the error bubble up to the error boundary so
        // we can say Not Found. If you need to allow a 404 and want it to show
        // up as `error` state instead, pass `useErrorBoundary: false` as an
        // option from the calling component and it will override this
        useErrorBoundary: (err) => err.statusCode === 404,
        ...options,
      }
    )
  }

export const getUsePrefetchedApiQuery =
  <A extends ApiClient>(api: A) =>
  <M extends string & keyof A>(
    method: M,
    params: Params<A[M]>,
    options: UseQueryOptions<Result<A[M]>, ApiError> = {}
  ) => {
    const queryKey = [method, params] as QueryKey
    const { data, ...rest } = useQuery(
      queryKey,
      ({ signal }) => api[method](params, { signal }).then(handleResult(method)),
      // no catch, let unexpected errors bubble up
      {
        // In the case of 404s, let the error bubble up to the error boundary so
        // we can say Not Found. If you need to allow a 404 and want it to show
        // up as `error` state instead, pass `useErrorBoundary: false` as an
        // option from the calling component and it will override this
        useErrorBoundary: (err) => err.statusCode === 404,
        ...options,
      }
    )
    invariant(data, `Expected query to be prefetched. Key: ${JSON.stringify(queryKey)}`)
    return { data, ...rest }
  }

const ERRORS_ALLOWED = 'errors-allowed'

/**
 * Variant of `getUseApiQuery` that allows error responses as a valid result,
 * which importantly means they can be cached by RQ. This means we can prefetch
 * an endpoint that might error (see `prefetchQueryErrorsAllowed`) and use this
 * hook to retrieve the error result.
 *
 * Concretely, the only difference from `getUseApiQuery`: we turn all errors
 * into successes. Instead of throwing the error, we return it as a valid
 * result. This means `data` has a type that includes the possibility of error,
 * plus a discriminant to let us handle both sides properly in the calling code.
 */
export const getUseApiQueryErrorsAllowed =
  <A extends ApiClient>(api: A) =>
  <M extends string & keyof A>(
    method: M,
    params: Params<A[M]>,
    options: UseQueryOptions<
      { type: 'success'; data: Result<A[M]> } | { type: 'error'; data: ApiError },
      ApiError
    > = {}
  ) => {
    return useQuery(
      // extra bit of key is important to distinguish from normal query. if we
      // hit a a given endpoint twice on the same page, once the normal way and
      // once with errors allowed the responses have different shapes, so we do
      // not want to share the cache and mix them up
      [method, params, ERRORS_ALLOWED] as QueryKey,
      ({ signal }) =>
        api[method](params, { signal })
          .then(handleResult(method))
          .then((data) => ({ type: 'success' as const, data }))
          .catch((data) => ({ type: 'error' as const, data })),
      options
    )
  }

export const getUseApiMutation =
  <A extends ApiClient>(api: A) =>
  <M extends string & keyof A>(
    method: M,
    options?: UseMutationOptions<Result<A[M]>, ApiError, Params<A[M]>>
  ) =>
    useMutation(
      (params) => api[method](params).then(handleResult(method)),
      // no catch, let unexpected errors bubble up
      options
    )

export const wrapQueryClient = <A extends ApiClient>(api: A, queryClient: QueryClient) => ({
  invalidateQueries: <M extends keyof A>(
    method: M,
    params?: Params<A[M]>,
    filters?: InvalidateQueryFilters
  ) => queryClient.invalidateQueries(params ? [method, params] : [method], filters),
  setQueryData: <M extends keyof A>(method: M, params: Params<A[M]>, data: Result<A[M]>) =>
    queryClient.setQueryData([method, params], data),
  cancelQueries: <M extends keyof A>(
    method: M,
    params?: Params<A[M]>,
    filters?: QueryFilters
  ) => queryClient.cancelQueries(params ? [method, params] : [method], filters),
  refetchQueries: <M extends keyof A>(
    method: M,
    params?: Params<A[M]>,
    filters?: QueryFilters
  ) => queryClient.refetchQueries(params ? [method, params] : [method], filters),
  fetchQuery: <M extends string & keyof A>(
    method: M,
    params: Params<A[M]>,
    options: FetchQueryOptions<Result<A[M]>, ApiError> = {}
  ) =>
    queryClient.fetchQuery({
      queryKey: [method, params],
      queryFn: () => api[method](params).then(handleResult(method)),
      ...options,
    }),
  prefetchQuery: <M extends string & keyof A>(
    method: M,
    params: Params<A[M]>,
    options: FetchQueryOptions<Result<A[M]>, ApiError> = {}
  ) =>
    queryClient.prefetchQuery({
      queryKey: [method, params],
      queryFn: () => api[method](params).then(handleResult(method)),
      ...options,
    }),
  /**
   * Loader analog to `useApiQueryErrorsAllowed`. Prefetch a query that can
   * error, converting the error to a valid result so RQ will cache it.
   */
  prefetchQueryErrorsAllowed: <M extends string & keyof A>(
    method: M,
    params: Params<A[M]>,
    options: FetchQueryOptions<
      { type: 'success'; data: Result<A[M]> } | { type: 'error'; data: ApiError },
      ApiError
    > & {
      /**
       * HTTP errors will show up unexplained in the browser console. It can be
       * helpful to reassure people they're normal.
       */
      explanation: string
      expectedStatusCode: 403 | 404
    }
  ) =>
    queryClient.prefetchQuery({
      queryKey: [method, params, ERRORS_ALLOWED],
      queryFn: () =>
        api[method](params)
          .then(handleResult(method))
          .then((data) => ({ type: 'success' as const, data }))
          .catch((data: ApiError) => {
            // if we get an unexpected error, we're still throwing
            if (data.statusCode !== options.expectedStatusCode) {
              // data is the result of handleResult, so it's ready to through
              // directly without further processing
              throw data
            }
            console.log(options.explanation)
            return { type: 'error' as const, data }
          }),
      ...options,
    }),
})

export const getUseApiQueryClient =
  <A extends ApiClient>(api: A) =>
  () =>
    wrapQueryClient(api, useQueryClient())

/* 
1. what's up with [method, params]?

https://react-query.tanstack.com/guides/queries

The first arg to useQuery is a unique key, which can be a string, an object,
or an array of those. The contents are tested with deep equality (not tricked
by key order) to uniquely identify a request for caching purposes. For us, what
uniquely identifies a request is the string name of the method and the params
object.

2. what's up with the types?

  A              - api client object
  M              - api method name, i.e., a key on the client object
  A[M]           - api fetcher function like (p: Params) => Promise<Response>
  Params<A[M]>   - extract Params from the function
  Result<A[M]>   - extract Result from the function

The difficulty is that we want full type safety, i.e., based on the method name
passed in, we want the typechecker to check the params and annotate the
response. PickByValue ensures we only call methods on the API object that follow
the (params) => Promise<Result> pattern. Then we use the inferred type of the
key (the method name) to enforce that params match the expected params on the
named method. Finally we use the Result helper to tell react-query what type to
put on the response data.

3. why

     (api) => (method, params) => useQuery(..., api[method](params))

   instead of

     const api = new Api()
     (method, params) => useQuery(..., api[method](params))

   i.e., why not use a closure for api?

In order to infer the A type and enforce that M is the right kind of key such
that we can pull the params and response off and actually call api[method], api
needs to be an argument to the function too.
*/
