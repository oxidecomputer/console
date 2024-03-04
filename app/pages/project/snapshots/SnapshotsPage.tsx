/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Link, Outlet, useNavigate, type LoaderFunctionArgs } from 'react-router-dom'

import {
  apiQueryClient,
  useApiMutation,
  useApiQueryClient,
  useApiQueryErrorsAllowed,
  type Snapshot,
} from '@oxide/api'
import { Snapshots24Icon } from '@oxide/design-system/icons/react'

import { SnapshotStatusBadge } from '~/components/StatusBadge'
import { getProjectSelector, useProjectSelector } from '~/hooks'
import { confirmDelete } from '~/stores/confirm-delete'
import { DateCell } from '~/table/cells/DateCell'
import { SkeletonCell } from '~/table/cells/EmptyCell'
import { SizeCell } from '~/table/cells/SizeCell'
import type { MenuAction } from '~/table/columns/action-col'
import { useQueryTable } from '~/table/QueryTable'
import { Badge } from '~/ui/lib/Badge'
import { buttonStyle } from '~/ui/lib/Button'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { TableActions } from '~/ui/lib/Table'
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
    body="You need to create a snapshot to be able to see it here"
    buttonText="New snapshot"
    buttonTo={pb.snapshotsNew(useProjectSelector())}
  />
)

SnapshotsPage.loader = async ({ params }: LoaderFunctionArgs) => {
  await apiQueryClient.prefetchQuery('snapshotList', {
    query: { ...getProjectSelector(params), limit: 25 },
  })
  return null
}

export function SnapshotsPage() {
  const queryClient = useApiQueryClient()
  const projectSelector = useProjectSelector()
  const { Table, Column } = useQueryTable('snapshotList', { query: projectSelector })
  const navigate = useNavigate()

  const deleteSnapshot = useApiMutation('snapshotDelete', {
    onSuccess() {
      queryClient.invalidateQueries('snapshotList')
    },
  })

  const makeActions = (snapshot: Snapshot): MenuAction[] => [
    {
      label: 'Create image',
      onActivate() {
        navigate(pb.snapshotImagesNew({ ...projectSelector, snapshot: snapshot.name }))
      },
    },
    {
      label: 'Delete',
      onActivate: confirmDelete({
        doDelete: () =>
          deleteSnapshot.mutateAsync({
            path: { snapshot: snapshot.name },
            query: projectSelector,
          }),
        label: snapshot.name,
      }),
    },
  ]

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Snapshots24Icon />}>Snapshots</PageTitle>
      </PageHeader>
      <TableActions>
        <Link to={pb.snapshotsNew(projectSelector)} className={buttonStyle({ size: 'sm' })}>
          New Snapshot
        </Link>
      </TableActions>
      <Table emptyState={<EmptyState />} makeActions={makeActions}>
        <Column accessor="name" />
        <Column accessor="description" />
        <Column id="disk" accessor="diskId" cell={DiskNameFromId} />
        <Column
          accessor="state"
          cell={({ value }) => <SnapshotStatusBadge status={value} />}
        />
        <Column accessor="size" cell={SizeCell} />
        <Column accessor="timeCreated" id="Created" cell={DateCell} />
      </Table>
      <Outlet />
    </>
  )
}
