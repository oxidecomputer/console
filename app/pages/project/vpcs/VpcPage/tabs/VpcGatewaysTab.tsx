/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useQuery } from '@tanstack/react-query'
import { createColumnHelper } from '@tanstack/react-table'
import { useMemo } from 'react'
import { Link, Outlet, type LoaderFunctionArgs } from 'react-router-dom'

import { apiq, getListQFn, queryClient, type InternetGateway } from '~/api'
import { getVpcSelector, useVpcSelector } from '~/hooks/use-params'
import { EmptyCell } from '~/table/cells/EmptyCell'
import { IpPoolCell } from '~/table/cells/IpPoolCell'
import { makeLinkCell } from '~/table/cells/LinkCell'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { CopyableIp } from '~/ui/lib/CopyableIp'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { ALL_ISH } from '~/util/consts'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

import {
  gatewayIpAddressList,
  gatewayIpPoolList,
  routeList,
  routerList,
  useGatewayRoutes,
} from '../../gateway-data'

const gatewayList = ({ project, vpc }: PP.Vpc) =>
  getListQFn('internetGatewayList', { query: { project, vpc, limit: ALL_ISH } })
const projectIpPoolList = getListQFn('projectIpPoolList', { query: { limit: ALL_ISH } })

const IpAddressCell = (gatewaySelector: PP.VpcInternetGateway) => {
  const { data: addresses } = useQuery(gatewayIpAddressList(gatewaySelector).optionsFn())
  if (!addresses || addresses.items.length < 1) return <EmptyCell />
  return <CopyableIp ip={addresses.items[0].address} isLinked={false} />
}

const GatewayIpPoolCell = (gatewaySelector: PP.VpcInternetGateway) => {
  const { data: gateways } = useQuery(gatewayIpPoolList(gatewaySelector).optionsFn())
  if (!gateways || gateways.items.length < 1) return <EmptyCell />
  return <IpPoolCell ipPoolId={gateways.items[0].ipPoolId} />
}

const GatewayRoutes = ({ project, vpc, gateway }: PP.VpcInternetGateway) => {
  const matchingRoutes = useGatewayRoutes({ project, vpc, gateway })

  if (!matchingRoutes?.length) return <EmptyCell />

  return matchingRoutes.map(([router, route]) => {
    const to = pb.vpcRouterRouteEdit({ project, vpc, router, route: route.name })
    const key = `${router}-${route.name}`
    return (
      <Link key={key} to={to} className="link-with-underline text-sans-md">
        {route.name}
      </Link>
    )
  })
}

const colHelper = createColumnHelper<InternetGateway>()

VpcInternetGatewaysTab.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project, vpc } = getVpcSelector(params)
  const [gateways, routers] = await Promise.all([
    queryClient.fetchQuery(gatewayList({ project, vpc }).optionsFn()),
    queryClient.fetchQuery(routerList({ project, vpc }).optionsFn()),
  ])

  await Promise.all([
    ...gateways.items.flatMap((gateway: InternetGateway) => [
      queryClient.prefetchQuery(
        gatewayIpAddressList({ project, vpc, gateway: gateway.name }).optionsFn()
      ),
      queryClient.prefetchQuery(
        gatewayIpPoolList({ project, vpc, gateway: gateway.name }).optionsFn()
      ),
    ]),
    ...routers.items.map((router) =>
      queryClient.prefetchQuery(
        routeList({ project, vpc, router: router.name }).optionsFn()
      )
    ),
    queryClient.fetchQuery(projectIpPoolList.optionsFn()).then((pools) => {
      for (const pool of pools.items) {
        const { queryKey } = apiq('projectIpPoolView', { path: { pool: pool.id } })
        queryClient.setQueryData(queryKey, pool)
      }
    }),
  ] satisfies Promise<unknown>[])

  return null
}

export function VpcInternetGatewaysTab() {
  const { project, vpc } = useVpcSelector()

  const emptyState = (
    <EmptyMessage
      title="No internet gateways"
      body="Create an internet gateway to see it here"
      // buttonText="New internet gateway"
      // buttonTo={pb.vpcInternetGatewaysNew(vpcSelector)}
    />
  )

  const columns = useMemo(
    () => [
      colHelper.accessor('name', {
        cell: makeLinkCell((gateway) => pb.vpcInternetGateway({ project, vpc, gateway })),
      }),
      colHelper.accessor('description', Columns.description),
      colHelper.accessor('name', {
        // ID needed to avoid key collision with other name column
        id: 'ip-address',
        header: 'Attached IP Address',
        cell: (info) => (
          <IpAddressCell project={project} vpc={vpc} gateway={info.getValue()} />
        ),
      }),
      colHelper.accessor('name', {
        // ID needed to avoid key collision with other name column
        id: 'ip-pool',
        header: 'Attached IP Pool',
        cell: (info) => (
          <GatewayIpPoolCell project={project} vpc={vpc} gateway={info.getValue()} />
        ),
      }),
      colHelper.accessor('name', {
        // ID needed to avoid key collision with other name column
        id: 'routes',
        header: 'Routes',
        cell: (info) => (
          <GatewayRoutes project={project} vpc={vpc} gateway={info.getValue()} />
        ),
      }),
      colHelper.accessor('timeCreated', Columns.timeCreated),
    ],
    [project, vpc]
  )

  const { table } = useQueryTable({
    query: gatewayList({ project, vpc }),
    columns,
    emptyState,
  })

  return (
    <>
      {table}
      <Outlet />
    </>
  )
}
