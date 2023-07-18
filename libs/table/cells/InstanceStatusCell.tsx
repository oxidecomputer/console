/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
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
      detailsClass="text-sans-sm"
      value={[
        <InstanceStatusBadge key="run-state" status={value.runState} />,
        timeAgoAbbr(value.timeRunStateUpdated),
      ]}
    ></TwoLineCell>
  )
}
