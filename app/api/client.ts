/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import {
  hashKey,
  QueryClient as QueryClientOrig,
  queryOptions,
  useMutation,
  useQuery,
  type QueryKey,
  type UseMutationOptions,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query'
import * as R from 'remeda'
import { type SetNonNullable } from 'type-fest'

import { invariant } from '~/util/invariant'

import { Api, type ApiResult } from './__generated__/Api'
import type { FetchParams } from './__generated__/http-client'
import { processServerError, type ApiError } from './errors'
import { navToLogin } from './nav-to-login'

const _api = new Api({
  // unit tests run in Node, whose fetch implementation requires a full URL
  host: process.env.NODE_ENV === 'test' ? 'http://testhost' : '',
})

// Pull the methods off to make the call sites shorter: `api.siloView`
// instead of `api.methods.siloView`. We only put this method field there in
// the generator to make the old way of typing `q` work, so we don't need it
// anymore. I plan to change the client to put the methods at top level, and
// then we can just export the Api() object directly.
export const api = _api.methods
export const instanceSerialConsoleStream = _api.ws.instanceSerialConsoleStream

/**
 * Same as `useQuery`, except we use `invariant(data)` to ensure the data is
 * already there in the cache at request time, which means it has been
 * prefetched in a loader. Whenever this hook is used, there should be an e2e
 * test loading the page to exercise the invariant in CI.
 */
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
  invalidateEndpoint(method: keyof typeof api) {
    return this.invalidateQueries({ queryKey: [method] })
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

export type ResultsPage<TItem> = { items: TItem[]; nextPage?: string | null }

type HandledResult<T> = { type: 'success'; data: T } | { type: 'error'; data: ApiError }

// method: keyof Api would be strictly more correct, but making it a string
// means we can call this directly in all the spots below instead of having to
// make it generic over Api, which requires passing it as an argument to
// getUseApiQuery, etc. This is fine because it is only being called inside
// functions where `method` is already required to be an API method.
const handleResult =
  (method: string) =>
  <Data>(result: ApiResult<Data>): HandledResult<Data> => {
    if (result.type === 'success') return { type: 'success', data: result.data }

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

    return { type: 'error', data: error }
  }

/**
 * `queryKey` and `queryFn` are always constructed by our helper hooks, so we
 * only allow the rest of the options.
 */
type UseQueryOtherOptions<T> = Omit<
  UseQueryOptions<T, ApiError>,
  'queryKey' | 'queryFn' | 'initialData'
>

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
 * Query options helper that only supports list endpoints. Returns
 * a function `(limit, pageToken) => QueryOptions` for use with
 * `useQueryTable`.
 *
 * Instead of returning the options directly, it returns a paginated
 * query config object containing the page size and a function that
 * takes `limit` and `pageToken` and merges them into the query params
 * so that these can be passed in by `QueryTable`.
 */
export const getListQFn = <
  Q,
  Params extends { query?: Q },
  Data extends ResultsPage<unknown>,
>(
  f: (p: Params) => Promise<ApiResult<Data>>,
  params: Params,
  options: UseQueryOtherOptions<Data> = {}
): PaginatedQuery<Data> => {
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
      return q(f, newParams, {
        ...options,
        // identity function so current page sticks around while next loads
        placeholderData: (x) => x,
      })
    },
    pageSize: limit,
  }
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

// what's up with [method, params]?
//
// https://react-query.tanstack.com/guides/queries
//
// The first arg to useQuery is a unique key, which can be a string, an object,
// or an array of those. The contents are tested with deep equality (not tricked
// by key order) to uniquely identify a request for caching purposes. For us, what
// uniquely identifies a request is the string name of the method and the params
// object.

/**
 * React Query query options helper that takes an API method, a params object,
 * and (optionally) more RQ options. Returns a query options object.
 */
export const q = <Params, Data>(
  f: (p: Params) => Promise<ApiResult<Data>>,
  params: Params,
  options: UseQueryOtherOptions<Data> = {}
) =>
  queryOptions({
    // method name first means we can invalidate all calls to this endpoint by
    // invalidating [f.name] (see invalidateEndpoint)
    queryKey: [f.name, params],
    // no catch, let unexpected errors bubble up. note there is a signal param
    // on queryFn that we could forward on to f(), but we are deliberately not
    // doing that. we don't really care about canceling queries in flight, and
    // it seems there are race conditions where something being unmounted on one
    // page causes a query we need on the subsequent page to be canceled right
    // in the middle of prefetching
    queryFn: () =>
      f(params)
        .then(handleResult(f.name))
        .then((result) => {
          if (result.type === 'success') return result.data
          throw result.data
        }),
    // In the case of 404s, let the error bubble up to the error boundary so
    // we can say Not Found. If you need to allow a 404 and want it to show
    // up as `error` state instead, pass `throwOnError: false` as an
    // option from the calling component and it will override this
    throwOnError: (err) => err.statusCode === 404,
    ...options,
  })

const ERRORS_ALLOWED = 'errors-allowed'

/**
 * Variant of `apiq` that allows error responses as a valid result, which
 * importantly means they can be cached by RQ. This means we can prefetch an
 * endpoint that might error and use this hook to retrieve the error result.
 *
 * Concretely, the difference from the usual query function is that we we
 * don't throw if handleResult comes back with an error. We return the entire
 * result object as a valid result. This means `data` has a type that includes
 * the possibility of error, plus a discriminant to let us handle both sides
 * properly in the calling code.
 *
 * We also use a special query key to distinguish these from normal API queries.
 * If we hit a given endpoint twice on the same page, once the normal way and
 * once with errors allowed, the results have different shapes, so we do not
 * want to share the cache and mix them up.
 */
export const qErrorsAllowed = <Params, Data>(
  f: (p: Params) => Promise<ApiResult<Data>>,
  params: Params,
  options: UseQueryOtherOptions<HandledResult<Data>> = {}
) =>
  queryOptions({
    // extra bit of key is important to distinguish from normal query. if we
    // hit a given endpoint twice on the same page, once the normal way and
    // once with errors allowed the responses have different shapes, so we do
    // not want to share the cache and mix them up
    queryKey: [f.name, params, ERRORS_ALLOWED],
    queryFn: () => f(params).then(handleResult(f.name)),
    // No point having throwOnError because errors do not throw. Worth
    // considering still throwing for particular errors: sometimes we expect
    // a 403, other times we expect 404s. We could take a list of acceptable
    // status codes.
    ...options,
  })

// Unlike the query one, we don't need this to go through an options object
// because we are not calling the mutation in two spots and sharing the options
//
// The signal thing is a hack that lets us pass in a signal as part of the
// params because mutation functions don't take a nice thing you can pass a
// signal in. I tried doing this with MutationMeta
// https://tanstack.com/query/latest/docs/framework/react/typescript#registering-global-meta
// but mutate() and mutateAsync() don't take the full option set or a context
// object. You can only initalize the meta at the site of the useMutation call,
// which doesn't work for the image upload use case because the timeout signal
// needs to be initialized separately for each call.
export const useApiMutation = <Params, Data>(
  f: (p: Params, fp: FetchParams) => Promise<ApiResult<Data>>,
  options?: Omit<
    // __signal bit makes it so you can pass a signal to mutate and mutateAsync.
    // the underscores make it virtually impossible for this to conflict with an
    // actual API field
    UseMutationOptions<Data, ApiError, Params & { __signal?: AbortSignal }>,
    'mutationFn'
  >
) =>
  useMutation({
    mutationFn: ({ __signal, ...params }) =>
      // Pretty safe cast: signal is an optional addition at the call site, not
      // part of the original Params type. Removing it via destructuring gives
      // us back Params, but TS can't prove Omit<Params & {signal?}, 'signal'>
      // === Params structurally.
      f(params as Params, { signal: __signal })
        .then(handleResult(f.name))
        .then((result) => {
          if (result.type === 'success') return result.data
          throw result.data
        }),
    // no catch, let unexpected errors bubble up
    ...options,
  })
