import type { Params } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'

const err = (param: string) =>
  `Param '${param}' not found in route. You might be rendering a component under the wrong route.`

/**
 * Wrapper for RR's `useParams` that guarantees (in dev) that the specified
 * params are present. No keys besides those specified are present on the result
 * object, but we do not error if there are other params present on the page.
 */
// default of never is required to prevent the highly undesirable property that if
// you don't pass any arguments, the result object thinks every property is defined
export function useRequiredParams<K extends string = never>(...requiredKeys: K[]) {
  const params = useParams()
  // same as below except we build an object with only the specified keys
  const requiredParams: { [k in K]?: string } = {}
  if (process.env.NODE_ENV !== 'production') {
    for (const k of requiredKeys) {
      const value = params[k]
      invariant(k in params && value, err(k))
      requiredParams[k] = value
    }
  }
  return requiredParams as { readonly [k in K]: string }
}

/**
 * Wrapper for RR's `useParams` that guarantees (in dev) that the specified
 * params are present. Includes all other string keys optionally — caller
 * has to check if they're undefined.
 */
// default of never is required to prevent the highly undesirable property that if
// you don't pass any arguments, the result object thinks every property is defined
export function useAllParams<K extends string = never>(...requiredKeys: K[]) {
  const params = useParams()
  if (process.env.NODE_ENV !== 'production') {
    for (const k of requiredKeys) {
      invariant(k in params, err(k))
    }
  }
  // same as above except we return everything useParams() gives us
  return params as { readonly [k in K]: string } & Params
}
