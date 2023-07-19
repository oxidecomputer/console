/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { Row, Table } from '@tanstack/react-table'

import { Checkbox, Radio } from '@oxide/ui'

// only needs to be a function because of the generic params
export const getSelectCol = <TData,>() => ({
  id: 'select',
  meta: { thClassName: 'w-10' },
  header: '',
  cell: ({ row }: { row: Row<TData> }) => {
    // `onChange` is empty to suppress react warning. Actual trigger happens in `Table.tsx`
    return <Radio checked={row.getIsSelected()} onChange={() => {}} />
  },
})

export const getMultiSelectCol = <TData,>() => ({
  id: 'select',
  meta: { thClassName: 'w-10' },
  header: ({ table }: { table: Table<TData> }) => (
    <div className="flex">
      <Checkbox
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
      />
    </div>
  ),
  cell: ({ row }: { row: Row<TData> }) => (
    // `onChange` is empty to suppress react warning. Actual trigger happens in `Table.tsx`
    <Checkbox checked={row.getIsSelected()} onChange={() => {}} />
  ),
})
