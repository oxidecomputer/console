import React from 'react'
import type { ReactTable } from '@tanstack/react-table'
import type { TableInstance } from 'react-table'
import { Table as UITable } from '@oxide/ui'

// eslint-disable-next-line @typescript-eslint/ban-types
export type TableProps<D extends object> = {
  className?: string
  rowClassName?: string // TODO: decide whether this is the worst idea ever or best
  table: TableInstance<D>
}

// eslint-disable-next-line @typescript-eslint/ban-types
export const Table = <D extends object>({
  className,
  rowClassName,
  table,
}: TableProps<D>) => (
  <UITable className={className} {...table.getTableProps()}>
    <UITable.Header>
      {table.headerGroups.map((headerGroup) => (
        // headerGroupProps has the key on it
        // eslint-disable-next-line react/jsx-key
        <UITable.HeaderRow {...headerGroup.getHeaderGroupProps()}>
          {headerGroup.headers.map((column) => (
            <UITable.HeadCell
              className={column.className}
              {...column.getHeaderProps()}
              key={column.id}
            >
              {column.render('Header')}
            </UITable.HeadCell>
          ))}
        </UITable.HeaderRow>
      ))}
    </UITable.Header>
    <UITable.Body {...table.getTableBodyProps()}>
      {table.rows.map((row) => {
        table.prepareRow(row)
        return (
          <UITable.Row
            {...row.getRowProps()}
            className={rowClassName}
            selected={row.isSelected}
            key={row.id}
          >
            {row.cells.map((cell) => (
              <UITable.Cell {...cell.getCellProps()} key={cell.column.id}>
                {cell.render('Cell')}
              </UITable.Cell>
            ))}
          </UITable.Row>
        )
      })}
    </UITable.Body>
  </UITable>
)

export type Table2Props<D> = {
  className?: string
  rowClassName?: string // TODO: decide whether this is the worst idea ever or best
  table: ReactTable<D, unknown, unknown, unknown, unknown>
}

export function Table2<D>({ className, rowClassName, table }: Table2Props<D>) {
  return (
    <UITable className={className} {...table.getTableProps()}>
      <UITable.Header>
        {table.getHeaderGroups().map((headerGroup) => (
          // headerGroupProps has the key on it
          // eslint-disable-next-line react/jsx-key
          <UITable.HeaderRow {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((header) => (
              <UITable.HeadCell key={header.id} {...header.getHeaderProps()}>
                {header.renderHeader()}
              </UITable.HeadCell>
            ))}
          </UITable.HeaderRow>
        ))}
      </UITable.Header>
      <UITable.Body {...table.getTableBodyProps()}>
        {table.getRows().map((row) => (
          <UITable.Row
            {...row.getRowProps()}
            className={rowClassName}
            key={row.id}
          >
            {row.getAllCells().map((cell) => (
              <UITable.Cell key={cell.column.id} {...cell.getCellProps()}>
                {cell.renderCell()}
              </UITable.Cell>
            ))}
          </UITable.Row>
        ))}
      </UITable.Body>
    </UITable>
  )
}
