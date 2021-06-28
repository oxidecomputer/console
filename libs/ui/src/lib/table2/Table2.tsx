import React from 'react'
import type { Row, TableInstance } from 'react-table'
import { useTable, useRowSelect } from 'react-table'
import cn from 'classnames'
import { Menu, MenuList, MenuButton, MenuItem } from '@reach/menu-button'

import { Avatar } from '../avatar/Avatar'
import { Icon } from '../icon/Icon'
import type { User } from './fake-data'
import { users } from './fake-data'
import './menu-button.css'

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
  <div className="flex items-center">
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

const IndeterminateCheckbox = React.forwardRef<
  HTMLInputElement,
  { indeterminate?: boolean }
>(({ indeterminate, ...rest }, outerRef) => {
  // null, not blank (undefined), otherwise TS is mad when ref passed to input
  const defaultRef = React.useRef<HTMLInputElement>(null)
  const ref = outerRef || defaultRef

  React.useEffect(() => {
    // TODO: this makes types pass by basically ignoring callback refs. see more
    // sophisticated approach here:
    // https://github.com/tannerlinsley/react-table/discussions/1989#discussioncomment-1488
    if (typeof ref !== 'function' && ref?.current) {
      ref.current.indeterminate = indeterminate ?? false
    }
  }, [ref, indeterminate])

  return <input type="checkbox" ref={ref} {...rest} />
})

const selectionCol = {
  id: 'selection',
  Header: (props: TableInstance<User>) => (
    <div>
      <IndeterminateCheckbox {...props.getToggleAllRowsSelectedProps()} />
    </div>
  ),
  Cell: ({ row }: { row: Row<User> }) => (
    <div className="text-center">
      <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
    </div>
  ),
}

const menuCol = {
  id: 'menu',
  Cell: ({ row }: { row: Row<User> }) => (
    <Menu>
      <MenuButton>
        <Icon name="more" className="text-base text-gray-200 mr-4" />
      </MenuButton>
      <MenuList className="TableControls">
        <MenuItem onSelect={() => console.log(row.values.name)}>
          Delete
        </MenuItem>
        <MenuItem onSelect={() => console.log(row.values.name)}>
          Interpret
        </MenuItem>
        <MenuItem onSelect={() => console.log(row.values.name)}>
          Astonish
        </MenuItem>
      </MenuList>
    </Menu>
  ),
}

export const Table2 = ({ className }: Props) => {
  const columns = React.useMemo(() => COLUMNS, [])
  const data = React.useMemo(() => users, [])
  const table = useTable({ columns, data }, useRowSelect, (hooks) => {
    hooks.visibleColumns.push((columns) => [selectionCol, ...columns, menuCol])
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
