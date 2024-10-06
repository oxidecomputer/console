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

import { apiQueryClient, type InternetGatewayIpAddress } from '~/api'
import { getInternetGatewaySelector, useInternetGatewaySelector } from '~/hooks/use-params'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { CopyableIp } from '~/ui/lib/CopyableIp'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { ALL_ISH } from '~/util/consts'

InternetGatewayIpAddressesTab.loader = async function ({ params }: LoaderFunctionArgs) {
  const { project, vpc, gateway } = getInternetGatewaySelector(params)
  await Promise.all([
    apiQueryClient.prefetchQuery('internetGatewayIpAddressList', {
      query: { project, vpc, gateway, limit: ALL_ISH },
    }),
  ])
  return null
}

const colHelper = createColumnHelper<InternetGatewayIpAddress>()

export function InternetGatewayIpAddressesTab() {
  const { project, vpc, gateway } = useInternetGatewaySelector()
  const { Table } = useQueryTable('internetGatewayIpAddressList', {
    query: { project, vpc, gateway, limit: ALL_ISH },
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
      colHelper.accessor('address', {
        header: 'Address',
        cell: (info) => <CopyableIp ip={info.getValue()} isLinked={false} />,
      }),
    ],
    []
  )

  const makeActions = (): MenuAction[] => []

  const columns = useColsWithActions(staticColumns, makeActions)
  return <Table columns={columns} emptyState={emptyState} />
}
