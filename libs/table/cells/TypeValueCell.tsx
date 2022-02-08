import React from 'react'
import { Badge } from '@oxide/ui'
import type { Cell } from './Cell'

export const TypeValueCell = ({
  value: { type, value },
}: Cell<{
  type: string
  value: string
}>) => (
  <div className="space-x-1">
    <Badge variant="dim">{type}</Badge>
    <Badge variant="solid">{value}</Badge>
  </div>
)
