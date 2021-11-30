import { format } from 'date-fns'
import React from 'react'
import { Cell } from './Cell'

interface DateCellProps {
  value: Date
}
export const DateCell = ({ value }: DateCellProps) => (
  <Cell>
    <div>{format(value, 'MMM d, yyyy')}</div>
    <div className="text-gray-200">{format(value, 'p')}</div>
  </Cell>
)
