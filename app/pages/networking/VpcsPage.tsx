import React from 'react'
import { Folder24Icon, PageHeader, PageTitle } from '@oxide/ui'
import { useParams } from '../../hooks'
import { DateCell, linkCell, useQueryTable } from '@oxide/table'

export const VpcsPage = () => {
  const { orgName: organizationName, projectName } = useParams(
    'orgName',
    'projectName'
  )
  const { Table, Column } = useQueryTable('projectVpcsGet', {
    organizationName,
    projectName,
  })
  return (
    <>
      <PageHeader>
        <PageTitle icon={<Folder24Icon title="Vpcs" />}>Vpcs</PageTitle>
      </PageHeader>
      <Table selectable>
        <Column
          id="name"
          cell={linkCell(
            (name) =>
              `/orgs/${organizationName}/projects/${projectName}/vpcs/${name}`
          )}
        />
        <Column id="dnsName" header="dns name" />
        <Column id="description" />
        <Column id="created" accessor="timeCreated" cell={DateCell} />
      </Table>
    </>
  )
}

export default VpcsPage
