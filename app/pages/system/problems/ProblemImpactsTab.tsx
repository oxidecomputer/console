/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { createColumnHelper } from '@tanstack/react-table'
import { match, P } from 'ts-pattern'

import {
  api,
  getListQFn,
  queryClient,
  type ImpactedResource,
  type ProblemImpact,
} from '@oxide/api'
import { Issues24Icon } from '@oxide/design-system/icons/react'

import { ImpactStateBadge } from '~/components/StateBadge'
import { makeCrumb } from '~/hooks/use-crumbs'
import { useProblemSelector } from '~/hooks/use-params'
import { LinkCell } from '~/table/cells/LinkCell'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { Truncate, truncate } from '~/ui/lib/Truncate'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

import type { Route } from './+types/ProblemImpactsTab'

const impactList = ({ problemId }: PP.Problem) =>
  getListQFn(api.problemImpactList, { path: { problemId } })

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const { problemId } = params
  await queryClient.prefetchQuery(impactList({ problemId }).optionsFn())
  return null
}

export const handle = makeCrumb('Impacts')

type ResourceType = ImpactedResource['resourceType']

const resourceTypeLabel: Record<ResourceType, string> = {
  sled: 'Sled',
  switch: 'Switch',
  switch_port: 'Switch port',
  physical_disk: 'Physical disk',
  instance: 'Instance',
  disk: 'Disk',
  image: 'Image',
  snapshot: 'Snapshot',
  silo: 'Silo',
}

const ResourceIdCell = ({ resource }: { resource: ImpactedResource }) =>
  match(resource)
    .with({ resourceType: 'sled' }, ({ id }) => (
      <LinkCell to={pb.sledInstances({ sledId: id })}>
        {truncate(id, 14, 'middle')}
      </LinkCell>
    ))
    .with(
      {
        // These aren't linked. The project-scoped types need the project name,
        // which might not be available to the operator; the impact gives only the resource ID.
        // The hardware types don't have a detail page.
        resourceType: P.union(
          'switch',
          'switch_port',
          'physical_disk',
          'instance',
          'disk',
          'image',
          'snapshot',
          'silo'
        ),
      },
      ({ id }) => (
        <Truncate text={id} position="middle" className="max-w-32" hasCopyButton />
      )
    )
    .exhaustive()

const colHelper = createColumnHelper<ProblemImpact>()
const columns = [
  colHelper.accessor((i) => i.resource.resourceType, {
    header: 'Resource type',
    cell: (info) => resourceTypeLabel[info.getValue()],
  }),
  colHelper.accessor('resource', {
    header: 'Resource ID',
    cell: (info) => <ResourceIdCell resource={info.getValue()} />,
  }),
  colHelper.accessor('reason', Columns.description),
  colHelper.accessor('state', {
    cell: (info) => <ImpactStateBadge state={info.getValue()} />,
  }),
  colHelper.accessor('timeDetected', { ...Columns.timeCreated, header: 'Detected' }),
]

// An impact has no ID of its own. A resource is in a problem's impact list once.
const getImpactId = (impact: ProblemImpact) => impact.resource.id

export default function ProblemImpactsTab() {
  const selector = useProblemSelector()
  const { table } = useQueryTable({
    query: impactList(selector),
    columns,
    getId: getImpactId,
    emptyState: (
      <EmptyMessage
        icon={<Issues24Icon />}
        title="No impacted resources"
        body="Resources affected by this problem will appear here"
      />
    ),
  })
  return table
}
