import { useParams as _useParams } from 'react-router'
import { invariant } from '../util/invariant'

/**
 * Wrapper for React Router's `useParams` that throws (in dev) if any of the
 * specified params is missing.
 *
 * @returns an object where the params are guaranteed (in dev) to be present
 */
export function useParams<K extends string>(
  ...paramNames: K[]
): Record<K, string> {
  const params = _useParams()
  // exclude both test and production
  // TODO: don't exclude test, that seems bad?
  if (process.env.NODE_ENV === 'development') {
    for (const k of paramNames) {
      invariant(
        k in params,
        `Param '${k}' not found in route. You might be rendering a component under the wrong route.`
      )
    }
  }
  return params as Record<K, string>
}
