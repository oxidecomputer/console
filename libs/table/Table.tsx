import type { TableInstance } from '@tanstack/react-table'
import { Table as UITable } from '@oxide/ui'

export type TableProps<TGenerics> = {
  className?: string
  rowClassName?: string // TODO: decide whether this is the worst idea ever or best
  table: TableInstance<TGenerics>
}

export const Table = <TGenerics,>({
  className,
  rowClassName,
  table,
}: TableProps<TGenerics>) => (
  <UITable className={className}>
    <UITable.Header>
      {table.getHeaderGroups().map((headerGroup) => (
        // headerGroupProps has the key on it
        // eslint-disable-next-line react/jsx-key
        <UITable.HeaderRow>
          {headerGroup.headers.map((header) => (
            <UITable.HeadCell key={header.id}>{header.renderHeader()}</UITable.HeadCell>
          ))}
        </UITable.HeaderRow>
      ))}
    </UITable.Header>
    <UITable.Body>
      {table.getRowModel().rows.map((row) => (
        <UITable.Row className={rowClassName} key={row.id}>
          {row.getAllCells().map((cell) => (
            <UITable.Cell key={cell.column.id}>{cell.renderCell()}</UITable.Cell>
          ))}
        </UITable.Row>
      ))}
    </UITable.Body>
  </UITable>
)
