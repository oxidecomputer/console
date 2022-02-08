import React from 'react'
import type { Cell } from './Cell'

export const TwoLineCell = ({
  value,
}: Cell<[string | JSX.Element, string | JSX.Element]>) => (
  <div className="space-y-1">
    <div>{value[0]}</div>
    <div className="normal-case text-mono-md text-secondary">{value[1]}</div>
  </div>
)
