import { useMemo } from 'react'
import type { LoaderFunctionArgs } from 'react-router-dom'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import type { Vpc } from '@oxide/api'
import { apiQueryClient, useApiMutation, useApiQuery, useApiQueryClient } from '@oxide/api'
import type { MenuAction } from '@oxide/table'
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
import EditVpcSideModalForm from 'app/forms/vpc-edit'
import { requireProjectParams, useQuickActions, useRequiredParams } from 'app/hooks'

const EmptyState = () => (
  <EmptyMessage
    icon={<Networking24Icon />}
    title="No VPCs"
    body="You need to create a VPC to be able to see it here"
    buttonText="New VPC"
    buttonTo="../vpc-new"
  />
)

// just as in the vpcList call for the quick actions menu, include limit: 10 to make
// sure it matches the call in the QueryTable
VpcsPage.loader = async ({ params }: LoaderFunctionArgs) => {
  await apiQueryClient.prefetchQuery('vpcList', {
    ...requireProjectParams(params),
    limit: 10,
  })
}

interface VpcsPageProps {
  modal?: 'createVpc' | 'editVpc'
}

export function VpcsPage({ modal }: VpcsPageProps) {
  const queryClient = useApiQueryClient()
  const { orgName, projectName } = useRequiredParams('orgName', 'projectName')
  const location = useLocation()
  const { data: vpcs } = useApiQuery('vpcList', {
    orgName,
    projectName,
    limit: 10, // to have same params as QueryTable
  })
  const navigate = useNavigate()

  const deleteVpc = useApiMutation('vpcDelete', {
    onSuccess() {
      queryClient.invalidateQueries('vpcList', { orgName, projectName })
    },
  })

  const makeActions = (vpc: Vpc): MenuAction[] => [
    {
      label: 'Edit',
      onActivate() {
        navigate(`${vpc.name}/edit`, { state: vpc })
      },
    },
    {
      label: 'Delete',
      onActivate() {
        deleteVpc.mutate({ orgName, projectName, vpcName: vpc.name })
      },
    },
  ]

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

  const backToVpcs = () => navigate(`/orgs/${orgName}/projects/${projectName}/vpcs`)

  const { Table, Column } = useQueryTable('vpcList', { orgName, projectName })
  return (
    <>
      <PageHeader>
        <PageTitle icon={<Networking24Icon />}>VPCs</PageTitle>
      </PageHeader>
      <TableActions>
        <Link to="../vpc-new" className={buttonStyle({ size: 'xs', variant: 'default' })}>
          New Vpc
        </Link>
      </TableActions>
      <Table emptyState={<EmptyState />} makeActions={makeActions}>
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
        onDismiss={backToVpcs}
        onSuccess={backToVpcs}
      />
      <EditVpcSideModalForm
        isOpen={modal === 'editVpc'}
        onDismiss={backToVpcs}
        initialValues={location.state}
      />
    </>
  )
}
