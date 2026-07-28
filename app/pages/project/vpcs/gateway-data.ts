/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useQueries } from '@tanstack/react-query'
import * as R from 'remeda'

import { api, getListQFn, usePrefetchedQuery } from '~/api'
import { ALL_ISH } from '~/util/consts'
import type * as PP from '~/util/path-params'

export const routerList = ({ project, vpc }: PP.Vpc) =>
  getListQFn(api.vpcRouterList, { query: { project, vpc, limit: ALL_ISH } })
export const routeList = ({ project, vpc, router }: PP.VpcRouter) =>
  getListQFn(api.vpcRouterRouteList, {
    query: { project, vpc, router, limit: ALL_ISH },
  })
export const gatewayIpPoolList = ({ project, vpc, gateway }: PP.VpcInternetGateway) =>
  getListQFn(api.internetGatewayIpPoolList, {
    query: { project, vpc, gateway, limit: ALL_ISH },
  })
export const gatewayIpAddressList = ({ project, vpc, gateway }: PP.VpcInternetGateway) =>
  getListQFn(api.internetGatewayIpAddressList, {
    query: { project, vpc, gateway, limit: ALL_ISH },
  })

/**
 * For a given gateway, return a list of [router name, RouterRoute] pairs
 */
export function useGatewayRoutes({ project, vpc, gateway }: PP.VpcInternetGateway) {
  const { data: routers } = usePrefetchedQuery(routerList({ project, vpc }).optionsFn())
  const routerNames = routers.items.map((r) => r.name)

  return useQueries({
    queries: routerNames.map((router) => routeList({ project, vpc, router }).optionsFn()),
    // combine's result is structurally shared by React Query, so the returned
    // array is referentially stable across renders — required by consumers
    // that use it as table data or in dep arrays
    combine: (results) => {
      // loading. should never happen because of prefetches
      if (!results.every((q) => !!q.data)) return null
      return R.pipe(
        R.zip(
          routerNames,
          results.map((q) => q.data.items)
        ),
        R.flatMap(([router, routes]) => routes.map((route) => [router, route] as const)),
        R.filter(
          ([_, r]) => r.target.type === 'internet_gateway' && r.target.value === gateway
        )
      )
    },
  })
}
