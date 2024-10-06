/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { VirtualResourceCounts } from '@oxide/api'
import { Cpu16Icon, Ram16Icon, Ssd16Icon } from '@oxide/design-system/icons/react'

import { bytesToSpecificUnit, getUnits } from '~/util/units'

import { CapacityBar } from './CapacityBar'

export const CapacityBars = ({
  allocated,
  provisioned,
  allocatedLabel,
}: {
  allocated: VirtualResourceCounts
  provisioned: VirtualResourceCounts
  allocatedLabel: string
}) => {
  // These will most likely be GiB, but calculating dynamically to handle larger configurations in the future
  const memoryUnits = getUnits(Math.max(provisioned.memory, allocated.memory))
  const provisionedMemory = bytesToSpecificUnit(provisioned.memory, memoryUnits)
  const allocatedMemory = bytesToSpecificUnit(allocated.memory, memoryUnits)

  // These will most likely be TiB, but calculating dynamically for the same reason as above
  const storageUnits = getUnits(Math.max(provisioned.storage, allocated.storage))
  const provisionedStorage = bytesToSpecificUnit(provisioned.storage, storageUnits)
  const allocatedStorage = bytesToSpecificUnit(allocated.storage, storageUnits)

  return (
    <div className="mb-12 flex min-w-min flex-col gap-3 lg+:flex-row">
      <CapacityBar
        icon={<Cpu16Icon />}
        title="CPU"
        unit="vCPUs"
        provisioned={provisioned.cpus}
        capacity={allocated.cpus}
        includeUnit={false}
        capacityLabel={allocatedLabel}
      />
      <CapacityBar
        icon={<Ram16Icon />}
        title="MEMORY"
        unit={memoryUnits}
        provisioned={provisionedMemory}
        capacity={allocatedMemory}
        capacityLabel={allocatedLabel}
      />
      <CapacityBar
        icon={<Ssd16Icon />}
        title="STORAGE"
        unit={storageUnits}
        provisioned={provisionedStorage}
        capacity={allocatedStorage}
        capacityLabel={allocatedLabel}
      />
    </div>
  )
}
