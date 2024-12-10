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

type VpcParams = { project: string; vpc: string }
type GatewayParams = VpcParams & { gateway: string }
type RouterParams = GatewayParams & { router: string }

const gatewayList = (query: VpcParams) =>
  getListQFn('internetGatewayList', { query: { ...query, limit: ALL_ISH } })
const routerList = (query: VpcParams) =>
  getListQFn('vpcRouterList', { query: { ...query, limit: ALL_ISH } })
const routeList = (query: VpcParams & { router: string }) =>
  getListQFn('vpcRouterRouteList', { query: { ...query, limit: ALL_ISH } })
const gatewayIpAddressList = (query: { gatewayId: string }) =>
  getListQFn('internetGatewayIpAddressList', { query: { gateway: query.gatewayId } })
const gatewayIpPoolList = (query: { gatewayId: string }) =>
  getListQFn('internetGatewayIpPoolList', { query: { gateway: query.gatewayId } })
const projectIpPoolList = getListQFn('projectIpPoolList', { query: { limit: ALL_ISH } })

const InternetGatewayIpAddressCell = ({ gatewayId }: { gatewayId: string }) => {
  const { data: addresses } = useQuery(gatewayIpAddressList({ gatewayId }).optionsFn())
  if (!addresses || addresses.items.length < 1) return <EmptyCell />
  return <CopyableIp ip={addresses.items[0].address} isLinked={false} />
}

const InternetGatewayIpPoolCell = ({ gatewayId }: { gatewayId: string }) => {
  const { data: gateways } = useQuery(gatewayIpPoolList({ gatewayId }).optionsFn())
  if (!gateways || gateways.items.length < 1) return <EmptyCell />
  return <IpPoolCell ipPoolId={gateways.items[0].ipPoolId} />
}

// called by InternetGatewayAttachedRoutesCell to get the routes per router
// we need to have this in its own function because useQuery cannot be called inside a loop
const InternetGatewayIndividualRoute = ({
  project,
  vpc,
  gateway,
  router,
}: RouterParams) => {
  const matchingRoutes: JSX.Element[] = []
  const { data: routes } = useQuery(routeList({ project, vpc, router }).optionsFn())
  if (!routes || routes.items.length < 1) return
  routes.items.forEach((route) => {
    if (route.target.type === 'internet_gateway' && route.target.value === gateway) {
      matchingRoutes.push(
        <Link
          key={route.name}
          to={pb.vpcRouterRouteEdit({
            project,
            vpc,
            router,
            route: route.name,
          })}
          className="link-with-underline text-sans-md"
        >
          {route.name}
        </Link>
      )
    }
  })
  return matchingRoutes
}

const InternetGatewayAttachedRoutesCell = ({ project, vpc, gateway }: GatewayParams) => {
  const { data: routers } = useQuery(routerList({ project, vpc }).optionsFn())
  const matchingRoutes = routers?.items.flatMap((router) =>
    InternetGatewayIndividualRoute({ project, vpc, gateway, router: router.name })
  )
  return matchingRoutes?.length ? (
    <div className="space-x-2">{matchingRoutes}</div>
  ) : (
    <EmptyCell />
  )
}

const colHelper = createColumnHelper<InternetGateway>()

VpcInternetGatewaysTab.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project, vpc } = getVpcSelector(params)
  await Promise.all([
    (await queryClient.fetchQuery(gatewayList({ project, vpc }).optionsFn())).items.flatMap(
      (gateway: InternetGateway) => {
        return [
          queryClient.prefetchQuery(
            gatewayIpAddressList({ gatewayId: gateway.id }).optionsFn()
          ),
          queryClient.prefetchQuery(
            gatewayIpPoolList({ gatewayId: gateway.id }).optionsFn()
          ),
        ]
      }
    ),
    (await queryClient.fetchQuery(routerList({ project, vpc }).optionsFn())).items.map(
      (router) => {
        queryClient.prefetchQuery(
          routeList({ project, vpc, router: router.name }).optionsFn()
        )
      }
    ),
    queryClient.fetchQuery(projectIpPoolList.optionsFn()).then((pools) => {
      for (const pool of pools.items) {
        const { queryKey } = apiq('projectIpPoolView', { path: { pool: pool.id } })
        queryClient.setQueryData(queryKey, pool)
      }
    }),
  ])
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
      colHelper.accessor('id', {
        // ID needed to avoid key collision with other name column
        id: 'ip-address',
        header: 'Attached IP Address',
        cell: (info) => <InternetGatewayIpAddressCell gatewayId={info.getValue()} />,
      }),
      colHelper.accessor('id', {
        // ID needed to avoid key collision with other name column
        id: 'ip-pool',
        header: 'Attached IP Pool',
        cell: (info) => <InternetGatewayIpPoolCell gatewayId={info.getValue()} />,
      }),
      colHelper.accessor('name', {
        // ID needed to avoid key collision with other name column
        id: 'routes',
        header: 'Routes',
        cell: (info) => (
          <InternetGatewayAttachedRoutesCell
            project={project}
            vpc={vpc}
            gateway={info.getValue()}
          />
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
