/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useQuery } from '@tanstack/react-query'
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import { match } from 'ts-pattern'

import {
  api,
  q,
  queryClient,
  usePrefetchedQuery,
  type ProblemImpact,
  type Alert,
  type RelatedProblem,
  type SupportBundleInfo,
} from '@oxide/api'
import { Issues24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { AlertClassBadge } from '~/components/AlertClassBadge'
import { ProblemStateBadge, SupportBundleStateBadge } from '~/components/StateBadge'
import { makeCrumb } from '~/hooks/use-crumbs'
import { DescriptionCell } from '~/table/cells/DescriptionCell'
import { EmptyCell, SkeletonCell } from '~/table/cells/EmptyCell'
import { LinkCell } from '~/table/cells/LinkCell'
import { Columns } from '~/table/columns/common'
import { Table } from '~/table/Table'
import { CardBlock } from '~/ui/lib/CardBlock'
import { DateTime } from '~/ui/lib/DateTime'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { Message } from '~/ui/lib/Message'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { TableEmptyBox } from '~/ui/lib/Table'
import { Truncate, truncate } from '~/ui/lib/Truncate'
import { ALL_ISH } from '~/util/consts'
import { pb } from '~/util/path-builder'

import type { Route } from './+types/ProblemPage'

const problemView = (problemId: string) => q(api.problemView, { path: { problemId } })

// These lists are paginated in the API, but a single problem should never have
// enough of any of them to need more than one page.
const listParams = (problemId: string) => ({
  path: { problemId },
  query: { limit: ALL_ISH },
})
const impactList = (problemId: string) => q(api.problemImpactList, listParams(problemId))
const causeList = (problemId: string) => q(api.problemCausesList, listParams(problemId))
const consequenceList = (problemId: string) =>
  q(api.problemConsequencesList, listParams(problemId))
const alertList = (problemId: string) =>
  q(api.problemAlertList, {
    path: { problemId },
    query: { limit: ALL_ISH, sortBy: 'time_and_id_descending' },
  })
const bundleList = (problemId: string) =>
  q(api.problemSupportBundlesList, {
    path: { problemId },
    query: { limit: ALL_ISH, sortBy: 'time_and_id_descending' },
  })

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const { problemId } = params
  const [, causes, consequences] = await Promise.all([
    queryClient.fetchQuery(problemView(problemId)),
    queryClient.fetchQuery(causeList(problemId)),
    queryClient.fetchQuery(consequenceList(problemId)),
    queryClient.prefetchQuery(impactList(problemId)),
    queryClient.prefetchQuery(alertList(problemId)),
    queryClient.prefetchQuery(bundleList(problemId)),
  ])
  // related problems only come with an ID, so fetch each one for its summary
  // and state. Don't block render on them.
  for (const { id } of [...causes.items, ...consequences.items]) {
    queryClient.prefetchQuery(problemView(id))
  }
  return null
}

export const handle = makeCrumb((p) => truncate(p.problemId!, 14, 'middle'))

export default function ProblemPage({ params: { problemId } }: Route.ComponentProps) {
  const { data: problem } = usePrefetchedQuery(problemView(problemId))
  return (
    <>
      <PageHeader>
        <PageTitle icon={<Issues24Icon />}>{problem.summary}</PageTitle>
      </PageHeader>
      <PropertiesTable columns={2} className="-mt-8 mb-6">
        <PropertiesTable.Row label="State">
          <ProblemStateBadge state={problem.state} />
        </PropertiesTable.Row>
        <PropertiesTable.IdRow id={problem.id} />
        <PropertiesTable.Row label="Class">
          <AlertClassBadge>{problem.class}</AlertClassBadge>
        </PropertiesTable.Row>
        <PropertiesTable.Row label="Detected">
          <DateTime date={problem.timeCreated} />
        </PropertiesTable.Row>
        <PropertiesTable.Row label="Code">{problem.code}</PropertiesTable.Row>
        <PropertiesTable.DateRow label="Updated" date={problem.timeModified} />
        <PropertiesTable.Row label="Revision">{problem.revision}</PropertiesTable.Row>
        <PropertiesTable.Row label="Resolved">
          {problem.timeResolved ? <DateTime date={problem.timeResolved} /> : <EmptyCell />}
        </PropertiesTable.Row>
      </PropertiesTable>
      <div className="space-y-6">
        <Message
          variant={problem.state === 'active' ? 'notice' : 'info'}
          title="Action required"
          content={problem.actionRequired}
        />
        <CardBlock>
          <CardBlock.Header title="Description" />
          <CardBlock.Body>
            <p className="text-default">{problem.description}</p>
          </CardBlock.Body>
        </CardBlock>
        <ImpactsCard problemId={problemId} />
        <RelatedProblemsCard problemId={problemId} />
        <AlertsCard problemId={problemId} />
        <SupportBundlesCard problemId={problemId} />
      </div>
    </>
  )
}

type ListCardProps<T> = {
  title: string
  description: string
  emptyTitle: string
  rows: T[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<T, any>[]
}

function ListCard<T>({ title, description, emptyTitle, rows, columns }: ListCardProps<T>) {
  const table = useReactTable({ columns, data: rows, getCoreRowModel: getCoreRowModel() })
  return (
    <CardBlock>
      <CardBlock.Header title={title} description={description} />
      <CardBlock.Body>
        {rows.length > 0 ? (
          <Table table={table} aria-label={title} />
        ) : (
          <TableEmptyBox>
            <EmptyMessage icon={<Issues24Icon />} title={emptyTitle} />
          </TableEmptyBox>
        )}
      </CardBlock.Body>
    </CardBlock>
  )
}

// Impacts

/**
 * Impacts only carry the resource's type and ID. Per RFD 699 §8, fleet viewers
 * may not be allowed to see anything else about silo resources, so we link the
 * hardware we have pages for and show the ID for everything else.
 */
function ImpactedResourceCell({ resource }: { resource: ProblemImpact['resource'] }) {
  const id = <Truncate text={resource.id} position="middle" className="max-w-32" />
  return match(resource.resourceType)
    .with('sled', () => (
      <LinkCell to={pb.sledInstances({ sledId: resource.id })}>{id}</LinkCell>
    ))
    .with('silo', () => <LinkCell to={pb.silo({ silo: resource.id })}>{id}</LinkCell>)
    .with(
      'physical_disk',
      'switch',
      'switch_port',
      'instance',
      'disk',
      'image',
      'snapshot',
      () => (
        <Truncate text={resource.id} position="middle" className="max-w-32" hasCopyButton />
      )
    )
    .exhaustive()
}

const impactColHelper = createColumnHelper<ProblemImpact>()
const impactCols = [
  impactColHelper.accessor('resource.resourceType', {
    header: 'Type',
    cell: (info) => <Badge color="neutral">{info.getValue().replace('_', ' ')}</Badge>,
  }),
  impactColHelper.accessor('resource', {
    header: 'Resource',
    cell: (info) => <ImpactedResourceCell resource={info.getValue()} />,
  }),
  impactColHelper.accessor('reason', Columns.description),
  impactColHelper.accessor('revisionAdded', { header: 'Added in revision' }),
]

function ImpactsCard({ problemId }: { problemId: string }) {
  const { data } = usePrefetchedQuery(impactList(problemId))
  return (
    <ListCard
      title="Impacted resources"
      description="Resources affected by this problem"
      emptyTitle="No impacted resources"
      rows={data.items}
      columns={impactCols}
    />
  )
}

// Related problems

type RelatedRow = RelatedProblem & { relation: 'cause' | 'consequence' }

function RelatedProblemCell({ problemId }: { problemId: string }) {
  const { data: problem } = useQuery(problemView(problemId))
  if (!problem) return <SkeletonCell />
  return (
    <LinkCell to={pb.problem({ problemId })}>
      <span className="flex items-center gap-2">
        {problem.summary}
        <ProblemStateBadge state={problem.state} />
      </span>
    </LinkCell>
  )
}

const relatedColHelper = createColumnHelper<RelatedRow>()
const relatedCols = [
  relatedColHelper.accessor('id', {
    header: 'Problem',
    cell: (info) => <RelatedProblemCell problemId={info.getValue()} />,
  }),
  relatedColHelper.accessor('relation', {
    header: 'Relation',
    cell: (info) => (
      <Badge color="neutral">{info.getValue() === 'cause' ? 'Cause' : 'Consequence'}</Badge>
    ),
  }),
  relatedColHelper.accessor('reason', Columns.description),
  relatedColHelper.accessor('revisionAdded', { header: 'Added in revision' }),
]

function RelatedProblemsCard({ problemId }: { problemId: string }) {
  const { data: causes } = usePrefetchedQuery(causeList(problemId))
  const { data: consequences } = usePrefetchedQuery(consequenceList(problemId))
  const rows: RelatedRow[] = [
    ...causes.items.map((r) => ({ ...r, relation: 'cause' as const })),
    ...consequences.items.map((r) => ({ ...r, relation: 'consequence' as const })),
  ]
  return (
    <ListCard
      title="Related problems"
      description="Problems that caused this one, or that this one caused"
      emptyTitle="No related problems"
      rows={rows}
      columns={relatedCols}
    />
  )
}

// Alerts

const alertColHelper = createColumnHelper<Alert>()
const alertCols = [
  alertColHelper.accessor('timeCreated', {
    header: 'Time',
    cell: (info) => <DateTime date={info.getValue()} />,
  }),
  alertColHelper.accessor('class', {
    header: 'Class',
    cell: (info) => <AlertClassBadge>{info.getValue()}</AlertClassBadge>,
  }),
  // the alert itself has no revision field, so this relies on a payload schema
  // that hasn't been defined yet
  alertColHelper.accessor((a) => a.payload.revision, {
    id: 'revision',
    header: 'Revision',
    cell: (info) => {
      const revision = info.getValue()
      return typeof revision === 'number' ? revision : <EmptyCell />
    },
  }),
  alertColHelper.accessor('id', Columns.id),
]

function AlertsCard({ problemId }: { problemId: string }) {
  const { data } = usePrefetchedQuery(alertList(problemId))
  return (
    <ListCard
      title="Alerts"
      description="Alerts emitted as the problem was detected, updated, and resolved"
      emptyTitle="No alerts"
      rows={data.items}
      columns={alertCols}
    />
  )
}

// Support bundles

const bundleColHelper = createColumnHelper<SupportBundleInfo>()
const bundleCols = [
  bundleColHelper.accessor('id', {
    header: 'ID',
    cell: (info) => (
      <LinkCell to={pb.supportBundle({ bundleId: info.getValue() })}>
        {truncate(info.getValue(), 14, 'middle')}
      </LinkCell>
    ),
  }),
  bundleColHelper.accessor('state', {
    cell: (info) => <SupportBundleStateBadge state={info.getValue()} />,
  }),
  bundleColHelper.accessor('reasonForCreation', {
    header: 'Creation reason',
    cell: (info) => <DescriptionCell text={info.getValue()} />,
  }),
  bundleColHelper.accessor('timeCreated', Columns.timeCreated),
]

function SupportBundlesCard({ problemId }: { problemId: string }) {
  const { data } = usePrefetchedQuery(bundleList(problemId))
  return (
    <ListCard
      title="Support bundles"
      description="Diagnostic data the system collected for this problem"
      emptyTitle="No support bundles"
      rows={data.items}
      columns={bundleCols}
    />
  )
}
