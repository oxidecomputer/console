import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useApiQuery } from '@oxide/api'
import { DateCell, linkCell, useQueryTable } from '@oxide/table'
import {
  EmptyMessage,
  Networking24Icon,
  PageHeader,
  PageTitle,
  TableActions,
  buttonStyle,
} from '@oxide/ui'

import CreateVpcSideModalForm from 'app/forms/vpc-create'
import { useParams, useQuickActions } from 'app/hooks'

const EmptyState = () => (
  <EmptyMessage
    icon={<Networking24Icon />}
    title="No VPCs"
    body="You need to create a VPC to be able to see it here"
    buttonText="New VPC"
    buttonTo="new"
  />
)

interface VpcsPageProps {
  modal?: 'createVpc'
}

export const VpcsPage = ({ modal }: VpcsPageProps) => {
  const projectParams = useParams('orgName', 'projectName')
  const { orgName, projectName } = projectParams
  const { data: vpcs } = useApiQuery('vpcList', {
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

  const { Table, Column } = useQueryTable('vpcList', projectParams)
  return (
    <>
      <PageHeader>
        <PageTitle icon={<Networking24Icon />}>VPCs</PageTitle>
      </PageHeader>
      <TableActions>
        <Link to="new" className={buttonStyle({ size: 'xs', variant: 'default' })}>
          New Vpc
        </Link>
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
        isOpen={modal === 'createVpc'}
        onDismiss={() => navigate('..')}
        onSuccess={() => navigate('..')}
      />
    </>
  )
}
