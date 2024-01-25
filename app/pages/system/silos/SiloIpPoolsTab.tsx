/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { type LoaderFunctionArgs } from 'react-router-dom'

import {
  apiQueryClient,
  useApiMutation,
  useApiQueryClient,
  type SiloIpPool,
} from '@oxide/api'
import { BooleanCell, linkCell, useQueryTable, type MenuAction } from '@oxide/table'
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
  const queryClient = useApiQueryClient()

  const updatePoolLink = useApiMutation('ipPoolSiloUpdate', {
    onSuccess() {
      queryClient.invalidateQueries('siloIpPoolList')
    },
  })

  const makeActions = (pool: SiloIpPool): MenuAction[] => [
    {
      label: pool.isDefault ? 'Clear default' : 'Make default',
      onActivate() {
        // TODO: confirm these actions. message should explain that making
        // default clears the other one from being default
        updatePoolLink.mutate({
          path: { silo, pool: pool.id },
          body: { isDefault: !pool.isDefault },
        })
      },
    },
  ]
  return (
    <>
      <Table emptyState={<EmptyState />} makeActions={makeActions}>
        <Column accessor="name" cell={linkCell((pool) => pb.ipPool({ pool }))} />
        <Column accessor="description" />
        <Column
          accessor="isDefault"
          header="Default"
          // ternary means show nothing when it's false rather than yellow circle
          cell={({ value }) => (value ? <BooleanCell value={value} /> : null)}
        />
      </Table>
    </>
  )
}
