/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { LoaderFunctionArgs } from 'react-router-dom'

import { apiQueryClient, usePrefetchedApiQuery } from '@oxide/api'
import { BooleanCell, useQueryTable } from '@oxide/table'
import { EmptyMessage, Networking24Icon, PageHeader, PageTitle } from '@oxide/ui'

import { getIpPoolSelector, useIpPoolSelector } from 'app/hooks'
import { pb } from 'app/util/path-builder'

IpPoolPage.loader = async function ({ params }: LoaderFunctionArgs) {
  const { pool } = getIpPoolSelector(params)
  await Promise.all([
    apiQueryClient.prefetchQuery('ipPoolView', { path: { pool } }),
    apiQueryClient.prefetchQuery('ipPoolSiloList', {
      path: { pool },
      query: { limit: 10 },
    }),
  ])
  return null
}

const EmptyState = () => (
  <EmptyMessage
    icon={<Networking24Icon />}
    title="No IP pool associations"
    body="You need to link an IP pool to the fleet or a silo to be able to see it here"
    buttonText="Link IP pool"
    // TODO: correct link
    buttonTo={pb.ipPoolNew()}
  />
)

export function IpPoolPage() {
  const poolSelector = useIpPoolSelector()
  const { data: pool } = usePrefetchedApiQuery('ipPoolView', { path: poolSelector })
  const { Table, Column } = useQueryTable('ipPoolSiloList', { path: poolSelector })
  return (
    <>
      {/* TODO: I think this page needs a back to pools button. clicking 
      Networking again is not at all obvious */}
      <PageHeader>
        <PageTitle icon={<Networking24Icon />}>IP Pool: {pool.name}</PageTitle>
      </PageHeader>
      <h2 id="links-label" className="mb-4 text-mono-sm text-secondary">
        Linked resources
      </h2>
      <Table emptyState={<EmptyState />} aria-labelledby="links-label">
        <Column accessor="siloId" id="Silo ID" />
        {/* TODO: we're going to want a tooltip to explain what the f this means */}
        <Column accessor="isDefault" id="Default" cell={BooleanCell} />
      </Table>
    </>
  )
}
