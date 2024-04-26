/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { createColumnHelper } from '@tanstack/react-table'
import { useCallback, useMemo } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import {
  apiQueryClient,
  useApiMutation,
  useApiQuery,
  usePrefetchedApiQuery,
  type IpPool,
} from '@oxide/api'
import { Networking16Icon, Networking24Icon } from '@oxide/design-system/icons/react'

import { ContextualDocsModal } from '~/components/ContextualDocsModal'
import { IpUtilCell } from '~/components/IpPoolUtilization'
import { useQuickActions } from '~/hooks'
import { confirmDelete } from '~/stores/confirm-delete'
import { SkeletonCell } from '~/table/cells/EmptyCell'
import { makeLinkCell } from '~/table/cells/LinkCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { PAGE_SIZE, useQueryTable } from '~/table/QueryTable'
import { CreateLink } from '~/ui/lib/CreateButton'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { TableActions } from '~/ui/lib/Table'
import { docLinks } from '~/util/links'
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
  colHelper.accessor('description', Columns.description),
  colHelper.accessor('name', {
    header: 'Utilization',
    cell: (info) => <UtilizationCell pool={info.getValue()} />,
  }),
  colHelper.accessor('timeCreated', Columns.timeCreated),
]

IpPoolsPage.loader = async function () {
  await apiQueryClient.prefetchQuery('ipPoolList', { query: { limit: PAGE_SIZE } })
  return null
}

export function IpPoolsPage() {
  const navigate = useNavigate()
  const { Table } = useQueryTable('ipPoolList', {})
  const { data: pools } = usePrefetchedApiQuery('ipPoolList', {
    query: { limit: PAGE_SIZE },
  })

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
      <PageHeader>
        <PageTitle icon={<Networking24Icon />}>IP Pools</PageTitle>
        <ContextualDocsModal
          heading="IP Pools"
          icon={<Networking16Icon />}
          summary="IP pools are a collection of IP addresses that can be assigned to VM instances."
          links={[docLinks.systemIpPools]}
        />
      </PageHeader>
      <TableActions>
        <CreateLink to={pb.ipPoolsNew()}>New IP Pool</CreateLink>
      </TableActions>
      <Table columns={columns} emptyState={<EmptyState />} />
      <Outlet />
    </>
  )
}
