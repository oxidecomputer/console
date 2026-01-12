/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useNavigate, type LoaderFunctionArgs } from 'react-router'

import { api, q, queryClient, usePrefetchedQuery, type Disk } from '@oxide/api'
import { Storage16Icon } from '@oxide/design-system/icons/react'

import { ReadOnlySideModalForm } from '~/components/form/ReadOnlySideModalForm'
import { DiskStateBadge, DiskTypeBadge } from '~/components/StateBadge'
import { titleCrumb } from '~/hooks/use-crumbs'
import { getDiskSelector, useDiskSelector } from '~/hooks/use-params'
import { EmptyCell } from '~/table/cells/EmptyCell'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { ResourceLabel } from '~/ui/lib/SideModal'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'
import { bytesToGiB } from '~/util/units'

const diskView = ({ disk, project }: PP.Disk) =>
  q(api.diskView, { path: { disk }, query: { project } })

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { project, disk } = getDiskSelector(params)
  await queryClient.prefetchQuery(diskView({ project, disk }))
  return null
}

export const handle = titleCrumb('Disk')

export default function DiskDetailSideModalRoute() {
  const { project, disk } = useDiskSelector()
  const navigate = useNavigate()
  const { data } = usePrefetchedQuery(diskView({ project, disk }))

  return (
    <DiskDetailSideModal disk={data} onDismiss={() => navigate(pb.disks({ project }))} />
  )
}

/**
 * The inner content of the disk detail modal, separated so it can be used
 * either as a standalone page/route or embedded in another page via query params.
 */

type DiskDetailSideModalProps = {
  disk: Disk
  onDismiss: () => void
  /** Pass `true` for state-driven usage (e.g., StorageTab). Omit for route usage. */
  animate?: boolean
}

export function DiskDetailSideModal({
  disk,
  onDismiss,
  animate,
}: DiskDetailSideModalProps) {
  return (
    <ReadOnlySideModalForm
      title="Disk details"
      onDismiss={onDismiss}
      animate={animate}
      subtitle={
        <ResourceLabel>
          <Storage16Icon /> {disk.name}
        </ResourceLabel>
      }
    >
      <PropertiesTable>
        <PropertiesTable.IdRow id={disk.id} />
        <PropertiesTable.DescriptionRow description={disk.description} />
        <PropertiesTable.Row label="Size">{bytesToGiB(disk.size)} GiB</PropertiesTable.Row>
        <PropertiesTable.Row label="State">
          <DiskStateBadge state={disk.state.state} />
        </PropertiesTable.Row>
        <PropertiesTable.Row label="Disk type">
          <DiskTypeBadge diskType={disk.diskType} />
        </PropertiesTable.Row>
        {/* TODO: show attached instance by name like the table does? */}
        <PropertiesTable.Row label="Image ID">
          {disk.imageId ?? <EmptyCell />}
        </PropertiesTable.Row>
        <PropertiesTable.Row label="Snapshot ID">
          {disk.snapshotId ?? <EmptyCell />}
        </PropertiesTable.Row>
        <PropertiesTable.Row label="Block size">
          {disk.blockSize.toLocaleString()} bytes
        </PropertiesTable.Row>
        <PropertiesTable.DateRow label="Created" date={disk.timeCreated} />
        <PropertiesTable.DateRow label="Last Modified" date={disk.timeModified} />
      </PropertiesTable>
    </ReadOnlySideModalForm>
  )
}
