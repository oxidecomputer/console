/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'
import { useCallback, useMemo } from 'react'
import { Outlet, useNavigate, type LoaderFunctionArgs } from 'react-router-dom'

import {
  apiQueryClient,
  useApiMutation,
  useApiQueryClient,
  usePrefetchedApiQuery,
  type Vpc,
} from '@oxide/api'
import { Networking16Icon, Networking24Icon } from '@oxide/design-system/icons/react'

import { DocsPopover } from '~/components/DocsPopover'
import { getProjectSelector, useProjectSelector, useQuickActions } from '~/hooks'
import { confirmDelete } from '~/stores/confirm-delete'
import { makeLinkCell } from '~/table/cells/LinkCell'
import { getActionsCol, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { PAGE_SIZE, useQueryTable } from '~/table/QueryTable'
import { CreateLink } from '~/ui/lib/CreateButton'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { TableActions } from '~/ui/lib/Table'
import { docLinks } from '~/util/links'
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

export const VpcDocsPopover = () => (
  <DocsPopover
    heading="VPCs"
    icon={<Networking16Icon />}
    summary="VPCs are private networks that isolate sets of instances from each other. Instances within a VPC can talk to each other using private IP addresses (if firewall rules allow it) but traffic between VPCs must go through external IPs."
    links={[docLinks.vpcs, docLinks.firewallRules]}
  />
)

const colHelper = createColumnHelper<Vpc>()

// just as in the vpcList call for the quick actions menu, include limit to make
// sure it matches the call in the QueryTable
VpcsPage.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project } = getProjectSelector(params)
  await apiQueryClient.prefetchQuery('vpcList', { query: { project, limit: PAGE_SIZE } })
  return null
}

export function VpcsPage() {
  const queryClient = useApiQueryClient()
  const { project } = useProjectSelector()
  // to have same params as QueryTable
  const { data: vpcs } = usePrefetchedApiQuery('vpcList', {
    query: { project, limit: PAGE_SIZE },
  })
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
      colHelper.accessor('description', Columns.description),
      colHelper.accessor('timeCreated', Columns.timeCreated),
      getActionsCol(makeActions),
    ],
    [project, makeActions]
  )

  const { Table } = useQueryTable('vpcList', { query: { project } })
  return (
    <>
      <PageHeader>
        <PageTitle icon={<Networking24Icon />}>VPCs</PageTitle>
        <VpcDocsPopover />
      </PageHeader>
      <TableActions>
        <CreateLink to={pb.vpcsNew({ project })}>New Vpc</CreateLink>
      </TableActions>
      <Table columns={columns} emptyState={<EmptyState />} />
      <Outlet />
    </>
  )
}
