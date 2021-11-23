import React from 'react'
import type { TableInstance } from 'react-table'
import cn from 'classnames'
import './menu-button.css'

// TODO: These shouldn't be object, but Record<string, unknown> isn't compatible
// with, e.g., Instance

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
  <table
    // TODO: turns out rounded corners on a table requires border-collapse separate,
    // which requires further shenanigans to get the borders to behave
    className={cn('w-full border border-gray-400 text-xs font-mono', className)}
    {...table.getTableProps()}
  >
    <thead className="h-[40px] text-gray-100 bg-gray-500 border-b border-gray-400">
      {table.headerGroups.map((headerGroup) => (
        // headerGroupProps has the key on it
        // eslint-disable-next-line react/jsx-key
        <tr
          {...headerGroup.getHeaderGroupProps()}
          className="between:border-l between:border-gray-400"
        >
          {headerGroup.headers.map((column) => (
            <th
              className={cn('font-light uppercase', column.className)}
              {...column.getHeaderProps()}
              key={column.id}
            >
              {column.render('Header')}
            </th>
          ))}
        </tr>
      ))}
    </thead>
    <tbody {...table.getTableBodyProps()}>
      {table.rows.map((row) => {
        table.prepareRow(row)
        return (
          <tr
            {...row.getRowProps()}
            className={cn(
              'border-b border-gray-500 last-of-type:border-none h-[60px]',
              rowClassName
            )}
            key={row.id}
          >
            {row.cells.map((cell) => (
              <td {...cell.getCellProps()} key={cell.column.id}>
                {cell.render('Cell')}
              </td>
            ))}
          </tr>
        )
      })}
    </tbody>
  </table>
)
