import React from 'react'
import filesize from 'filesize'
import cn from 'classnames'

import type { Instance } from '@oxide/api'
import { classed } from '@oxide/ui'
import { InstanceStatusBadge } from './StatusBadge'

export interface InstanceDetailsProps {
  instance: Instance
  className?: string
}

const Sep = classed.span`before:content-['/'] before:mx-2 before:text-gray-400`

// fun hack to include spaces if you highlight and copy the line of details. if
// you paste in a rich text editor they'll be tiny, but in a normal text editor
// they're fine
const Space = () => <span style={{ fontSize: 0 }}>&nbsp;</span>

export const InstanceDetails = ({
  instance,
  className,
}: InstanceDetailsProps) => (
  <div className={cn('text-xs font-mono flex items-center', className)}>
    <span>{instance.ncpus} vCPU</span>
    <Sep />
    <Space />
    <span>{filesize(instance.memory)} RAM</span>
    <Sep />
    <Space />
    <span className="mr-6">&lt;size&gt; GB SSD</span>
    <Space />
    <span className="mr-6">&lt;image info&gt;</span>
    <Space />
    {/* TODO: when API logic for fallback hostname is correct, this should
    just be hostname */}
    <span>&lt;hostname&gt;</span>
    <Sep />
    <Space />
    <span className="mr-6">&lt;IP address&gt;</span>
    <Space />
    <InstanceStatusBadge status={instance.runState} />
  </div>
)
