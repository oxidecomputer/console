import React from 'react'
import { useParams } from '../../hooks'
import { useQueryTable } from '@oxide/table'
import { Checkmark12Icon } from '@oxide/ui'

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
        <Column id="name" />
        <Column id="description" />
        {/* TODO: show info about the instance it's attached to */}
        <Column
          id="attached"
          accessor={(vpc) => vpc.state.state === 'attached'}
          cell={({ value }: { value: boolean }) =>
            value ? <Checkmark12Icon className="text-green-500" /> : null
          }
        />
      </Table>
    </>
  )
}
