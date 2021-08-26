import type {
  InvalidateQueryFilters,
  UseMutationOptions,
  UseQueryOptions,
} from 'react-query'
import { useQuery, useMutation, useQueryClient } from 'react-query'

import type { ApiResponse } from './__generated__'

/* eslint-disable @typescript-eslint/no-explicit-any */

type Params<F> = F extends (p: infer P) => any ? P : never
type Result<F> = F extends (p: any) => Promise<infer R> ? R : never

// even though the api object has other properties on it, as far as
// getUseApiQuery is concerned it only has the fetcher functions
type ApiClient<A> = OmitByValue<
  PickByValue<A, (p: any) => Promise<any>>,
  (p: any) => Promise<ApiResponse<any>> // exclude "-Raw" fetchers
>
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface ApiError {
  raw: Response
  data: {
    request_id: string
    error_code: string | null
    message: string
  } | null
}

// we need to rethrow so react-query knows the request in question is a
// failure and uses the result to populate `error` rather than `data`
const parseJsonAndRethrow = async (error: Response): Promise<ApiError> =>
  error
    .json()
    .catch(() => null) // if json parse fails, data is null
    .then((data) => Promise.reject({ raw: error, data }))

export const getUseApiQuery =
  <A extends ApiClient<A>>(api: A) =>
  <M extends keyof A>(
    method: M,
    params: Params<A[M]>,
    options?: UseQueryOptions<Result<A[M]>, ApiError>
  ) =>
    useQuery(
      [method, params],
      () => api[method](params).catch(parseJsonAndRethrow),
      options
    )

export const getUseApiMutation =
  <A extends ApiClient<A>>(api: A) =>
  <M extends keyof A>(
    method: M,
    options?: UseMutationOptions<Result<A[M]>, ApiError, Params<A[M]>>
  ) =>
    useMutation(
      (params) => api[method](params).catch(parseJsonAndRethrow),
      options
    )

export const getUseApiQueryClient =
  <A extends ApiClient<A>>() =>
  () => {
    const queryClient = useQueryClient()
    return {
      invalidateQueries: <M extends keyof A>(
        method: M,
        params: Params<A[M]>,
        filters?: InvalidateQueryFilters
      ) => {
        queryClient.invalidateQueries([method, params], filters)
      },
      setQueryData: <M extends keyof A>(
        method: M,
        params: Params<A[M]>,
        data: Result<A[M]>
      ) => {
        queryClient.setQueryData([method, params], data)
      },
    }
  }

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
