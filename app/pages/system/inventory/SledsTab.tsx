/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { apiQueryClient } from '@oxide/api'
import { linkCell, useQueryTable } from '@oxide/table'
import { EmptyMessage, Racks24Icon } from '@oxide/ui'

import { pb } from 'app/util/path-builder'

const EmptyState = () => {
  return (
    <EmptyMessage
      icon={<Racks24Icon />}
      title="Something went wrong"
      body="We expected some racks here, but none were found"
    />
  )
}

SledsTab.loader = async () => {
  await apiQueryClient.prefetchQuery('sledList', {
    query: { limit: 25 },
  })
  return null
}

export function SledsTab() {
  const { Table, Column } = useQueryTable('sledList', {}, { placeholderData: (x) => x })

  return (
    <>
      <Table emptyState={<EmptyState />}>
        <Column accessor="id" cell={linkCell((sledId) => pb.sled({ sledId }))} />
        {/* TODO */}
        {/* <Column accessor="serviceAddress" header="service address" /> */}
        <Column accessor="baseboard.part" header="part number" />
        <Column accessor="baseboard.serial" header="serial number" />
        <Column accessor="baseboard.revision" header="revision" />
      </Table>
    </>
  )
}
