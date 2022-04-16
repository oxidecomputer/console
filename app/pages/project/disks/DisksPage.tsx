import { Link } from 'react-router-dom'

import { useQueryTable } from '@oxide/table'
import { useApiQuery } from '@oxide/api'

import { useParams } from 'app/hooks'
import { DiskStatusBadge } from 'app/components/StatusBadge'
import { buttonStyle, EmptyMessage, TableActions, Storage24Icon } from '@oxide/ui'

function AttachedInstance(props: {
  orgName: string
  projectName: string
  instanceId: string
}) {
  // HACK: workaround because there's no other way to go from an instance ID to
  // name. Fetch the whole list (default page size is 100 I think) and find the
  // instance client-side. Fortunately, React Query dedupes the request.
  const { data: instances } = useApiQuery('projectInstancesGet', {
    orgName: props.orgName,
    projectName: props.projectName,
  })
  const instance = instances?.items.find((i) => i.id === props.instanceId)
  return instance ? (
    <Link className="text-accent" to={`../instances/${instance.name}`}>
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
    buttonTo="new"
  />
)

export function DisksPage() {
  const { orgName, projectName } = useParams('orgName', 'projectName')
  const { Table, Column } = useQueryTable(
    'projectDisksGet',
    { orgName, projectName },
    { refetchInterval: 5000 }
  )

  return (
    <>
      <TableActions>
        <Link
          to={`/orgs/${orgName}/projects/${projectName}/disks/new`}
          className={buttonStyle({ size: 'xs', variant: 'secondary' })}
        >
          New Disk
        </Link>
      </TableActions>
      <Table emptyState={<EmptyState />}>
        <Column id="name" header="Disk" />
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
            value ? (
              <AttachedInstance
                orgName={orgName}
                projectName={projectName}
                instanceId={value}
              />
            ) : null
          }
        />
        <Column
          id="status"
          accessor="state.state"
          cell={({ value }) => <DiskStatusBadge status={value} />}
        />
      </Table>
    </>
  )
}
