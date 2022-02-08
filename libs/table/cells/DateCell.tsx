import { format } from 'date-fns'
import React from 'react'
import type { Cell } from './Cell'

export const DateCell = ({ value }: Cell<string>) => (
  <div className="space-y-0.5">
    <div>{format(new Date(value), 'MMM d, yyyy')}</div>
    <div className="text-secondary">{format(new Date(value), 'p')}</div>
  </div>
)
