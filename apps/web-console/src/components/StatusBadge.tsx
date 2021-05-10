import React from 'react'

import type { BadgeColor } from '@oxide/ui'
import { Badge } from '@oxide/ui'
import type { ApiInstanceState } from '@oxide/api'

interface Props {
  status: ApiInstanceState
  className?: string
}

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

export const StatusBadge = ({ status, className }: Props) => (
  <Badge
    color={COLORS[status]}
    variant="notification"
    size="sm"
    className={className}
  >
    {status}
  </Badge>
)
