import type { TableInstance } from '@tanstack/react-table'
import { Table as UITable } from '@oxide/ui'

export type TableProps<TGenerics> = {
  className?: string
  rowClassName?: string
  table: TableInstance<TGenerics>
}

/*
 * This is a bit odd and deserves explanation. RT's TableGenerics has
 * `ColumnMeta?: any` on it, which means that by default, `createDataColumn`
 * takes a `meta` option that can be anything you want to put in there. If you
 * want a particular table instance to have a more specific type for
 * `ColumnMeta`, you can call `createTable().setColumnMetaType<MyType>()` just
 * like we call `.setRowType<Disk>()` to set the row data type.
 *
 * But enforcing here that all that is being done in the calling code isn't easy
 * because of how `TableGenerics` is defined: all the keys have type `any`. This
 * means that even if we do something like this:
 *
 *   type MyTGenerics = Merge<TableGenerics, { ColumnMeta?: ColumnMeta }>
 *   export const Table = <TGenerics extends MyTGenerics>() => {}
 *
 * TS will still let us pass whatever we want on a default `createTable()` table
 * because `ColumnMeta` defaults to `any`, and `any` extends everything. In
 * order to get typechecking of the column meta, we'd have to export something
 * like this
 *
 *    export const createTable = () => _createTable().setColumnMetaType<ColumnMeta>()
 *
 * and use it everywhere, which is fine, but if someone didn't use it and tries
 * to pass spurious `meta`, there's nothing that will tell them they can't do
 * that. Ideally I'd like to be able to enforce a type constraint here and all
 * tables will magically be subject to it. I hope overriding the type declaration
 * isn't the only way... and even that didn't seem to work, weirdly.
 *
 * Anyway, absent a good way of enforcing this typing on the calling code, there's
 * no point enforcing it at all. Let the calling code pass whatever, and if the stuff
 * in `ColumnMeta` is there, we'll use it.
 */
type ColumnMeta = {
  thClassName?: string
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
            <UITable.HeadCell
              key={header.id}
              className={(header.column.meta as ColumnMeta)?.thClassName}
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
