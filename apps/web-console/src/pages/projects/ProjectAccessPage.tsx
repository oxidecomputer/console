import React from 'react'
import type { Row } from 'react-table'
import { useTable, useRowSelect } from 'react-table'
import { Menu, MenuList, MenuButton, MenuItem } from '@reach/menu-button'

import {
  Avatar,
  Breadcrumbs,
  Icon,
  PageHeader,
  PageTitle,
  selectCol,
  Table,
} from '@oxide/ui'
import { useBreadcrumbs } from '../../hooks'
import type { User } from './mock-users'
import { users } from './mock-users'

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

// TODO: inline separate copies of this until we can see if it's worth abstracting
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

const ProjectPage = () => {
  const breadcrumbs = useBreadcrumbs()
  const columns = React.useMemo(() => COLUMNS, [])
  const data = React.useMemo(() => users, [])
  const table = useTable({ columns, data }, useRowSelect, (hooks) => {
    hooks.visibleColumns.push((columns) => [selectCol, ...columns, menuCol])
  })

  return (
    <>
      <Breadcrumbs data={breadcrumbs} />
      <PageHeader>
        <PageTitle icon="users">Access &amp; IAM</PageTitle>
      </PageHeader>

      <Table className="mt-4" table={table} />
    </>
  )
}

export default ProjectPage
