/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { Instance } from '@oxide/api'

import { InstanceStatusBadge } from 'app/components/StatusBadge'
import { TimeAgo } from 'app/components/TimeAgo'

import type { Cell } from './Cell'

export const InstanceStatusCell = ({
  value,
}: Cell<Pick<Instance, 'runState' | 'timeRunStateUpdated'>>) => {
  return (
    <div className="space-y-0.5">
      <InstanceStatusBadge key="run-state" status={value.runState} />
      <TimeAgo description="Run state updated" datetime={value.timeRunStateUpdated} />
    </div>
  )
}
