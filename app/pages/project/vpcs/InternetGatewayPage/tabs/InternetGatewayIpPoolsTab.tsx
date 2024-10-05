/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { createColumnHelper } from '@tanstack/react-table'
import { useMemo } from 'react'
import type { LoaderFunctionArgs } from 'react-router-dom'

import { apiQueryClient, usePrefetchedApiQuery, type InternetGatewayIpPool } from '~/api'
import { getInternetGatewaySelector, useInternetGatewaySelector } from '~/hooks/use-params'
import { DescriptionCell } from '~/table/cells/DescriptionCell'
import { EmptyCell } from '~/table/cells/EmptyCell'
import { UtilizationCell } from '~/table/cells/UtilizationCell'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { ALL_ISH } from '~/util/consts'

InternetGatewayIpPoolsTab.loader = async function ({ params }: LoaderFunctionArgs) {
  const { project, vpc, gateway } = getInternetGatewaySelector(params)
  await Promise.all([
    apiQueryClient.prefetchQuery('internetGatewayIpPoolList', {
      query: { project, vpc, gateway, limit: ALL_ISH },
    }),
    // get IP Pools
    apiQueryClient.prefetchQuery('ipPoolList', { query: { limit: ALL_ISH } }),
  ])
  return null
}

const colHelper = createColumnHelper<InternetGatewayIpPool>()

export function InternetGatewayIpPoolsTab() {
  const { project, vpc, gateway } = useInternetGatewaySelector()
  const { Table } = useQueryTable('internetGatewayIpPoolList', {
    query: { project, vpc, gateway, limit: ALL_ISH },
  })
  const { data: ipPools } = usePrefetchedApiQuery('ipPoolList', {
    query: { limit: ALL_ISH },
  })

  const emptyState = (
    <EmptyMessage
      title="No Internet Gateway IP Pools"
      body="Use the CLI to add an IP pool to this internet gateway to see it here."
    />
  )

  const staticColumns = useMemo(
    () => [
      colHelper.accessor('name', {}),
      colHelper.accessor('description', Columns.description),
      colHelper.accessor('ipPoolId', {
        header: 'IP Pool Name',
        cell: (info) => {
          const ipPool = ipPools.items.find((item) => item.id === info.getValue())
          return ipPool?.name || <EmptyCell />
        },
      }),
      colHelper.accessor('ipPoolId', {
        header: 'IP Pool Description',
        cell: (info) => {
          const ipPool = ipPools.items.find((item) => item.id === info.getValue())
          return <DescriptionCell text={ipPool?.description} />
        },
      }),
      colHelper.accessor('ipPoolId', {
        header: 'IP Pool Utilization',
        cell: (info) => {
          const ipPool = ipPools.items.find((item) => item.id === info.getValue())
          return <UtilizationCell pool={ipPool?.name || ''} />
        },
      }),
    ],
    [ipPools]
  )

  //   const makeActions = (info) => {
  //     return [
  //         <RowActions id={silo.siloId} copyIdLabel="Copy silo ID" />
  //     ]
  //   }

  return (
    <>
      <Table columns={staticColumns} emptyState={emptyState} />
    </>
  )
}
