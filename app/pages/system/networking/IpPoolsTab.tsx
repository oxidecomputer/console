/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { createColumnHelper } from '@tanstack/react-table'
import { useCallback, useMemo } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'

import {
  apiQueryClient,
  useApiMutation,
  useApiQuery,
  usePrefetchedApiQuery,
  type IpPool,
} from '@oxide/api'
import { Networking24Icon } from '@oxide/design-system/icons/react'

import { IpUtilCell } from '~/components/IpPoolUtilization'
import { useQuickActions } from '~/hooks'
import { confirmDelete } from '~/stores/confirm-delete'
import { DateCell } from '~/table/cells/DateCell'
import { SkeletonCell } from '~/table/cells/EmptyCell'
import { makeLinkCell } from '~/table/cells/LinkCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { useQueryTable } from '~/table/QueryTable'
import { buttonStyle } from '~/ui/lib/Button'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { pb } from '~/util/path-builder'

const EmptyState = () => (
  <EmptyMessage
    icon={<Networking24Icon />}
    title="No IP pools"
    body="You need to create an IP pool to be able to see it here"
    buttonText="New IP pool"
    buttonTo={pb.ipPoolsNew()}
  />
)

function UtilizationCell({ pool }: { pool: string }) {
  const { data } = useApiQuery('ipPoolUtilizationView', { path: { pool } })

  if (!data) return <SkeletonCell />
  return <IpUtilCell {...data} />
}

const colHelper = createColumnHelper<IpPool>()

const staticColumns = [
  colHelper.accessor('name', { cell: makeLinkCell((pool) => pb.ipPool({ pool })) }),
  colHelper.accessor('description', {}),
  colHelper.accessor('name', {
    header: 'Utilization',
    cell: (info) => <UtilizationCell pool={info.getValue()} />,
  }),
  colHelper.accessor('timeCreated', {
    header: 'Created',
    cell: (info) => <DateCell value={info.getValue()} />,
  }),
]

IpPoolsTab.loader = async function () {
  await apiQueryClient.prefetchQuery('ipPoolList', { query: { limit: 25 } })
  return null
}

export function IpPoolsTab() {
  const navigate = useNavigate()
  const { Table } = useQueryTable('ipPoolList', {})
  const { data: pools } = usePrefetchedApiQuery('ipPoolList', { query: { limit: 25 } })

  const deletePool = useApiMutation('ipPoolDelete', {
    onSuccess() {
      apiQueryClient.invalidateQueries('ipPoolList')
    },
  })

  const makeActions = useCallback(
    (pool: IpPool): MenuAction[] => [
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
    ],
    [deletePool, navigate]
  )

  const columns = useColsWithActions(staticColumns, makeActions)

  useQuickActions(
    useMemo(
      () => [
        {
          value: 'New IP pool',
          onSelect: () => navigate(pb.projectsNew()),
        },
        ...(pools.items || []).map((p) => ({
          value: p.name,
          onSelect: () => navigate(pb.ipPool({ pool: p.name })),
          navGroup: 'Go to IP pool',
        })),
      ],
      [navigate, pools]
    )
  )

  return (
    <>
      <div className="mb-3 flex justify-end space-x-2">
        <Link to={pb.ipPoolsNew()} className={buttonStyle({ size: 'sm' })}>
          New IP Pool
        </Link>
      </div>
      <Table columns={columns} emptyState={<EmptyState />} />
      <Outlet />
    </>
  )
}
