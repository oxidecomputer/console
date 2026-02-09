/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useQuery } from '@tanstack/react-query'
import { createColumnHelper } from '@tanstack/react-table'
import { useCallback, useMemo } from 'react'
import { Outlet, useNavigate } from 'react-router'

import { api, getListQFn, q, queryClient, useApiMutation, type IpPool } from '@oxide/api'
import { IpGlobal16Icon, IpGlobal24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { DocsPopover } from '~/components/DocsPopover'
import { HL } from '~/components/HL'
import { IpVersionBadge } from '~/components/IpVersionBadge'
import { useQuickActions } from '~/hooks/use-quick-actions'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { SkeletonCell } from '~/table/cells/EmptyCell'
import { makeLinkCell } from '~/table/cells/LinkCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { BigNum } from '~/ui/lib/BigNum'
import { CreateLink } from '~/ui/lib/CreateButton'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { TableActions } from '~/ui/lib/Table'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'

const EmptyState = () => (
  <EmptyMessage
    icon={<IpGlobal24Icon />}
    title="No IP pools"
    body="Create an IP pool to see it here"
    buttonText="New IP pool"
    buttonTo={pb.ipPoolsNew()}
  />
)

function UtilizationCell({ pool }: { pool: string }) {
  const { data } = useQuery(q(api.systemIpPoolUtilizationView, { path: { pool } }))
  if (!data) return <SkeletonCell />
  return (
    <div>
      <BigNum className="text-raise" num={data.remaining} /> /{' '}
      <BigNum className="text-secondary" num={data.capacity} />
    </div>
  )
}

const colHelper = createColumnHelper<IpPool>()

const staticColumns = [
  colHelper.accessor('name', { cell: makeLinkCell((pool) => pb.ipPool({ pool })) }),
  colHelper.accessor('description', Columns.description),
  colHelper.accessor('ipVersion', {
    header: 'Version',
    cell: (info) => <IpVersionBadge ipVersion={info.getValue()} />,
  }),
  colHelper.accessor('poolType', {
    header: 'Type',
    cell: (info) => <Badge color="neutral">{info.getValue()}</Badge>,
  }),
  colHelper.display({
    header: 'IPs REMAINING',
    meta: { thClassName: 'normal-case' },
    cell: (info) => <UtilizationCell pool={info.row.original.name} />,
  }),
  colHelper.accessor('timeCreated', Columns.timeCreated),
]

const ipPoolList = getListQFn(api.systemIpPoolList, {})

export async function clientLoader() {
  await queryClient.prefetchQuery(ipPoolList.optionsFn())
  return null
}

export const handle = { crumb: 'IP Pools' }

export default function IpPoolsPage() {
  const navigate = useNavigate()

  const { mutateAsync: deletePool } = useApiMutation(api.systemIpPoolDelete, {
    onSuccess(_data, variables) {
      queryClient.invalidateEndpoint('systemIpPoolList')
      // prettier-ignore
      addToast(<>Pool <HL>{variables.path.pool}</HL> deleted</>)
    },
  })

  const makeActions = useCallback(
    (pool: IpPool): MenuAction[] => [
      {
        label: 'Edit',
        onActivate: () => {
          // the edit view has its own loader, but we can make the modal open
          // instantaneously by preloading the fetch result
          const ipPoolView = q(api.systemIpPoolView, { path: { pool: pool.name } })
          queryClient.setQueryData(ipPoolView.queryKey, pool)
          navigate(pb.ipPoolEdit({ pool: pool.name }))
        },
      },
      {
        label: 'Delete',
        onActivate: confirmDelete({
          doDelete: () => deletePool({ path: { pool: pool.name } }),
          label: pool.name,
        }),
      },
    ],
    [deletePool, navigate]
  )

  const columns = useColsWithActions(staticColumns, makeActions)
  const { table, query } = useQueryTable({
    query: ipPoolList,
    columns,
    // turn this back on if we expect to see IPv6 ranges regularly
    // rowHeight: 'large',
    emptyState: <EmptyState />,
  })
  const { data: pools } = query

  useQuickActions(
    useMemo(
      () => [
        {
          value: 'New IP pool',
          onSelect: () => navigate(pb.projectsNew()),
        },
        ...(pools?.items || []).map((p) => ({
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
      <PageHeader>
        <PageTitle icon={<IpGlobal24Icon />}>IP Pools</PageTitle>
        <DocsPopover
          heading="IP pools"
          icon={<IpGlobal16Icon />}
          summary="IP pools are collections of external IPs you can assign to silos. When a pool is linked to a silo, users in that silo can allocate IPs from the pool for their instances."
          links={[docLinks.systemIpPools]}
        />
      </PageHeader>
      <TableActions>
        <CreateLink to={pb.ipPoolsNew()}>New IP Pool</CreateLink>
      </TableActions>
      {table}
      <Outlet />
    </>
  )
}
