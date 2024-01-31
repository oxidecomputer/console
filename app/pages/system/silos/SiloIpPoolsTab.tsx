/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useMemo } from 'react'

import { useApiMutation, useApiQuery, useApiQueryClient, type SiloIpPool } from '@oxide/api'
import { linkCell, useQueryTable, type MenuAction } from '@oxide/table'
import { Badge, EmptyMessage, Networking24Icon, Success12Icon } from '@oxide/ui'

import { HL } from 'app/components/HL'
import { useSiloSelector } from 'app/hooks'
import { confirmAction } from 'app/stores/confirm-action'
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

  // Fetch 1000 to we can be sure to get them all. There should only be a few
  // anyway. Not prefetched because the prefetched one only gets 25 to match the
  // query table. This req is better to do async because they can't click make
  // default that fast anyway.
  const { data: allPools } = useApiQuery('siloIpPoolList', {
    path: { silo },
    query: { limit: 1000 },
  })

  // used in change default confirm modal
  const defaultPool = useMemo(
    () => (allPools ? allPools.items.find((p) => p.isDefault)?.name : undefined),
    [allPools]
  )

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

  // this is all very extra. I'm sorry. it's for the users
  const makeActions = (pool: SiloIpPool): MenuAction[] => [
    {
      label: pool.isDefault ? 'Clear default' : 'Make default',
      onActivate() {
        if (pool.isDefault) {
          confirmAction({
            doAction: () =>
              updatePoolLink.mutateAsync({
                path: { silo, pool: pool.id },
                body: { isDefault: false },
              }),
            modalTitle: 'Confirm clear default',
            modalContent: (
              <p>
                Are you sure you want to clear the default pool? If there is no default,
                users in this silo will have to specify a pool when allocating IPs.
              </p>
            ),
            errorTitle: 'Could not clear default',
          })
        } else {
          const modalContent = defaultPool ? (
            <p>
              Are you sure you want to change the default pool from <HL>{defaultPool}</HL>{' '}
              to <HL>{pool.name}</HL>?
            </p>
          ) : (
            <p>
              Are you sure you want to make <HL>{pool.name}</HL> the default pool for this
              silo?
            </p>
          )
          const verb = defaultPool ? 'change' : 'make'
          confirmAction({
            doAction: () =>
              updatePoolLink.mutateAsync({
                path: { silo, pool: pool.id },
                body: { isDefault: true },
              }),
            modalTitle: `Confirm ${verb} default`,
            modalContent,
            errorTitle: `Could not ${verb} default`,
          })
        }
      },
    },
    {
      label: 'Unlink',
      onActivate() {
        confirmAction({
          doAction: () => unlinkPool.mutateAsync({ path: { silo, pool: pool.id } }),
          modalTitle: `Confirm unlink pool`,
          modalContent: (
            <p>
              Are you sure you want to unlink <HL>{pool.name}</HL>? Users in this silo will
              no longer be able to allocate IPs from this pool.
            </p>
          ),
          errorTitle: `Could not unlink pool`,
        })
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
