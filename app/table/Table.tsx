/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { flexRender, type Header, type Table as TableInstance } from '@tanstack/react-table'
import cn from 'classnames'
import { useLayoutEffect, useRef, useState, type JSX, type RefObject } from 'react'
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

/** A column can be dragged to this many times the average column width */
const MAX_COL_WIDTH_FACTOR = 3

/**
 * Px for each visible column, or undefined to share the leftover space. Once
 * no column is flexible, the leftover is split between the columns nobody has
 * dragged, since fixed layout would otherwise stretch every column, the
 * dragged one and actions included.
 */
function getColumnWidths<TData>(
  table: TableInstance<TData>,
  visibleWidth: number | undefined
) {
  const leafCols = table.getVisibleLeafColumns()
  const { columnSizing } = table.getState()
  const widths = leafCols.map((col) => {
    if (col.id in columnSizing) return col.getSize()
    // not TanStack's `size`, which defaults to 150 and so can't mark a column
    // as flexible
    const width = col.columnDef.meta?.width
    return width === 'flex' ? undefined : width
  })
  const minWidth = R.sumBy(widths, (width) => width ?? FLEX_COL_MIN_WIDTH)

  const fixed = widths.filter((width) => width !== undefined)
  const extra = (visibleWidth ?? 0) - R.sum(fixed)
  if (fixed.length < widths.length || extra <= 0) return { widths, minWidth }

  const resizable = leafCols.filter((col) => col.getCanResize())
  const undragged = resizable.filter((col) => !(col.id in columnSizing))
  const receivers = undragged.length > 0 ? undragged : resizable
  const share = extra / receivers.length
  return {
    widths: fixed.map((width, i) =>
      receivers.includes(leafCols[i]) ? width + share : width
    ),
    minWidth,
  }
}

const clientX = (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) =>
  'touches' in e ? (e.touches[0]?.clientX ?? 0) : e.clientX

function headerText<TData>(header: Header<TData, unknown>) {
  const def = header.column.columnDef.header
  // compared by identity: TanStack merges its default into defs without one
  if (def === header.getContext().table._getDefaultColumnDef().header) {
    return header.column.id
  }
  return typeof def === 'string' && def ? def : undefined
}

/**
 * Width of the scroll container, which unlike the table's own width doesn't
 * grow when columns overflow. Measured before paint, so the first frame
 * already has the final widths.
 */
function useVisibleWidth(tableRef: RefObject<HTMLTableElement | null>) {
  const [width, setWidth] = useState<number>()
  useLayoutEffect(() => {
    const scroller = tableRef.current?.closest('.ox-table-scroller')
    if (!scroller) return
    const observer = new ResizeObserver(() => setWidth(scroller.clientWidth))
    observer.observe(scroller)
    setWidth(scroller.clientWidth)
    return () => observer.disconnect()
  }, [tableRef])
  return width
}

function ResizeHandle<TData>({
  header,
  maxWidth,
}: {
  header: Header<TData, unknown>
  maxWidth: number
}) {
  const { column } = header
  const { table } = header.getContext()

  const startResize = (e: React.MouseEvent | React.TouchEvent) => {
    // a flexible column has no size of its own to start from
    const th = e.currentTarget.closest('th')
    const startWidth = th ? th.getBoundingClientRect().width : column.getSize()
    const startX = clientX(e)
    const minSize = column.columnDef.minSize ?? 0
    // a flexible column can already be wider than the max, so don't snap it down
    const maxSize = Math.max(minSize, maxWidth, startWidth)

    const onMove = (ev: MouseEvent | TouchEvent) => {
      const width = Math.round(startWidth + clientX(ev) - startX)
      const clamped = R.clamp(width, { min: minSize, max: maxSize })
      table.setColumnSizing((old) => ({ ...old, [column.id]: clamped }))
    }
    const [moveEvent, endEvent] =
      'touches' in e
        ? (['touchmove', 'touchend'] as const)
        : (['mousemove', 'mouseup'] as const)
    const onEnd = () => {
      document.removeEventListener(moveEvent, onMove)
      document.removeEventListener(endEvent, onEnd)
      table.setColumnSizingInfo((old) => ({ ...old, isResizingColumn: false }))
    }
    document.addEventListener(moveEvent, onMove)
    document.addEventListener(endEvent, onEnd)
    table.setColumnSizingInfo((old) => ({ ...old, isResizingColumn: column.id }))
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
  const tableRef = useRef<HTMLTableElement>(null)
  const visibleWidth = useVisibleWidth(tableRef)
  const { widths, minWidth } = getColumnWidths(table, visibleWidth)
  const maxColWidth = visibleWidth
    ? (visibleWidth / leafCols.length) * MAX_COL_WIDTH_FACTOR
    : Infinity
  const isResizing = !!table.getState().columnSizingInfo.isResizingColumn
  // compared by identity: TanStack merges this into any def without a `cell`
  const defaultCell = table._getDefaultColumnDef().cell

  return (
    <UITable
      className={cn(className, 'ox-table-fixed', { 'ox-table-resizing': isResizing })}
      style={{ ...style, minWidth }}
      ref={tableRef}
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
                  header.column.getCanResize() && (
                    <ResizeHandle header={header} maxWidth={maxColWidth} />
                  )}
              </UITable.HeadCell>
            ))}
          </UITable.HeaderRow>
        ))}
      </UITable.Header>
      <UITable.Body>
        {table.getRowModel().rows.map((row) => (
          <UITable.Row key={row.id}>
            {row.getVisibleCells().map((cell) => (
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
