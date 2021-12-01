import { Cell } from './Cell'
import React from 'react'
import { Badge } from '@oxide/ui'

interface LabelCellProps {
  value: string
}
export const LabelCell = ({ value }: LabelCellProps) => (
  <Cell>
    <Badge>{value}</Badge>
  </Cell>
)
