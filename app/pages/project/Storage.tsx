import React from 'react'
import { useParams } from '../../hooks'
import { useQueryTable } from '@oxide/table'

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
      </Table>
    </>
  )
}
