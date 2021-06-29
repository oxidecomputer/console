import React from 'react'
import type { TableInstance } from 'react-table'
import cn from 'classnames'
import './menu-button.css'

// TODO: These shouldn't be object, but Record<string, unknown> isn't compatible
// with, e.g., ApiInstanceView

// eslint-disable-next-line @typescript-eslint/ban-types
type Props<D extends object> = {
  className?: string
  table: TableInstance<D>
}

// eslint-disable-next-line @typescript-eslint/ban-types
export const Table2 = <D extends object>({ className, table }: Props<D>) => (
  <table
    // TODO: turns out rounded corners on a table requires border-collapse separate,
    // which requires further shenanigans to get the borders to behave
    className={cn('w-full border border-gray-400 text-xs', className)}
    {...table.getTableProps()}
  >
    <thead className="h-[40px] bg-gray-500 border-b border-gray-400">
      {table.headerGroups.map((headerGroup) => (
        <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
          {headerGroup.headers.map((column) => (
            <th
              className="font-light uppercase"
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
            className="border-b border-gray-400 last-of-type:border-none h-[60px]"
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
