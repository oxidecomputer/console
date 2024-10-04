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

import { apiQueryClient, usePrefetchedApiQuery, type InternetGateway } from '~/api'
import { getVpcSelector, useVpcSelector } from '~/hooks/use-params'
import { makeLinkCell } from '~/table/cells/LinkCell'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { CreateLink } from '~/ui/lib/CreateButton'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { ALL_ISH } from '~/util/consts'
import { pb } from '~/util/path-builder'

const colHelper = createColumnHelper<InternetGateway>()

VpcInternetGatewaysTab.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project, vpc } = getVpcSelector(params)
  await apiQueryClient.prefetchQuery('internetGatewayList', {
    query: { project, vpc, limit: ALL_ISH },
  })
  return null
}

export function VpcInternetGatewaysTab() {
  const vpcSelector = useVpcSelector()
  const { project, vpc } = vpcSelector
  const igs = usePrefetchedApiQuery('internetGatewayList', {
    query: { project, vpc, limit: ALL_ISH },
  })
  const { Table } = useQueryTable('internetGatewayList', {
    query: { project, vpc, limit: ALL_ISH },
  })

  console.log({ igs })
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
        <CreateLink to={pb.vpcInternetGatewaysNew({ project, vpc })}>
          New internet gateway
        </CreateLink>
      </div>
      <Table columns={staticColumns} emptyState={emptyState} />
      <Outlet />
    </>
  )
}
