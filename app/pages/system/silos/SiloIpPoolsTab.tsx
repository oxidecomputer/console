/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { type LoaderFunctionArgs } from 'react-router-dom'

import { apiQueryClient } from '@oxide/api'
import { linkCell, useQueryTable } from '@oxide/table'
import { EmptyMessage, Networking24Icon } from '@oxide/ui'

import { getSiloSelector, useSiloSelector } from 'app/hooks'
import { pb } from 'app/util/path-builder'

const EmptyState = () => (
  <EmptyMessage
    icon={<Networking24Icon />}
    title="No IP pools"
    body="You need to create an IP pool to be able to see it here"
    buttonText="New IP pool"
    buttonTo={pb.ipPoolNew()}
  />
)

SiloIpPoolsTab.loader = async function ({ params }: LoaderFunctionArgs) {
  const { silo } = getSiloSelector(params)
  await apiQueryClient.prefetchQuery('siloIpPoolList', {
    query: { limit: 25 }, // match QueryTable
    path: { silo },
  })
  return null
}

export function SiloIpPoolsTab() {
  const { silo } = useSiloSelector()
  const { Table, Column } = useQueryTable('siloIpPoolList', { path: { silo } })
  return (
    <>
      <Table emptyState={<EmptyState />}>
        <Column accessor="name" cell={linkCell((pool) => pb.ipPool({ pool }))} />
        <Column accessor="description" />
        <Column accessor="isDefault" header="Default" />
      </Table>
    </>
  )
}
