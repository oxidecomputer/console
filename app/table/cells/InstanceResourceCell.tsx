/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { filesize } from 'filesize'

import type { Instance } from '@oxide/api'

type Props = { value: Pick<Instance, 'ncpus' | 'memory'> }

export const InstanceResourceCell = ({ value }: Props) => {
  const memory = filesize(value.memory, { output: 'object', base: 2 })
  return (
    <div className="space-y-0.5">
      <div>
        {value.ncpus} <span className="text-tertiary">vCPU</span>
      </div>
      <div>
        {memory.value} <span className="text-tertiary">{memory.unit}</span>
      </div>
    </div>
  )
}
