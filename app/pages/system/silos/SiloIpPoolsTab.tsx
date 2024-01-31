/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useApiMutation, useApiQueryClient, type SiloIpPool } from '@oxide/api'
import { linkCell, useQueryTable, type MenuAction } from '@oxide/table'
import { Badge, EmptyMessage, Networking24Icon, Success12Icon } from '@oxide/ui'

import { useSiloSelector } from 'app/hooks'
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

export function SiloIpPoolsTab() {
  const { silo } = useSiloSelector()
  const { Table, Column } = useQueryTable('siloIpPoolList', { path: { silo } })
  const queryClient = useApiQueryClient()

  const updatePoolLink = useApiMutation('ipPoolSiloUpdate', {
    onSuccess() {
      queryClient.invalidateQueries('siloIpPoolList')
    },
  })
  const unlinkPool = useApiMutation('ipPoolSiloUnlink', {
    onSuccess() {
      queryClient.invalidateQueries('siloIpPoolList')
    },
  })

  // TODO: confirm both actions. explain that make default clears existing default
  const makeActions = (pool: SiloIpPool): MenuAction[] => [
    {
      label: pool.isDefault ? 'Clear default' : 'Make default',
      onActivate() {
        updatePoolLink.mutate({
          path: { silo, pool: pool.id },
          body: { isDefault: !pool.isDefault },
        })
      },
    },
    {
      label: 'Unlink',
      onActivate() {
        unlinkPool.mutate({ path: { silo, pool: pool.id } })
      },
    },
  ]

  return (
    <>
      <p className="mb-8 max-w-2xl text-sans-md text-secondary">
        Users in this silo can allocate external IPs from these pools for their instances. A
        silo can have at most one default pool. IPs are allocated from the default pool when
        users ask for one without specifying a pool.
      </p>
      <Table emptyState={<EmptyState />} makeActions={makeActions}>
        <Column accessor="name" cell={linkCell((pool) => pb.ipPool({ pool }))} />
        <Column accessor="description" />
        <Column
          accessor="isDefault"
          header="Default"
          cell={({ value }) =>
            value && (
              <>
                <Success12Icon className="mr-1 text-accent" />
                <Badge>default</Badge>
              </>
            )
          }
        />
      </Table>
    </>
  )
}
