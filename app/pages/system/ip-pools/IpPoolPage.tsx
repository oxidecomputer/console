/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { LoaderFunctionArgs } from 'react-router-dom'

import { apiQueryClient, usePrefetchedApiQuery } from '@oxide/api'
import { BooleanCell, DateCell, useQueryTable } from '@oxide/table'
import {
  EmptyMessage,
  Message,
  Networking24Icon,
  PageHeader,
  PageTitle,
  Tabs,
} from '@oxide/ui'

import { QueryParamTabs } from 'app/components/QueryParamTabs'
import { getIpPoolSelector, useIpPoolSelector } from 'app/hooks'

IpPoolPage.loader = async function ({ params }: LoaderFunctionArgs) {
  const { pool } = getIpPoolSelector(params)
  await Promise.all([
    apiQueryClient.prefetchQuery('ipPoolView', { path: { pool } }),
    apiQueryClient.prefetchQuery('ipPoolSiloList', {
      path: { pool },
      query: { limit: 25 }, // match QueryTable
    }),
    apiQueryClient.prefetchQuery('ipPoolRangeList', {
      path: { pool },
      query: { limit: 25 }, // match QueryTable
    }),
  ])
  return null
}

export function IpPoolPage() {
  const poolSelector = useIpPoolSelector()
  const { data: pool } = usePrefetchedApiQuery('ipPoolView', { path: poolSelector })
  return (
    <>
      <PageHeader>
        <PageTitle icon={<Networking24Icon />}>IP pool: {pool.name}</PageTitle>
      </PageHeader>
      <Message
        className="-mt-8 mb-12"
        variant="info"
        content="This page is a work in progress. Use the CLI or API for full control over IP ranges and linked silos."
      />
      <QueryParamTabs className="full-width" defaultValue="ranges">
        <Tabs.List>
          <Tabs.Trigger value="ranges">IP ranges</Tabs.Trigger>
          <Tabs.Trigger value="silos">Linked silos</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="ranges">
          <IpRangesTable />
        </Tabs.Content>
        <Tabs.Content value="silos">
          <LinkedSilosTable />
        </Tabs.Content>
      </QueryParamTabs>
    </>
  )
}

const RangesEmptyState = () => (
  <EmptyMessage
    icon={<Networking24Icon />}
    title="No IP ranges"
    body="Add a range to see it here"
    // TODO: link add range button
    // buttonText="Add range"
    // buttonTo={pb.ipPoolNew()}
  />
)

function IpRangesTable() {
  const poolSelector = useIpPoolSelector()
  const { Table, Column } = useQueryTable('ipPoolRangeList', { path: poolSelector })

  return (
    <Table emptyState={<RangesEmptyState />}>
      {/* TODO: only showing the ID is ridiculous. we need names */}
      <Column accessor="range.first" header="First" />
      <Column accessor="range.last" header="Last" />
      <Column accessor="timeCreated" header="Created" cell={DateCell} />
    </Table>
  )
}

const SilosEmptyState = () => (
  <EmptyMessage
    icon={<Networking24Icon />}
    title="No IP pool associations"
    body="You need to link the IP pool to a silo to be able to see it here"
    // TODO: link silo button
    // buttonText="Link IP pool"
    // buttonTo={pb.ipPoolNew()}
  />
)

function LinkedSilosTable() {
  const poolSelector = useIpPoolSelector()
  const { Table, Column } = useQueryTable('ipPoolSiloList', { path: poolSelector })

  return (
    <Table emptyState={<SilosEmptyState />}>
      {/* TODO: only showing the ID is ridiculous. we need names */}
      <Column accessor="siloId" id="Silo ID" />
      {/* TODO: we're going to want a tooltip to explain what the f this means */}
      <Column accessor="isDefault" id="Default for silo" cell={BooleanCell} />
    </Table>
  )
}
