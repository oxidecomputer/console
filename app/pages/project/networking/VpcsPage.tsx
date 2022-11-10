import { useMemo } from 'react'
import type { LoaderFunctionArgs } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
import { Link, useNavigate } from 'react-router-dom'

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

import {
  requireProjectParams,
  useProjectParams,
  useQuickActions,
  useRequiredParams,
} from 'app/hooks'
import { pb } from 'app/util/path-builder'

const EmptyState = () => (
  <EmptyMessage
    icon={<Networking24Icon />}
    title="No VPCs"
    body="You need to create a VPC to be able to see it here"
    buttonText="New VPC"
    buttonTo={pb.vpcNew(useProjectParams())}
  />
)

// just as in the vpcList call for the quick actions menu, include limit: 10 to make
// sure it matches the call in the QueryTable
VpcsPage.loader = async ({ params }: LoaderFunctionArgs) => {
  await apiQueryClient.prefetchQuery('vpcList', {
    path: requireProjectParams(params),
    query: { limit: 10 },
  })
}

export function VpcsPage() {
  const queryClient = useApiQueryClient()
  const { orgName, projectName } = useRequiredParams('orgName', 'projectName')
  const { data: vpcs } = useApiQuery('vpcList', {
    path: { orgName, projectName },
    query: { limit: 10 }, // to have same params as QueryTable
  })
  const navigate = useNavigate()

  const deleteVpc = useApiMutation('vpcDelete', {
    onSuccess() {
      queryClient.invalidateQueries('vpcList', { path: { orgName, projectName } })
    },
  })

  const makeActions = (vpc: Vpc): MenuAction[] => [
    {
      label: 'Edit',
      onActivate() {
        navigate(pb.vpcEdit({ orgName, projectName, vpcName: vpc.name }), { state: vpc })
      },
    },
    {
      label: 'Delete',
      onActivate() {
        deleteVpc.mutate({ path: { orgName, projectName, vpcName: vpc.name } })
      },
    },
  ]

  useQuickActions(
    useMemo(
      () =>
        (vpcs?.items || []).map((v) => ({
          value: v.name,
          onSelect: () => navigate(pb.vpc({ orgName, projectName, vpcName: v.name })),
          navGroup: 'Go to VPC',
        })),
      [orgName, projectName, vpcs, navigate]
    )
  )

  const { Table, Column } = useQueryTable('vpcList', { path: { orgName, projectName } })
  return (
    <>
      <PageHeader>
        <PageTitle icon={<Networking24Icon />}>VPCs</PageTitle>
      </PageHeader>
      <TableActions>
        <Link
          to={pb.vpcNew({ orgName, projectName })}
          className={buttonStyle({ size: 'sm' })}
        >
          New Vpc
        </Link>
      </TableActions>
      <Table emptyState={<EmptyState />} makeActions={makeActions}>
        <Column
          accessor="name"
          cell={linkCell((vpcName) => pb.vpc({ orgName, projectName, vpcName }))}
        />
        <Column accessor="dnsName" header="dns name" />
        <Column accessor="description" />
        <Column accessor="timeCreated" cell={DateCell} />
      </Table>
      <Outlet />
    </>
  )
}
