/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'
import type { LoaderFunctionArgs } from 'react-router-dom'

import { type VpcRouter } from '~/api'
import { apiQueryClient } from '~/api/client'
import { getVpcSelector, useVpcSelector } from '~/hooks/use-params'
import { Columns } from '~/table/columns/common'
import { PAGE_SIZE, useQueryTable } from '~/table/QueryTable'
import { Badge } from '~/ui/lib/Badge'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'

// import { pb } from '~/util/path-builder'

VpcRoutersTab.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project, vpc } = getVpcSelector(params)
  await apiQueryClient.prefetchQuery('vpcRouterList', {
    query: { project, vpc, limit: PAGE_SIZE },
  })
  return null
}

const colHelper = createColumnHelper<VpcRouter>()

const columns = [
  colHelper.accessor('name', {}),
  colHelper.accessor('kind', {
    cell: (info) => <Badge color="neutral">{info.getValue()}</Badge>,
  }),
  colHelper.accessor('description', Columns.description),
  colHelper.accessor('timeCreated', Columns.timeCreated),
]

export function VpcRoutersTab() {
  const vpcSelector = useVpcSelector()
  const { Table } = useQueryTable('vpcRouterList', { query: vpcSelector })

  const emptyState = (
    <EmptyMessage
      title="No VPC routers"
      body="Create a router to see it here"
      // buttonText="New router"
      // buttonTo={pb.vpcSubnetsNew(vpcSelector)}
    />
  )

  return <Table columns={columns} emptyState={emptyState} />
}
