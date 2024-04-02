/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'

import { apiQueryClient, type PhysicalDisk } from '@oxide/api'
import { Racks24Icon } from '@oxide/design-system/icons/react'

import { useQueryTable } from '~/table/QueryTable'
import { Badge } from '~/ui/lib/Badge'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'

const EmptyState = () => {
  return (
    <EmptyMessage
      icon={<Racks24Icon />}
      title="Something went wrong"
      body="We expected some racks here, but none were found"
    />
  )
}

DisksTab.loader = async () => {
  await apiQueryClient.prefetchQuery('physicalDiskList', { query: { limit: 25 } })
  return null
}

export function DisksTab() {
  const { Table } = useQueryTable('physicalDiskList', {})
  const colHelper = createColumnHelper<PhysicalDisk>()
  const staticCols = [
    colHelper.accessor('id', {}),
    colHelper.accessor((d) => (d.formFactor === 'u2' ? 'U.2' : 'M.2'), {
      header: 'Form factor',
      cell: (info) => <Badge>{info.getValue()}</Badge>,
    }),
    colHelper.accessor('model', { header: 'model number' }),
    colHelper.accessor('serial', { header: 'serial number' }),
  ]

  return (
    <>
      <Table emptyState={<EmptyState />} columns={staticCols} />
    </>
  )
}
