import useSWR from 'swr'

type Params = Record<string, unknown>

// TODO: write tests for this
export const sortObj = (obj: Params): Params => {
  const sorted: Params = {}
  for (const k of Object.keys(obj).sort()) {
    sorted[k] = obj[k]
  }
  return sorted
}

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
export function useApiData<P extends Params, R>(
  method: (p: P) => Promise<R>,
  params: P
) {
  if (process.env.NODE_ENV === 'development' && method.name === '') {
    throw new Error('API method must have a name')
  }

  const paramsStr = JSON.stringify(sortObj(params))
  return useSWR<R>([method.name, paramsStr], () => method(params))
}
