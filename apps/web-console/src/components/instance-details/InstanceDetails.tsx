import React from 'react'
import filesize from 'filesize'

import type { ApiInstanceView } from '@oxide/api'
import { Icon, classed } from '@oxide/ui'
import { StatusBadge } from '../StatusBadge'

export interface InstanceDetailsProps {
  instance: ApiInstanceView
}

const Cell = classed.span`before:content-['//'] before:mx-2 first:before:content-none`

export const InstanceDetails = ({ instance }: InstanceDetailsProps) => (
  <div className="text-sm flex items-center">
    <StatusBadge className="mr-3" status={instance.runState} />
    <span>
      <Cell>{instance.ncpus} vCPU</Cell>
      <Cell>{filesize(instance.memory)} RAM</Cell>
      <Cell className="uppercase">100 GB Disk</Cell>
      <Cell>Debian 9.12 x64</Cell>
      <Cell>
        {instance.hostname}
        <Icon className="ml-1 mr-3" name="copy" />
        10.10.16.7
      </Cell>
    </span>
  </div>
)
