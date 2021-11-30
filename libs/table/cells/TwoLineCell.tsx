import React from 'react'
import { Cell } from './Cell'

interface TwoLineCellProps {
  value: [string, string]
}
export const TwoLineCell = ({ value }: TwoLineCellProps) => (
  <Cell>
    <div className="mx-4">{value[0]}</div>
    <div className="mx-4 text-gray-200">{value[1]}</div>
  </Cell>
)
