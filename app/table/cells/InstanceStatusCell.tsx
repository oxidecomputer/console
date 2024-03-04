/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { Instance } from '@oxide/api'

import { InstanceStatusBadge } from '~/components/StatusBadge'
import { TimeAgo } from '~/components/TimeAgo'

import type { Cell } from './Cell'

export const InstanceStatusCell = ({
  value,
}: Cell<Pick<Instance, 'runState' | 'timeRunStateUpdated'>>) => {
  return (
    <div className="flex flex-col">
      <InstanceStatusBadge key="run-state" status={value.runState} />
      <TimeAgo tooltipText="Run state updated" datetime={value.timeRunStateUpdated} />
    </div>
  )
}
