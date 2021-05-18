import React from 'react'

import type { BadgeColor, BadgeProps } from '@oxide/ui'
import { Badge } from '@oxide/ui'
import type { ApiInstanceState } from '@oxide/api'

type Props = {
  status: ApiInstanceState
  className?: string
} & Pick<BadgeProps, 'size'>

const COLORS: Record<ApiInstanceState, BadgeColor> = {
  creating: 'yellow',
  starting: 'yellow',
  running: 'green',
  stopping: 'yellow',
  stopped: 'gray',
  repairing: 'blue',
  failed: 'red',
  destroyed: 'gray',
}

export const StatusBadge = ({ status, className, size }: Props) => (
  <Badge
    color={COLORS[status]}
    variant="notification"
    size={size}
    className={className}
  >
    {status}
  </Badge>
)
