/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { createColumnHelper } from '@tanstack/react-table'
import { useMemo } from 'react'
import { Outlet, type LoaderFunctionArgs } from 'react-router-dom'

import {
  apiQueryClient,
  type InternetGateway,
  // type InternetGatewayIpAddress,
  // type InternetGatewayIpPool,
} from '~/api'
import { getVpcSelector, useVpcSelector } from '~/hooks/use-params'
import { makeLinkCell } from '~/table/cells/LinkCell'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
// import { CreateLink } from '~/ui/lib/CreateButton'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { ALL_ISH } from '~/util/consts'
import { pb } from '~/util/path-builder'

const colHelper = createColumnHelper<InternetGateway>()

VpcInternetGatewaysTab.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project, vpc } = getVpcSelector(params)
  const query = { project, vpc, limit: ALL_ISH }
  await Promise.all([
    apiQueryClient.prefetchQuery('internetGatewayList', { query }),
    apiQueryClient.prefetchQuery('internetGatewayIpAddressList', { query }),
    apiQueryClient.prefetchQuery('internetGatewayIpPoolList', { query }),
  ])
  return null
}

export function VpcInternetGatewaysTab() {
  const vpcSelector = useVpcSelector()
  const { project, vpc } = vpcSelector
  // const { data: internetGatewayIpAddresses } = usePrefetchedApiQuery(
  //   'internetGatewayIpAddressList',
  //   { query }
  // )
  // const { data: internetGatewayIpPools } = usePrefetchedApiQuery(
  //   'internetGatewayIpPoolList',
  //   { query }
  // )
  const { Table } = useQueryTable('internetGatewayList', {
    query: { project, vpc, limit: ALL_ISH },
  })

  // type PartitionedIpAddresses = Record<string, InternetGatewayIpAddress[]>
  // const partitionedIpAddresses: PartitionedIpAddresses = useMemo(() => {
  //   if (!internetGatewayIpAddresses) return {}
  //   return internetGatewayIpAddresses.items.reduce((acc, ip: InternetGatewayIpAddress) => {
  //     acc[ip.internetGatewayId] = acc[ip.internetGatewayId] || []
  //     acc[ip.internetGatewayId].push(ip)
  //     return acc
  //   }, {} as PartitionedIpAddresses)
  // }, [internetGatewayIpAddresses])

  // type PartitionedIpPools = Record<string, InternetGatewayIpPool[]>
  // const partitionedIpPools: PartitionedIpPools = useMemo(() => {
  //   if (!internetGatewayIpPools) return {}
  //   return internetGatewayIpPools.items.reduce((acc, ip: InternetGatewayIpPool) => {
  //     acc[ip.internetGatewayId] = acc[ip.internetGatewayId] || []
  //     acc[ip.internetGatewayId].push(ip)
  //     return acc
  //   }, {} as PartitionedIpPools)
  // }, [internetGatewayIpPools])

  const emptyState = (
    <EmptyMessage
      title="No internet gateways"
      body="Create an internet gateway to see it here"
      buttonText="New internet gateway"
      buttonTo={pb.vpcInternetGatewaysNew({ project, vpc })}
    />
  )

  const staticColumns = useMemo(
    () => [
      colHelper.accessor('name', {
        cell: makeLinkCell((gateway) => pb.vpcInternetGateway({ ...vpcSelector, gateway })),
      }),
      colHelper.accessor('description', Columns.description),
      colHelper.accessor('timeCreated', Columns.timeCreated),
    ],
    [vpcSelector]
  )

  return (
    <>
      <div className="mb-3 flex justify-end space-x-2">
        {/* Add this back in when moving out of read-only mode */}
        {/* <CreateLink to={pb.vpcInternetGatewaysNew({ project, vpc })}>
          New internet gateway
        </CreateLink> */}
      </div>
      <Table columns={staticColumns} emptyState={emptyState} />
      <Outlet />
    </>
  )
}
