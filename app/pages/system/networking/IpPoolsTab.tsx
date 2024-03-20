/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useMemo } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'

import {
  apiQueryClient,
  useApiMutation,
  useApiQuery,
  usePrefetchedApiQuery,
  type IpPool,
} from '@oxide/api'
import { Networking24Icon } from '@oxide/design-system/icons/react'

import { useQuickActions } from '~/hooks'
import { confirmDelete } from '~/stores/confirm-delete'
import { DateCell } from '~/table/cells/DateCell'
import { SkeletonCell } from '~/table/cells/EmptyCell'
import { linkCell } from '~/table/cells/LinkCell'
import type { MenuAction } from '~/table/columns/action-col'
import { useQueryTable } from '~/table/QueryTable'
import { Badge } from '~/ui/lib/Badge'
import { BigNum } from '~/ui/lib/BigNum'
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

const IpUtilFrac = (props: { allocated: number | bigint; capacity: number | bigint }) => (
  <>
    <BigNum className="text-default" num={props.allocated} /> /{' '}
    <BigNum className="text-tertiary" num={props.capacity} />
  </>
)

function IpPoolUtilizationCell({ pool }: { pool: string }) {
  const { data } = useApiQuery('ipPoolUtilizationView', { path: { pool } })

  if (!data) return <SkeletonCell />

  const { ipv4 } = data
  const ipv6 = {
    allocated: BigInt(data.ipv6.allocated),
    capacity: BigInt(data.ipv6.capacity),
  }

  if (ipv6.capacity === 0n) {
    return (
      <div className="space-y-1">
        <IpUtilFrac {...ipv4} />
      </div>
    )
  }

  // the API doesn't let you add IPv6 ranges, but there's a remote possibility
  // a pool already exists with IPv6 ranges, so we might as well show that. also
  // this is nice for e2e testing the utilization logic
  return (
    <div className="space-y-1">
      <div>
        <Badge color="neutral" className="mr-2 !normal-case">
          v4
        </Badge>
        <IpUtilFrac {...ipv4} />
      </div>
      <div>
        <Badge color="neutral" className="mr-2 !normal-case">
          v6
        </Badge>
        <IpUtilFrac {...ipv6} />
      </div>
    </div>
  )
}

IpPoolsTab.loader = async function () {
  await apiQueryClient.prefetchQuery('ipPoolList', { query: { limit: 25 } })
  return null
}

export function IpPoolsTab() {
  const navigate = useNavigate()
  const { Table, Column } = useQueryTable('ipPoolList', {})
  const { data: pools } = usePrefetchedApiQuery('ipPoolList', { query: { limit: 25 } })

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
      <Table emptyState={<EmptyState />} makeActions={makeActions}>
        <Column accessor="name" cell={linkCell((pool) => pb.ipPool({ pool }))} />
        <Column accessor="description" />
        <Column
          accessor="name"
          id="Utilization"
          header="Utilization"
          cell={({ value }) => <IpPoolUtilizationCell pool={value} />}
        />
        <Column accessor="timeCreated" header="Created" cell={DateCell} />
      </Table>
      <Outlet />
    </>
  )
}
