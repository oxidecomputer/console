import React from 'react'

import type { BadgeColor } from '@oxide/ui'
import { Badge } from '@oxide/ui'
import type { DiskState, InstanceState } from '@oxide/api'

const INSTANCE_COLORS: Record<InstanceState, BadgeColor> = {
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

export const InstanceStatusBadge = (props: {
  status: InstanceState
  className?: string
}) => (
  <Badge
    variant="dim"
    color={INSTANCE_COLORS[props.status]}
    className={props.className}
  >
    {props.status}
  </Badge>
)

type DiskStateStr = DiskState['state']

const DISK_COLORS: Record<DiskStateStr, BadgeColor> = {
  attached: 'green',
  attaching: 'yellow',
  creating: 'yellow',
  detaching: 'yellow',
  detached: 'darkGray',
  destroyed: 'darkGray', // should we ever see this?
  faulted: 'red',
}

export const DiskStatusBadge = (props: {
  status: DiskStateStr
  className?: string
}) => (
  <Badge
    variant="dim"
    color={DISK_COLORS[props.status]}
    className={props.className}
  >
    {props.status}
  </Badge>
)
