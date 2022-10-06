import fileSize from 'filesize'

import type { Instance } from '@oxide/api'

import type { Cell } from './Cell'

const slash = <span className="text-quinary">/</span>
export const InstanceResourceCell = ({
  value,
}: Cell<Pick<Instance, 'ncpus' | 'memory'>>) => {
  return (
    <span className="text-secondary">
      {value.ncpus} vCPU {slash} {fileSize(value.memory, { base: 2 })} SSD
    </span>
  )
}
