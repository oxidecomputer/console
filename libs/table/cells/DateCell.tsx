import { format } from 'date-fns'
import React from 'react'
import type { Cell } from './Cell'

export const DateCell = ({ value }: Cell<Date>) => (
  <div className="space-y-0.5">
    <div>{format(value, 'MMM d, yyyy')}</div>
    <div className="text-secondary selected:text-accent-secondary">
      {format(value, 'p')}
    </div>
  </div>
)
