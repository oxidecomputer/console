import { formatDistanceToNow } from 'date-fns'

import type { Instance } from '@oxide/api'
import { Badge } from '@oxide/ui'

import type { Cell } from './Cell'
import { TwoLineCell } from './TwoLineCell'

export const InstanceStatusCell = ({
  value,
}: Cell<Pick<Instance, 'runState' | 'timeRunStateUpdated'>>) => {
  return (
    <TwoLineCell
      detailsClass="text-mono-sm"
      value={[
        <Badge variant="secondary" key="run-state">
          {value.runState}
        </Badge>,
        formatDistanceToNow(value.timeRunStateUpdated),
      ]}
    ></TwoLineCell>
  )
}
