/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useMemo } from 'react'
import { Link, Outlet, useNavigate, type LoaderFunctionArgs } from 'react-router-dom'

import {
  apiQueryClient,
  useApiMutation,
  useApiQueryClient,
  usePrefetchedApiQuery,
  type Vpc,
} from '@oxide/api'
import { Networking24Icon } from '@oxide/design-system/icons/react'

import { getProjectSelector, useProjectSelector, useQuickActions } from '~/hooks'
import { confirmDelete } from '~/stores/confirm-delete'
import { DateCell } from '~/table/cells/DateCell'
import { linkCell } from '~/table/cells/LinkCell'
import type { MenuAction } from '~/table/columns/action-col'
import { useQueryTable } from '~/table/QueryTable'
import { buttonStyle } from '~/ui/lib/Button'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { TableActions } from '~/ui/lib/Table'
import { pb } from '~/util/path-builder'

const EmptyState = () => (
  <EmptyMessage
    icon={<Networking24Icon />}
    title="No VPCs"
    body="You need to create a VPC to be able to see it here"
    buttonText="New VPC"
    buttonTo={pb.vpcsNew(useProjectSelector())}
  />
)

// just as in the vpcList call for the quick actions menu, include limit: 25 to make
// sure it matches the call in the QueryTable
VpcsPage.loader = async ({ params }: LoaderFunctionArgs) => {
  await apiQueryClient.prefetchQuery('vpcList', {
    query: { ...getProjectSelector(params), limit: 25 },
  })
  return null
}

export function VpcsPage() {
  const queryClient = useApiQueryClient()
  const projectSelector = useProjectSelector()
  const { data: vpcs } = usePrefetchedApiQuery('vpcList', {
    query: { ...projectSelector, limit: 25 }, // to have same params as QueryTable
  })
  const navigate = useNavigate()

  const deleteVpc = useApiMutation('vpcDelete', {
    onSuccess() {
      queryClient.invalidateQueries('vpcList')
    },
  })

  const makeActions = (vpc: Vpc): MenuAction[] => [
    {
      label: 'Edit',
      onActivate() {
        apiQueryClient.setQueryData(
          'vpcView',
          { path: { vpc: vpc.name }, query: projectSelector },
          vpc
        )
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
        vpcs.items.map((v) => ({
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
        <Link to={pb.vpcsNew(projectSelector)} className={buttonStyle({ size: 'sm' })}>
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
