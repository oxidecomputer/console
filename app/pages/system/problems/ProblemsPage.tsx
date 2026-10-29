/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'

import { api, getListQFn, queryClient, type Problem, type ProblemState } from '@oxide/api'
import { Issues24Icon } from '@oxide/design-system/icons/react'

import { AlertClassBadge } from '~/components/AlertClassBadge'
import { QueryParamTabs } from '~/components/QueryParamTabs'
import { EmptyCell } from '~/table/cells/EmptyCell'
import { LinkCell } from '~/table/cells/LinkCell'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { DateTime } from '~/ui/lib/DateTime'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { Tabs } from '~/ui/lib/Tabs'
import { pb } from '~/util/path-builder'

const problemList = (state: ProblemState) =>
  getListQFn(api.problemList, {
    query: { state, sortBy: 'time_and_id_descending' },
  })

// Prefetch both tabs. The new tab's panel renders before a loader rerun
// triggered by the tab param finishes, so a per-tab prefetch isn't enough.
export async function clientLoader() {
  await Promise.all([
    queryClient.prefetchQuery(problemList('active').optionsFn()),
    queryClient.prefetchQuery(problemList('resolved').optionsFn()),
  ])
  return null
}

const colHelper = createColumnHelper<Problem>()

const summaryCol = colHelper.accessor('summary', {
  header: 'Summary',
  cell: (info) => (
    <LinkCell to={pb.problem({ problemId: info.row.original.id })}>
      {info.getValue()}
    </LinkCell>
  ),
})
// problem classes are dotted strings like alert classes, and they show up in
// the classes of the alerts a problem emits
const classCol = colHelper.accessor('class', {
  header: 'Class',
  cell: (info) => <AlertClassBadge>{info.getValue()}</AlertClassBadge>,
})
const codeCol = colHelper.accessor('code', { header: 'Code' })
const detectedCol = colHelper.accessor('timeCreated', {
  ...Columns.timeCreated,
  header: 'Detected',
})
const updatedCol = colHelper.accessor('timeModified', {
  ...Columns.timeModified,
  header: 'Updated',
})
const resolvedCol = colHelper.accessor('timeResolved', {
  header: 'Resolved',
  cell: (info) => {
    const date = info.getValue()
    return date ? <DateTime date={date} /> : <EmptyCell />
  },
})

const activeColumns = [summaryCol, classCol, codeCol, detectedCol, updatedCol]
const resolvedColumns = [summaryCol, classCol, codeCol, detectedCol, resolvedCol]

const EMPTY_STATE: Record<ProblemState, React.ReactElement> = {
  active: (
    <EmptyMessage
      icon={<Issues24Icon />}
      title="No active problems"
      body="Problems the system detects will show up here"
    />
  ),
  resolved: (
    <EmptyMessage
      icon={<Issues24Icon />}
      title="No resolved problems"
      body="Problems the system has resolved will show up here"
    />
  ),
}

function ProblemTable({ state }: { state: ProblemState }) {
  const { table } = useQueryTable({
    query: problemList(state),
    columns: state === 'active' ? activeColumns : resolvedColumns,
    emptyState: EMPTY_STATE[state],
  })
  return table
}

export default function ProblemsPage() {
  return (
    <>
      <PageHeader>
        <PageTitle icon={<Issues24Icon />}>Problems</PageTitle>
      </PageHeader>
      <QueryParamTabs className="full-width" defaultValue="active">
        <Tabs.List>
          <Tabs.Trigger value="active">Active</Tabs.Trigger>
          <Tabs.Trigger value="resolved">Resolved</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="active">
          <ProblemTable state="active" />
        </Tabs.Content>
        <Tabs.Content value="resolved">
          <ProblemTable state="resolved" />
        </Tabs.Content>
      </QueryParamTabs>
    </>
  )
}
