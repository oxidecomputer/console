import React from 'react'
import { Networking24Icon, PageHeader, PageTitle } from '@oxide/ui'
import { useParams } from '../../../hooks'
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
        <PageTitle icon={<Networking24Icon title="Vpcs" />}>VPCs</PageTitle>
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
