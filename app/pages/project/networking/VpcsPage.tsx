import { useMemo } from 'react'
import type { LoaderFunctionArgs } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
import { Link, useNavigate } from 'react-router-dom'

import type { Vpc } from '@oxide/api'
import { apiQueryClient, useApiMutation, useApiQuery, useApiQueryClient } from '@oxide/api'
import { DateCell, type MenuAction, linkCell, useQueryTable } from '@oxide/table'
import {
  EmptyMessage,
  Networking24Icon,
  PageHeader,
  PageTitle,
  TableActions,
  buttonStyle,
} from '@oxide/ui'

import { getProjectSelector, useProjectSelector, useQuickActions } from 'app/hooks'
import { confirmDelete } from 'app/stores/confirm-delete'
import { pb } from 'app/util/path-builder'

const EmptyState = () => (
  <EmptyMessage
    icon={<Networking24Icon />}
    title="No VPCs"
    body="You need to create a VPC to be able to see it here"
    buttonText="New VPC"
    buttonTo={pb.vpcNew(useProjectSelector())}
  />
)

// just as in the vpcList call for the quick actions menu, include limit: 10 to make
// sure it matches the call in the QueryTable
VpcsPage.loader = async ({ params }: LoaderFunctionArgs) => {
  await apiQueryClient.prefetchQuery('vpcList', {
    query: { ...getProjectSelector(params), limit: 10 },
  })
  return null
}

export function VpcsPage() {
  const queryClient = useApiQueryClient()
  const projectSelector = useProjectSelector()
  const { data: vpcs } = useApiQuery('vpcList', {
    query: { ...projectSelector, limit: 10 }, // to have same params as QueryTable
  })
  const navigate = useNavigate()

  const deleteVpc = useApiMutation('vpcDelete', {
    onSuccess() {
      queryClient.invalidateQueries('vpcList', { query: projectSelector })
    },
  })

  const makeActions = (vpc: Vpc): MenuAction[] => [
    {
      label: 'Edit',
      onActivate() {
        navigate(pb.vpcEdit({ ...projectSelector, vpc: vpc.name }), { state: vpc })
      },
    },
    {
      label: 'Delete',
      onActivate: confirmDelete({
        doDelete: () =>
          deleteVpc.mutateAsync({ path: { vpc: vpc.name }, query: projectSelector }),
        label: vpc.name,
      }),
    },
  ]

  useQuickActions(
    useMemo(
      () =>
        (vpcs?.items || []).map((v) => ({
          value: v.name,
          onSelect: () => navigate(pb.vpc({ ...projectSelector, vpc: v.name })),
          navGroup: 'Go to VPC',
        })),
      [projectSelector, vpcs, navigate]
    )
  )

  const { Table, Column } = useQueryTable('vpcList', { query: projectSelector })
  return (
    <>
      <PageHeader>
        <PageTitle icon={<Networking24Icon />}>VPCs</PageTitle>
      </PageHeader>
      <TableActions>
        <Link to={pb.vpcNew(projectSelector)} className={buttonStyle({ size: 'sm' })}>
          New Vpc
        </Link>
      </TableActions>
      <Table emptyState={<EmptyState />} makeActions={makeActions}>
        <Column
          accessor="name"
          cell={linkCell((vpc) => pb.vpc({ ...projectSelector, vpc }))}
        />
        <Column accessor="dnsName" header="DNS name" />
        <Column accessor="description" />
        <Column accessor="timeCreated" header="Created" cell={DateCell} />
      </Table>
      <Outlet />
    </>
  )
}
