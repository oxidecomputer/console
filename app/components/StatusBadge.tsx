import type { DiskState, InstanceState, SnapshotState } from '@oxide/api'
import type { BadgeColor, BadgeProps } from '@oxide/ui'
import { Badge } from '@oxide/ui'

const INSTANCE_COLORS: Record<InstanceState, Pick<BadgeProps, 'color' | 'variant'>> = {
  creating: { color: 'notice' },
  starting: { color: 'notice' },
  running: { color: 'default' },
  rebooting: { color: 'notice' },
  stopping: { color: 'notice' },
  stopped: { color: 'neutral', variant: 'default' },
  repairing: { color: 'notice' },
  migrating: { color: 'notice' },
  failed: { color: 'destructive' },
  destroyed: { color: 'neutral' },
}

export const InstanceStatusBadge = (props: {
  status: InstanceState
  className?: string
}) => (
  <Badge variant="default" {...INSTANCE_COLORS[props.status]} className={props.className}>
    {props.status}
  </Badge>
)

type DiskStateStr = DiskState['state']

const DISK_COLORS: Record<DiskStateStr, BadgeColor> = {
  attached: 'default',
  attaching: 'notice',
  creating: 'notice',
  detaching: 'notice',
  detached: 'neutral',
  destroyed: 'neutral', // should we ever see this?
  faulted: 'destructive',
}

export const DiskStatusBadge = (props: { status: DiskStateStr; className?: string }) => (
  <Badge variant="default" color={DISK_COLORS[props.status]} className={props.className}>
    {props.status}
  </Badge>
)

const SNAPSHOT_COLORS: Record<SnapshotState, BadgeColor> = {
  creating: 'notice',
  destroyed: 'neutral',
  faulted: 'destructive',
  ready: 'default',
}

export const SnapshotStatusBadge = (props: {
  status: SnapshotState
  className?: string
}) => (
  <Badge
    variant="default"
    color={SNAPSHOT_COLORS[props.status]}
    className={props.className}
  >
    {props.status}
  </Badge>
)
