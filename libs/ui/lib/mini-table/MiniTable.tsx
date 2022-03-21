import { flattenChildren, pluckFirstOfType } from '@oxide/util'
import React from 'react'
import { Table } from '../table/Table'
import './mini-table.css'

export interface MiniTableProps {
  children: React.ReactNode
}

export function MiniTable({ children }: MiniTableProps) {
  const childArray = flattenChildren(children)
  const header = pluckFirstOfType(childArray, MiniTable.Header)
  return (
    <table className="ox-mini-table w-full border-separate text-sans-md">
      {header}
      <tbody>{childArray}</tbody>
    </table>
  )
}

interface MiniTableHeaderProps {
  children: React.ReactNode
}
MiniTable.Header = ({ children }: MiniTableHeaderProps) => (
  <Table.Header>
    <Table.HeaderRow>{children}</Table.HeaderRow>
  </Table.Header>
)
MiniTable.HeadCell = Table.HeadCell

interface MiniTableRowProps {
  children: React.ReactNode
}
MiniTable.Row = ({ children }: MiniTableRowProps) => {
  return (
    <tr className="is-selected children:border-default first:children:border-l children:last:border-b last:children:border-r">
      {children}
    </tr>
  )
}

interface MiniTableCell {
  children: React.ReactNode
}
MiniTable.Cell = ({ children }: MiniTableCell) => {
  return (
    <td>
      <div>{children}</div>
    </td>
  )
}
