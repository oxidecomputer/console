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
import { Affinity24Icon } from '@oxide/design-system/icons/react'

import { getProjectSelector, useProjectSelector } from '~/hooks/use-params'
import { makeLinkCell } from '~/table/cells/LinkCell'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

export const handle = { crumb: 'Affinity' }

const antiAffinityGroupList = (query: PP.Project) =>
  getListQFn('antiAffinityGroupList', { query })

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { project } = getProjectSelector(params)
  await queryClient.fetchQuery(antiAffinityGroupList({ project }).optionsFn())
  return null
}

const colHelper = createColumnHelper<AntiAffinityGroup>()

export const AffinityPageHeader = ({ name = 'Affinity' }: { name?: string }) => (
  <PageHeader>
    <PageTitle icon={<Affinity24Icon />}>{name}</PageTitle>
    {/* TODO: Add a DocsPopover with docLinks.affinity once the doc page exists */}
  </PageHeader>
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
    colHelper.accessor('timeCreated', Columns.timeCreated),
  ]

  const { table } = useQueryTable({
    query: antiAffinityGroupList({ project }),
    columns: staticCols,
    emptyState: <AffinityGroupEmptyState />,
  })
  return (
    <>
      <AffinityPageHeader />
      {table}
    </>
  )
}

export const AffinityGroupEmptyState = () => (
  <EmptyMessage
    icon={<Affinity24Icon />}
    title="No anti-affinity groups"
    body="Create a new anti-affinity group to see it here"
    buttonText="New anti-affinity group"
    buttonTo={pb.antiAffinityGroupNew(useProjectSelector())}
  />
)
