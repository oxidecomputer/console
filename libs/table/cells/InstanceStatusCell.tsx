import type { Instance } from '@oxide/api'

import { InstanceStatusBadge } from 'app/components/StatusBadge'
import { timeAgoAbbr } from 'app/util/date'

import type { Cell } from './Cell'
import { TwoLineCell } from './TwoLineCell'

export const InstanceStatusCell = ({
  value,
}: Cell<Pick<Instance, 'runState' | 'timeRunStateUpdated'>>) => {
  return (
    <TwoLineCell
      detailsClass="text-mono-md !lowercase"
      value={[
        <InstanceStatusBadge key="run-state" status={value.runState} />,
        timeAgoAbbr(value.timeRunStateUpdated),
      ]}
    ></TwoLineCell>
  )
}
