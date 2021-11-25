import React from 'react'
import { Badge } from '@oxide/ui'
import { Cell } from './Cell'

interface TypeValueCellProps {
  type: string
  value: string
}
export const TypeValueCell = ({ type, value }: TypeValueCellProps) => (
  <Cell className="space-x-0.5">
    <Badge color="green" variant="dim">
      {type}
    </Badge>
    <Badge color="green" variant="solid">
      {value}
    </Badge>
  </Cell>
)
