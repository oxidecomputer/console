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

import type { ApiResult, ErrorResult } from './__generated__/Api'

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Params<F> = F extends (p: infer P, r: infer R) => any
  ? P & {
      body?: R
    }
  : never
export type Result<F> = F extends (p: any, r: any) => Promise<ApiResult<infer R>>
  ? R
  : never
export type ResultItem<F> = F extends (
  p: any,
  r: any
) => Promise<ApiResult<{ items: (infer R)[] }>>
  ? R
  : never

type ApiClient = Record<string, (...args: any) => Promise<ApiResult<any>>>
/* eslint-enable @typescript-eslint/no-explicit-any */

export const getUseApiQuery =
  <A extends ApiClient>(
    api: A,
    handleErrors: (M: keyof A) => (resp: ErrorResult) => void
  ) =>
  <M extends keyof A>(
    method: M,
    params: Params<A[M]>,
    options: UseQueryOptions<Result<A[M]>, ErrorResult> = {}
  ) => {
    return useQuery(
      [method, params] as QueryKey,
      ({ signal }) =>
        api[method](params, { signal }).then((resp) =>
          resp.type === 'success' ? resp.data : handleErrors(method)(resp)
        ), // TODO: should we also have a catch to be careful?

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

export const getUseApiMutation =
  <A extends ApiClient>(
    api: A,
    handleErrors: (M: keyof A) => (resp: ErrorResult) => void
  ) =>
  <M extends keyof A>(
    method: M,
    options?: UseMutationOptions<Result<A[M]>, ErrorResult, Params<A[M]>>
  ) =>
    useMutation(
      ({ body, ...params }) =>
        api[method](params, body).then((resp) =>
          resp.type === 'success' ? resp.data : handleErrors(method)(resp)
        ), // TODO: should we also have a catch to be careful?
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
  fetchQuery: <M extends keyof A>(
    method: M,
    params?: Params<A[M]>,
    options: FetchQueryOptions<Result<A[M]>, ErrorResult> = {}
  ) =>
    queryClient.fetchQuery({
      queryKey: [method, params],
      queryFn: () =>
        api[method](params).then((resp) => {
          if (resp.type !== 'success') throw resp
          return resp.data
        }),
      ...options,
    }),
  prefetchQuery: <M extends keyof A>(
    method: M,
    params?: Params<A[M]>,
    options: FetchQueryOptions<Result<A[M]>, ErrorResult> = {}
  ) =>
    queryClient.prefetchQuery({
      queryKey: [method, params],
      queryFn: () =>
        api[method](params).then((resp) => {
          if (resp.type !== 'success') throw resp
          return resp.data
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
