/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useQueries } from '@tanstack/react-query'
import * as R from 'remeda'

import { getListQFn, usePrefetchedQuery } from '~/api'
import { ALL_ISH } from '~/util/consts'
import type * as PP from '~/util/path-params'

export const routerList = ({ project, vpc }: PP.Vpc) =>
  getListQFn('vpcRouterList', { query: { project, vpc, limit: ALL_ISH } })
export const routeList = ({ project, vpc, router }: PP.VpcRouter) =>
  getListQFn('vpcRouterRouteList', { query: { project, vpc, router, limit: ALL_ISH } })
export const gatewayIpPoolList = ({ project, vpc, gateway }: PP.VpcInternetGateway) =>
  getListQFn('internetGatewayIpPoolList', {
    query: { project, vpc, gateway, limit: ALL_ISH },
  })
export const gatewayIpAddressList = ({ project, vpc, gateway }: PP.VpcInternetGateway) =>
  getListQFn('internetGatewayIpAddressList', {
    query: { project, vpc, gateway, limit: ALL_ISH },
  })

/**
 * For a given gateway, return a list of [router name, RouterRoute] pairs
 */
export function useGatewayRoutes({ project, vpc, gateway }: PP.VpcInternetGateway) {
  const { data: routers } = usePrefetchedQuery(routerList({ project, vpc }).optionsFn())
  const routerNames = routers.items.map((r) => r.name)

  const routesQueries = useQueries({
    queries: routerNames.map((router) => routeList({ project, vpc, router }).optionsFn()),
  })
  const loadedRoutesLists = routesQueries.filter((q) => !!q.data).map((q) => q.data.items)

  // loading. should never happen because of prefetches
  if (loadedRoutesLists.length < routers.items.length) return null

  return R.pipe(
    R.zip(routerNames, loadedRoutesLists),
    R.flatMap(([router, routes]) => routes.map((route) => [router, route] as const)),
    R.filter(([_, r]) => r.target.type === 'internet_gateway' && r.target.value === gateway)
  )
}
