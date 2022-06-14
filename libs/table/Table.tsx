import type { TableInstance } from '@tanstack/react-table'
import { createTable as _createTable } from '@tanstack/react-table'

import { Table as UITable } from '@oxide/ui'

export type TableProps<TGenerics> = JSX.IntrinsicElements['table'] & {
  rowClassName?: string
  table: TableInstance<TGenerics>
}

type ColumnMeta = {
  thClassName?: string
}

/**
 * Use instead of React Table's built-in `createTable` to get typechecking on
 * the `ColumnMeta`.
 */
export const createTable = () => _createTable().setColumnMetaType<ColumnMeta>()

// We can add whatever other `set*` stuff we want to `createTable` and this will
// Just Work, passing on the type constraints to `Table`
type OurTableGenerics = ReturnType<typeof createTable>['generics']

/**
 * Render a React Table table instance. Will get mad if `table` comes from the
 * built-in `createTable` instead of our {@link createTable}.
 */
export const Table = <TGenerics extends OurTableGenerics>({
  rowClassName,
  table,
  ...tableProps
}: TableProps<TGenerics>) => (
  <UITable {...tableProps}>
    <UITable.Header>
      {table.getHeaderGroups().map((headerGroup) => (
        <UITable.HeaderRow key={headerGroup.id}>
          {headerGroup.headers.map((header) => (
            <UITable.HeadCell
              key={header.id}
              className={header.column.columnDef.meta?.thClassName}
            >
              {header.renderHeader()}
            </UITable.HeadCell>
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
