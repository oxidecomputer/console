/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'

import { api, q, queryClient, usePrefetchedQuery, type RelatedProblem } from '@oxide/api'
import { Issues24Icon } from '@oxide/design-system/icons/react'

import { ProblemStateBadge } from '~/components/StateBadge'
import { makeCrumb } from '~/hooks/use-crumbs'
import { useProblemSelector } from '~/hooks/use-params'
import { LinkCell } from '~/table/cells/LinkCell'
import { Columns } from '~/table/columns/common'
import { Table } from '~/table/Table'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { TableEmptyBox, TableTitle } from '~/ui/lib/Table'
import { truncate } from '~/ui/lib/Truncate'
import { ALL_ISH } from '~/util/consts'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

import type { Route } from './+types/ProblemRelatedTab'

const causesList = ({ problemId }: PP.Problem) =>
  q(api.problemCausesList, { path: { problemId }, query: { limit: ALL_ISH } })
const consequencesList = ({ problemId }: PP.Problem) =>
  q(api.problemConsequencesList, { path: { problemId }, query: { limit: ALL_ISH } })

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const { problemId } = params
  await Promise.all([
    queryClient.prefetchQuery(causesList({ problemId })),
    queryClient.prefetchQuery(consequencesList({ problemId })),
  ])
  return null
}

export const handle = makeCrumb('Related problems')

const colHelper = createColumnHelper<RelatedProblem>()
const columns = [
  colHelper.accessor('id', {
    header: 'Problem',
    cell: (info) => (
      <LinkCell to={pb.problem({ problemId: info.getValue() })}>
        {truncate(info.getValue(), 14, 'middle')}
      </LinkCell>
    ),
  }),
  colHelper.accessor('reason', Columns.description),
  colHelper.accessor('state', {
    cell: (info) => <ProblemStateBadge state={info.getValue()} />,
  }),
]

type RelatedTableProps = {
  title: string
  emptyTitle: string
  problems: RelatedProblem[]
}

function RelatedTable({ title, emptyTitle, problems }: RelatedTableProps) {
  const table = useReactTable({
    columns,
    data: problems,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
  })
  return (
    <div>
      <TableTitle className="mb-3">{title}</TableTitle>
      {problems.length > 0 ? (
        <Table table={table} aria-label={title} />
      ) : (
        <TableEmptyBox>
          <EmptyMessage icon={<Issues24Icon />} title={emptyTitle} />
        </TableEmptyBox>
      )}
    </div>
  )
}

export default function ProblemRelatedTab() {
  const selector = useProblemSelector()
  const { data: causes } = usePrefetchedQuery(causesList(selector))
  const { data: consequences } = usePrefetchedQuery(consequencesList(selector))
  return (
    <div className="space-y-8">
      <RelatedTable title="Causes" emptyTitle="No known causes" problems={causes.items} />
      <RelatedTable
        title="Consequences"
        emptyTitle="No known consequences"
        problems={consequences.items}
      />
    </div>
  )
}
