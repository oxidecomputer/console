/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import {
  api,
  getListQFn,
  queryClient,
  type PhysicalDisk,
  type PhysicalDiskPolicy,
  type PhysicalDiskState,
} from '@oxide/api'
import { Servers24Icon } from '@oxide/design-system/icons/react'
import { Badge, type BadgeColor } from '@oxide/design-system/ui'

import { createColumnHelper } from '~/table/column-helper'
import { ColWidth, Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { Truncate } from '~/ui/lib/Truncate'

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

const diskList = getListQFn(api.physicalDiskList, {})

export async function clientLoader() {
  await queryClient.prefetchQuery(diskList.optionsFn())
  return null
}

export const handle = { crumb: 'Disks' }

const colHelper = createColumnHelper<PhysicalDisk>()
const staticCols = [
  colHelper.accessor('id', {
    meta: { width: ColWidth.id },
    cell: (info) => (
      <Truncate
        text={info.getValue()}
        position="middle"
        className="max-w-48"
        hasCopyButton
      />
    ),
  }),
  colHelper.accessor((d) => (d.formFactor === 'u2' ? 'U.2' : 'M.2'), {
    header: 'Form factor',
    meta: { width: ColWidth.md },
    cell: (info) => <Badge>{info.getValue()}</Badge>,
  }),
  colHelper.accessor('model', { meta: { width: 'flex' }, header: 'model number' }),
  colHelper.accessor('serial', Columns.serial),
  colHelper.accessor('policy.kind', {
    header: 'policy',
    meta: { width: ColWidth.lg },
    cell: (info) => (
      <Badge color={POLICY_KIND_BADGE_COLORS[info.getValue()]}>
        {info.getValue().replace(/_/g, ' ')}
      </Badge>
    ),
  }),
  colHelper.accessor('state', {
    meta: { width: ColWidth.xl },
    cell: (info) => (
      <Badge color={STATE_BADGE_COLORS[info.getValue()]}>{info.getValue()}</Badge>
    ),
  }),
]

export default function DisksTab() {
  const emptyState = <EmptyState />
  const { table } = useQueryTable({
    id: 'physical-disks',
    query: diskList,
    columns: staticCols,
    emptyState,
  })
  return table
}
