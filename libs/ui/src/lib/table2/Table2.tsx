import React from 'react'
import { useTable, useRowSelect } from 'react-table'
import cn from 'classnames'

import { Avatar } from '../avatar/Avatar'
import { Icon } from '../icon/Icon'
import type { User } from './fake-data'
import { users } from './fake-data'

const AccessIcon = ({ value }: { value: boolean }) => (
  <div className="text-center">
    {value ? (
      <Icon name="check" className="text-green-500 !w-6" />
    ) : (
      <Icon name="prohibited" className="text-red-500 !w-4" />
    )}
  </div>
)

const NameCell = ({ value }: { value: string }) => (
  <div className="flex items-center h-[60px]">
    <Avatar round size="xs" name={value} className="inline-block" />
    <span className="ml-3 text-sm font-sans font-light">{value}</span>
  </div>
)

type Props = { className?: string }

const COLUMNS = [
  // TS doesn't like string accessors unless they're `as const`. Nested string
  // accessors don't even work with `as const`, which is why they're functions
  {
    accessor: 'name' as const,
    Header: () => <div className="text-left">Name</div>,
    Cell: NameCell,
  },
  {
    accessor: 'lastAccessed' as const,
    Header: () => <div className="text-left">Accessed</div>,
    Cell: ({ value }: { value: string }) => (
      <div className="uppercase text-gray-200">{value}</div>
    ),
  },
  {
    accessor: (u: User) => u.access.read,
    id: 'access.read',
    Header: 'Read',
    Cell: AccessIcon,
  },
  {
    accessor: (u: User) => u.access.modify,
    id: 'access.modify',
    Header: 'Modify',
    Cell: AccessIcon,
  },
  {
    accessor: (u: User) => u.access.create,
    id: 'access.create',
    Header: 'Create',
    Cell: AccessIcon,
  },
  {
    accessor: (u: User) => u.access.admin,
    id: 'access.admin',
    Header: 'Admin',
    Cell: AccessIcon,
  },
]

// TODO: turns out rounded corners on a table requires border-collapse separate,
// which requires further shenanigans to get the borders to behave

type CheckboxProps = {
  children?: React.ReactNode
  indeterminate: boolean
}

const IndeterminateCheckbox = React.forwardRef(
  (
    { indeterminate, ...rest }: CheckboxProps,
    ref: React.Ref<HTMLInputElement>
  ) => {
    const defaultRef = React.useRef<HTMLInputElement>()
    const resolvedRef = ref || defaultRef

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate
    }, [resolvedRef, indeterminate])

    return (
      <>
        <input type="checkbox" ref={resolvedRef} {...rest} />
      </>
    )
  }
)
const selectionCol = {
  id: 'selection',
  // The header can use the table's getToggleAllRowsSelectedProps method
  // to render a checkbox
  Header: ({ getToggleAllRowsSelectedProps }) => (
    <div>
      <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
    </div>
  ),
  // The cell can use the individual row's getToggleRowSelectedProps method
  // to the render a checkbox
  Cell: ({ row }) => (
    <div className="text-center">
      <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
    </div>
  ),
}

export const Table2 = ({ className }: Props) => {
  const columns = React.useMemo(() => COLUMNS, [])
  const data = React.useMemo(() => users, [])
  const table = useTable({ columns, data }, useRowSelect, (hooks) => {
    hooks.visibleColumns.push((columns) => [selectionCol, ...columns])
  })
  return (
    <table
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
}
