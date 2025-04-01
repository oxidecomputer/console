/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useQuery } from '@tanstack/react-query'
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useCallback } from 'react'
import { Link, Outlet, type LoaderFunctionArgs } from 'react-router'

import {
  apiq,
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
  type AffinityPolicy,
  type AntiAffinityGroup,
} from '@oxide/api'
import { Affinity24Icon } from '@oxide/design-system/icons/react'

import { HL } from '~/components/HL'
import { getProjectSelector, useProjectSelector } from '~/hooks/use-params'
import { confirmAction } from '~/stores/confirm-action'
import { addToast } from '~/stores/toast'
import { EmptyCell, SkeletonCell } from '~/table/cells/EmptyCell'
import { makeLinkCell } from '~/table/cells/LinkCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { Table } from '~/table/Table'
import { Badge } from '~/ui/lib/Badge'
import { CreateLink } from '~/ui/lib/CreateButton'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { Slash } from '~/ui/lib/Slash'
import { TableActions, TableEmptyBox } from '~/ui/lib/Table'
import { intersperse } from '~/util/array'
import { ALL_ISH } from '~/util/consts'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

const antiAffinityGroupList = ({ project }: PP.Project) =>
  apiq('antiAffinityGroupList', { query: { project, limit: ALL_ISH } })
const memberList = ({ antiAffinityGroup, project }: PP.AntiAffinityGroup) =>
  apiq('antiAffinityGroupMemberList', {
    path: { antiAffinityGroup },
    // We only need to get the first 2 members for preview
    query: { project, limit: 2 },
  })

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { project } = getProjectSelector(params)
  const groups = await queryClient.fetchQuery(antiAffinityGroupList({ project }))
  const memberFetches = groups.items.map(({ name }) =>
    queryClient.prefetchQuery(memberList({ antiAffinityGroup: name, project }))
  )
  // The browser will fetch up to 6 anti-affinity group member lists without queuing,
  // so we can prefetch them without slowing down the page. If there are more than 6 groups,
  // we won't bother to wait for the promises to fulfill, and will just load the actual page content.
  if (groups.items.length < 6) await Promise.all(memberFetches)
  return null
}

const colHelper = createColumnHelper<AntiAffinityGroup>()

export const AffinityPageHeader = ({ name = 'Affinity' }: { name?: string }) => (
  <PageHeader>
    <PageTitle icon={<Affinity24Icon />}>{name}</PageTitle>
    {/* TODO: Add a DocsPopover with docLinks.affinity once the doc page exists */}
  </PageHeader>
)

type AffinityGroupPolicyBadgeProps = { policy: AffinityPolicy; className?: string }
const AffinityGroupPolicyBadge = ({ policy, className }: AffinityGroupPolicyBadgeProps) => (
  <Badge
    color="neutral"
    variant={{ allow: 'default' as const, fail: 'solid' as const }[policy]}
    className={className}
  >
    {policy}
  </Badge>
)

const staticCols = [
  colHelper.accessor('description', Columns.description),
  colHelper.accessor(() => {}, {
    header: 'type',
    cell: () => <Badge>anti-affinity</Badge>,
  }),
  colHelper.accessor('policy', {
    cell: (info) => <AffinityGroupPolicyBadge policy={info.getValue()} />,
  }),
  colHelper.accessor('name', {
    header: 'members',
    cell: (info) => <AffinityGroupMembersCell antiAffinityGroup={info.getValue()} />,
  }),
  colHelper.accessor('timeCreated', Columns.timeCreated),
]

export default function AffinityPage() {
  const { project } = useProjectSelector()
  const {
    data: { items: antiAffinityGroups },
  } = usePrefetchedQuery(antiAffinityGroupList({ project }))

  const { mutateAsync: deleteGroup } = useApiMutation('antiAffinityGroupDelete', {
    onSuccess(_data, variables) {
      queryClient.invalidateEndpoint('antiAffinityGroupList')
      addToast(
        <>
          Anti-affinity group <HL>{variables.path.antiAffinityGroup}</HL> deleted
        </>
      )
    },
  })

  const makeActions = useCallback(
    (antiAffinityGroup: AntiAffinityGroup): MenuAction[] => [
      {
        label: 'Delete',
        onActivate() {
          confirmAction({
            actionType: 'danger',
            doAction: () =>
              deleteGroup({
                path: { antiAffinityGroup: antiAffinityGroup.name },
                query: { project },
              }),
            modalTitle: 'Delete anti-affinity group',
            modalContent: (
              <p>
                Are you sure you want to delete the anti-affinity group{' '}
                <HL>{antiAffinityGroup.name}</HL>?
              </p>
            ),
            errorTitle: `Error removing ${antiAffinityGroup.name}`,
          })
        },
      },
    ],
    [project, deleteGroup]
  )

  const columns = useColsWithActions(
    [
      colHelper.accessor('name', {
        cell: makeLinkCell((antiAffinityGroup) =>
          pb.antiAffinityGroup({ project, antiAffinityGroup })
        ),
        id: 'members',
      }),
      ...staticCols,
    ],
    makeActions
  )

  const table = useReactTable({
    columns,
    data: antiAffinityGroups,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
      <AffinityPageHeader />
      <TableActions>
        <CreateLink to={pb.affinityNew({ project })}>New anti-affinity group</CreateLink>
      </TableActions>
      {antiAffinityGroups.length ? (
        <Table table={table} />
      ) : (
        <AntiAffinityGroupEmptyState />
      )}
      <Outlet />
    </>
  )
}

export const AntiAffinityGroupEmptyState = () => (
  <TableEmptyBox>
    <EmptyMessage
      icon={<Affinity24Icon />}
      title="No anti-affinity groups"
      body="Create an anti-affinity group to see it here"
    />
  </TableEmptyBox>
)

// TODO: Use the prefetched query
export const AffinityGroupMembersCell = ({
  antiAffinityGroup,
}: {
  antiAffinityGroup: string
}) => {
  const { project } = useProjectSelector()
  const { data: members } = useQuery(memberList({ antiAffinityGroup, project }))

  if (!members) return <SkeletonCell />
  if (!members.items.length) return <EmptyCell />

  const instances = members.items.map((member) => member.value.name)
  const instancesToShow = instances.slice(0, 2)
  const links = instancesToShow.map((instance) => (
    <Link
      key={instance}
      to={pb.instance({ project, instance })}
      className="link-with-underline"
    >
      {instance}
    </Link>
  ))
  if (instances.length > instancesToShow.length) {
    links.push(<>…</>)
  }
  return <div className="flex max-w-full items-center">{intersperse(links, <Slash />)}</div>
}
