import useSWR from 'swr'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Params = Record<string, any>

export const sortObj = (obj: Params): Params => {
  const sorted: Params = {}
  for (const k of Object.keys(obj).sort()) {
    sorted[k] = obj[k]
  }
  return sorted
}

// https://github.com/piotrwitek/utility-types/tree/df2502e#pickbyvaluet-valuetype
type PickByValue<T, ValueType> = Pick<
  T,
  { [Key in keyof T]-?: T[Key] extends ValueType ? Key : never }[keyof T]
>

/* eslint-disable @typescript-eslint/no-explicit-any */

// given an API object A and a key K where A[K] is a function that takes a
// single argument and returns a promise...

// extract the type of the argument (if it extends Params)
type ReqParams<A, K extends keyof A> = A[K] extends (p: infer P) => Promise<any>
  ? P extends Params
    ? P
    : never
  : never

// extract the type of the value inside the promise
type Response<A, K extends keyof A> = A[K] extends (p: any) => Promise<infer R>
  ? R
  : never

// This all needs explanation. The easiest starting point is what this would
// look like in plain JS, which is quite simple:
//
//   const getUseApi = (api) => (method, params) => {
//     const paramsStr = JSON.stringify(sortObj(params))
//     return useSWR([method, paramsStr], () => api[method](params))
//   }
//
// 1. what's up with the JSON.stringify/
//
// The first argument to useSWR in the standard use case would be the URL to
// fetch. It is used to uniquely identify the request for caching purposes. If
// multiple components request the same thing at the same time, SWR will only
// make one HTTP request. Because we have a generated client library, we do not
// have URLs. Instead, we have function names and parameter objects. But object
// literals do not have referential stability across renders, so we have to use
// JSON.stringify to turn the params into a stable key. We also sort the keys in
// the params object so that { a: 1, b: 2 } and { b: 2, a: 1 } are considered
// equivalent. SWR accepts an array of strings as well as a single string.
//
// 2. what's up with the types?
//
// The type situation here is pretty gnarly considering how simple the plain JS
// version is. The difficulty is that we want full type safety, i.e., based on
// the method name passed in, we want the typechecker to check the params and
// annotate the response. PickByValue ensures we only call methods on the API
// object that follow the (params) => Promise<Response> pattern. Then we use the
// inferred type of the key (the method name) to enforce that params match the
// expected params on the named method. Finally we use the Response helper to
// tell useSWR what type to put on the response data.
export function getUseApi<A extends PickByValue<A, (p: any) => Promise<any>>>(
  api: A
) {
  function useApi<K extends keyof A>(method: K, params: ReqParams<A, K>) {
    const paramsStr = JSON.stringify(sortObj(params))
    return useSWR<Response<A, K>>([method, paramsStr], () =>
      api[method](params)
    )
  }
  return useApi
}

/* eslint-enable @typescript-eslint/no-explicit-any */
