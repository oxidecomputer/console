import type { Instance } from '@oxide/api'
import { Badge } from '@oxide/ui'
import { formatDistanceToNow } from 'date-fns'
import React from 'react'
import { TwoLineCell } from '.'

interface InstanceStatusCellProps {
  value: Pick<Instance, 'runState' | 'timeRunStateUpdated'>
}
export const InstanceStatusCell = ({ value }: InstanceStatusCellProps) => {
  return (
    <TwoLineCell
      value={[
        <Badge variant="dim" key="run-state">
          {value.runState}
        </Badge>,
        formatDistanceToNow(value.timeRunStateUpdated),
      ]}
    ></TwoLineCell>
  )
}
