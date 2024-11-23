/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { createColumnHelper } from '@tanstack/react-table'
import type { LoaderFunctionArgs } from 'react-router-dom'

import { getListQFn, queryClient, type InternetGatewayIpAddress } from '~/api'
import { getInternetGatewaySelector, useInternetGatewaySelector } from '~/hooks/use-params'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { CopyableIp } from '~/ui/lib/CopyableIp'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'

type GatewayParams = { project: string; vpc: string; gateway: string }

const gatewayIpList = (query: GatewayParams) =>
  getListQFn('internetGatewayIpAddressList', { query })

InternetGatewayIpAddressesTab.loader = async function ({ params }: LoaderFunctionArgs) {
  const gatewaySelector = getInternetGatewaySelector(params)
  await queryClient.prefetchQuery(gatewayIpList(gatewaySelector).optionsFn())
  return null
}

const colHelper = createColumnHelper<InternetGatewayIpAddress>()

const staticColumns = [
  colHelper.accessor('name', {}),
  colHelper.accessor('description', Columns.description),
  colHelper.accessor('address', {
    header: 'Address',
    cell: (info) => <CopyableIp ip={info.getValue()} isLinked={false} />,
  }),
]

export function InternetGatewayIpAddressesTab() {
  const gatewaySelector = useInternetGatewaySelector()

  const emptyState = (
    <EmptyMessage
      title="No Internet Gateway IP Addresses"
      body="Use the CLI to add an IP address to this internet gateway to see it here."
    />
  )

  const makeActions = (): MenuAction[] => []

  const columns = useColsWithActions(staticColumns, makeActions)

  const { table } = useQueryTable({
    query: gatewayIpList(gatewaySelector),
    columns,
    emptyState,
  })

  return <>{table}</>
}
