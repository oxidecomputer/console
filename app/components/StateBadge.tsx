/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'

import {
  diskTransitioning,
  instanceTransitioning,
  type DiskState,
  type DiskType,
  type InstanceState,
  type SnapshotState,
} from '@oxide/api'
import { Badge, type BadgeColor } from '@oxide/design-system/ui'

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

const badgeClasses = '*:flex *:items-center *:gap-1'

export const InstanceStateBadge = (props: { state: InstanceState; className?: string }) => (
  <Badge color={INSTANCE_COLORS[props.state]} className={cn(props.className, badgeClasses)}>
    {instanceTransitioning(props.state) && (
      <Spinner size="sm" variant={INSTANCE_COLORS[props.state]} />
    )}
    {props.state}
  </Badge>
)

type DiskStateStr = DiskState['state']

const DISK_COLORS: Record<DiskStateStr, BadgeColor> = {
  attached: 'default',
  attaching: 'blue',
  creating: 'default',
  detaching: 'blue',
  detached: 'neutral',
  destroyed: 'destructive', // should we ever see this?
  faulted: 'destructive',
  maintenance: 'notice',
  import_ready: 'blue',
  importing_from_url: 'purple',
  importing_from_bulk_writes: 'purple',
  finalizing: 'blue',
}

export const DiskStateBadge = (props: { state: DiskStateStr; className?: string }) => (
  <Badge color={DISK_COLORS[props.state]} className={cn(props.className, badgeClasses)}>
    {diskTransitioning(props.state) && (
      <Spinner size="sm" variant={DISK_COLORS[props.state]} />
    )}
    {props.state.replace(/_/g, ' ')}
  </Badge>
)

const SNAPSHOT_COLORS: Record<SnapshotState, BadgeColor> = {
  creating: 'default',
  destroyed: 'neutral',
  faulted: 'destructive',
  ready: 'default',
}

export const SnapshotStateBadge = (props: { state: SnapshotState; className?: string }) => (
  <Badge color={SNAPSHOT_COLORS[props.state]} className={cn(props.className, badgeClasses)}>
    {props.state === 'creating' && (
      <Spinner size="sm" variant={SNAPSHOT_COLORS[props.state]} />
    )}
    {props.state}
  </Badge>
)

export const DiskTypeBadge = (props: { diskType: DiskType; className?: string }) => (
  <Badge color="neutral" className={props.className}>
    {props.diskType}
  </Badge>
)

export const ReadOnlyBadge = () => (
  <Badge color="neutral" className="relative">
    Read only
  </Badge>
)
