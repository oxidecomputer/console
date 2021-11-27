import type { UseQueryOptions } from 'react-query'
import { useQuery } from 'react-query'

import type { HttpResponse } from './__generated__/Api'
import type { ApiError } from './hooks'

/* eslint-disable @typescript-eslint/no-explicit-any */

// this doesn't work for all methods. there appears to be a bug where
// --extract-request-params only works on some methods. it's supposed to put
// path params in an object, but there are a bunch of methods where the path
// params are separate string arguments
type Params<F> = F extends (p: infer P, r: any) => any ? P : never
type Result<F> = F extends (p: any, r: any) => Promise<HttpResponse<infer R>>
  ? R
  : never

type ApiClient = Record<string, (...args: any) => Promise<HttpResponse<any>>>
/* eslint-enable @typescript-eslint/no-explicit-any */

export const getUseApiQuery2 =
  <A extends ApiClient>(api: A) =>
  <M extends keyof A>(
    method: M,
    params: Params<A[M]>,
    options?: UseQueryOptions<Result<A[M]>, ApiError['data']>
  ) =>
    useQuery(
      [method, params],
      () =>
        api[method](params)
          .then(({ data }) => data)
          .catch(({ error }) => Promise.reject(error)),
      options
    )
