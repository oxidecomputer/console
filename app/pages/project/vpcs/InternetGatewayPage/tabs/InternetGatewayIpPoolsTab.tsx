/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { createColumnHelper } from '@tanstack/react-table'
import { useCallback } from 'react'
import type { LoaderFunctionArgs } from 'react-router-dom'

import { apiQueryClient, getListQFn, queryClient, type InternetGatewayIpPool } from '~/api'
import { getInternetGatewaySelector, useInternetGatewaySelector } from '~/hooks/use-params'
import { IpPoolCell } from '~/table/cells/IpPoolCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { ALL_ISH } from '~/util/consts'
import type * as PP from '~/util/path-params'

const gatewayIpPoolList = (query: PP.VpcInternetGateway) =>
  getListQFn('internetGatewayIpPoolList', { query })

InternetGatewayIpPoolsTab.loader = async function ({ params }: LoaderFunctionArgs) {
  const { project, vpc, gateway } = getInternetGatewaySelector(params)
  await Promise.all([
    queryClient.prefetchQuery(gatewayIpPoolList({ project, vpc, gateway }).optionsFn()),
    // fetch IP Pools and preload into RQ cache so fetches by ID in
    // IpPoolCell can be mostly instant yet gracefully fall back to
    // fetching individually if we don't fetch them all here
    apiQueryClient
      .fetchQuery('projectIpPoolList', { query: { limit: ALL_ISH } })
      .then((pools) => {
        console.log({ pools })
        for (const pool of pools.items) {
          apiQueryClient.setQueryData(
            'projectIpPoolView',
            { path: { pool: pool.id } },
            pool
          )
        }
      }),
  ])
  return null
}

const colHelper = createColumnHelper<InternetGatewayIpPool>()

const staticColumns = [
  colHelper.accessor('name', {}),
  colHelper.accessor('description', Columns.description),
  colHelper.accessor('ipPoolId', {
    header: 'IP Pool',
    cell: (info) => <IpPoolCell ipPoolId={info.getValue()} />,
  }),
]

export function InternetGatewayIpPoolsTab() {
  const gatewaySelector = useInternetGatewaySelector()

  const emptyState = (
    <EmptyMessage
      title="No Internet Gateway IP Pools"
      body="Use the CLI to add an IP pool to this internet gateway to see it here."
    />
  )

  // The user can copy the ID of the IP Pool attached to this internet gateway
  const makeActions = useCallback(
    (internetGatewayIpPool: InternetGatewayIpPool): MenuAction[] => [
      {
        label: 'Copy IP pool ID',
        onActivate() {
          window.navigator.clipboard.writeText(internetGatewayIpPool.ipPoolId)
        },
      },
    ],
    []
  )

  const columns = useColsWithActions(staticColumns, makeActions)
  const { table } = useQueryTable({
    query: gatewayIpPoolList(gatewaySelector),
    columns,
    emptyState,
  })
  return table
}
