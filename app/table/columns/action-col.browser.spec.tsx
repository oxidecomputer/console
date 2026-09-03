/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table'
import { useCallback } from 'react'
import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'

import { Table } from '../Table'
import { useColsWithActions, type MenuAction } from './action-col'

type Item = { id: string; name: string }

const data: Item[] = [{ id: '1', name: 'alpha' }]
const staticCols: ColumnDef<Item>[] = [{ accessorKey: 'name', header: 'Name' }]

function ActionsTable({ version }: { version: number }) {
  // depends on `version` so its identity changes when the prop changes, like a
  // real page whose actions depend on a background query result
  const makeActions = useCallback(
    (item: Item): MenuAction[] => [
      { label: `Rename ${item.name} v${version}`, onActivate: () => {} },
    ],
    [version]
  )
  const columns = useColsWithActions(staticCols, makeActions)
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  })
  return <Table aria-label="Items" table={table} />
}

test('open row actions menu survives makeActions identity change', async () => {
  const screen = await render(<ActionsTable version={1} />)

  await screen.getByRole('button', { name: 'Row actions' }).click()
  await expect
    .element(screen.getByRole('menuitem', { name: 'Rename alpha v1' }))
    .toBeVisible()

  // simulates a query resolving and changing a dep of makeActions while the
  // menu is open. Before the fix, the cell remounted and the menu closed.
  await screen.rerender(<ActionsTable version={2} />)

  await expect
    .element(screen.getByRole('menuitem', { name: 'Rename alpha v2' }))
    .toBeVisible()
})
