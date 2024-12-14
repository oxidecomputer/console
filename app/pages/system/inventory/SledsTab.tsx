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
  type SledProvisionPolicy,
  type SledState,
} from '@oxide/api'
import { Servers24Icon } from '@oxide/design-system/icons/react'

import { makeLinkCell } from '~/table/cells/LinkCell'
import { useQueryTable } from '~/table/QueryTable'
import { Badge, type BadgeColor } from '~/ui/lib/Badge'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { pb } from '~/util/path-builder'

const PROV_POLICY_DISP: Record<SledProvisionPolicy, [string, BadgeColor]> = {
  provisionable: ['Provisionable', 'default'],
  non_provisionable: ['Not provisionable', 'neutral'],
}

const STATE_BADGE_COLORS: Record<SledState, BadgeColor> = {
  active: 'default',
  decommissioned: 'neutral',
}

const sledList = getListQFn('sledList', {})

export async function loader() {
  await queryClient.prefetchQuery(sledList.optionsFn())
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
  colHelper.accessor('policy', {
    header: 'policy',
    cell: (info) => {
      const policy = info.getValue()
      if (policy.kind === 'expunged') return <Badge color="neutral">Expunged</Badge>
      const [label, color] = PROV_POLICY_DISP[policy.provisionPolicy]
      return (
        <div className="space-x-0.5">
          <Badge>In service</Badge>
          <Badge variant="solid" color={color}>
            {label}
          </Badge>
        </div>
      )
    },
  }),
  colHelper.accessor('state', {
    cell: (info) => (
      <Badge color={STATE_BADGE_COLORS[info.getValue()]}>{info.getValue()}</Badge>
    ),
  }),
]

Component.displayName = 'SledsTab'
export function Component() {
  const emptyState = <EmptyMessage icon={<Servers24Icon />} title="No sleds found" />
  const { table } = useQueryTable({ query: sledList, columns: staticCols, emptyState })
  return table
}
