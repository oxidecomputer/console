/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useQuery } from '@tanstack/react-query'
import { createColumnHelper } from '@tanstack/react-table'
import { match, P } from 'ts-pattern'

import {
  api,
  getListQFn,
  qErrorsAllowed,
  queryClient,
  type ImpactedResource,
  type ProblemImpact,
} from '@oxide/api'
import { Issues24Icon } from '@oxide/design-system/icons/react'

import { ImpactStateBadge } from '~/components/StateBadge'
import { makeCrumb } from '~/hooks/use-crumbs'
import { useProblemSelector } from '~/hooks/use-params'
import { SkeletonCell } from '~/table/cells/EmptyCell'
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

// impacts might refer to a silo that doesn't exist any longer, so we want to handle 404s if the resource isn't found
const siloView = (silo: string) =>
  qErrorsAllowed(
    api.siloView,
    { path: { silo } },
    {
      errorsExpected: {
        // TODO: might revisit this copy
        explanation: 'the impacted silo may have been deleted.',
        statusCode: 404,
      },
    }
  )

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const { problemId } = params
  const impacts = await queryClient.fetchQuery(impactList({ problemId }).optionsFn())
  for (const { resource } of impacts.items) {
    if (resource.resourceType === 'silo') queryClient.prefetchQuery(siloView(resource.id))
  }
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

// TODO: audit other ID cells to clean things up / import
const IdCell = ({ id }: { id: string }) => (
  <Truncate text={id} position="middle" className="max-w-32" hasCopyButton />
)

// TODO: Might extract into a component / import if that makes sense
function SiloCell({ siloId }: { siloId: string }) {
  const { data: result } = useQuery(siloView(siloId))

  if (!result) return <SkeletonCell />
  if (result.type === 'error') return <IdCell id={siloId} />

  const { name } = result.data
  return <LinkCell to={pb.silo({ silo: name })}>{name}</LinkCell>
}

const ResourceIdCell = ({ resource }: { resource: ImpactedResource }) =>
  match(resource)
    .with({ resourceType: 'sled' }, ({ id }) => (
      <LinkCell to={pb.sledInstances({ sledId: id })}>
        {truncate(id, 14, 'middle')}
      </LinkCell>
    ))
    .with({ resourceType: 'silo' }, ({ id }) => <SiloCell siloId={id} />)
    .with(
      {
        // These aren't linked, either because they rely on a project name
        // (which the operator might not have access to) or because the
        // hardware type doesn't have a linkable detail page.
        resourceType: P.union(
          'switch',
          'switch_port',
          'physical_disk',
          'instance',
          'disk',
          'image',
          'snapshot'
        ),
      },
      ({ id }) => <IdCell id={id} />
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

// TODO: Revisit using the resource ID as a proxy forthe impact ID.
// An impact has no ID of its own; a resource ID is unique within the problem's impact list.
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
