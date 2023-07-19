/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { TypeValueCell, useQueryTable } from '@oxide/table'
import { EmptyMessage } from '@oxide/ui'

import { useVpcSelector } from 'app/hooks'

const EmptyState = () => (
  <EmptyMessage
    title="No system routes"
    body="You need to create a system route to be able to see it here"
    // buttonText="New system route"
    // onClick={() => {}}
  />
)

export const VpcSystemRoutesTab = () => {
  const vpcSelector = useVpcSelector()
  const { Table, Column } = useQueryTable('vpcRouterRouteList', {
    query: { ...vpcSelector, router: 'system' },
  })

  return (
    <Table emptyState={<EmptyState />}>
      <Column accessor="name" />
      <Column accessor="destination" cell={TypeValueCell} />
      <Column accessor="target" cell={TypeValueCell} />
      <Column accessor="description" />
    </Table>
  )
}
