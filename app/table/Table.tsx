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
          {headerGroup.headers.map((header) => {
            const sortDir = header.column.getIsSorted()

            return (
              <UITable.HeadCell
                key={header.id}
                className={cn(
                  header.column.columnDef.meta?.thClassName,
                  header.column.getCanSort() ? 'cursor-pointer select-none' : '',
                  'group'
                )}
                onClick={header.column.getToggleSortingHandler()}
                style={{
                  minWidth: `${header.getSize()}px`,
                  maxWidth: `${header.getSize()}px`,
                }}
              >
                <div className="-m-1 flex rounded p-1 group-hover:bg-[var(--base-neutral-300)]">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  <div
                    className={cn(
                      'invisible ml-2 flex flex-col group-hover:visible',
                      sortDir && '!visible'
                    )}
                  >
                    <SortArrow
                      className={cn(
                        sortDir === 'desc' && 'opacity-20',
                        'rotate-180 text-tertiary'
                      )}
                    />
                    <SortArrow
                      className={cn(sortDir === 'asc' && 'opacity-20', 'text-tertiary')}
                    />
                  </div>
                </div>
              </UITable.HeadCell>
            )
          })}
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
                style={{
                  minWidth: `${cell.column.getSize()}px`,
                  maxWidth: `${cell.column.getSize()}px`,
                }}
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

const SortArrow = ({ className }: { className?: string }) => (
  <svg
    width="6"
    height="7"
    viewBox="0 0 6 7"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M3.32156 6.46407C3.17591 6.70682 2.82409 6.70682 2.67844 6.46407L0.340763 2.56794C0.190794 2.31799 0.370837 2 0.662322 2L5.33768 2C5.62916 2 5.80921 2.31799 5.65924 2.56794L3.32156 6.46407Z"
      fill="currentColor"
    />
  </svg>
)
