/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { createColumnHelper } from '@tanstack/react-table'
import type { LoaderFunctionArgs } from 'react-router'

import { getListQFn, queryClient, type AffinityGroup } from '@oxide/api'

import { getProjectSelector, useProjectSelector } from '~/hooks/use-params'
import { makeLinkCell } from '~/table/cells/LinkCell'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

import { AffinityGroupEmptyState } from './utils'

export const handle = { crumb: 'Affinity groups' }

const affinityGroupList = (query: PP.Project) => getListQFn('affinityGroupList', { query })

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { project } = getProjectSelector(params)
  await queryClient.prefetchQuery(affinityGroupList({ project }).optionsFn())
  return null
}

const colHelper = createColumnHelper<AffinityGroup>()

export default function AffinityGroupsTab() {
  const { project } = useProjectSelector()

  const staticCols = [
    colHelper.accessor('name', {
      cell: makeLinkCell((affinityGroup) => pb.affinityGroup({ project, affinityGroup })),
    }),
    colHelper.accessor('description', Columns.description),
    colHelper.accessor('timeCreated', Columns.timeCreated),
  ]

  const { table } = useQueryTable({
    query: affinityGroupList({ project }),
    columns: staticCols,
    emptyState: <AffinityGroupEmptyState type="affinity" />,
  })

  return table
}
