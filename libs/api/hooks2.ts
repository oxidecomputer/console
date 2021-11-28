import type { UseQueryOptions } from 'react-query'
import { useQuery } from 'react-query'

import type { HttpResponse } from './__generated__/Api'

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

type ErrorData = {
  request_id: string
  error_code: string | null
  message: string
}

export const getUseApiQuery2 =
  <A extends ApiClient>(api: A) =>
  <M extends keyof A>(
    method: M,
    params: Params<A[M]>,
    options?: UseQueryOptions<Result<A[M]>, HttpResponse<null, ErrorData>>
  ) =>
    useQuery(
      [method, params],
      // The generated client parses the json and sticks it in `data` for us, so
      // that's what we want to return from the fetcher. Note that while there
      // is an --unwrap-response-data CLI flag for the generator that pulls out
      // the data key for us, something about the types is weird or wrong, so
      // we're doing it ourselves here instead.
      //
      // In the case of an error, it does the same thing with the `error` key,
      // but since there may not always be parseable json in an error response
      // (I think?) it seems more reasonable in that case to take the whole
      // `HttpResponse` instead of plucking out error with
      //
      //   .catch((resp) => resp.error)
      //
      // The generated client already throws on error responses, which is what
      // react-query wants, so we don't have to handle the error case explicitly
      // here.
      () => api[method](params).then((resp) => resp.data),
      options
    )
