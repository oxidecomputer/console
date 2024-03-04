/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { apiQueryClient } from '@oxide/api'
import { Racks24Icon } from '@oxide/design-system/icons/react'

import { useQueryTable } from '~/table/QueryTable'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'

const EmptyState = () => {
  return (
    <EmptyMessage
      icon={<Racks24Icon />}
      title="Something went wrong"
      body="We expected some racks here, but none were found"
    />
  )
}

RacksTab.loader = async () => {
  await apiQueryClient.prefetchQuery('rackList', {
    query: { limit: 25 },
  })
  return null
}

export function RacksTab() {
  const { Table, Column } = useQueryTable('rackList', {})

  return (
    <>
      <Table emptyState={<EmptyState />}>
        <Column accessor="id" />
      </Table>
    </>
  )
}
