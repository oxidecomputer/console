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
import { linkCell, useQueryTable, type MenuAction } from '@oxide/table'
import { buttonStyle, EmptyMessage, Networking24Icon } from '@oxide/ui'

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

FloatingIpsTab.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project } = getProjectSelector(params)
  await Promise.all([
    apiQueryClient.prefetchQuery('floatingIpList', {
      query: { project, limit: 25 },
    }),
    apiQueryClient.prefetchQuery('instanceList', {
      query: { project },
    }),
  ])
  return null
}

export function FloatingIpsTab() {
  const queryClient = useApiQueryClient()
  const { project } = useProjectSelector()
  const { data: floatingIps } = usePrefetchedApiQuery('floatingIpList', {
    query: { project, limit: 25 }, // to have same params as QueryTable
  })
  const { data: instances } = usePrefetchedApiQuery('instanceList', {
    query: { project },
  })
  const navigate = useNavigate()

  const deleteFloatingIp = useApiMutation('floatingIpDelete', {
    onSuccess() {
      queryClient.invalidateQueries('floatingIpList')
    },
  })

  const makeActions = (floatingIp: FloatingIp): MenuAction[] => {
    const isAttachedToAnInstance = !!floatingIp.instanceId
    return [
      {
        label: 'Edit',
        onActivate() {
          navigate(pb.floatingIpEdit({ project, floatingIp: floatingIp.name }), {
            state: floatingIp,
          })
        },
      },
      {
        label: 'Attach',
        // this should be available even if the floating IP is already attached
        onActivate() {
          // Open a modal to attach the floating IP to an instance
        },
      },
      {
        label: 'Detach',
        disabled: isAttachedToAnInstance
          ? false
          : 'This floating IP is not attached to an instance',
        onActivate() {
          // Open a modal to attach the floating IP to an instance
        },
      },
      {
        label: 'Delete',
        // Only available if the floating IP is not attached
        disabled: isAttachedToAnInstance
          ? 'This floating IP must be detached from the instance before it can be deleted'
          : false,
        onActivate: confirmDelete({
          doDelete: () =>
            deleteFloatingIp.mutateAsync({
              path: { floatingIp: floatingIp.name },
              query: { project },
            }),
          label: floatingIp.name,
        }),
      },
    ]
  }

  useQuickActions(
    useMemo(
      () =>
        floatingIps.items.map((v) => ({
          value: v.name,
          onSelect: () => navigate(pb.floatingIp({ project, floatingIp: v.name })),
          navGroup: 'Go to Floating IP',
        })),
      [project, floatingIps, navigate]
    )
  )
  const getInstanceName = (instanceId: string) =>
    instances.items.find((i) => i.id === instanceId)?.name

  const { Table, Column } = useQueryTable('floatingIpList', { query: { project } })
  return (
    <>
      <div className="mb-3 flex justify-end space-x-2">
        <Link to={pb.floatingIpNew({ project })} className={buttonStyle({ size: 'sm' })}>
          New Floating IP
        </Link>
      </div>
      <Table emptyState={<EmptyState />} makeActions={makeActions}>
        <Column
          accessor="name"
          cell={linkCell((floatingIp) => pb.floatingIp({ project, floatingIp }))}
        />
        <Column accessor="description" />
        <Column accessor="ip" />
        <Column
          accessor="instanceId"
          header="Attached Instance"
          cell={({ value: instanceId }) => getInstanceName(instanceId)}
        />
      </Table>
      <Outlet />
    </>
  )
}
