/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import {
  flexRender,
  type Column,
  type Header,
  type Table as TableInstance,
} from '@tanstack/react-table'
import cn from 'classnames'
import type { JSX } from 'react'
import { flushSync } from 'react-dom'
import * as R from 'remeda'

import { Table as UITable } from '~/ui/lib/Table'
import { Truncate } from '~/ui/lib/Truncate'

export type TableProps<TData> = JSX.IntrinsicElements['table'] & {
  rowHeight?: 'small' | 'large'
  table: TableInstance<TData>
}

/** A bare string in the cell's flex container can't show an ellipsis */
const TextCell = ({ value }: { value: unknown }) =>
  typeof value === 'string' ||
  typeof value === 'number' ||
  typeof value === 'bigint' ||
  typeof value === 'boolean' ? (
    <Truncate text={value.toString()} />
  ) : null

/** Below this, the table scrolls rather than squashing flexible columns */
const FLEX_COL_MIN_WIDTH = 160

function getColumnWidths<TData>(table: TableInstance<TData>) {
  const leafCols = table.getVisibleLeafColumns()
  const { columnSizing } = table.getState()
  // not TanStack's `size`, which defaults to 150 and so can't mark a column
  // as flexible
  const metaWidth = (col: Column<TData>) => {
    const width = col.columnDef.meta?.width
    return width === 'flex' ? undefined : width
  }
  const ownWidth = (col: Column<TData>) =>
    col.id in columnSizing ? col.getSize() : metaWidth(col)

  let flexCols = leafCols.filter((col) => ownWidth(col) === undefined)
  // Fixed layout would otherwise stretch every column, actions included
  if (flexCols.length === 0) {
    flexCols = [leafCols.find((col) => metaWidth(col) === undefined) ?? leafCols[0]]
  }

  return {
    widths: leafCols.map((col) => (flexCols.includes(col) ? undefined : ownWidth(col))),
    minWidth: R.sumBy(leafCols, (col) => ownWidth(col) ?? FLEX_COL_MIN_WIDTH),
  }
}

function headerText<TData>(header: Header<TData, unknown>) {
  const def = header.column.columnDef.header
  // compared by identity: TanStack merges its default into defs without one
  if (def === header.getContext().table._getDefaultColumnDef().header) {
    return header.column.id
  }
  return typeof def === 'string' && def ? def : undefined
}

function ResizeHandle<TData>({ header }: { header: Header<TData, unknown> }) {
  const { column, getContext } = header
  const { table } = getContext()

  const startResize = (e: React.MouseEvent | React.TouchEvent) => {
    // TanStack starts the drag from `getSize()`, which defaults to 150, so
    // record the rendered width first or the column jumps
    if (!(column.id in table.getState().columnSizing)) {
      const th = e.currentTarget.closest('th')
      if (th) {
        const width = Math.round(th.getBoundingClientRect().width)
        flushSync(() => table.setColumnSizing((old) => ({ ...old, [column.id]: width })))
      }
    }
    header.getResizeHandler()(e)
  }

  // pointer-only: keyboard resizing would make every header a tab stop
  return (
    <div
      aria-hidden
      title="Drag to resize, double-click to reset"
      className={cn('ox-table-resize-handle', { 'is-resizing': column.getIsResizing() })}
      onMouseDown={startResize}
      onTouchStart={startResize}
      onDoubleClick={() => column.resetSize()}
    />
  )
}

/** Render a React Table table instance */
export const Table = <TData,>({
  rowHeight = 'small',
  table,
  className,
  style,
  ...tableProps
}: TableProps<TData>) => {
  const leafCols = table.getVisibleLeafColumns()
  const { widths, minWidth } = getColumnWidths(table)
  const isResizing = !!table.getState().columnSizingInfo.isResizingColumn
  // compared by identity: TanStack merges this into any def without a `cell`
  const defaultCell = table._getDefaultColumnDef().cell

  return (
    <UITable
      className={cn(className, 'ox-table-fixed', { 'ox-table-resizing': isResizing })}
      style={{ ...style, minWidth }}
      {...tableProps}
    >
      <colgroup>
        {leafCols.map((col, i) => (
          <col key={col.id} style={{ width: widths[i] }} />
        ))}
      </colgroup>
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
                  header.isPlaceholder ? null : (
                    <span className="min-w-0 truncate" title={headerText(header)}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </span>
                  )
                }
                {/* leaf headers only: a group header would resize all its columns at once */}
                {!header.isPlaceholder &&
                  header.subHeaders.length === 0 &&
                  header.column.getCanResize() && <ResizeHandle header={header} />}
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
                {cell.column.columnDef.cell === defaultCell ? (
                  <TextCell value={cell.renderValue()} />
                ) : (
                  flexRender(cell.column.columnDef.cell, cell.getContext())
                )}
              </UITable.Cell>
            ))}
          </UITable.Row>
        ))}
      </UITable.Body>
    </UITable>
  )
}
