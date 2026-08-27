/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useQuery } from '@tanstack/react-query'

import { api, qErrorsAllowed, type Disk } from '@oxide/api'
import { Badge } from '@oxide/design-system/ui'

import { SkeletonCell } from './EmptyCell'
import { ButtonCell } from './LinkCell'

// Views of a resource another resource was created from. Use qErrorsAllowed so
// deletion of the source is a cacheable result rather than an error that blows
// up the page; consumers render a "Deleted" badge in that case.

const deletedOk = (resource: string) => ({
  errorsExpected: {
    explanation: `the source ${resource} may have been deleted.`,
    statusCode: 404,
  },
})

export const sourceDiskQ = (disk: string) =>
  qErrorsAllowed(api.diskView, { path: { disk } }, deletedOk('disk'))

export const sourceImageQ = (image: string) =>
  qErrorsAllowed(api.imageView, { path: { image } }, deletedOk('image'))

export const sourceSnapshotQ = (snapshot: string) =>
  qErrorsAllowed(api.snapshotView, { path: { snapshot } }, deletedOk('snapshot'))

type DiskNameFromIdProps = {
  diskId: string
  /** When present, the name is a button. Otherwise it's plain text. */
  onClick?: (disk: Disk) => void
}

/**
 * Disk name resolved from ID. Renders a skeleton while loading and a "Deleted"
 * badge if the disk no longer exists.
 */
export const DiskNameFromId = ({ diskId, onClick }: DiskNameFromIdProps) => {
  const { data } = useQuery(sourceDiskQ(diskId))

  if (!data) return <SkeletonCell />
  if (data.type === 'error') return <Badge color="neutral">Deleted</Badge>

  const disk = data.data
  if (!onClick) return <>{disk.name}</>
  return <ButtonCell onClick={() => onClick(disk)}>{disk.name}</ButtonCell>
}
