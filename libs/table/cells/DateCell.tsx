import { format } from 'date-fns'
import React from 'react'
import type { Cell } from './Cell'

export const DateCell = ({ value }: Cell<Date>) => (
  <div className="space-y-0.5">
    <div>{format(value, 'MMM d, yyyy')}</div>
    <div className="text-gray-200">{format(value, 'p')}</div>
  </div>
)
