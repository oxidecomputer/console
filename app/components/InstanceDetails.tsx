import React from 'react'
import filesize from 'filesize'

import type { Instance } from '@oxide/api'
import { classed } from '@oxide/ui'
import { StatusBadge } from './StatusBadge'

export interface InstanceDetailsProps {
  instance: Instance
}

const Sep = classed.span`before:content-['/'] before:mx-2 before:text-gray-400`

// fun hack to include spaces if you highlight and copy the line of details. if
// you paste in a rich text editor they'll be tiny, but in a normal text editor
// they're fine
const Space = () => <span style={{ fontSize: 0 }}>&nbsp;</span>

export const InstanceDetails = ({ instance }: InstanceDetailsProps) => (
  <div className="text-xs font-mono flex items-center">
    <span>{instance.ncpus} vCPU</span>
    <Sep />
    <Space />
    <span>{filesize(instance.memory)} RAM</span>
    <Sep />
    <Space />
    <span className="mr-6">100 GB SSD</span>
    <Space />
    <span className="mr-6">Debian 9.12</span>
    <Space />
    <span>{instance.hostname}</span>
    <Sep />
    <Space />
    <span className="mr-6">10.10.16.7</span>
    <Space />
    <StatusBadge status={instance.runState} size="sm" />
  </div>
)
