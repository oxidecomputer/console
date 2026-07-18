/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table'
import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'

import { getMultiSelectCol } from './columns/select-col'
import { Table } from './Table'

type Item = { id: string; name: string }

const data: Item[] = [
  { id: '1', name: 'alpha' },
  { id: '2', name: 'beta' },
]
const columns: ColumnDef<Item>[] = [
  getMultiSelectCol<Item>(),
  { accessorKey: 'name', header: 'Name' },
]

function MultiSelectTable() {
  const table = useReactTable({
    columns,
    data,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  })
  return <Table aria-label="Items" table={table} multiSelect />
}

test('selects a row by clicking its checkbox cell', async () => {
  const screen = await render(<MultiSelectTable />)
  const row = screen.getByRole('row', { name: 'alpha' })
  const headerCheckbox = screen.getByRole('checkbox').first()

  await row.getByRole('cell').first().click()

  await expect.element(row.getByRole('checkbox')).toBeChecked()
  await expect.element(headerCheckbox).toBePartiallyChecked()
})

test('selects and clears every row from the header checkbox', async () => {
  const screen = await render(<MultiSelectTable />)
  const checkboxes = screen.getByRole('checkbox')
  const headerCheckbox = checkboxes.first()

  await headerCheckbox.click()
  await expect.element(checkboxes.nth(1)).toBeChecked()
  await expect.element(checkboxes.nth(2)).toBeChecked()

  await headerCheckbox.click()
  await expect.element(checkboxes.nth(1)).not.toBeChecked()
  await expect.element(checkboxes.nth(2)).not.toBeChecked()
})
