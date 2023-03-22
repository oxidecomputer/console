import { hashQueryKey } from '@tanstack/react-query'
import { useMemo } from 'react'
import type { Params } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'

const err = (param: string) =>
  `Param '${param}' not found in route. You might be rendering a component under the wrong route.`

type AllParams = Readonly<Params<string>>

// default of never is required to prevent the highly undesirable property that if
// you don't pass any arguments, the result object thinks every property is defined
export const requireParams =
  <K extends string = never>(...requiredKeys: K[]) =>
  (params: AllParams) => {
    const requiredParams: { [k in K]?: string } = {}
    for (const k of requiredKeys) {
      const value = params[k]
      if (process.env.NODE_ENV !== 'production') {
        invariant(k in params && value, err(k))
      }
      requiredParams[k] = value
    }
    return requiredParams as { readonly [k in K]: string }
  }

export const getProjectSelector = requireParams('project')
export const getInstanceSelector = requireParams('project', 'instance')
export const getVpcSelector = requireParams('project', 'vpc')
export const getSiloSelector = requireParams('silo')
const requireSledParams = requireParams('sledId')
export const requireUpdateParams = requireParams('version')

/**
 * Turn `getThingSelector`, a pure function on a params object, into a hook
 * that pulls the params off `useParams()` and
 *
 * 1. throws an error if the desired params are missing (this is just what
 *    `getThingSelector` does), and
 * 2. more importantly, memoizes the result in a sneaky way, using React Query's
 *    `hashQueryKey` in the deps to only re-render if the contents actually
 *    change.
 *
 * Without 2, these hooks will produce a new object on every render, which is
 * fine if you always pull the params out and put those in dep arrays (they're
 * all strings) but it's much more convenient not to have it silently go wrong
 * if you use the object as a whole.
 */
function useSelectedParams<T>(getSelector: (params: AllParams) => T) {
  const sel = getSelector(useParams())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => sel, [hashQueryKey([sel])])
}

// Wrappers for RR's `useParams` that guarantee (in dev) that the specified
// params are present. Only the specified keys end up in the result object, but
// we do not error if there are other params present in the query string.

export const useProjectSelector = () => useSelectedParams(getProjectSelector)
export const useInstanceSelector = () => useSelectedParams(getInstanceSelector)
export const useVpcSelector = () => useSelectedParams(getVpcSelector)
export const useSiloSelector = () => useSelectedParams(getSiloSelector)
export const useSledParams = () => useSelectedParams(requireSledParams)
export const useUpdateParams = () => useSelectedParams(requireUpdateParams)
