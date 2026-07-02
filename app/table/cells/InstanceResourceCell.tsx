/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { Instance } from '@oxide/api'

import { Size, ValueUnit } from '~/ui/lib/ValueUnit'

type Props = { value: Pick<Instance, 'ncpus' | 'memory'> }

export const InstanceResourceCell = ({ value }: Props) => (
  <div className="space-y-0.5">
    <div>
      <ValueUnit value={value.ncpus} unit="vCPU" />
    </div>
    <div>
      <Size bytes={value.memory} />
    </div>
  </div>
)
