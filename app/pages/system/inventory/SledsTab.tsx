/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo } from 'react'
import * as R from 'remeda'

import { api, q, queryClient, usePrefetchedQuery, type Sled } from '@oxide/api'
import { Servers24Icon } from '@oxide/design-system/icons/react'

import { EmptyCell } from '~/table/cells/EmptyCell'
import { LinkCell } from '~/table/cells/LinkCell'
import { Table } from '~/table/Table'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { TableEmptyBox } from '~/ui/lib/Table'
import { Truncate } from '~/ui/lib/Truncate'
import { ALL_ISH } from '~/util/consts'
import { pb } from '~/util/path-builder'

import { ProvisionPolicyBadge, SledKindBadge, SledStateBadge } from './sled/SledBadges'

const sledList = q(api.sledList, { query: { limit: ALL_ISH } })

export async function clientLoader() {
  await queryClient.fetchQuery(sledList)
  return null
}

export const handle = { crumb: 'Sleds' }

const colHelper = createColumnHelper<Sled>()
const staticCols = [
  colHelper.accessor('slot', {
    cell: (info) => (
      <div className="w-[2.5ch] text-right tabular-nums">
        {info.getValue() ?? <EmptyCell />}
      </div>
    ),
  }),
  colHelper.accessor('id', {
    cell: (info) => (
      <LinkCell to={pb.sledInstances({ sledId: info.getValue() })}>
        <Truncate text={info.getValue()} position="middle" className="max-w-32" />
      </LinkCell>
    ),
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
        id: 'policyKind',
        header: 'Kind',
        cell: (info) => <SledKindBadge policy={info.getValue()} />,
      }),
      colHelper.accessor('policy', {
        id: 'provisionPolicy',
        header: 'Provision policy',
        cell: (info) => <ProvisionPolicyBadge policy={info.getValue()} />,
      }),
    ],
  }),
  colHelper.accessor('state', {
    cell: (info) => <SledStateBadge state={info.getValue()} />,
  }),
]

export default function SledsTab() {
  const { data } = usePrefetchedQuery(sledList)
  const sleds = useMemo(
    () =>
      R.sortBy(
        data.items,
        (sled) => sled.slot == null,
        (sled) => sled.slot ?? 0
      ),
    [data]
  )
  const table = useReactTable({
    columns: staticCols,
    data: sleds,
    getRowId: (sled) => sled.id,
    getCoreRowModel: getCoreRowModel(),
  })
  if (sleds.length === 0) {
    return (
      <TableEmptyBox>
        <EmptyMessage icon={<Servers24Icon />} title="No sleds found" />
      </TableEmptyBox>
    )
  }
  return <Table table={table} />
}
