/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { createColumnHelper } from '@tanstack/react-table'
import type { LoaderFunctionArgs } from 'react-router'

import { getListQFn, queryClient, type AntiAffinityGroup } from '@oxide/api'
import { Access24Icon } from '@oxide/design-system/icons/react'

import { getProjectSelector, useProjectSelector } from '~/hooks/use-params'
import { makeLinkCell } from '~/table/cells/LinkCell'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

export const handle = { crumb: 'Anti-Affinity' }

const EmptyState = () => (
  <EmptyMessage
    icon={<Access24Icon />}
    title="No anti-affinity groups"
    body="Create an anti-affinity group to see it here"
    buttonText="New anti-affinity group"
    buttonTo={pb.antiAffinityGroupNew(useProjectSelector())}
  />
)

const antiAffinityGroupList = (query: PP.Project) =>
  getListQFn('antiAffinityGroupList', { query })

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { project } = getProjectSelector(params)
  await queryClient.prefetchQuery(antiAffinityGroupList({ project }).optionsFn())
  return null
}

const colHelper = createColumnHelper<AntiAffinityGroup>()

export default function AffinityGroupsTab() {
  const { project } = useProjectSelector()

  const staticCols = [
    colHelper.accessor('name', {
      cell: makeLinkCell((antiAffinityGroup) =>
        pb.antiAffinityGroup({ project, antiAffinityGroup })
      ),
    }),
    colHelper.accessor('description', Columns.description),
    colHelper.accessor('timeCreated', Columns.timeCreated),
  ]

  const { table } = useQueryTable({
    query: antiAffinityGroupList({ project }),
    columns: staticCols,
    emptyState: <EmptyState />,
  })

  return table
}
