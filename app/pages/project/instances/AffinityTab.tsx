/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo } from 'react'
import { type LoaderFunctionArgs } from 'react-router'

import {
  apiq,
  getListQFn,
  queryClient,
  usePrefetchedQuery,
  type AffinityGroup,
  type AntiAffinityGroup,
} from '@oxide/api'
import { Affinity24Icon } from '@oxide/design-system/icons/react'

import { getInstanceSelector, useInstanceSelector } from '~/hooks/use-params'
import { makeLinkCell } from '~/table/cells/LinkCell'
import { Columns } from '~/table/columns/common'
import { Table } from '~/table/Table'
import { Badge } from '~/ui/lib/Badge'
import { CardBlock } from '~/ui/lib/CardBlock'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { TableEmptyBox } from '~/ui/lib/Table'
import { TipIcon } from '~/ui/lib/TipIcon'
import { ALL_ISH } from '~/util/consts'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

const instanceView = ({ project, instance }: PP.Instance) =>
  apiq('instanceView', { path: { instance }, query: { project } })
const antiAffinityGroupList = ({ project, instance }: PP.Instance) =>
  getListQFn('instanceAntiAffinityGroupList', {
    path: { instance },
    query: { project, limit: ALL_ISH },
  })

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const instanceSelector = getInstanceSelector(params)
  await Promise.all([
    // This is covered by the InstancePage loader but there's no downside to
    // being redundant. If it were removed there, we'd still want it here.
    queryClient.prefetchQuery(instanceView(instanceSelector)),
    queryClient.prefetchQuery(antiAffinityGroupList(instanceSelector).optionsFn()),
  ])
  return null
}

const colHelper = createColumnHelper<AffinityGroup | AntiAffinityGroup>()
const staticCols = [
  colHelper.accessor('description', Columns.description),
  colHelper.accessor('policy', {
    header: () => (
      <>
        Policy
        <TipIcon className="ml-2">
          The affinity policy describes what to do when a request cannot be satisfied.
          &lsquo;allow&rsquo; means a best-effort approach, while &lsquo;fail&rsquo; means
          fail explicitly.
        </TipIcon>
      </>
    ),
    cell: (info) => <Badge color="neutral">{info.getValue()}</Badge>,
  }),
  colHelper.accessor('failureDomain', {
    header: () => (
      <>
        Failure Domain
        <TipIcon className="ml-2">
          Describes the scope of affinity for the purposes of co-location. Currently, only
          &lsquo;sled&rsquo; is supported.
        </TipIcon>
      </>
    ),
    cell: (info) => <Badge color="neutral">{info.getValue()}</Badge>,
  }),
]

export const handle = { crumb: 'Affinity' }

export default function AffinityTab() {
  const instanceSelector = useInstanceSelector()
  const { project } = instanceSelector

  const { data: antiAffinityGroups } = usePrefetchedQuery(
    antiAffinityGroupList(instanceSelector).optionsFn()
  )

  const antiAffinityCols = useMemo(
    () => [
      colHelper.accessor('name', {
        header: 'Group Name',
        cell: makeLinkCell((antiAffinityGroup) =>
          pb.antiAffinityGroup({ project, antiAffinityGroup })
        ),
      }),
      ...staticCols,
    ],
    [project]
  )

  // Create tables for both types of groups
  const antiAffinityTable = useReactTable({
    columns: antiAffinityCols,
    data: antiAffinityGroups.items,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <CardBlock>
      <CardBlock.Header title="Anti-affinity groups" titleId="anti-affinity-groups-label" />

      <CardBlock.Body>
        {antiAffinityGroups.items.length > 0 ? (
          <Table
            aria-labelledby="anti-affinity-groups-label"
            table={antiAffinityTable}
            className="table-inline"
          />
        ) : (
          <TableEmptyBox border={false}>
            <EmptyMessage
              icon={<Affinity24Icon />}
              title="No Anti-Affinity Groups"
              body="This instance is not a member of any anti-affinity groups"
            />
          </TableEmptyBox>
        )}
      </CardBlock.Body>
    </CardBlock>
  )
}
