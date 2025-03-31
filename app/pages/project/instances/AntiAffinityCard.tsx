/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo } from 'react'

import {
  getListQFn,
  usePrefetchedQuery,
  type AffinityGroup,
  type AntiAffinityGroup,
} from '@oxide/api'
import { Affinity24Icon } from '@oxide/design-system/icons/react'

import { useInstanceSelector } from '~/hooks/use-params'
import { makeLinkCell } from '~/table/cells/LinkCell'
import { Columns } from '~/table/columns/common'
import { Table } from '~/table/Table'
import { Badge } from '~/ui/lib/Badge'
import { CardBlock } from '~/ui/lib/CardBlock'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { TableEmptyBox } from '~/ui/lib/Table'
import { ALL_ISH } from '~/util/consts'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

export const antiAffinityGroupList = ({ project, instance }: PP.Instance) =>
  getListQFn('instanceAntiAffinityGroupList', {
    path: { instance },
    query: { project, limit: ALL_ISH },
  })

const colHelper = createColumnHelper<AffinityGroup | AntiAffinityGroup>()
const staticCols = [
  colHelper.accessor('description', Columns.description),
  colHelper.accessor('policy', {
    cell: (info) => <Badge color="neutral">{info.getValue()}</Badge>,
  }),
]

export function AntiAffinityCard() {
  const instanceSelector = useInstanceSelector()
  const { project } = instanceSelector

  const { data: antiAffinityGroups } = usePrefetchedQuery(
    antiAffinityGroupList(instanceSelector).optionsFn()
  )

  const antiAffinityCols = useMemo(
    () => [
      colHelper.accessor('name', {
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
              title="No anti-affinity groups"
              body="This instance is not a member of any anti-affinity groups"
            />
          </TableEmptyBox>
        )}
      </CardBlock.Body>
    </CardBlock>
  )
}
