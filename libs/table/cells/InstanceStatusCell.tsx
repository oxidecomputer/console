import type { Instance } from '@oxide/api'
import { Badge } from '@oxide/ui'
import { formatDistanceToNow } from 'date-fns'
import React from 'react'
import type { Cell } from './Cell'
import { TwoLineCell } from './TwoLineCell'

export const InstanceStatusCell = ({
  value,
}: Cell<Pick<Instance, 'runState' | 'timeRunStateUpdated'>>) => {
  return (
    <TwoLineCell
      value={[
        <Badge variant="dim" key="run-state">
          {value.runState}
        </Badge>,
        formatDistanceToNow(new Date(value.timeRunStateUpdated)),
      ]}
    ></TwoLineCell>
  )
}
