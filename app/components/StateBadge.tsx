/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'

import {
  instanceTransitioning,
  type DiskState,
  type InstanceState,
  type SnapshotState,
} from '@oxide/api'

import { Badge, type BadgeColor, type BadgeProps } from '~/ui/lib/Badge'
import { Spinner } from '~/ui/lib/Spinner'

const INSTANCE_COLORS: Record<InstanceState, BadgeColor> = {
  running: 'default',
  stopped: 'neutral',
  failed: 'destructive',
  destroyed: 'destructive',
  creating: 'default',
  starting: 'blue',
  rebooting: 'blue',
  migrating: 'purple',
  repairing: 'notice',
  stopping: 'neutral',
}

export const InstanceStateBadge = (props: { state: InstanceState; className?: string }) => (
  <Badge
    color={INSTANCE_COLORS[props.state]}
    className={cn(props.className, 'children:flex children:items-center children:gap-1')}
  >
    {instanceTransitioning(props.state) && (
      <Spinner size="sm" variant={INSTANCE_COLORS[props.state]} />
    )}
    {props.state}
  </Badge>
)

type DiskStateStr = DiskState['state']

const DISK_COLORS: Record<DiskStateStr, Pick<BadgeProps, 'color' | 'variant'>> = {
  attached: { color: 'default' },
  attaching: { color: 'blue', variant: 'solid' },
  creating: { color: 'purple', variant: 'solid' },
  detaching: { color: 'notice', variant: 'solid' },
  detached: { color: 'neutral', variant: 'solid' },
  destroyed: { color: 'destructive', variant: 'solid' }, // should we ever see this?
  faulted: { color: 'destructive', variant: 'solid' },
  maintenance: { color: 'notice', variant: 'solid' },
  import_ready: { color: 'blue', variant: 'solid' },
  importing_from_url: { color: 'purple', variant: 'solid' },
  importing_from_bulk_writes: { color: 'purple', variant: 'solid' },
  finalizing: { color: 'blue', variant: 'solid' },
}

export const DiskStateBadge = (props: { state: DiskStateStr; className?: string }) => (
  <Badge {...DISK_COLORS[props.state]} className={props.className}>
    {props.state}
  </Badge>
)

const SNAPSHOT_COLORS: Record<SnapshotState, BadgeColor> = {
  creating: 'notice',
  destroyed: 'neutral',
  faulted: 'destructive',
  ready: 'default',
}

export const SnapshotStateBadge = (props: { state: SnapshotState; className?: string }) => (
  <Badge color={SNAPSHOT_COLORS[props.state]} className={props.className}>
    {props.state}
  </Badge>
)
