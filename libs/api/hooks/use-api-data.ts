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

type PickByValue<T, ValueType> = Pick<
  T,
  { [Key in keyof T]-?: T[Key] extends ValueType ? Key : never }[keyof T]
>

/* eslint-disable @typescript-eslint/no-explicit-any */
type ReqParams<A, K extends keyof A> = A[K] extends (p: infer P) => Promise<any>
  ? P extends Params
    ? P
    : never
  : never

type Response<A, K extends keyof A> = A[K] extends (p: any) => Promise<infer R>
  ? R
  : never

// The first argument to useSWR in the standard use case would be
// the URL to fetch. It is used to uniquely identify the request
// for caching purposes. If multiple components request the same
// thing at the same time, SWR will only make one HTTP request.
// Because we have a generated client library, we do not have URLs.
// Instead, we have function names and parameter objects. But object
// literals do not have referential stability across renders, so we
// have to use JSON.stringify to turn the params into a stable key.
// We also sort the keys in the params object so that { a: 1, b: 2 }
// and { b: 2, a: 1 } are considered equivalent. SWR accepts an array
// of strings as well as a single string.
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
