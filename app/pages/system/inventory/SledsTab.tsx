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
  type Sled,
  type SledPolicy,
  type SledState,
} from '@oxide/api'
import { Servers24Icon } from '@oxide/design-system/icons/react'

import { EmptyCell } from '~/table/cells/EmptyCell'
import { makeLinkCell } from '~/table/cells/LinkCell'
import { useQueryTable } from '~/table/QueryTable'
import { Badge, type BadgeColor } from '~/ui/lib/Badge'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { pb } from '~/util/path-builder'

const STATE_BADGE_COLORS: Record<SledState, BadgeColor> = {
  active: 'default',
  decommissioned: 'neutral',
}

const sledList = getListQFn('sledList', {})

export async function clientLoader() {
  await queryClient.prefetchQuery(sledList.optionsFn())
  return null
}

export const handle = { crumb: 'Sleds' }

const colHelper = createColumnHelper<Sled>()
const staticCols = [
  colHelper.accessor('id', {
    cell: makeLinkCell((sledId) => pb.sled({ sledId })),
  }),
  // TODO: colHelper.accessor('baseboard.serviceAddress', { header: 'service address' }),
  colHelper.group({
    id: 'baseboard',
    header: 'Baseboard',
    columns: [
      colHelper.accessor('baseboard.part', { header: 'part number' }),
      colHelper.accessor('baseboard.serial', { header: 'serial number' }),
      colHelper.accessor('baseboard.revision', { header: 'revision' }),
    ],
  }),
  colHelper.group({
    id: 'policy',
    header: 'Policy',
    columns: [
      colHelper.accessor('policy', {
        header: 'Kind',
        cell: (info) => {
          // need to cast because inference is broken inside groups
          // https://github.com/TanStack/table/issues/5065
          const policy: SledPolicy = info.getValue()
          return policy.kind === 'expunged' ? (
            <Badge color="neutral">Expunged</Badge>
          ) : (
            <Badge>In service</Badge>
          )
        },
      }),
      colHelper.accessor('policy', {
        header: 'Provision policy',
        cell: (info) => {
          const policy: SledPolicy = info.getValue()
          if (policy.kind === 'expunged') return <EmptyCell />
          return policy.provisionPolicy === 'provisionable' ? (
            <Badge>Provisionable</Badge>
          ) : (
            <Badge color="neutral">Not provisionable</Badge>
          )
        },
      }),
    ],
  }),
  colHelper.accessor('state', {
    cell: (info) => (
      <Badge color={STATE_BADGE_COLORS[info.getValue()]}>{info.getValue()}</Badge>
    ),
  }),
]

export default function SledsTab() {
  const emptyState = <EmptyMessage icon={<Servers24Icon />} title="No sleds found" />
  const { table } = useQueryTable({ query: sledList, columns: staticCols, emptyState })
  return table
}
