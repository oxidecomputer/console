/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { api, q, queryClient, usePrefetchedQuery } from '@oxide/api'
import { Issues24Icon, OpenLink12Icon } from '@oxide/design-system/icons/react'

import { RouteTabs, Tab } from '~/components/RouteTabs'
import { ProblemStateBadge } from '~/components/StateBadge'
import { makeCrumb } from '~/hooks/use-crumbs'
import { useProblemSelector } from '~/hooks/use-params'
import { EmptyCell } from '~/table/cells/EmptyCell'
import { CardBlock } from '~/ui/lib/CardBlock'
import { DateTime } from '~/ui/lib/DateTime'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { truncate } from '~/ui/lib/Truncate'
import { links } from '~/util/links'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

import type { Route } from './+types/ProblemPage'

const problemView = ({ problemId }: PP.Problem) =>
  q(api.problemView, { path: { problemId } })

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const { problemId } = params
  await queryClient.prefetchQuery(problemView({ problemId }))
  return null
}

export const handle = makeCrumb(
  (p) => truncate(p.problemId!, 14, 'middle'),
  (p) => pb.problem({ problemId: p.problemId! })
)

export default function ProblemPage() {
  const selector = useProblemSelector()
  const { data: problem } = usePrefetchedQuery(problemView(selector))

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Issues24Icon />}>{problem.summary}</PageTitle>
      </PageHeader>
      <PropertiesTable columns={2} className="-mt-8 mb-8">
        <PropertiesTable.IdRow id={problem.id} />
        <PropertiesTable.Row label="State">
          <ProblemStateBadge state={problem.state} />
        </PropertiesTable.Row>
        <PropertiesTable.Row label="Class">
          <span className="text-mono-sm">{problem.class}</span>
        </PropertiesTable.Row>
        <PropertiesTable.Row label="Detected">
          <DateTime date={problem.timeCreated} />
        </PropertiesTable.Row>
        <PropertiesTable.Row label="Code">
          <a
            href={links.problemCodeDocs(problem.code)}
            aria-label={`Docs for Problem code ${problem.code}`}
            className="text-sans-md text-raise hover:bg-tertiary relative -ml-2 inline-block rounded-md py-1 pr-7 pl-2"
            target="_blank"
            rel="noreferrer"
          >
            {problem.code}
            <OpenLink12Icon className="text-secondary absolute top-1.5 ml-2 translate-y-px" />
          </a>
        </PropertiesTable.Row>
        <PropertiesTable.DateRow date={problem.timeModified} label="Updated" />
        <PropertiesTable.Row label="Revision">{problem.revision}</PropertiesTable.Row>
        <PropertiesTable.Row label="Resolved">
          {problem.state === 'resolved' ? (
            <DateTime date={problem.timeStateChanged} />
          ) : (
            <EmptyCell />
          )}
        </PropertiesTable.Row>
      </PropertiesTable>
      <div className="max-1000:grid-cols-1 mb-8 grid grid-cols-2 gap-6">
        <CardBlock>
          <CardBlock.Header title="Description" />
          <CardBlock.Body>{problem.description}</CardBlock.Body>
        </CardBlock>
        <CardBlock>
          <CardBlock.Header title="Action required" />
          <CardBlock.Body>{problem.actionRequired}</CardBlock.Body>
        </CardBlock>
      </div>
      <RouteTabs fullWidth>
        <Tab to={pb.problemImpacts(selector)}>Impacts</Tab>
        <Tab to={pb.problemRelated(selector)}>Related problems</Tab>
        <Tab to={pb.problemAlerts(selector)}>Alerts</Tab>
        <Tab to={pb.problemSupportBundles(selector)}>Support bundles</Tab>
      </RouteTabs>
    </>
  )
}
