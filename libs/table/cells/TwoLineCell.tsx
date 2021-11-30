import React from 'react'
import { Cell } from './Cell'

interface TwoLineCellProps {
  value: [string | JSX.Element, string | JSX.Element]
}
export const TwoLineCell = ({ value }: TwoLineCellProps) => (
  <Cell className="space-y-1">
    <div>{value[0]}</div>
    <div className="text-gray-200">{value[1]}</div>
  </Cell>
)
