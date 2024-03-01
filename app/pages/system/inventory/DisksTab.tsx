/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { apiQueryClient } from '@oxide/api'
import { Racks24Icon } from '@oxide/ui'

import { LabelCell } from '~/table/cells/LabelCell'
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

DisksTab.loader = async () => {
  await apiQueryClient.prefetchQuery('physicalDiskList', { query: { limit: 25 } })
  return null
}

export function DisksTab() {
  const { Table, Column } = useQueryTable('physicalDiskList', {})

  return (
    <>
      <Table emptyState={<EmptyState />}>
        <Column accessor="id" />
        <Column
          id="form-factor"
          accessor={(d) => (d.formFactor === 'u2' ? 'U.2' : 'M.2')}
          header="Form factor"
          cell={LabelCell}
        />
        <Column accessor="model" header="model number" />
        <Column accessor="serial" header="serial number" />
      </Table>
    </>
  )
}
