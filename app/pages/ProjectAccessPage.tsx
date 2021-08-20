import React, { useState } from 'react'
import type { Row } from 'react-table'
import { useTable, useRowSelect } from 'react-table'
import { Dialog } from '@reach/dialog'
import { Menu, MenuList, MenuButton, MenuItem } from '@reach/menu-button'
import { v4 as uuid } from 'uuid'

import {
  Avatar,
  Button,
  Icon,
  PageHeader,
  PageTitle,
  selectCol,
  Table,
} from '@oxide/ui'
import type { User } from '@oxide/api-mocks'
import { users } from '@oxide/api-mocks'

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
    <Avatar round size="sm" name={value} className="inline-block" />
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
  const columns = React.useMemo(() => COLUMNS, [])
  const data = React.useMemo(() => users, [])
  const table = useTable({ columns, data }, useRowSelect, (hooks) => {
    hooks.visibleColumns.push((columns) => [selectCol, ...columns, menuCol])
  })

  const [modalIsOpen, setModalIsOpen] = useState(false)
  const closeModal = () => setModalIsOpen(false)

  const modalTitleId = React.useMemo(() => uuid(), [])

  return (
    <>
      <PageHeader>
        <PageTitle icon="users">Access &amp; IAM</PageTitle>
      </PageHeader>

      <Dialog
        className="SideModal"
        isOpen={modalIsOpen}
        onDismiss={closeModal}
        aria-labelledby={modalTitleId}
      >
        <div className="modal-body">
          <div className="p-8">
            <div className="flex justify-between mt-2 mb-14">
              <h2 className="text-display-xl" id={modalTitleId}>
                Manage project access
              </h2>
              <Button variant="link" onClick={closeModal}>
                <Icon name="close" />
              </Button>
            </div>
            <h3 className="font-medium">Choose members</h3>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <h3 className="font-medium">Select roles</h3>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </div>
          <hr className="border-gray-400" />
          <div className="p-8">
            <h3 className="font-medium">Relevant docs</h3>
          </div>
        </div>
        <footer className="modal-footer">
          {/* TODO: not supposed to be a ghost button */}
          <Button variant="ghost" className="mr-2.5" onClick={closeModal}>
            Cancel
          </Button>
          <Button>Update access</Button>
        </footer>
      </Dialog>

      <div className="flex justify-end">
        {/* TODO: not supposed to be dim buttons */}
        <Button variant="dim">
          <Icon name="search" />
        </Button>
        <Button variant="dim">
          <Icon name="filter" />
        </Button>
        <Button onClick={() => setModalIsOpen(true)}>
          Add <Icon name="plus" className="text-sm ml-1" />
        </Button>
      </div>
      <Table className="mt-4" table={table} />
    </>
  )
}

export default ProjectPage
