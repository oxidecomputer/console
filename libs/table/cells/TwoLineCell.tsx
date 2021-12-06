import React from 'react'
import type { Cell } from './Cell'

export const TwoLineCell = ({
  value,
}: Cell<[string | JSX.Element, string | JSX.Element]>) => (
  <div className="space-y-0.5">
    <div>{value[0]}</div>
    <div className="text-gray-200">{value[1]}</div>
  </div>
)
