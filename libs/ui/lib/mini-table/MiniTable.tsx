import { classed } from '@oxide/util'
import React from 'react'
import { Table } from '../table/Table'
import './mini-table.css'

export const MiniTable =
  classed.table`ox-mini-table w-full border-separate text-sans-md` as ReturnType<
    typeof classed.table
  > & {
    Header: React.ComponentType
    Body: React.ComponentType
    HeadCell: React.ComponentType
    Row: React.ComponentType
    Cell: React.ComponentType
  }

MiniTable.Header = ({ children }) => (
  <Table.Header>
    <Table.HeaderRow>{children}</Table.HeaderRow>
  </Table.Header>
)

MiniTable.HeadCell = Table.HeadCell

MiniTable.Body = classed.tbody``

MiniTable.Row = classed.tr`is-selected children:border-default first:children:border-l children:last:border-b last:children:border-r`

MiniTable.Cell = ({ children }) => {
  return (
    <td>
      <div>{children}</div>
    </td>
  )
}
