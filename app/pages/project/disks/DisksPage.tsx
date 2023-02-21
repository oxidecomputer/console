import type { LoaderFunctionArgs } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
import { Link } from 'react-router-dom'

import type { Disk } from '@oxide/api'
import {
  apiQueryClient,
  genName,
  useApiMutation,
  useApiQuery,
  useApiQueryClient,
} from '@oxide/api'
import { DateCell, type MenuAction, SizeCell, useQueryTable } from '@oxide/table'
import {
  EmptyMessage,
  PageHeader,
  PageTitle,
  Storage24Icon,
  Success16Icon,
  TableActions,
  buttonStyle,
} from '@oxide/ui'

import { DiskStatusBadge } from 'app/components/StatusBadge'
import { getProjectSelector, useProjectSelector, useToast } from 'app/hooks'
import { pb2 } from 'app/util/path-builder'

function AttachedInstance({
  instanceId,
  ...projectSelector
}: {
  organization: string
  project: string
  instanceId: string
}) {
  const { data: instance } = useApiQuery('instanceViewV1', {
    path: { instance: instanceId },
  })
  return instance ? (
    <Link
      className="text-sans-semi-md text-accent hover:underline"
      to={pb2.instancePage({ ...projectSelector, instance: instance.name })}
    >
      {instance.name}
    </Link>
  ) : null
}

const EmptyState = () => (
  <EmptyMessage
    icon={<Storage24Icon />}
    title="No disks"
    body="You need to create a disk to be able to see it here"
    buttonText="New disk"
    buttonTo={pb2.diskNew(useProjectSelector())}
  />
)

DisksPage.loader = async ({ params }: LoaderFunctionArgs) => {
  await apiQueryClient.prefetchQuery('diskListV1', {
    query: { ...getProjectSelector(params), limit: 10 },
  })
  return null
}

export function DisksPage() {
  const queryClient = useApiQueryClient()
  const projectSelector = useProjectSelector()
  const { Table, Column } = useQueryTable('diskListV1', { query: projectSelector })
  const addToast = useToast()

  const deleteDisk = useApiMutation('diskDeleteV1', {
    onSuccess() {
      queryClient.invalidateQueries('diskListV1', { query: projectSelector })
    },
  })

  const createSnapshot = useApiMutation('snapshotCreateV1', {
    onSuccess() {
      queryClient.invalidateQueries('snapshotListV1', { query: projectSelector })
      addToast({
        icon: <Success16Icon />,
        title: 'Success!',
        content: 'Snapshot successfully created',
      })
    },
  })

  const makeActions = (disk: Disk): MenuAction[] => [
    {
      label: 'Snapshot',
      onActivate() {
        createSnapshot.mutate({
          query: projectSelector,
          body: {
            name: genName(disk.name),
            disk: disk.name,
            description: '',
          },
        })
      },
      disabled:
        disk.state.state !== 'attached' &&
        'Only disks attached to an instance can be snapshotted',
    },
    {
      label: 'Delete',
      onActivate: () => {
        deleteDisk.mutate({ path: { disk: disk.name }, query: projectSelector })
      },
      disabled:
        !['detached', 'creating', 'faulted'].includes(disk.state.state) &&
        (disk.state.state === 'attached'
          ? 'Disk must be detached before it can be deleted'
          : `A ${disk.state.state} disk cannon be deleted`),
    },
  ]

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Storage24Icon />}>Disks</PageTitle>
      </PageHeader>
      <TableActions>
        <Link to={pb2.diskNew(projectSelector)} className={buttonStyle({ size: 'sm' })}>
          New Disk
        </Link>
      </TableActions>
      <Table emptyState={<EmptyState />} makeActions={makeActions}>
        <Column accessor="name" header="Disk" />
        {/* TODO: show info about the instance it's attached to */}
        <Column
          id="attached-to"
          header="Attached To"
          accessor={(disk) =>
            // sneaky: rather than looking at particular states, just look at
            // whether it has an instance field
            'instance' in disk.state ? disk.state.instance : null
          }
          cell={({ value }: { value: string | undefined }) =>
            value ? <AttachedInstance {...projectSelector} instanceId={value} /> : null
          }
        />
        <Column header="Size" accessor="size" cell={SizeCell} />
        <Column
          id="status"
          accessor={(row) => row.state.state}
          cell={({ value }) => <DiskStatusBadge status={value} />}
        />
        <Column header="Created" accessor="timeCreated" cell={DateCell} />
      </Table>
      <Outlet />
    </>
  )
}
