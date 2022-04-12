import type { Instance } from '@oxide/api'
import { UbuntuResponsiveIcon } from '@oxide/ui'
import fileSize from 'filesize'
import React from 'react'
import type { Cell } from './Cell'
import { TwoLineCell } from './TwoLineCell'

const slash = <span className="text-secondary">/</span>
export const InstanceResourceCell = ({ value }: Cell<Pick<Instance, 'ncpus' | 'memory'>>) => {
  return (
    <TwoLineCell
      value={[
        <span key="first-row">
          {value.ncpus} vCPU {slash} {fileSize(value.memory, { base: 2 })} SSD
        </span>,
        <span className="flex items-center text-secondary" key="second-row">
          <UbuntuResponsiveIcon className="mr-1 w-5" /> FakeOS 12.04
        </span>,
      ]}
    ></TwoLineCell>
  )
}
