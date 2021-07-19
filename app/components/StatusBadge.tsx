import React from 'react'

import type { BadgeColor, BadgeProps } from '@oxide/ui'
import { Badge } from '@oxide/ui'
import type { InstanceState } from '@oxide/api'

type Props = {
  status: InstanceState
  className?: string
} & Pick<BadgeProps, 'size'>

const COLORS: Record<InstanceState, BadgeColor> = {
  creating: 'yellow',
  starting: 'yellow',
  running: 'green',
  rebooting: 'yellow',
  stopping: 'yellow',
  stopped: 'gray',
  repairing: 'blue',
  failed: 'red',
  destroyed: 'gray',
}

export const StatusBadge = ({ status, className, size }: Props) => (
  <Badge color={COLORS[status]} size={size} className={className}>
    {status}
  </Badge>
)
