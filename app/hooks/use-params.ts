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
export const requireProjectParams = requireParams('orgName', 'projectName')
const requireInstanceParams = requireParams('orgName', 'projectName', 'instanceName')
const requireVpcParams = requireParams('orgName', 'projectName', 'vpcName')
export const requireSiloParams = requireParams('siloName')
export const requireSledParams = requireParams('sledId')
export const requireUpdateParams = requireParams('version')

const useOrgParams = () => requireOrgParams(useParams())
const useProjectParams = () => requireProjectParams(useParams())
const useInstanceParams = () => requireInstanceParams(useParams())
const useVpcParams = () => requireVpcParams(useParams())
export const useSiloParams = () => requireSiloParams(useParams())
export const useSledParams = () => requireSledParams(useParams())
export const useUpdateParams = () => requireUpdateParams(useParams())

export const getOrgSelector = (p: Readonly<Params<string>>) =>
  toApiSelector(requireOrgParams(p))
export const getProjectSelector = (p: Readonly<Params<string>>) =>
  toApiSelector(requireProjectParams(p))
export const getInstanceSelector = (p: Readonly<Params<string>>) =>
  toApiSelector(requireInstanceParams(p))
export const getVpcSelector = (p: Readonly<Params<string>>) =>
  toApiSelector(requireVpcParams(p))

export const useOrgSelector = () => toApiSelector(useOrgParams())
export const useProjectSelector = () => toApiSelector(useProjectParams())
export const useVpcSelector = () => toApiSelector(useVpcParams())
export const useInstanceSelector = () => toApiSelector(useInstanceParams())

/**
 * Wrapper for RR's `useParams` that guarantees (in dev) that the specified
 * params are present. No keys besides those specified are present on the result
 * object, but we do not error if there are other params present on the page.
 */
// default of never is required to prevent the highly undesirable property that if
// you don't pass any arguments, the result object thinks every property is defined
export function useRequiredParams<K extends string = never>(...requiredKeys: K[]) {
  return requireParams(...requiredKeys)(useParams())
}
