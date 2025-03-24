/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Link, type LoaderFunctionArgs } from 'react-router'

import {
  apiq,
  getListQFn,
  queryClient,
  useApiQuery,
  usePrefetchedQuery,
  type AffinityPolicy,
  type AntiAffinityGroup,
} from '@oxide/api'
import { Affinity24Icon } from '@oxide/design-system/icons/react'

import { getProjectSelector, useProjectSelector } from '~/hooks/use-params'
import { EmptyCell, SkeletonCell } from '~/table/cells/EmptyCell'
import { makeLinkCell } from '~/table/cells/LinkCell'
import { Columns } from '~/table/columns/common'
import { Table } from '~/table/Table'
import { Badge } from '~/ui/lib/Badge'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { Slash } from '~/ui/lib/Slash'
import { TableEmptyBox } from '~/ui/lib/Table'
import { intersperse } from '~/util/array'
import { ALL_ISH } from '~/util/consts'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

const antiAffinityGroupList = ({ project }: PP.Project) =>
  getListQFn('antiAffinityGroupList', { query: { project, limit: ALL_ISH } })
const memberList = ({ antiAffinityGroup, project }: PP.AntiAffinityGroup) =>
  apiq('antiAffinityGroupMemberList', {
    path: { antiAffinityGroup },
    // We only need to get the first 2 members for preview
    query: { project, limit: 2 },
  })

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { project } = getProjectSelector(params)
  await queryClient
    .fetchQuery(antiAffinityGroupList({ project }).optionsFn())
    .then((data) => {
      // Preload the anti-affinity group details
      data.items.forEach((antiAffinityGroup) => {
        queryClient.fetchQuery(
          memberList({ antiAffinityGroup: antiAffinityGroup.name, project })
        )
      })
    })
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

export default function AffinityPage() {
  const { project } = useProjectSelector()
  const staticCols = [
    colHelper.accessor('name', {
      cell: makeLinkCell((antiAffinityGroup) =>
        pb.antiAffinityGroup({ project, antiAffinityGroup })
      ),
    }),
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
  const {
    data: { items: antiAffinityGroups },
  } = usePrefetchedQuery(antiAffinityGroupList({ project }).optionsFn())

  const table = useReactTable({
    columns: staticCols,
    data: antiAffinityGroups || [],
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
      <AffinityPageHeader />
      {antiAffinityGroups.length === 0 ? (
        <AntiAffinityGroupEmptyState />
      ) : (
        <Table table={table} />
      )}
    </>
  )
}

export const AntiAffinityGroupEmptyState = () => (
  <TableEmptyBox>
    <EmptyMessage
      icon={<Affinity24Icon />}
      title="No anti-affinity groups"
      body="Create an anti-affinity group to see it here"
      buttonText="New anti-affinity group"
      buttonTo={pb.antiAffinityGroupNew(useProjectSelector())}
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
  const { data: members } = useApiQuery('antiAffinityGroupMemberList', {
    path: { antiAffinityGroup },
    query: { project, limit: 2 },
  })

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
