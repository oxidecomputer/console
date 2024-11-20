/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'
import { useCallback } from 'react'
import { Outlet, useNavigate, type LoaderFunctionArgs } from 'react-router-dom'

import {
  apiq,
  apiQueryClient,
  queryClient,
  useApiMutation,
  useApiQueryClient,
  useApiQueryErrorsAllowed,
  type Snapshot,
} from '@oxide/api'
import { Snapshots16Icon, Snapshots24Icon } from '@oxide/design-system/icons/react'

import { DocsPopover } from '~/components/DocsPopover'
import { SnapshotStateBadge } from '~/components/StateBadge'
import { getProjectSelector, useProjectSelector } from '~/hooks/use-params'
import { confirmDelete } from '~/stores/confirm-delete'
import { SkeletonCell } from '~/table/cells/EmptyCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { PAGE_SIZE, useQueryTable } from '~/table/QueryTable2'
import { Badge } from '~/ui/lib/Badge'
import { CreateLink } from '~/ui/lib/CreateButton'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { TableActions } from '~/ui/lib/Table'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'

const DiskNameFromId = ({ value }: { value: string }) => {
  const { data } = useApiQueryErrorsAllowed('diskView', { path: { disk: value } })

  if (!data) return <SkeletonCell />
  if (data.type === 'error') return <Badge color="neutral">Deleted</Badge>
  return <span className="text-secondary">{data.data.name}</span>
}

const EmptyState = () => (
  <EmptyMessage
    icon={<Snapshots24Icon />}
    title="No snapshots"
    body="Create a snapshot to see it here"
    buttonText="New snapshot"
    buttonTo={pb.snapshotsNew(useProjectSelector())}
  />
)
// clearly we need to shorten this
const snapshotListOptions = (project: string) => (limit: number, pageToken?: string) =>
  apiq('snapshotList', { query: { project, pageToken, limit } })

SnapshotsPage.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project } = getProjectSelector(params)
  await Promise.all([
    queryClient.prefetchQuery(snapshotListOptions(project)(PAGE_SIZE)),

    // Fetch disks and preload into RQ cache so fetches by ID in DiskNameFromId
    // can be mostly instant yet gracefully fall back to fetching individually
    // if we don't fetch them all here. This has to be the *ErrorsAllowed
    // version of setQueryData because the disk fetchs are also the errors
    // allowed version. If we use regular setQueryData, nothing blows up; the
    // data is just never found in the cache. Note that the disks that error
    // (delete disks) are not prefetched here because they are (obviously) not
    // in the disk list response.
    apiQueryClient
      .fetchQuery('diskList', { query: { project, limit: 200 } })
      .then((disks) => {
        for (const disk of disks.items) {
          apiQueryClient.setQueryDataErrorsAllowed(
            'diskView',
            { path: { disk: disk.id } },
            { type: 'success', data: disk }
          )
        }
      }),
  ])
  return null
}

const colHelper = createColumnHelper<Snapshot>()
const staticCols = [
  colHelper.accessor('name', {}),
  colHelper.accessor('description', Columns.description),
  colHelper.accessor('diskId', {
    header: 'disk',
    cell: (info) => <DiskNameFromId value={info.getValue()} />,
  }),
  colHelper.accessor('state', {
    cell: (info) => <SnapshotStateBadge state={info.getValue()} />,
  }),
  colHelper.accessor('size', Columns.size),
  colHelper.accessor('timeCreated', Columns.timeCreated),
]

export function SnapshotsPage() {
  const queryClient = useApiQueryClient()
  const { project } = useProjectSelector()
  const navigate = useNavigate()

  const { mutateAsync: deleteSnapshot } = useApiMutation('snapshotDelete', {
    onSuccess() {
      queryClient.invalidateQueries('snapshotList')
    },
  })

  const makeActions = useCallback(
    (snapshot: Snapshot): MenuAction[] => [
      {
        label: 'Create image',
        onActivate() {
          navigate(pb.snapshotImagesNew({ project, snapshot: snapshot.name }))
        },
      },
      {
        label: 'Delete',
        onActivate: confirmDelete({
          doDelete: () =>
            deleteSnapshot({
              path: { snapshot: snapshot.name },
              query: { project },
            }),
          label: snapshot.name,
        }),
      },
    ],
    [deleteSnapshot, navigate, project]
  )
  const columns = useColsWithActions(staticCols, makeActions)
  const { table } = useQueryTable({
    optionsFn: snapshotListOptions(project),
    columns,
    emptyState: <EmptyState />,
  })
  return (
    <>
      <PageHeader>
        <PageTitle icon={<Snapshots24Icon />}>Snapshots</PageTitle>
        <DocsPopover
          heading="snapshots"
          icon={<Snapshots16Icon />}
          summary="A snapshot is a lightweight point-in-time copy of a disk that can be used to create an image."
          links={[docLinks.snapshots]}
        />
      </PageHeader>
      <TableActions>
        <CreateLink to={pb.snapshotsNew({ project })}>New snapshot</CreateLink>
      </TableActions>
      {table}
      <Outlet />
    </>
  )
}
