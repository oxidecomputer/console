/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'

import { apiQueryClient, type Sled } from '@oxide/api'
import { Racks24Icon } from '@oxide/design-system/icons/react'

import { makeLinkCell } from '~/table/cells/LinkCell'
import { useQueryTable } from '~/table/QueryTable'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { pb } from '~/util/path-builder'

const EmptyState = () => {
  return (
    <EmptyMessage
      icon={<Racks24Icon />}
      title="Something went wrong"
      body="We expected some racks here, but none were found"
    />
  )
}

SledsTab.loader = async () => {
  await apiQueryClient.prefetchQuery('sledList', {
    query: { limit: 25 },
  })
  return null
}

export function SledsTab() {
  const { Table } = useQueryTable('sledList', {}, { placeholderData: (x) => x })
  const colHelper = createColumnHelper<Sled>()
  const staticCols = [
    colHelper.accessor('id', {
      cell: makeLinkCell((sledId) => pb.sled({ sledId })),
    }),
    // TODO: colHelper.accessor('baseboard.serviceAddress', { header: 'service address' }),
    colHelper.accessor('baseboard.part', { header: 'part number' }),
    colHelper.accessor('baseboard.serial', { header: 'serial number' }),
    colHelper.accessor('baseboard.revision', { header: 'revision' }),
  ]

  return <Table emptyState={<EmptyState />} columns={staticCols} />
}
