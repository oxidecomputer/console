/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { apiQueryClient } from '@oxide/api'
import { linkCell, useQueryTable } from '@oxide/table'
import { EmptyMessage, Networking24Icon } from '@oxide/ui'

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

SiloIpPoolsTab.loader = async function () {
  // todo: scope to silo
  // Use ipPoolSiloList?
  await apiQueryClient.prefetchQuery('siloIpPoolsList', {
    query: { limit: 10 },
  })
  return null
}

export function SiloIpPoolsTab() {
  const { Table, Column } = useQueryTable('siloIpPoolsList', {})
  return (
    <>
      <Table emptyState={<EmptyState />}>
        <Column accessor="name" cell={linkCell((pool) => pb.ipPool({ pool }))} />
        <Column accessor="description" />
        {/* <Column accessor="isDefault" /> */}
      </Table>
    </>
  )
}
