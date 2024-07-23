/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'

import { apiQueryClient, type Sled } from '@oxide/api'
import { Servers24Icon } from '@oxide/design-system/icons/react'

import { PolicyKindBadge, StateBadge } from '~/components/StatusBadge'
import { makeLinkCell } from '~/table/cells/LinkCell'
import { PAGE_SIZE, useQueryTable } from '~/table/QueryTable'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { pb } from '~/util/path-builder'

const EmptyState = () => {
  return (
    <EmptyMessage
      icon={<Servers24Icon />}
      title="Something went wrong"
      body="We expected some racks here, but none were found"
    />
  )
}

SledsTab.loader = async () => {
  await apiQueryClient.prefetchQuery('sledList', {
    query: { limit: PAGE_SIZE },
  })
  return null
}

const colHelper = createColumnHelper<Sled>()
const staticCols = [
  colHelper.accessor('id', {
    cell: makeLinkCell((sledId) => pb.sled({ sledId })),
  }),
  // TODO: colHelper.accessor('baseboard.serviceAddress', { header: 'service address' }),
  colHelper.accessor('baseboard.part', { header: 'part number' }),
  colHelper.accessor('baseboard.serial', { header: 'serial number' }),
  colHelper.accessor('baseboard.revision', { header: 'revision' }),
  colHelper.accessor('policy.kind', {
    cell: (info) => <PolicyKindBadge kind={info.getValue()} />,
  }),
  colHelper.accessor('state', {
    cell: (info) => <StateBadge state={info.getValue()} />,
  }),
]

export function SledsTab() {
  const { Table } = useQueryTable('sledList', {}, { placeholderData: (x) => x })
  return <Table emptyState={<EmptyState />} columns={staticCols} />
}
