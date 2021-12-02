import React from 'react'
import { Folder24Icon, PageHeader, PageTitle } from '@oxide/ui'
import { useParams } from '../../hooks'
import { DateCell, useQueryTable } from '@oxide/table'

export const VpcsPage = () => {
  const { orgName: organizationName, ...other } = useParams(
    'orgName',
    'projectName'
  )
  const { Table, Column } = useQueryTable('projectVpcsGet', {
    organizationName,
    ...other,
  })
  return (
    <>
      <PageHeader>
        <PageTitle icon={<Folder24Icon title="Vpcs" />}>Vpcs</PageTitle>
      </PageHeader>
      <Table selectable debug>
        <Column id="name" />
        <Column id="dnsName" header="dns name" />
        <Column id="description" />
        <Column id="created" accessor="timeCreated" cell={DateCell} />
      </Table>
    </>
  )
}

export default VpcsPage
