import type { Table as TableInstance } from '@tanstack/react-table'
import { flexRender } from '@tanstack/react-table'
import cn from 'classnames'

import { Table as UITable } from '@oxide/ui'

export type TableProps<TData> = JSX.IntrinsicElements['table'] & {
  rowClassName?: string
  table: TableInstance<TData>
  singleSelect?: boolean
  multiSelect?: boolean
}

/** Render a React Table table instance */
export const Table = <TData,>({
  rowClassName,
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
            >
              {flexRender(header.column.columnDef.header, header.getContext())}
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
              <UITable.Cell key={cell.column.id} {...(i === 0 ? firstCellProps : {})}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </UITable.Cell>
            ))}
          </UITable.Row>
        )
      })}
    </UITable.Body>
  </UITable>
)
