/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useQuery } from '@tanstack/react-query'
import { createColumnHelper } from '@tanstack/react-table'
import { useCallback } from 'react'
import { Outlet, useNavigate } from 'react-router'

import {
  api,
  getListQFn,
  q,
  queryClient,
  useApiMutation,
  type SubnetPool,
} from '@oxide/api'
import { Subnet16Icon, Subnet24Icon } from '@oxide/design-system/icons/react'

import { DocsPopover } from '~/components/DocsPopover'
import { HL } from '~/components/HL'
import { IpVersionBadge } from '~/components/IpVersionBadge'
import { useQuickActions } from '~/hooks/use-quick-actions'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { makeLinkCell } from '~/table/cells/LinkCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { CreateLink } from '~/ui/lib/CreateButton'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { TableActions } from '~/ui/lib/Table'
import { ALL_ISH } from '~/util/consts'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'

const EmptyState = () => (
  <EmptyMessage
    icon={<Subnet24Icon />}
    title="No subnet pools"
    body="Create a subnet pool to see it here"
    buttonText="New subnet pool"
    buttonTo={pb.subnetPoolsNew()}
  />
)

const colHelper = createColumnHelper<SubnetPool>()

// TODO: add utilization column once Nexus endpoint is implemented
// https://github.com/oxidecomputer/omicron/issues/10109
const staticColumns = [
  colHelper.accessor('name', {
    cell: makeLinkCell((pool) => pb.subnetPool({ subnetPool: pool })),
  }),
  colHelper.accessor('description', Columns.description),
  colHelper.accessor('ipVersion', {
    header: 'Version',
    cell: (info) => <IpVersionBadge ipVersion={info.getValue()} />,
  }),
  colHelper.accessor('timeCreated', Columns.timeCreated),
]

const subnetPoolList = getListQFn(api.systemSubnetPoolList, {})

export async function clientLoader() {
  await queryClient.prefetchQuery(subnetPoolList.optionsFn())
  return null
}

export const handle = { crumb: 'Subnet Pools' }

export default function SubnetPoolsPage() {
  const navigate = useNavigate()

  const { mutateAsync: deletePool } = useApiMutation(api.systemSubnetPoolDelete, {
    onSuccess(_data, variables) {
      queryClient.invalidateEndpoint('systemSubnetPoolList')
      // prettier-ignore
      addToast(<>Subnet pool <HL>{variables.path.pool}</HL> deleted</>)
    },
  })

  const makeActions = useCallback(
    (pool: SubnetPool): MenuAction[] => [
      {
        label: 'Edit',
        onActivate: () => {
          const poolView = q(api.systemSubnetPoolView, {
            path: { pool: pool.name },
          })
          queryClient.setQueryData(poolView.queryKey, pool)
          navigate(pb.subnetPoolEdit({ subnetPool: pool.name }))
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
  const { table } = useQueryTable({
    query: subnetPoolList,
    columns,
    emptyState: <EmptyState />,
  })

  const { data: allPools } = useQuery(
    q(api.systemSubnetPoolList, { query: { limit: ALL_ISH } })
  )

  useQuickActions(
    () => [
      {
        value: 'New subnet pool',
        navGroup: 'Actions',
        action: pb.subnetPoolsNew(),
      },
      ...(allPools?.items || []).map((p) => ({
        value: p.name,
        action: pb.subnetPool({ subnetPool: p.name }),
        navGroup: 'Go to subnet pool',
      })),
    ],
    [allPools]
  )

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Subnet24Icon />}>Subnet Pools</PageTitle>
        <DocsPopover
          heading="Subnet pools"
          icon={<Subnet16Icon />}
          summary="Subnet pools are collections of IP subnets you can assign to silos. When a pool is linked to a silo, users in that silo can allocate external subnets from the pool."
          links={[docLinks.subnetPools]}
        />
      </PageHeader>
      <TableActions>
        <CreateLink to={pb.subnetPoolsNew()}>New Subnet Pool</CreateLink>
      </TableActions>
      {table}
      <Outlet />
    </>
  )
}
