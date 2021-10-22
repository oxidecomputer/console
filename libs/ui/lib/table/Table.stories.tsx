import React from 'react'
import { useTable } from 'react-table'
import { Table } from './Table'
import type { TableProps } from './Table'
import type { StoryObj } from '@storybook/react'

type Props = TableProps<Record<string, unknown>>

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

const TableProvider = ({ children }: any) => {
  const table = useTable({ columns, data })
  return React.Children.map(children, (child) =>
    React.cloneElement(child, { table })
  )
}

export default {
  component: Table,
  render: (args) => (
    <TableProvider>
      <Table {...args} />
    </TableProvider>
  ),
} as StoryObj<Props>

export const Default: StoryObj<Props> = {}
