import { format } from 'date-fns'
import React from 'react'
import { TwoLineCell } from '.'
import type { Cell } from './Cell'

export const DateCell = ({ value }: Cell<string>) => (
  <TwoLineCell
    value={[
      format(new Date(value), 'MMM d, yyyy'),
      format(new Date(value), 'p'),
    ]}
  />
)
