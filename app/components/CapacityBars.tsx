/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { VirtualResourceCounts } from '@oxide/api'
import { Cpu16Icon, Ram16Icon, Ssd16Icon } from '@oxide/design-system/icons/react'

import { bytesInUnit } from '~/util/units'

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
  const memUnit = 'GiB'
  const storageUnit = 'TiB'

  return (
    <div className="1000:flex-row flex min-w-min flex-col gap-3">
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
        unit={memUnit}
        provisioned={bytesInUnit(provisioned.memory, memUnit)}
        capacity={bytesInUnit(allocated.memory, memUnit)}
        capacityLabel={allocatedLabel}
      />
      <CapacityBar
        icon={<Ssd16Icon />}
        title="STORAGE"
        unit={storageUnit}
        provisioned={bytesInUnit(provisioned.storage, storageUnit)}
        capacity={bytesInUnit(allocated.storage, storageUnit)}
        capacityLabel={allocatedLabel}
      />
    </div>
  )
}
