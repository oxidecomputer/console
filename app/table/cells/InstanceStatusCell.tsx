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

type Props = { value: Pick<Instance, 'runState' | 'timeRunStateUpdated'> }

export const InstanceStatusCell = ({ value }: Props) => {
  return (
    <div className="flex flex-col">
      <InstanceStatusBadge key="run-state" status={value.runState} />
      <TimeAgo tooltipText="Run state updated" datetime={value.timeRunStateUpdated} />
    </div>
  )
}
