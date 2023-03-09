import type { Params } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'

const err = (param: string) =>
  `Param '${param}' not found in route. You might be rendering a component under the wrong route.`

// default of never is required to prevent the highly undesirable property that if
// you don't pass any arguments, the result object thinks every property is defined
export const requireParams =
  <K extends string = never>(...requiredKeys: K[]) =>
  (params: Readonly<Params<string>>) => {
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

export const getOrgSelector = requireParams('organization')
export const getProjectSelector = requireParams('organization', 'project')
export const getInstanceSelector = requireParams('organization', 'project', 'instance')
export const getVpcSelector = requireParams('organization', 'project', 'vpc')
export const getSiloSelector = requireParams('silo')
const requireSledParams = requireParams('sledId')
export const requireUpdateParams = requireParams('version')

// Wrappers for RR's `useParams` that guarantee (in dev) that the specified
// params are present. Only the specified keys end up in the result object, but
// we do not error if there are other params present in the query string.

export const useOrgSelector = () => getOrgSelector(useParams())
export const useProjectSelector = () => getProjectSelector(useParams())
export const useInstanceSelector = () => getInstanceSelector(useParams())
export const useVpcSelector = () => getVpcSelector(useParams())
export const useSiloSelector = () => getSiloSelector(useParams())
export const useSledParams = () => requireSledParams(useParams())
export const useUpdateParams = () => requireUpdateParams(useParams())
