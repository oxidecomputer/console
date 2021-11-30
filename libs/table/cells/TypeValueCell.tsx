import React from 'react'
import { Badge } from '@oxide/ui'
import { Cell } from './Cell'

interface TypeValueCellProps {
  value: {
    type: string
    value: string
  }
}
export const TypeValueCell = ({
  value: { type, value },
}: TypeValueCellProps) => (
  <Cell className="space-x-1">
    <Badge color="green" variant="dim">
      {type}
    </Badge>
    <Badge color="green" variant="solid">
      {value}
    </Badge>
  </Cell>
)
