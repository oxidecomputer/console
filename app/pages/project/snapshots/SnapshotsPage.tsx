/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { LoaderFunctionArgs } from 'react-router-dom'
import { Link, Outlet, useNavigate } from 'react-router-dom'

import type { Snapshot } from '@oxide/api'
import {
  apiQueryClient,
  useApiMutation,
  useApiQueryClient,
  useApiQueryErrorsAllowed,
} from '@oxide/api'
import type { MenuAction } from '@oxide/table'
import { DateCell, SizeCell, useQueryTable } from '@oxide/table'
import {
  Badge,
  EmptyMessage,
  PageHeader,
  PageTitle,
  Snapshots24Icon,
  Spinner,
  TableActions,
  buttonStyle,
} from '@oxide/ui'

import { SnapshotStatusBadge } from 'app/components/StatusBadge'
import { getProjectSelector, useProjectSelector } from 'app/hooks'
import { confirmDelete } from 'app/stores/confirm-delete'
import { pb } from 'app/util/path-builder'

const DiskNameFromId = ({ value }: { value: string }) => {
  const { data } = useApiQueryErrorsAllowed('diskView', { path: { disk: value } })

  if (!data) return <Spinner />
  if (data.type === 'error') return <Badge color="neutral">Deleted</Badge>
  return <span className="text-secondary">{data.data.name}</span>
}

const EmptyState = () => (
  <EmptyMessage
    icon={<Snapshots24Icon />}
    title="No snapshots"
    body="You need to create a snapshot to be able to see it here"
    buttonText="New snapshot"
    buttonTo={pb.snapshotNew(useProjectSelector())}
  />
)

SnapshotsPage.loader = async ({ params }: LoaderFunctionArgs) => {
  await apiQueryClient.prefetchQuery('snapshotList', {
    query: { ...getProjectSelector(params), limit: 10 },
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
        navigate(pb.snapshotImageCreate({ ...projectSelector, snapshot: snapshot.name }))
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
        <Link to={pb.snapshotNew(projectSelector)} className={buttonStyle({ size: 'sm' })}>
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
