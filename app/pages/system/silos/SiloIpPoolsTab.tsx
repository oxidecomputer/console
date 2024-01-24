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
import { EmptyMessage, Networking24Icon } from '@oxide/ui'

import { getSiloSelector, useIpPoolSelector } from 'app/hooks'
import { pb } from 'app/util/path-builder'

const EmptyState = () => (
  <EmptyMessage
    icon={<Networking24Icon />}
    title="No IP pool associations"
    body="You need to link an IP pool to this silo to be able to see it here"
    buttonText="Link IP pool"
    // TODO: correct link
    buttonTo={pb.ipPoolNew()}
  />
)

SiloIpPoolsTab.loader = async ({ params }: LoaderFunctionArgs) => {
  const { silo } = getSiloSelector(params)
  await Promise.all([
    apiQueryClient.prefetchQuery('siloView', { path: { silo } }),
    apiQueryClient.prefetchQuery('siloIdentityProviderList', {
      query: { silo, limit: 25 }, // same as query table
    }),
  ])
  return null
}

export function SiloIpPoolsTab() {
  // none of this is correct yet
  //   const poolSelector = useIpPoolSelector()
  //   const { data: silo } = usePrefetchedApiQuery('ipPoolView', {
  //     path: poolSelector,
  //   })
  //   const { Table, Column } = useQueryTable('siloIpPoolsList', {
  //     path: poolSelector,
  //   })
  return (
    <>
      IP Pools tab coming
      {/* <Table emptyState={<EmptyState />} aria-labelledby="links-label">
        <Column accessor="siloId" id="Silo ID" />
        <Column accessor="isDefault" id="Default" cell={BooleanCell} />
      </Table> */}
    </>
  )
}
