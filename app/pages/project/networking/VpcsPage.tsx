import { useMemo, useState } from 'react'
import { useParams, useQuickActions } from 'app/hooks'
import { DateCell, linkCell, useQueryTable } from '@oxide/table'
import { useApiQuery } from '@oxide/api'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  EmptyMessage,
  Networking24Icon,
  PageHeader,
  PageTitle,
  TableActions,
} from '@oxide/ui'
import CreateVpcSideModalForm from 'app/forms/vpc-create'

const EmptyState = () => (
  <EmptyMessage
    icon={<Networking24Icon />}
    title="No VPCs"
    body="You need to create a VPC to be able to see it here"
    buttonText="New VPC"
    buttonTo="new"
  />
)

export const VpcsPage = () => {
  const [showVpcCreate, setShowVpcCreate] = useState(false)
  const projectParams = useParams('orgName', 'projectName')
  const { orgName, projectName } = projectParams
  const { data: vpcs } = useApiQuery('projectVpcsGet', {
    ...projectParams,
    limit: 10, // to have same params as QueryTable
  })
  const navigate = useNavigate()
  useQuickActions(
    useMemo(
      () =>
        (vpcs?.items || []).map((p) => ({
          value: p.name,
          onSelect: () => navigate(p.name),
          navGroup: 'Go to VPC',
        })),
      [vpcs, navigate]
    )
  )

  const { Table, Column } = useQueryTable('projectVpcsGet', projectParams)
  return (
    <>
      <PageHeader>
        <PageTitle icon={<Networking24Icon />}>VPCs</PageTitle>
      </PageHeader>
      <TableActions>
        <Button variant="secondary" size="xs" onClick={() => setShowVpcCreate(true)}>
          New Vpc
        </Button>
      </TableActions>
      <Table emptyState={<EmptyState />}>
        <Column
          accessor="name"
          cell={linkCell((name) => `/orgs/${orgName}/projects/${projectName}/vpcs/${name}`)}
        />
        <Column accessor="dnsName" header="dns name" />
        <Column accessor="description" />
        <Column accessor="timeCreated" cell={DateCell} />
      </Table>
      <CreateVpcSideModalForm
        isOpen={showVpcCreate}
        onDismiss={() => setShowVpcCreate(false)}
      />
    </>
  )
}
