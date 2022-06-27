import type { Instance } from '@oxide/api'
import { Badge } from '@oxide/ui'

import { timeAgoAbbr } from 'app/util/date'

import type { Cell } from './Cell'
import { TwoLineCell } from './TwoLineCell'

export const InstanceStatusCell = ({
  value,
}: Cell<Pick<Instance, 'runState' | 'timeRunStateUpdated'>>) => {
  return (
    <TwoLineCell
      detailsClass="text-mono-sm !lowercase"
      value={[
        <Badge variant="secondary" key="run-state">
          {value.runState}
        </Badge>,
        timeAgoAbbr(value.timeRunStateUpdated),
      ]}
    ></TwoLineCell>
  )
}
