import React from 'react'
import { Link } from 'react-router-dom'

import { useQueryTable } from '@oxide/table'
import { useApiQuery } from '@oxide/api'

import { useParams } from '../../hooks'
import { DiskStatusBadge } from '../../components/StatusBadge'

function AttachedInstance(props: {
  orgName: string
  projectName: string
  instanceId: string
}) {
  // HACK: workaround because there's no other way to go from an instance ID to
  // name. Fetch the whole list (default page size is 100 I think) and find the
  // instance client-side. Fortunately, React Query dedupes the request.
  const { data: instances } = useApiQuery('projectInstancesGet', {
    organizationName: props.orgName,
    projectName: props.projectName,
  })
  const instance = instances?.items.find((i) => i.id === props.instanceId)
  return instance ? (
    <Link to={`../instances/${instance.name}`}>{instance.name}</Link>
  ) : null
}

export default function ProjectStorage() {
  const { orgName, projectName } = useParams('orgName', 'projectName')
  const { Table, Column } = useQueryTable(
    'projectDisksGet',
    { organizationName: orgName, projectName },
    { refetchInterval: 5000 }
  )

  return (
    <>
      <h1 className="text-display-2xl my-8">Disks</h1>
      <Table selectable>
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
