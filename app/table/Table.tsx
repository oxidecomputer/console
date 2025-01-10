/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { flexRender, type Table as TableInstance } from '@tanstack/react-table'
import cn from 'classnames'

import { Table as UITable } from '~/ui/lib/Table'

export type TableProps<TData> = JSX.IntrinsicElements['table'] & {
  rowClassName?: string
  rowHeight?: 'small' | 'large'
  table: TableInstance<TData>
  singleSelect?: boolean
  multiSelect?: boolean
}

/** Render a React Table table instance */
export const Table = <TData,>({
  rowClassName,
  rowHeight = 'small',
  table,
  singleSelect,
  multiSelect,
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
      {table.getRowModel().rows.map((row) => {
        // For single-select, the entire row is clickable
        const rowProps =
          singleSelect && row.getCanSelect() // this means single-select only
            ? {
                className: cn(rowClassName, 'cursor-pointer'),
                selected: row.getIsSelected(),
                // select only this row
                onClick: () => table.setRowSelection(() => ({ [row.id]: true })),
              }
            : { className: rowClassName }

        // For multi-select, assume the first cell is the checkbox and make the
        // whole cell clickable
        const firstCellProps =
          multiSelect && row.getCanMultiSelect()
            ? {
                className: 'cursor-pointer',
                onClick: () => row.toggleSelected(),
              }
            : {}

        return (
          <UITable.Row key={row.id} {...rowProps}>
            {row.getAllCells().map((cell, i) => (
              <UITable.Cell
                key={cell.column.id}
                {...(i === 0 ? firstCellProps : {})}
                className={cell.column.columnDef.meta?.tdClassName}
                height={rowHeight}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </UITable.Cell>
            ))}
          </UITable.Row>
        )
      })}
    </UITable.Body>
  </UITable>
)
