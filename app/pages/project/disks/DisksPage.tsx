import { Link } from 'react-router-dom'

import { useApiQuery } from '@oxide/api'
import { useQueryTable } from '@oxide/table'
import {
  EmptyMessage,
  PageHeader,
  PageTitle,
  Storage24Icon,
  TableActions,
  buttonStyle,
} from '@oxide/ui'

import { DiskStatusBadge } from 'app/components/StatusBadge'
import { useParams } from 'app/hooks'

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
    <Link className="text-accent" to={`../../instances/${instance.name}`}>
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
      <PageHeader>
        <PageTitle icon={<Storage24Icon />}>Disks</PageTitle>
      </PageHeader>
      <TableActions>
        <Link
          to={`/orgs/${orgName}/projects/${projectName}/disks/new`}
          className={buttonStyle({ size: 'xs', variant: 'secondary' })}
        >
          New Disk
        </Link>
      </TableActions>
      <Table emptyState={<EmptyState />}>
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
          accessor={(row) => row.state.state}
          cell={({ value }) => <DiskStatusBadge status={value} />}
        />
      </Table>
    </>
  )
}
