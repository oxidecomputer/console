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
import { Outlet, type LoaderFunctionArgs } from 'react-router-dom'

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

const InternetGatewayIpAddressCell = ({ gatewayId }: { gatewayId: string }) => {
  const { data: addresses } = useQuery(
    getListQFn('internetGatewayIpAddressList', {
      query: { gateway: gatewayId },
    }).optionsFn()
  )
  if (!addresses || addresses.items.length < 1) return <EmptyCell />
  return <CopyableIp ip={addresses.items[0].address} isLinked={false} />
}

const InternetGatewayIpPoolCell = ({ gatewayId }: { gatewayId: string }) => {
  const { data: gateways } = useQuery(
    getListQFn('internetGatewayIpPoolList', {
      query: { gateway: gatewayId },
    }).optionsFn()
  )
  if (!gateways || gateways.items.length < 1) return <EmptyCell />
  return <IpPoolCell ipPoolId={gateways.items[0].ipPoolId} />
}

const colHelper = createColumnHelper<InternetGateway>()

type VpcParams = { project: string; vpc: string }

const gatewayList = (query: VpcParams) => getListQFn('internetGatewayList', { query })

VpcInternetGatewaysTab.loader = async ({ params }: LoaderFunctionArgs) => {
  const vpcSelector = getVpcSelector(params)
  const gateways = await queryClient.fetchQuery(gatewayList(vpcSelector).optionsFn())
  await Promise.all([
    ...gateways.items.flatMap((gateway: InternetGateway) => {
      return [
        queryClient.prefetchQuery(
          getListQFn('internetGatewayIpAddressList', {
            query: { gateway: gateway.id },
          }).optionsFn()
        ),
        queryClient.prefetchQuery(
          getListQFn('internetGatewayIpPoolList', {
            query: { gateway: gateway.id },
          }).optionsFn()
        ),
      ]
    }),
    queryClient
      .fetchQuery(
        getListQFn('projectIpPoolList', { query: { limit: ALL_ISH } }).optionsFn()
      )
      .then((pools) => {
        for (const pool of pools.items) {
          const { queryKey } = apiq('projectIpPoolView', { path: { pool: pool.id } })
          queryClient.setQueryData(queryKey, pool)
        }
      }),
  ])
  return null
}

export function VpcInternetGatewaysTab() {
  const vpcSelector = useVpcSelector()

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
        cell: makeLinkCell((gateway) => pb.vpcInternetGateway({ ...vpcSelector, gateway })),
      }),
      colHelper.accessor('description', Columns.description),
      // add a column for the IP Pool associated with this Internet Gateway
      colHelper.accessor('id', {
        header: 'IP Address',
        cell: (info) => <InternetGatewayIpAddressCell gatewayId={info.getValue()} />,
      }),
      colHelper.accessor('id', {
        header: 'IP Pool',
        cell: (info) => <InternetGatewayIpPoolCell gatewayId={info.getValue()} />,
      }),
      colHelper.accessor('timeCreated', Columns.timeCreated),
    ],
    [vpcSelector]
  )

  const { table } = useQueryTable({ query: gatewayList(vpcSelector), columns, emptyState })

  return (
    <>
      {table}
      <Outlet />
    </>
  )
}
