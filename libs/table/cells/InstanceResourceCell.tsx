import fileSize from 'filesize'

import type { Instance } from '@oxide/api'

import type { Cell } from './Cell'

export const InstanceResourceCell = ({
  value,
}: Cell<Pick<Instance, 'ncpus' | 'memory'>>) => {
  const memory = fileSize(value.memory, { output: 'object', base: 2 })
  return (
    <div className="space-y-0.5">
      <div>
        {value.ncpus} <span className="text-quaternary">vCPU</span>
      </div>
      <div>
        {memory.value} <span className="text-quaternary">{memory.unit} SSD</span>
      </div>
    </div>
  )
}
