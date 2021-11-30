import { Cell } from './Cell'
import React from 'react'

interface DefaultCellProps {
  value: string
}
export const DefaultCell = ({ value }: DefaultCellProps) => <Cell>{value}</Cell>
