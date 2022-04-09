import type { Params } from 'react-router-dom'
import { useParams as _useParams } from 'react-router-dom'
import { invariant } from '@oxide/util'

/**
 * Wrapper for React Router's `useParams` that throws (in dev) if any of the
 * specified params is missing. The specified params are guaranteed by TS to be
 * present on the resulting params object. Any other param is allowed to be
 * pulled off the object, but TS will require you to check if it's undefined.
 *
 * @returns an object where the specified params are guaranteed (in dev) to be
 * present
 */
// default of never is required to prevent the highly undesirable property that if
// you don't pass any arguments, the result object thinks every property is defined
export function useParams<K extends string = never>(...paramNames: K[]) {
  const params = _useParams()
  if (process.env.NODE_ENV !== 'production') {
    for (const k of paramNames) {
      invariant(
        k in params,
        `Param '${k}' not found in route. You might be rendering a component under the wrong route.`
      )
    }
  }
  return params as { readonly [k in K]: string } & Params
}
