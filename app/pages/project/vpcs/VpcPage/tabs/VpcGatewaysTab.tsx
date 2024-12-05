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

import { getListQFn, queryClient, type InternetGateway } from '~/api'
import { getVpcSelector, useVpcSelector } from '~/hooks/use-params'
import { makeLinkCell } from '~/table/cells/LinkCell'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { pb } from '~/util/path-builder'

const colHelper = createColumnHelper<InternetGateway>()

type VpcParams = { project: string; vpc: string }

const gatewayList = (query: VpcParams) => getListQFn('internetGatewayList', { query })

VpcInternetGatewaysTab.loader = async ({ params }: LoaderFunctionArgs) => {
  const vpcSelector = getVpcSelector(params)
  await queryClient.prefetchQuery(gatewayList(vpcSelector).optionsFn())
  return null
}

export function VpcInternetGatewaysTab() {
  const vpcSelector = useVpcSelector()

  const emptyState = (
    <EmptyMessage
      title="No internet gateways"
      body="Create an internet gateway to see it here"
      buttonText="New internet gateway"
      buttonTo={pb.vpcInternetGatewaysNew(vpcSelector)}
    />
  )

  const columns = useMemo(
    () => [
      colHelper.accessor('name', {
        cell: makeLinkCell((gateway) => pb.vpcInternetGateway({ ...vpcSelector, gateway })),
      }),
      colHelper.accessor('description', Columns.description),
      // add a column for the IP Pool associated with this Internet Gateway

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
