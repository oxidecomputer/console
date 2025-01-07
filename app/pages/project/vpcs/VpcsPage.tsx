/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useQuery } from '@tanstack/react-query'
import { createColumnHelper } from '@tanstack/react-table'
import { useCallback, useMemo } from 'react'
import { Outlet, useNavigate, type LoaderFunctionArgs } from 'react-router'

import { apiq, getListQFn, queryClient, useApiMutation, type Vpc } from '@oxide/api'
import { Networking16Icon, Networking24Icon } from '@oxide/design-system/icons/react'

import { DocsPopover } from '~/components/DocsPopover'
import { HL } from '~/components/HL'
import { getProjectSelector, useProjectSelector } from '~/hooks/use-params'
import { useQuickActions } from '~/hooks/use-quick-actions'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { SkeletonCell } from '~/table/cells/EmptyCell'
import { LinkCell, makeLinkCell } from '~/table/cells/LinkCell'
import { getActionsCol, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { CreateLink } from '~/ui/lib/CreateButton'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { TableActions } from '~/ui/lib/Table'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

const vpcList = (project: string) => getListQFn('vpcList', { query: { project } })

const EmptyState = () => (
  <EmptyMessage
    icon={<Networking24Icon />}
    title="No VPCs"
    body="Create a VPC to see it here"
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

const FirewallRuleCount = ({ project, vpc }: PP.Vpc) => {
  const { data } = useQuery(apiq('vpcFirewallRulesView', { query: { project, vpc } }))

  if (!data) return <SkeletonCell /> // loading

  return <LinkCell to={pb.vpc({ project, vpc })}>{data.rules.length}</LinkCell>
}

const colHelper = createColumnHelper<Vpc>()

// just as in the vpcList call for the quick actions menu, include limit to make
// sure it matches the call in the QueryTable
VpcsPage.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project } = getProjectSelector(params)
  await queryClient.prefetchQuery(vpcList(project).optionsFn())
  return null
}

export function VpcsPage() {
  const { project } = useProjectSelector()
  const navigate = useNavigate()

  const { mutateAsync: deleteVpc } = useApiMutation('vpcDelete', {
    onSuccess(_data, variables) {
      queryClient.invalidateEndpoint('vpcList')
      addToast(<>VPC <HL>{variables.path.vpc}</HL> deleted</>) // prettier-ignore
    },
  })

  const makeActions = useCallback(
    (vpc: Vpc): MenuAction[] => [
      {
        label: 'Edit',
        onActivate() {
          queryClient.setQueryData(
            apiq('vpcView', { path: { vpc: vpc.name }, query: { project } }).queryKey,
            vpc
          )
          navigate(pb.vpcEdit({ project, vpc: vpc.name }), { state: vpc })
        },
      },
      {
        label: 'Delete',
        onActivate: confirmDelete({
          doDelete: () => deleteVpc({ path: { vpc: vpc.name }, query: { project } }),
          label: vpc.name,
        }),
      },
    ],
    [deleteVpc, navigate, project]
  )

  const columns = useMemo(
    () => [
      colHelper.accessor('name', {
        cell: makeLinkCell((vpc) => pb.vpc({ project, vpc })),
      }),
      colHelper.accessor('dnsName', { header: 'DNS name' }),
      colHelper.accessor('description', Columns.description),
      colHelper.accessor('name', {
        // ID needed to avoid key collision with other name column
        id: 'rule-count',
        header: 'Firewall Rules',
        cell: (info) => <FirewallRuleCount project={project} vpc={info.getValue()} />,
      }),
      colHelper.accessor('timeCreated', Columns.timeCreated),
      getActionsCol(makeActions),
    ],
    [project, makeActions]
  )

  const { table, query } = useQueryTable({
    query: vpcList(project),
    columns,
    emptyState: <EmptyState />,
  })

  const { data: vpcs } = query

  useQuickActions(
    useMemo(
      () =>
        (vpcs?.items || []).map((v) => ({
          value: v.name,
          onSelect: () => navigate(pb.vpc({ project, vpc: v.name })),
          navGroup: 'Go to VPC',
        })),
      [project, vpcs, navigate]
    )
  )

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Networking24Icon />}>VPCs</PageTitle>
        <VpcDocsPopover />
      </PageHeader>
      <TableActions>
        <CreateLink to={pb.vpcsNew({ project })}>New Vpc</CreateLink>
      </TableActions>
      {table}
      <Outlet />
    </>
  )
}
