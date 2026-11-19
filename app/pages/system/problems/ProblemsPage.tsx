/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { createColumnHelper } from '@tanstack/react-table'
import { useSearchParams } from 'react-router'

import { api, getListQFn, queryClient, type Problem, type ProblemState } from '@oxide/api'
import { Issues24Icon } from '@oxide/design-system/icons/react'

import { ProblemStateBadge } from '~/components/StateBadge'
import { makeCrumb } from '~/hooks/use-crumbs'
import { LinkCell } from '~/table/cells/LinkCell'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { Listbox, type ListboxItem } from '~/ui/lib/Listbox'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { TableActions } from '~/ui/lib/Table'
import { pb } from '~/util/path-builder'

import type { Route } from './+types/ProblemsPage'

const STATE_PARAM = 'state'

type StateFilter = 'all' | ProblemState

const stateFilterItems: ListboxItem<StateFilter>[] = [
  { value: 'all', label: 'All states' },
  { value: 'active', label: 'Active' },
  { value: 'resolved', label: 'Resolved' },
]

// ignore values that are not a problem state, so a bad URL shows all problems
const getStateFilter = (searchParams: URLSearchParams): ProblemState | undefined => {
  const value = searchParams.get(STATE_PARAM)
  return value === 'active' || value === 'resolved' ? value : undefined
}

const problemList = (state?: ProblemState) =>
  getListQFn(api.problemList, {
    query: { sortBy: 'time_and_id_descending', state },
  })

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const state = getStateFilter(new URL(request.url).searchParams)
  await queryClient.prefetchQuery(problemList(state).optionsFn())
  return null
}

export const handle = makeCrumb('Problems', pb.problems())

const colHelper = createColumnHelper<Problem>()

const columns = [
  colHelper.accessor('summary', {
    cell: (info) => (
      <LinkCell to={pb.problem({ problemId: info.row.original.id })}>
        {info.getValue()}
      </LinkCell>
    ),
  }),
  colHelper.accessor('state', {
    cell: (info) => <ProblemStateBadge state={info.getValue()} />,
  }),
  colHelper.accessor('class', {
    cell: (info) => <span className="text-mono-sm">{info.getValue()}</span>,
  }),
  colHelper.accessor('code', {}),
  colHelper.accessor('timeCreated', { ...Columns.timeCreated, header: 'Detected' }),
  colHelper.accessor('id', Columns.shortId),
]

export default function ProblemsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const state = getStateFilter(searchParams)

  function setStateFilter(next: StateFilter) {
    const newParams = new URLSearchParams(searchParams)
    if (next === 'all') {
      newParams.delete(STATE_PARAM)
    } else {
      newParams.set(STATE_PARAM, next)
    }
    setSearchParams(newParams, { replace: true })
  }

  const emptyState = state ? (
    <EmptyMessage
      icon={<Issues24Icon />}
      title={`No ${state} problems`}
      buttonText="Show all problems"
      onClick={() => setStateFilter('all')}
    />
  ) : (
    <EmptyMessage
      icon={<Issues24Icon />}
      title="No problems"
      body="Problems detected by the system will appear here"
    />
  )

  const { table } = useQueryTable({ query: problemList(state), columns, emptyState })

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Issues24Icon />}>Problems</PageTitle>
      </PageHeader>
      <TableActions>
        <Listbox
          selected={state ?? 'all'}
          onChange={setStateFilter}
          items={stateFilterItems}
          label="Filter by state"
          hideLabel
          className="w-48"
        />
      </TableActions>
      {table}
    </>
  )
}
