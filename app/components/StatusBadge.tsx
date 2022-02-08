import React from 'react'

import type { BadgeColor } from '@oxide/ui'
import { Badge } from '@oxide/ui'
import type { DiskState, InstanceState } from '@oxide/api'

const INSTANCE_COLORS: Record<InstanceState, BadgeColor> = {
  creating: 'notice',
  starting: 'notice',
  running: 'default',
  rebooting: 'notice',
  stopping: 'notice',
  stopped: 'lightGray',
  repairing: 'notice',
  migrating: 'notice',
  failed: 'destructive',
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
  attached: 'default',
  attaching: 'notice',
  creating: 'notice',
  detaching: 'notice',
  detached: 'darkGray',
  destroyed: 'darkGray', // should we ever see this?
  faulted: 'destructive',
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
