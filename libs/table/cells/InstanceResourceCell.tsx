import fileSize from 'filesize'

import type { Instance } from '@oxide/api'
import { UbuntuDistroIcon } from '@oxide/ui'

import type { Cell } from './Cell'
import { TwoLineCell } from './TwoLineCell'

const slash = <span className="text-secondary">/</span>
export const InstanceResourceCell = ({
  value,
}: Cell<Pick<Instance, 'ncpus' | 'memory'>>) => {
  return (
    <TwoLineCell
      value={[
        <span key="first-row">
          {value.ncpus} vCPU {slash} {fileSize(value.memory, { base: 2 })} SSD
        </span>,
        <span className="flex items-center text-secondary" key="second-row">
          <UbuntuDistroIcon className="mr-1 w-5" /> FakeOS 12.04
        </span>,
      ]}
    ></TwoLineCell>
  )
}
