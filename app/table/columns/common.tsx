/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { Badge } from '@oxide/design-system/ui'

import type { DiskState, DiskType, IdentityType, InstanceState, IpVersion } from '~/api'
import { IpVersionBadge } from '~/components/IpVersionBadge'
import { DiskStateBadge, DiskTypeBadge, InstanceStateBadge } from '~/components/StateBadge'
import { DescriptionCell } from '~/table/cells/DescriptionCell'
import { DiskSourceName } from '~/table/cells/DiskSourceCell'
import { EmptyCell } from '~/table/cells/EmptyCell'
import { InstanceLink } from '~/table/cells/InstanceLinkCell'
import { DateTime } from '~/ui/lib/DateTime'
import { Truncate } from '~/ui/lib/Truncate'
import { Size } from '~/ui/lib/ValueUnit'
import { identityTypeLabel } from '~/util/access'

// the full type of the info arg is CellContext<Row, Item> from RT, but in these
// cells we only care about the return value of getValue
type Info<T> = { getValue: () => T }

function dateCell(info: Info<Date>) {
  return <DateTime date={info.getValue()} />
}

function idCell(info: Info<string>) {
  return (
    <Truncate text={info.getValue()} position="middle" className="max-w-48" hasCopyButton />
  )
}

// narrow enough to leave ~5 characters on either side of the ellipsis, enough
// to tell UUIDs apart at a glance without the wide column a full one demands
function shortIdCell(info: Info<string>) {
  return (
    <Truncate text={info.getValue()} position="middle" className="max-w-32" hasCopyButton />
  )
}

function instanceStateCell(info: Info<InstanceState>) {
  return <InstanceStateBadge state={info.getValue()} />
}

/** Column widths in px, including the cell's 44px of horizontal padding (28px for `compact-col`) */
export const ColWidth = {
  xs: 96,
  sm: 112,
  md: 128,
  lg: 160,
  xl: 208,
  // widest US date, "May 28, 2026 12:59 PM", is 160px, plus compact padding
  date: 192,
  description: 240,
  id: 240,
  // an IPv4 range or a typical IPv6 address with its copy button
  ip: 224,
} as const

const optionalTextCell = (info: Info<string | null | undefined>) =>
  info.getValue() || <EmptyCell />

/** Columns used in a bunch of tables */
export const Columns = {
  /** Truncates text if too long, full text in tooltip */
  description: {
    cell: (info: Info<string | undefined>) => <DescriptionCell text={info.getValue()} />,
    meta: { width: ColWidth.description },
  },
  id: { header: 'ID', cell: idCell, meta: { width: ColWidth.id } },
  /**
   * Like `id`, but middle-truncated, with the full value in a tooltip and on
   * the copy button. For tables too crowded to give an ID its full width, or
   * that show more than one ID per row.
   */
  shortId: { header: 'ID', cell: shortIdCell, meta: { width: 184 } },
  instanceState: { header: 'state', cell: instanceStateCell, meta: { width: ColWidth.lg } },
  size: {
    cell: (info: Info<number>) => <Size bytes={info.getValue()} />,
    meta: { width: ColWidth.sm },
  },
  timeCreated: {
    header: 'created',
    cell: dateCell,
    meta: { width: ColWidth.date, tdClassName: 'compact-col' },
  },
  timeModified: {
    header: 'modified',
    cell: dateCell,
    meta: { width: ColWidth.date, tdClassName: 'compact-col' },
  },
  diskSource: {
    id: 'source',
    header: 'Source',
    cell: (info: Info<{ imageId?: string | null; snapshotId?: string | null }>) => (
      <DiskSourceName {...info.getValue()} />
    ),
    meta: { width: ColWidth.lg },
  },
  diskState: {
    header: 'state',
    cell: (info: Info<DiskState['state']>) => <DiskStateBadge state={info.getValue()} />,
    meta: { width: ColWidth.md },
  },
  diskType: {
    header: 'Type',
    cell: (info: Info<DiskType>) => <DiskTypeBadge diskType={info.getValue()} />,
    // fits `distributed`
    meta: { width: 144 },
  },
  identityType: {
    header: 'Type',
    cell: (info: Info<IdentityType>) => identityTypeLabel[info.getValue()],
    meta: { width: ColWidth.sm },
  },
  imageOs: { header: 'OS', cell: optionalTextCell, meta: { width: ColWidth.sm } },
  imageVersion: { header: 'version', cell: optionalTextCell, meta: { width: ColWidth.md } },
  instance: (tab: 'storage' | 'networking') => ({
    header: 'Instance',
    cell: (info: Info<string | null | undefined>) => (
      <InstanceLink instanceId={info.getValue()} tab={tab} cell />
    ),
    meta: { width: ColWidth.lg },
  }),
  ipVersion: {
    header: 'Version',
    cell: (info: Info<IpVersion>) => <IpVersionBadge ipVersion={info.getValue()} />,
    meta: { width: ColWidth.xs },
  },
  poolType: {
    header: 'Type',
    cell: (info: Info<string>) => <Badge color="neutral">{info.getValue()}</Badge>,
    meta: { width: ColWidth.md },
  },
  serial: { header: 'serial number', meta: { width: ColWidth.lg } },
}
