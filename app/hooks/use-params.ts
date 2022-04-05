import { useParams as _useParams } from 'react-router-dom'
import { invariant } from '@oxide/util'

type OptionalKey<K> = K extends `${infer U}?` ? U : never
type RequiredKey<K> = K extends OptionalKey<K> ? never : K

type ParamsWithOptionalKeys<K extends string> = {
  [key in RequiredKey<K>]: string
} & {
  [key in OptionalKey<K>]?: string
}

/**
 * Wrapper for React Router's `useParams` that throws (in dev) if any of the
 * specified params is missing.
 *
 * @returns an object where the params are guaranteed (in dev) to be present
 */
export function useParams<K extends string>(
  ...paramNames: K[]
): ParamsWithOptionalKeys<K> {
  const params = _useParams()
  if (process.env.NODE_ENV !== 'production') {
    for (const k of paramNames) {
      invariant(
        k in params,
        `Param '${k}' not found in route. You might be rendering a component under the wrong route.`
      )
    }
  }
  return params as ParamsWithOptionalKeys<K>
}
