import React from 'react'

import type { BadgeColor } from '@oxide/ui'
import { Badge } from '@oxide/ui'
import type { InstanceState } from '@oxide/api'

type Props = {
  status: InstanceState
  className?: string
}

const COLORS: Record<InstanceState, BadgeColor> = {
  creating: 'yellow',
  starting: 'yellow',
  running: 'green',
  rebooting: 'yellow',
  stopping: 'yellow',
  stopped: 'lightGray',
  repairing: 'blue',
  failed: 'red',
  destroyed: 'darkGray',
}

export const StatusBadge = ({ status, className }: Props) => (
  <Badge color={COLORS[status]} className={className}>
    {status}
  </Badge>
)
