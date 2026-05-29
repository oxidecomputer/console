/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { api, qErrorsAllowed } from '@oxide/api'
import { Badge } from '@oxide/design-system/ui'

import { ImageDetailSideModal } from '~/components/ImageDetailSideModal'
import { SnapshotDetailSideModal } from '~/components/SnapshotDetailSideModal'
import { useIsInSideModal } from '~/ui/lib/modal-context'

import { EmptyCell, SkeletonCell } from './EmptyCell'
import { ButtonCell } from './LinkCell'

// Use qErrorsAllowed so deletion of the source resource is a cacheable result
// rather than an error that blows up the page. Tables and the disk detail
// modal both render a "Deleted" badge in that case.

const sourceImageQ = (image: string) =>
  qErrorsAllowed(
    api.imageView,
    { path: { image } },
    {
      errorsExpected: {
        explanation: 'the source image may have been deleted.',
        statusCode: 404,
      },
    }
  )

const sourceSnapshotQ = (snapshot: string) =>
  qErrorsAllowed(
    api.snapshotView,
    { path: { snapshot } },
    {
      errorsExpected: {
        explanation: 'the source snapshot may have been deleted.',
        statusCode: 404,
      },
    }
  )

type Props = {
  imageId?: string | null
  snapshotId?: string | null
}

/**
 * Renders the source resource's name. In a table cell the name is a
 * `ButtonCell` that opens a detail side modal; inside a side modal it falls
 * back to plain text to avoid stacking modals. Falls back to a skeleton while
 * loading and a "Deleted" badge when the source no longer exists.
 */
export const DiskSourceName = ({ imageId, snapshotId }: Props) => {
  const inSideModal = useIsInSideModal()
  const [showDetail, setShowDetail] = useState(false)
  const image = useQuery({ ...sourceImageQ(imageId!), enabled: !!imageId })
  const snapshot = useQuery({ ...sourceSnapshotQ(snapshotId!), enabled: !!snapshotId })

  if (!imageId && !snapshotId) return <EmptyCell />

  // Nexus populates exactly one of imageId/snapshotId per disk, so a disk won't have both,
  // though the Disk type in the API just lists both as optional
  // https://github.com/oxidecomputer/omicron/blob/254a0c5/nexus/db-model/src/disk_type_crucible.rs#L49-L78
  const result = imageId ? image.data : snapshot.data
  if (!result) return <SkeletonCell />
  if (result.type === 'error') return <Badge color="neutral">Deleted</Badge>

  const name = result.data.name
  if (inSideModal) {
    return (
      <span className="flex items-center gap-1">
        <Badge color="neutral">{imageId ? 'Image' : 'Snapshot'}</Badge>
        {name}
      </span>
    )
  }
  return (
    <>
      <ButtonCell onClick={() => setShowDetail(true)}>{name}</ButtonCell>
      {showDetail &&
        (imageId && image.data?.type === 'success' ? (
          <ImageDetailSideModal
            image={image.data.data}
            onDismiss={() => setShowDetail(false)}
          />
        ) : snapshotId && snapshot.data?.type === 'success' ? (
          <SnapshotDetailSideModal
            snapshot={snapshot.data.data}
            onDismiss={() => setShowDetail(false)}
          />
        ) : null)}
    </>
  )
}
