/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { flexRender, type Table as TableInstance } from '@tanstack/react-table'
import type { JSX } from 'react'

import { Table as UITable } from '~/ui/lib/Table'

export type TableProps<TData> = JSX.IntrinsicElements['table'] & {
  rowHeight?: 'small' | 'large'
  table: TableInstance<TData>
}

/** Render a React Table table instance */
export const Table = <TData,>({
  rowHeight = 'small',
  table,
  ...tableProps
}: TableProps<TData>) => (
  <UITable {...tableProps}>
    <UITable.Header>
      {table.getHeaderGroups().map((headerGroup) => (
        <UITable.HeaderRow key={headerGroup.id}>
          {headerGroup.headers.map((header) => (
            <UITable.HeadCell
              key={header.id}
              className={header.column.columnDef.meta?.thClassName}
              colSpan={header.colSpan}
            >
              {
                // Placeholder concept is for when grouped columns are
                // combined with regular columns. The regular column only
                // needs one entry in the stack of header cells, so the others
                // have isPlacholder=true. See sleds table for an example.
                header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())
              }
            </UITable.HeadCell>
          ))}
        </UITable.HeaderRow>
      ))}
    </UITable.Header>
    <UITable.Body>
      {table.getRowModel().rows.map((row) => (
        <UITable.Row key={row.id}>
          {row.getAllCells().map((cell) => (
            <UITable.Cell
              key={cell.column.id}
              className={cell.column.columnDef.meta?.tdClassName}
              height={rowHeight}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </UITable.Cell>
          ))}
        </UITable.Row>
      ))}
    </UITable.Body>
  </UITable>
)
