/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useCallback } from 'react'
import { Outlet, type LoaderFunctionArgs } from 'react-router'

import {
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
  type AffinityPolicy,
  type AntiAffinityGroup,
} from '@oxide/api'
import { Affinity24Icon } from '@oxide/design-system/icons/react'

import { AffinityDocsPopover } from '~/components/AffinityDocsPopover'
import { HL } from '~/components/HL'
import { antiAffinityGroupList, antiAffinityGroupMemberList } from '~/forms/affinity-util'
import { getProjectSelector, useProjectSelector } from '~/hooks/use-params'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { DescriptionCell } from '~/table/cells/DescriptionCell'
import { EmptyCell, SkeletonCell } from '~/table/cells/EmptyCell'
import { makeLinkCell } from '~/table/cells/LinkCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { Table } from '~/table/Table'
import { Badge } from '~/ui/lib/Badge'
import { CreateLink } from '~/ui/lib/CreateButton'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { TableActions, TableEmptyBox } from '~/ui/lib/Table'
import { pb } from '~/util/path-builder'

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { project } = getProjectSelector(params)
  const groups = await queryClient.fetchQuery(antiAffinityGroupList({ project }))
  const memberFetches = groups.items.map(({ name }) =>
    queryClient.prefetchQuery(
      antiAffinityGroupMemberList({ antiAffinityGroup: name, project })
    )
  )
  // The browser will fetch up to 6 anti-affinity group member lists without queuing,
  // so we can prefetch them without slowing down the page. If there are more than 6 groups,
  // we won't bother to wait for the promises to fulfill, and will just load the actual page content.
  if (groups.items.length < 6) await Promise.all(memberFetches)
  return null
}

const colHelper = createColumnHelper<AntiAffinityGroup>()

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
  colHelper.accessor(() => {}, {
    header: 'type',
    cell: () => <Badge>anti-affinity</Badge>,
  }),
  colHelper.accessor('description', {
    cell: (info) => <DescriptionCell text={info.getValue()} maxLength={32} />,
  }),
  colHelper.accessor('name', {
    header: 'instances',
    cell: (info) => <AffinityGroupMembersCell antiAffinityGroup={info.getValue()} />,
  }),
  colHelper.accessor('policy', {
    cell: (info) => <AffinityGroupPolicyBadge policy={info.getValue()} />,
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
        label: 'Edit',
        to: pb.antiAffinityGroupEdit({
          project,
          antiAffinityGroup: antiAffinityGroup.name,
        }),
      },
      {
        label: 'Delete',
        onActivate: confirmDelete({
          doDelete: () =>
            deleteGroup({
              path: { antiAffinityGroup: antiAffinityGroup.name },
              query: { project },
            }),
          label: antiAffinityGroup.name,
          resourceKind: 'anti-affinity group',
        }),
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
      <PageHeader>
        <PageTitle icon={<Affinity24Icon />}>Affinity</PageTitle>
        <AffinityDocsPopover />
      </PageHeader>
      <TableActions>
        <CreateLink to={pb.affinityNew({ project })}>New group</CreateLink>
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

export const AffinityGroupMembersCell = ({
  antiAffinityGroup,
}: {
  antiAffinityGroup: string
}) => {
  const { project } = useProjectSelector()
  const { data: members } = usePrefetchedQuery(
    antiAffinityGroupMemberList({ antiAffinityGroup, project })
  )
  if (!members) return <SkeletonCell />
  if (!members.items.length) return <EmptyCell />
  return <>{members.items.length}</>
}
