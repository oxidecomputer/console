import type { LoaderFunctionArgs } from 'react-router-dom'
import { Link, Outlet } from 'react-router-dom'

import type { Snapshot } from '@oxide/api'
import { toApiSelector } from '@oxide/api'
import { apiQueryClient, useApiMutation, useApiQuery, useApiQueryClient } from '@oxide/api'
import type { MenuAction } from '@oxide/table'
import { DateCell, SizeCell, useQueryTable } from '@oxide/table'
import {
  EmptyMessage,
  PageHeader,
  PageTitle,
  Snapshots24Icon,
  TableActions,
  buttonStyle,
} from '@oxide/ui'

import { SnapshotStatusBadge } from 'app/components/StatusBadge'
import { requireProjectParams, useProjectParams, useRequiredParams } from 'app/hooks'
import { pb } from 'app/util/path-builder'

const DiskNameFromId = ({ value }: { value: string }) => {
  const { data: disk } = useApiQuery('diskViewV1', { path: { disk: value } })
  if (!disk) return null
  return <>{disk.name}</>
}

const EmptyState = () => (
  <EmptyMessage
    icon={<Snapshots24Icon />}
    title="No snapshots"
    body="You need to create a snapshot to be able to see it here"
    buttonText="New snapshot"
    buttonTo={pb.snapshotNew(useProjectParams())}
  />
)

SnapshotsPage.loader = async ({ params }: LoaderFunctionArgs) => {
  const projectSelector = toApiSelector(requireProjectParams(params))
  await apiQueryClient.prefetchQuery('snapshotListV1', {
    query: { ...projectSelector, limit: 10 },
  })
  return null
}

export function SnapshotsPage() {
  const queryClient = useApiQueryClient()
  const projectParams = useRequiredParams('orgName', 'projectName')
  const projectSelector = toApiSelector(projectParams)
  const { Table, Column } = useQueryTable('snapshotListV1', { query: projectSelector })

  const deleteSnapshot = useApiMutation('snapshotDeleteV1', {
    onSuccess() {
      queryClient.invalidateQueries('snapshotListV1', { query: projectSelector })
    },
  })

  const makeActions = (snapshot: Snapshot): MenuAction[] => [
    {
      label: 'Delete',
      onActivate() {
        deleteSnapshot.mutate({ path: { snapshot: snapshot.name }, query: projectSelector })
      },
    },
  ]

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Snapshots24Icon />}>Snapshots</PageTitle>
      </PageHeader>
      <TableActions>
        <Link to={pb.snapshotNew(projectParams)} className={buttonStyle({ size: 'sm' })}>
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
