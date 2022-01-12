import React from 'react'
import {
  Delete10Icon,
  Networking24Icon,
  PageHeader,
  PageTitle,
} from '@oxide/ui'
import { useParams } from 'app/hooks'
import { DateCell, linkCell, useQueryTable } from '@oxide/table'
import { useApiMutation, useApiQueryClient } from '@oxide/api'

export const VpcsPage = () => {
  const { orgName, projectName } = useParams('orgName', 'projectName')
  const { Table, Column } = useQueryTable('projectVpcsGet', {
    orgName,
    projectName,
  })
  const queryClient = useApiQueryClient()
  const refetch = () =>
    queryClient.invalidateQueries('projectVpcsGet', { orgName, projectName })
  const deleteVpc = useApiMutation('projectVpcsDeleteVpc', {
    onSuccess() {
      refetch()
    },
  })
  return (
    <>
      <PageHeader>
        <PageTitle icon={<Networking24Icon title="Vpcs" />}>VPCs</PageTitle>
      </PageHeader>

      <Table
        bulkActions={[
          {
            label: 'delete',
            icon: <Delete10Icon />,
            onActivate(vpcs) {
              for (const vpc of vpcs) {
                deleteVpc.mutate({
                  orgName,
                  projectName,
                  vpcName: vpc.name,
                })
              }
            },
          },
        ]}
      >
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
