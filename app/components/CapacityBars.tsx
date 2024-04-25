/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { VirtualResourceCounts } from '@oxide/api'
import { Cpu16Icon, Ram16Icon, Ssd16Icon } from '@oxide/design-system/icons/react'

import { bytesToGiB, bytesToTiB } from '~/util/units'

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
        unit="GiB"
        provisioned={bytesToGiB(provisioned.memory)}
        capacity={bytesToGiB(allocated.memory)}
        capacityLabel={allocatedLabel}
      />
      <CapacityBar
        icon={<Ssd16Icon />}
        title="STORAGE"
        unit="TiB"
        provisioned={bytesToTiB(provisioned.storage)}
        capacity={bytesToTiB(allocated.storage)}
        capacityLabel={allocatedLabel}
      />
    </div>
  )
}
