import React from 'react'
import type { Cell } from './Cell'

export const DefaultCell = ({ value }: Cell<string>) => (
  <span className="text-default">{value}</span>
)
