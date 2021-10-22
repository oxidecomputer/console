import React from 'react'
import { useTable } from 'react-table'
import { Table } from './Table'
import type { FC, ReactElement, ComponentProps } from 'react'
import type { StoryObj } from '@storybook/react'

type Story = StoryObj<ComponentProps<typeof Table>>

const data = [
  {
    id: 1,
    name: 'Jane Doe',
    location: 'SF',
  },
  {
    id: 2,
    name: 'Jack Black',
    location: 'nyc',
  },
]

const columns = [
  {
    Header: 'Name',
    accessor: 'name' as const,
  },
  {
    Header: 'Location',
    accessor: 'location' as const,
  },
]

const TableProvider: FC = ({ children }) => {
  const table = useTable({ columns, data })
  return React.Children.map(children, (child) =>
    React.cloneElement(child as ReactElement, { table })
  ) as unknown as ReactElement
}

export default {
  component: Table,
  render: (args) => (
    <TableProvider>
      <Table {...args} />
    </TableProvider>
  ),
} as Story

export const Default: Story = {}
