/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'
import { useCallback, useMemo } from 'react'
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
import { makeLinkCell } from '~/table/cells/LinkCell'
import { getActionsCol, type MenuAction } from '~/table/columns/action-col'
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

const colHelper = createColumnHelper<Vpc>()

// just as in the vpcList call for the quick actions menu, include limit: 25 to make
// sure it matches the call in the QueryTable
VpcsPage.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project } = getProjectSelector(params)
  await apiQueryClient.prefetchQuery('vpcList', { query: { project, limit: 25 } })
  return null
}

export function VpcsPage() {
  const queryClient = useApiQueryClient()
  const { project } = useProjectSelector()
  // to have same params as QueryTable
  const { data: vpcs } = usePrefetchedApiQuery('vpcList', { query: { project, limit: 25 } })
  const navigate = useNavigate()

  const deleteVpc = useApiMutation('vpcDelete', {
    onSuccess() {
      queryClient.invalidateQueries('vpcList')
    },
  })

  const makeActions = useCallback(
    (vpc: Vpc): MenuAction[] => [
      {
        label: 'Edit',
        onActivate() {
          apiQueryClient.setQueryData(
            'vpcView',
            { path: { vpc: vpc.name }, query: { project } },
            vpc
          )
          navigate(pb.vpcEdit({ project, vpc: vpc.name }), { state: vpc })
        },
      },
      {
        label: 'Delete',
        onActivate: confirmDelete({
          doDelete: () =>
            deleteVpc.mutateAsync({ path: { vpc: vpc.name }, query: { project } }),
          label: vpc.name,
        }),
      },
    ],
    [deleteVpc, navigate, project]
  )

  useQuickActions(
    useMemo(
      () =>
        vpcs.items.map((v) => ({
          value: v.name,
          onSelect: () => navigate(pb.vpc({ project, vpc: v.name })),
          navGroup: 'Go to VPC',
        })),
      [project, vpcs, navigate]
    )
  )

  const columns = useMemo(
    () => [
      colHelper.accessor('name', {
        cell: makeLinkCell((vpc) => pb.vpc({ project, vpc })),
      }),
      colHelper.accessor('dnsName', { header: 'DNS name' }),
      colHelper.accessor('description', {}),
      colHelper.accessor('timeCreated', {
        header: 'created',
        cell: (info) => <DateCell value={info.getValue()} />,
      }),
      getActionsCol(makeActions),
    ],
    [project, makeActions]
  )

  const { Table } = useQueryTable('vpcList', { query: { project } })
  return (
    <>
      <PageHeader>
        <PageTitle icon={<Networking24Icon />}>VPCs</PageTitle>
      </PageHeader>
      <TableActions>
        <Link to={pb.vpcsNew({ project })} className={buttonStyle({ size: 'sm' })}>
          New Vpc
        </Link>
      </TableActions>
      <Table columns={columns} emptyState={<EmptyState />} />
      <Outlet />
    </>
  )
}
