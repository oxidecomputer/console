import { Badge, Success12Icon } from '@oxide/ui'
import React from 'react'
import type { Cell } from '.'

export const EnabledCell = ({ value }: Cell<'enabled' | 'disabled'>) =>
  value === 'enabled' ? (
    <>
      <Success12Icon className="text-green-500 mr-1" />
      <Badge variant="dim">Enabled</Badge>
    </>
  ) : (
    <>
      <Success12Icon className="text-yellow-500 mr-1" />
      <Badge color="yellow" variant="dim">
        Disabled
      </Badge>
    </>
  )
