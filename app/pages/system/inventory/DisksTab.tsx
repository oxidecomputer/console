/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'

import {
  getListQFn,
  queryClient,
  type PhysicalDisk,
  type PhysicalDiskPolicy,
  type PhysicalDiskState,
} from '@oxide/api'
import { Servers24Icon } from '@oxide/design-system/icons/react'

import { useQueryTable } from '~/table/QueryTable2'
import { Badge, type BadgeColor } from '~/ui/lib/Badge'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'

const POLICY_KIND_BADGE_COLORS: Record<PhysicalDiskPolicy['kind'], BadgeColor> = {
  in_service: 'default',
  expunged: 'neutral',
}

const STATE_BADGE_COLORS: Record<PhysicalDiskState, BadgeColor> = {
  active: 'default',
  decommissioned: 'neutral',
}

const EmptyState = () => (
  <EmptyMessage
    icon={<Servers24Icon />}
    title="Something went wrong"
    body="We expected some racks here, but none were found"
  />
)

const diskList = getListQFn('physicalDiskList', {})

export async function loader() {
  await queryClient.prefetchQuery(diskList.optionsFn())
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

Component.displayName = 'DisksTab'
export function Component() {
  const emptyState = <EmptyState />
  const { table } = useQueryTable({ query: diskList, columns: staticCols, emptyState })
  return table
}
