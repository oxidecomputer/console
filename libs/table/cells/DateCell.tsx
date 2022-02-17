import { format } from 'date-fns'
import React from 'react'
import type { Cell } from './Cell'
import { TwoLineCell } from './TwoLineCell'

export const DateCell = ({ value }: Cell<Date>) => (
  <TwoLineCell value={[format(value, 'MMM d, yyyy'), format(value, 'p')]} />
)
