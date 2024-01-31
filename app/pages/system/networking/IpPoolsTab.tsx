/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { Link, Outlet, useNavigate } from 'react-router-dom'

import { apiQueryClient, useApiMutation, type IpPool } from '@oxide/api'
import { DateCell, linkCell, useQueryTable, type MenuAction } from '@oxide/table'
import { buttonStyle, EmptyMessage, Networking24Icon } from '@oxide/ui'

import { confirmDelete } from 'app/stores/confirm-delete'
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

IpPoolsTab.loader = async function () {
  await apiQueryClient.prefetchQuery('ipPoolList', { query: { limit: 25 } })
  return null
}

export function IpPoolsTab() {
  const navigate = useNavigate()
  const { Table, Column } = useQueryTable('ipPoolList', {})

  const deletePool = useApiMutation('ipPoolDelete', {
    onSuccess() {
      apiQueryClient.invalidateQueries('ipPoolList')
    },
  })

  const makeActions = (pool: IpPool): MenuAction[] => [
    {
      label: 'Edit',
      onActivate: () => {
        // the edit view has its own loader, but we can make the modal open
        // instantaneously by preloading the fetch result
        apiQueryClient.setQueryData('ipPoolView', { path: { pool: pool.name } }, pool)
        navigate(pb.ipPoolEdit({ pool: pool.name }))
      },
    },
    {
      label: 'Delete',
      onActivate: confirmDelete({
        doDelete: () => deletePool.mutateAsync({ path: { pool: pool.name } }),
        label: pool.name,
      }),
    },
  ]

  return (
    <>
      <div className="mb-3 flex justify-end space-x-2">
        <Link to={pb.ipPoolNew()} className={buttonStyle({ size: 'sm' })}>
          New IP Pool
        </Link>
      </div>
      <Table emptyState={<EmptyState />} makeActions={makeActions}>
        <Column accessor="name" cell={linkCell((pool) => pb.ipPool({ pool }))} />
        <Column accessor="description" />
        <Column accessor="timeCreated" header="Created" cell={DateCell} />
      </Table>
      <Outlet />
    </>
  )
}
