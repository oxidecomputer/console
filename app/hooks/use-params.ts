/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { hashKey } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useParams, type Params } from 'react-router-dom'

import { invariant } from '~/util/invariant'

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
export const getFloatingIpSelector = requireParams('project', 'floatingIp')
export const getInstanceSelector = requireParams('project', 'instance')
export const getVpcSelector = requireParams('project', 'vpc')
export const getFirewallRuleSelector = requireParams('project', 'vpc', 'rule')
export const getVpcRouterSelector = requireParams('project', 'vpc', 'router')
export const getRouterRouteSelector = requireParams('project', 'vpc', 'router', 'route')
export const getVpcSubnetSelector = requireParams('project', 'vpc', 'subnet')
export const getSiloSelector = requireParams('silo')
export const getSiloImageSelector = requireParams('image')
export const getIdpSelector = requireParams('silo', 'provider')
export const getProjectImageSelector = requireParams('project', 'image')
export const getProjectSnapshotSelector = requireParams('project', 'snapshot')
export const requireSledParams = requireParams('sledId')
export const requireUpdateParams = requireParams('version')
export const getIpPoolSelector = requireParams('pool')

/**
 * Turn `getThingSelector`, a pure function on a params object, into a hook
 * that pulls the params off `useParams()` and
 *
 * 1. throws an error if the desired params are missing (this is just what
 *    `getThingSelector` does), and
 * 2. more importantly, memoizes the result in a sneaky way, using React Query's
 *    `hashKey` in the deps to only re-render if the contents actually
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
  return useMemo(() => sel, [hashKey([sel])])
}

// Wrappers for RR's `useParams` that guarantee (in dev) that the specified
// params are present. Only the specified keys end up in the result object, but
// we do not error if there are other params present in the query string.

export const useFloatingIpSelector = () => useSelectedParams(getFloatingIpSelector)
export const useProjectSelector = () => useSelectedParams(getProjectSelector)
export const useProjectImageSelector = () => useSelectedParams(getProjectImageSelector)
export const useProjectSnapshotSelector = () =>
  useSelectedParams(getProjectSnapshotSelector)
export const useInstanceSelector = () => useSelectedParams(getInstanceSelector)
export const useVpcSelector = () => useSelectedParams(getVpcSelector)
export const useVpcRouterSelector = () => useSelectedParams(getVpcRouterSelector)
export const useRouterRouteSelector = () => useSelectedParams(getRouterRouteSelector)
export const useVpcSubnetSelector = () => useSelectedParams(getVpcSubnetSelector)
export const useFirewallRuleSelector = () => useSelectedParams(getFirewallRuleSelector)
export const useSiloSelector = () => useSelectedParams(getSiloSelector)
export const useSiloImageSelector = () => useSelectedParams(getSiloImageSelector)
export const useIdpSelector = () => useSelectedParams(getIdpSelector)
export const useSledParams = () => useSelectedParams(requireSledParams)
export const useUpdateParams = () => useSelectedParams(requireUpdateParams)
export const useIpPoolSelector = () => useSelectedParams(getIpPoolSelector)
