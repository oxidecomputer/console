import React, { useState } from 'react'
import { createTable } from '@tanstack/react-table'
import { Dialog } from '@reach/dialog'
import { Menu, MenuList, MenuButton, MenuItem } from '@reach/menu-button'

import {
  Avatar,
  Button,
  PageHeader,
  PageTitle,
  Add12Icon,
  Success12Icon,
  Close12Icon,
  Filter12Icon,
  More12Icon,
  Search16Icon,
  Unauthorized12Icon,
  Access24Icon,
} from '@oxide/ui'
import { Table2, selectCol } from '@oxide/table'

type User = {
  name: string
  lastAccessed: string
  access: {
    read: boolean
    modify: boolean
    create: boolean
    admin: boolean
  }
}

const makeRM = (name: string): User => ({
  name,
  lastAccessed: 'Never',
  access: {
    read: true,
    modify: true,
    create: false,
    admin: false,
  },
})

export const users = [
  {
    name: 'Cameron Howe',
    lastAccessed: 'Just now',
    access: {
      read: true,
      modify: true,
      create: true,
      admin: false,
    },
  },
  makeRM('Ryan Ray'),
  makeRM('Frosty Turek'),
  makeRM('Donna Clark'),
  makeRM('Wonder Boy'),
  makeRM('Malcolm Levitan'),
  makeRM('Yoyo Engberk'),
  makeRM('Tom Renden'),
]

const AccessIcon = ({ value }: { value: boolean }) => (
  <div className="text-center">
    {value ? (
      <Success12Icon title="Permitted" />
    ) : (
      <Unauthorized12Icon title="Prohibited" />
    )}
  </div>
)

const NameCell = ({ value }: { value: string }) => (
  <div className="flex items-center">
    <Avatar round size="sm" name={value} className="inline-block" />
    <span className="ml-3 text-sans-sm">{value}</span>
  </div>
)

const tableHelper = createTable().RowType<User>()

const columns = tableHelper.createColumns([
  tableHelper.createDisplayColumn(selectCol()),
  tableHelper.createDataColumn('name', {
    header: <div className="text-left">Name</div>,
    cell: NameCell,
  }),
  tableHelper.createDataColumn('lastAccessed', {
    header: <div className="text-left">Accessed</div>,
    cell: ({ value }) => (
      <div className="uppercase text-secondary">{value}</div>
    ),
  }),
  tableHelper.createDataColumn((u) => u.access.read, {
    id: 'access.read',
    header: 'Read',
    cell: AccessIcon,
  }),
  tableHelper.createDataColumn((u) => u.access.modify, {
    id: 'access.modify',
    header: 'Modify',
    cell: AccessIcon,
  }),
  tableHelper.createDataColumn((u) => u.access.create, {
    id: 'access.create',
    header: 'Create',
    cell: AccessIcon,
  }),
  tableHelper.createDataColumn((u) => u.access.admin, {
    id: 'access.admin',
    header: 'Admin',
    cell: AccessIcon,
  }),
  // TODO: is this the way to do this? select the entire object as the value?
  tableHelper.createDataColumn((u) => u, {
    id: 'more',
    header: '',
    cell: ({ value: user }) => (
      <Menu>
        <MenuButton>
          <More12Icon className="mr-4 text-tertiary" />
        </MenuButton>
        <MenuList className="TableControls">
          <MenuItem onSelect={() => console.log('delete', user.name)}>
            Delete
          </MenuItem>
          <MenuItem onSelect={() => console.log('interpret', user.name)}>
            Interpret
          </MenuItem>
          <MenuItem onSelect={() => console.log('astonish', user.name)}>
            Astonish
          </MenuItem>
        </MenuList>
      </Menu>
    ),
  }),
])

export const AccessPage = () => {
  const table = tableHelper.useTable({ columns, data: users })

  const [modalIsOpen, setModalIsOpen] = useState(false)
  const closeModal = () => setModalIsOpen(false)

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Access24Icon title="Access & IAM" />}>
          Access &amp; IAM
        </PageTitle>
      </PageHeader>

      <Dialog
        className="SideModal"
        isOpen={modalIsOpen}
        onDismiss={closeModal}
        aria-labelledby="access-modal-title"
      >
        <div className="modal-body">
          <div className="p-8">
            <div className="mt-2 mb-14 flex justify-between">
              <h2 className="text-sans-xl" id="access-modal-title">
                Manage project access
              </h2>
              <Button variant="link" onClick={closeModal}>
                <Close12Icon />
              </Button>
            </div>
            <h3 className="text-sans-md">Choose members</h3>
            <h3 className="text-sans-md">Select roles</h3>
          </div>
          <hr className="border-default" />
          <div className="p-8">
            <h3 className="text-sans-md">Relevant docs</h3>
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
        <Button variant="secondary">
          <Search16Icon />
        </Button>
        <Button variant="secondary">
          <Filter12Icon />
        </Button>
        <Button onClick={() => setModalIsOpen(true)}>
          Add <Add12Icon className="ml-2" />
        </Button>
      </div>
      <Table2 className="mt-4" table={table} />
    </>
  )
}
