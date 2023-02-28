import type { Params } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'

import { toApiSelector } from '@oxide/util'

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

const requireOrgParams = requireParams('orgName')
const requireProjectParams = requireParams('orgName', 'projectName')
const requireInstanceParams = requireParams('orgName', 'projectName', 'instanceName')
const requireVpcParams = requireParams('orgName', 'projectName', 'vpcName')
export const requireSiloParams = requireParams('siloName')
const requireSledParams = requireParams('sledId')
export const requireUpdateParams = requireParams('version')

// non-hook versions for use in loaders

export const getOrgSelector = (p: Readonly<Params<string>>) =>
  toApiSelector(requireOrgParams(p))
export const getProjectSelector = (p: Readonly<Params<string>>) =>
  toApiSelector(requireProjectParams(p))
export const getInstanceSelector = (p: Readonly<Params<string>>) =>
  toApiSelector(requireInstanceParams(p))
export const getVpcSelector = (p: Readonly<Params<string>>) =>
  toApiSelector(requireVpcParams(p))
export const getGroupSelector = requireParams('group')

// Wrappers for RR's `useParams` that guarantee (in dev) that the specified
// params are present. Only the specified keys end up in the result object, but
// we do not error if there are other params present in the query string.

export const useOrgSelector = () => toApiSelector(useOrgParams())
export const useProjectSelector = () => toApiSelector(useProjectParams())
export const useVpcSelector = () => toApiSelector(useVpcParams())
export const useInstanceSelector = () => toApiSelector(useInstanceParams())
export const useGroupSelector = () => getGroupSelector(useParams())

const useOrgParams = () => requireOrgParams(useParams())
const useProjectParams = () => requireProjectParams(useParams())
const useInstanceParams = () => requireInstanceParams(useParams())
const useVpcParams = () => requireVpcParams(useParams())
export const useSiloParams = () => requireSiloParams(useParams())
export const useSledParams = () => requireSledParams(useParams())
export const useUpdateParams = () => requireUpdateParams(useParams())
