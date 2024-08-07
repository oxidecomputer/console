/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'

import { apiQueryClient, type Sled, type SledPolicy, type SledState } from '@oxide/api'
import { Servers24Icon } from '@oxide/design-system/icons/react'

import { makeLinkCell } from '~/table/cells/LinkCell'
import { PAGE_SIZE, useQueryTable } from '~/table/QueryTable'
import { Badge, type BadgeColor } from '~/ui/lib/Badge'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { pb } from '~/util/path-builder'

const POLICY_KIND_BADGE_COLORS: Record<SledPolicy['kind'], BadgeColor> = {
  in_service: 'default',
  expunged: 'neutral',
}

const STATE_BADGE_COLORS: Record<SledState, BadgeColor> = {
  active: 'default',
  decommissioned: 'neutral',
}

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
    header: 'policy',
    cell: (info) => (
      <Badge color={POLICY_KIND_BADGE_COLORS[info.getValue()]}>
        {info.getValue().replace(/_/g, ' ')}
      </Badge>
    ),
  }),
  colHelper.accessor('state', {
    cell: (info) => (
      <Badge color={STATE_BADGE_COLORS[info.getValue()]}>{info.getValue()}</Badge>
    ),
  }),
]

export function SledsTab() {
  const { Table } = useQueryTable('sledList', {}, { placeholderData: (x) => x })
  return <Table emptyState={<EmptyState />} columns={staticCols} />
}
