import type { TableInstance } from 'react-table'
import { Table as UITable } from '@oxide/ui'
import cn from 'classnames'

export type TableProps<D extends object> = {
  className?: string
  rowClassName?: string // TODO: decide whether this is the worst idea ever or best
  table: TableInstance<D>
}

export function Table<D extends object>({
  className,
  rowClassName,
  table,
  ...tableProps
}: TableProps<D>) {
  const { className: rtClassName, ...rtTableProps } = table.getTableProps()
  return (
    <UITable className={cn(className, rtClassName)} {...tableProps} {...rtTableProps}>
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
}
