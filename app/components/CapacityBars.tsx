/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { CapacityBar, type CapacityBarProps } from './CapacityBar'

export const CapacityBars = ({
  allocated,
  provisioned,
  allocatedLabel,
}: Omit<CapacityBarProps, 'kind'>) => {
  return (
    <div className="mb-12 flex min-w-min flex-col gap-3 lg+:flex-row">
      <CapacityBar
        kind="cpus"
        provisioned={provisioned}
        allocated={allocated}
        allocatedLabel={allocatedLabel}
      />
      <CapacityBar
        kind="memory"
        provisioned={provisioned}
        allocated={allocated}
        allocatedLabel={allocatedLabel}
      />
      <CapacityBar
        kind="storage"
        provisioned={provisioned}
        allocated={allocated}
        allocatedLabel={allocatedLabel}
      />
    </div>
  )
}
