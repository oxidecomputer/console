/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { CapacityBar, CapacityBarsRow, type CapacityBarProps } from './CapacityBar'

export const CapacityBars = ({
  provisioned,
  provisionedLabel,
  capacity,
  capacityLabel,
}: Omit<CapacityBarProps, 'kind'>) => {
  return (
    <CapacityBarsRow>
      <CapacityBar
        kind="cpus"
        provisioned={provisioned}
        provisionedLabel={provisionedLabel}
        capacity={capacity}
        capacityLabel={capacityLabel}
      />
      <CapacityBar
        kind="memory"
        provisioned={provisioned}
        provisionedLabel={provisionedLabel}
        capacity={capacity}
        capacityLabel={capacityLabel}
      />
      <CapacityBar
        kind="storage"
        provisioned={provisioned}
        provisionedLabel={provisionedLabel}
        capacity={capacity}
        capacityLabel={capacityLabel}
      />
    </CapacityBarsRow>
  )
}
