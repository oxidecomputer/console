/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useMemo } from 'react'
import { Link, Outlet, useNavigate, type LoaderFunctionArgs } from 'react-router-dom'

import {
  apiQueryClient,
  useApiMutation,
  useApiQueryClient,
  usePrefetchedApiQuery,
  type FloatingIp,
} from '@oxide/api'
import { DateCell, linkCell, useQueryTable, type MenuAction } from '@oxide/table'
import { buttonStyle, EmptyMessage, Networking24Icon, TableActions } from '@oxide/ui'

import { getProjectSelector, useProjectSelector, useQuickActions } from 'app/hooks'
import { confirmDelete } from 'app/stores/confirm-delete'
import { pb } from 'app/util/path-builder'

const EmptyState = () => (
  <EmptyMessage
    icon={<Networking24Icon />}
    title="No Floating IPs"
    body="You need to create a Floating IP to be able to see it here"
    buttonText="New Floating IP"
    buttonTo={pb.floatingIpNew(useProjectSelector())}
  />
)

// 🐛👀 This isn't actually prefetching the Floating IPs at the moment
FloatingIpsTab.loader = async ({ params }: LoaderFunctionArgs) => {
  await apiQueryClient.prefetchQuery('floatingIpList', {
    query: { ...getProjectSelector(params), limit: 25 },
  })
  return null
}

export function FloatingIpsTab() {
  const queryClient = useApiQueryClient()
  const projectSelector = useProjectSelector()
  const { data: floatingIps } = usePrefetchedApiQuery('floatingIpList', {
    query: { ...projectSelector, limit: 25 }, // to have same params as QueryTable
  })
  const navigate = useNavigate()

  const deleteFloatingIp = useApiMutation('floatingIpDelete', {
    onSuccess() {
      queryClient.invalidateQueries('floatingIpList')
    },
  })

  const makeActions = (floatingIp: FloatingIp): MenuAction[] => [
    {
      label: 'Edit',
      onActivate() {
        navigate(pb.floatingIpEdit({ ...projectSelector, floatingIp: floatingIp.name }), {
          state: floatingIp,
        })
      },
    },
    {
      label: 'Delete',
      onActivate: confirmDelete({
        doDelete: () =>
          deleteFloatingIp.mutateAsync({
            path: { floatingIp: floatingIp.name },
            query: projectSelector,
          }),
        label: floatingIp.name,
      }),
    },
  ]

  useQuickActions(
    useMemo(
      () =>
        floatingIps.items.map((v) => ({
          value: v.name,
          onSelect: () =>
            navigate(pb.floatingIp({ ...projectSelector, floatingIp: v.name })),
          navGroup: 'Go to Floating IP',
        })),
      [projectSelector, floatingIps, navigate]
    )
  )

  const { Table, Column } = useQueryTable('floatingIpList', { query: projectSelector })
  return (
    <>
      <TableActions>
        <Link
          to={pb.floatingIpNew(projectSelector)}
          className={buttonStyle({ size: 'sm' })}
        >
          New FloatingIp
        </Link>
      </TableActions>
      <Table emptyState={<EmptyState />} makeActions={makeActions}>
        <Column
          accessor="name"
          cell={linkCell((floatingIp) => pb.floatingIp({ ...projectSelector, floatingIp }))}
        />
        <Column accessor="description" />
        <Column accessor="timeCreated" header="Created" cell={DateCell} />
      </Table>
      <Outlet />
    </>
  )
}
