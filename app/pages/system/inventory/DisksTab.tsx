/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'

import { apiQueryClient, type PhysicalDisk } from '@oxide/api'
import { Servers24Icon } from '@oxide/design-system/icons/react'

import { PAGE_SIZE, useQueryTable } from '~/table/QueryTable'
import { Badge } from '~/ui/lib/Badge'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'

const EmptyState = () => (
  <EmptyMessage
    icon={<Servers24Icon />}
    title="Something went wrong"
    body="We expected some racks here, but none were found"
  />
)

DisksTab.loader = async () => {
  await apiQueryClient.prefetchQuery('physicalDiskList', { query: { limit: PAGE_SIZE } })
  return null
}

const colHelper = createColumnHelper<PhysicalDisk>()
const staticCols = [
  colHelper.accessor('id', {}),
  colHelper.accessor((d) => (d.formFactor === 'u2' ? 'U.2' : 'M.2'), {
    header: 'Form factor',
    cell: (info) => <Badge>{info.getValue()}</Badge>,
  }),
  colHelper.accessor('model', { header: 'model number' }),
  colHelper.accessor('serial', { header: 'serial number' }),
  colHelper.accessor('policy', {
    cell: (info) => {
      const policy = info.getValue().kind
      const color = policy === 'in_service' ? 'default' : 'neutral'
      return <Badge color={color}>{policy.replace(/_/g, ' ')}</Badge>
    },
  }),
  colHelper.accessor('state', {
    cell: (info) => {
      const state = info.getValue()
      const color = state === 'active' ? 'default' : 'neutral'
      return <Badge color={color}>{state}</Badge>
    },
  }),
]

export function DisksTab() {
  const { Table } = useQueryTable('physicalDiskList', {})
  return <Table emptyState={<EmptyState />} columns={staticCols} />
}
