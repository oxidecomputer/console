/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import {
  hashKey,
  queryOptions,
  useMutation,
  useQuery,
  type FetchQueryOptions,
  type InvalidateQueryFilters,
  type QueryClient,
  type QueryKey,
  type UseMutationOptions,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query'
import * as R from 'remeda'
import { type SetNonNullable } from 'type-fest'

import { invariant } from '~/util/invariant'

import type { ApiResult } from './__generated__/Api'
import { processServerError, type ApiError } from './errors'
import { navToLogin } from './nav-to-login'

/* eslint-disable @typescript-eslint/no-explicit-any */
type Params<F> = F extends (p: infer P) => any ? P : never
type Result<F> = F extends (p: any) => Promise<ApiResult<infer R>> ? R : never

export type ResultsPage<TItem> = { items: TItem[]; nextPage?: string | null }

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
    if (result.response.status === 401 && method !== 'loginLocal') {
      // TODO-usability: for background requests, a redirect to login without
      // warning could come as a surprise to the user, especially because
      // sometimes background requests are not directly triggered by a user
      // action, e.g., polling or refetching when window regains focus
      navToLogin({ includeCurrent: true })
    }

    const error = processServerError(method, result)

    // log to the console so it's there in case they open the dev tools, unlike
    // network tab, which only records if dev tools are already open. but don't
    // clutter test output
    if (process.env.NODE_ENV !== 'test') {
      const consolePage = window.location.pathname + window.location.search
      // TODO: need to change oxide.ts to put the HTTP method on the result in
      // order to log it here
      console.error(
        `More info about API ${error.statusCode || 'error'} on ${consolePage}

API URL:        ${result.response.url}
Request ID:     ${error.requestId}
Error code:     ${error.errorCode}
Error message:  ${error.message.replace(/\n/g, '\n' + ' '.repeat('Error message:  '.length))}
`
      )
    }

    // we need to rethrow because that's how react-query knows it's an error
    throw error
  }

/**
 * `queryKey` and `queryFn` are always constructed by our helper hooks, so we
 * only allow the rest of the options.
 */
type UseQueryOtherOptions<T> = Omit<
  UseQueryOptions<T, ApiError>,
  'queryKey' | 'queryFn' | 'initialData'
>

/**
 * `queryKey` and `queryFn` are always constructed by our helper hooks, so we
 * only allow the rest of the options.
 */
type FetchQueryOtherOptions<T> = Omit<
  FetchQueryOptions<T, ApiError>,
  'queryKey' | 'queryFn'
>

export const getApiQueryOptions =
  <A extends ApiClient>(api: A) =>
  <M extends string & keyof A>(
    method: M,
    params: Params<A[M]>,
    options: UseQueryOtherOptions<Result<A[M]>> = {}
  ) =>
    queryOptions({
      queryKey: [method, params],
      // no catch, let unexpected errors bubble up
      queryFn: () => api[method](params).then(handleResult(method)),
      // In the case of 404s, let the error bubble up to the error boundary so
      // we can say Not Found. If you need to allow a 404 and want it to show
      // up as `error` state instead, pass `useErrorBoundary: false` as an
      // option from the calling component and it will override this
      throwOnError: (err) => err.statusCode === 404,
      ...options,
    })

// Managed here instead of at the display layer so it can be built into the
// query options and shared between loader prefetch and QueryTable
export const PAGE_SIZE = 50

/**
 * This primarily exists so we can have an object that encapsulates everything
 * useQueryTable needs to know about a query. In particular, it needs the page
 * size, and you can't pull that out of the query options object unless you
 * stick it in `meta`, and then we don't have type safety.
 */
export type PaginatedQuery<TData> = {
  optionsFn: (
    pageToken?: string
  ) => UseQueryOptions<TData, ApiError> & { queryKey: QueryKey }
  pageSize: number
}

/**
 * This is the same as getApiQueryOptions except for two things:
 *
 *   1. We use a type constraint on the method key to ensure it can
 *      only be used with endpoints that return a `ResultsPage`.
 *   2. Instead of returning the options directly, it returns a paginated
 *      query config object containing the page size and a function that
 *      takes `limit` and `pageToken` and merges them into the query params
 *      so that these can be passed in by `QueryTable`.
 */
export const getListQueryOptionsFn =
  <A extends ApiClient>(api: A) =>
  <
    M extends string &
      {
        // this helper can only be used with endpoints that return ResultsPage
        [K in keyof A]: Result<A[K]> extends ResultsPage<unknown> ? K : never
      }[keyof A],
  >(
    method: M,
    params: Params<A[M]>,
    options: UseQueryOtherOptions<Result<A[M]>> = {}
  ): PaginatedQuery<Result<A[M]>> => {
    // We pull limit out of the query params rather than passing it in some
    // other way so that there is exactly one way of specifying it. If we had
    // some other way of doing it, and then you also passed it in as a query
    // param, it would be hard to guess which takes precedence. (pathOr plays
    // nice when the properties don't exist.)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const limit = R.pathOr(params as any, ['query', 'limit'], PAGE_SIZE)
    return {
      optionsFn: (pageToken?: string) => {
        const newParams = { ...params, query: { ...params.query, limit, pageToken } }
        return getApiQueryOptions(api)(method, newParams, {
          ...options,
          // identity function so current page sticks around while next loads
          placeholderData: (x) => x,
        })
      },
      pageSize: limit,
    }
  }

export const getUseApiQuery =
  <A extends ApiClient>(api: A) =>
  <M extends string & keyof A>(
    method: M,
    params: Params<A[M]>,
    options: UseQueryOtherOptions<Result<A[M]>> = {}
  ) =>
    useQuery(getApiQueryOptions(api)(method, params, options))

export const getUsePrefetchedApiQuery =
  <A extends ApiClient>(api: A) =>
  <M extends string & keyof A>(
    method: M,
    params: Params<A[M]>,
    options: UseQueryOtherOptions<Result<A[M]>> = {}
  ) => {
    const qOptions = getApiQueryOptions(api)(method, params, options)
    return ensurePrefetched(useQuery(qOptions), qOptions.queryKey)
  }

const prefetchError = (key?: QueryKey) =>
  `Expected query to be prefetched.
Key: ${key ? hashKey(key) : '<unknown>'}
Ensure the following:
• loader is called in routes.tsx and is running
• query matches in both the loader and the component
• request isn't erroring-out server-side (check the Networking tab)
• mock API endpoint is implemented in handlers.ts`

/**
 * Ensure a query result came from the cache by blowing up if `data` comes
 * back undefined.
 */
export function ensurePrefetched<TData, TError>(
  result: UseQueryResult<TData, TError>,
  /**
   * Optional because if we call this manually from a component like
   * `ensure(useQuery(...))`, * we don't necessarily have access to the key.
   */
  key?: QueryKey
) {
  invariant(result.data, prefetchError(key))
  // TS infers non-nullable on a freestanding variable, but doesn't like to do
  // it on a property. So we give it a hint
  return result as SetNonNullable<typeof result, 'data'>
}

const ERRORS_ALLOWED = 'errors-allowed'

/** Result that includes both success and error so it can be cached by RQ */
type ErrorsAllowed<T, E> = { type: 'success'; data: T } | { type: 'error'; data: E }

export const getApiQueryOptionsErrorsAllowed =
  <A extends ApiClient>(api: A) =>
  <M extends string & keyof A>(
    method: M,
    params: Params<A[M]>,
    options: UseQueryOtherOptions<ErrorsAllowed<Result<A[M]>, ApiError>> = {}
  ) =>
    queryOptions({
      // extra bit of key is important to distinguish from normal query. if we
      // hit a given endpoint twice on the same page, once the normal way and
      // once with errors allowed the responses have different shapes, so we do
      // not want to share the cache and mix them up
      queryKey: [method, params, ERRORS_ALLOWED],
      queryFn: ({ signal }) =>
        api[method](params, { signal })
          .then(handleResult(method))
          .then((data) => ({ type: 'success' as const, data }))
          .catch((data) => ({ type: 'error' as const, data })),
      ...options,
    })

export const getUseApiMutation =
  <A extends ApiClient>(api: A) =>
  <M extends string & keyof A>(
    method: M,
    options?: Omit<
      UseMutationOptions<Result<A[M]>, ApiError, Params<A[M]> & { signal?: AbortSignal }>,
      'mutationFn'
    >
  ) =>
    useMutation({
      mutationFn: ({ signal, ...params }) =>
        api[method](params, { signal }).then(handleResult(method)),
      // no catch, let unexpected errors bubble up
      ...options,
    })

export const wrapQueryClient = <A extends ApiClient>(api: A, queryClient: QueryClient) => ({
  /**
   * Note that we only take a single argument, `method`, rather than allowing
   * the full query key `[query, params]` to be specified. This is to avoid
   * accidentally overspecifying and therefore failing to match the desired
   * query. The params argument can be added back in if we ever have a use case
   * for it.
   *
   * Passing no arguments will invalidate all queries.
   */
  invalidateQueries: <M extends keyof A>(method?: M, filters?: InvalidateQueryFilters) =>
    queryClient.invalidateQueries(method ? { queryKey: [method], ...filters } : undefined),
  setQueryData: <M extends keyof A>(method: M, params: Params<A[M]>, data: Result<A[M]>) =>
    queryClient.setQueryData([method, params], data),
  setQueryDataErrorsAllowed: <M extends keyof A>(
    method: M,
    params: Params<A[M]>,
    data: ErrorsAllowed<Result<A[M]>, ApiError>
  ) => queryClient.setQueryData([method, params, ERRORS_ALLOWED], data),
  fetchQuery: <M extends string & keyof A>(
    method: M,
    params: Params<A[M]>,
    options: FetchQueryOtherOptions<Result<A[M]>> = {}
  ) =>
    queryClient.fetchQuery({
      queryKey: [method, params],
      queryFn: () => api[method](params).then(handleResult(method)),
      ...options,
    }),
  prefetchQuery: <M extends string & keyof A>(
    method: M,
    params: Params<A[M]>,
    options: FetchQueryOtherOptions<Result<A[M]>> = {}
  ) =>
    queryClient.prefetchQuery({
      queryKey: [method, params],
      queryFn: () => api[method](params).then(handleResult(method)),
      ...options,
    }),
})

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
