import React from 'react'
import { Networking24Icon, PageHeader, PageTitle } from '@oxide/ui'
import { useParams } from 'app/hooks'
import { DateCell, linkCell, useQueryTable } from '@oxide/table'

export const VpcsPage = () => {
  const { orgName, projectName } = useParams('orgName', 'projectName')
  const { Table, Column } = useQueryTable('projectVpcsGet', {
    orgName,
    projectName,
  })
  return (
    <>
      <PageHeader>
        <PageTitle icon={<Networking24Icon title="Vpcs" />}>VPCs</PageTitle>
      </PageHeader>

      <Table>
        <Column
          id="name"
          cell={linkCell(
            (name) => `/orgs/${orgName}/projects/${projectName}/vpcs/${name}`
          )}
        />
        <Column id="dnsName" header="dns name" />
        <Column id="description" />
        <Column id="created" accessor="timeCreated" cell={DateCell} />
      </Table>
    </>
  )
}
