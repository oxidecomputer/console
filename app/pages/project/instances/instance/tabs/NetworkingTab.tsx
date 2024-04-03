/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'
import { useCallback, useState } from 'react'
import { type LoaderFunctionArgs } from 'react-router-dom'

import {
  apiQueryClient,
  instanceCan,
  useApiMutation,
  useApiQuery,
  useApiQueryClient,
  usePrefetchedApiQuery,
  type InstanceNetworkInterface,
} from '@oxide/api'
import { Networking24Icon } from '@oxide/design-system/icons/react'

import { CreateNetworkInterfaceForm } from '~/forms/network-interface-create'
import { EditNetworkInterfaceForm } from '~/forms/network-interface-edit'
import {
  getInstanceSelector,
  useInstanceSelector,
  useProjectSelector,
  useToast,
} from '~/hooks'
import { confirmDelete } from '~/stores/confirm-delete'
import { SkeletonCell } from '~/table/cells/EmptyCell'
import { LinkCell } from '~/table/cells/LinkCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { Badge } from '~/ui/lib/Badge'
import { Button } from '~/ui/lib/Button'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { pb } from '~/util/path-builder'

import { fancifyStates } from './common'

const VpcNameFromId = ({ value }: { value: string }) => {
  const projectSelector = useProjectSelector()
  const { data: vpc, isError } = useApiQuery(
    'vpcView',
    { path: { vpc: value } },
    { throwOnError: false }
  )

  // If we can't find it, it must have been deleted. This is probably not
  // possible because you can't delete a VPC that has child resources, but let's
  // be safe
  if (isError) return <Badge color="neutral">Deleted</Badge>
  if (!vpc) return <SkeletonCell />
  return <LinkCell to={pb.vpc({ ...projectSelector, vpc: vpc.name })}>{vpc.name}</LinkCell>
}

const SubnetNameFromId = ({ value }: { value: string }) => {
  const { data: subnet, isError } = useApiQuery(
    'vpcSubnetView',
    { path: { subnet: value } },
    { throwOnError: false }
  )

  // same deal as VPC: probably not possible but let's be safe
  if (isError) return <Badge color="neutral">Deleted</Badge>
  if (!subnet) return <SkeletonCell /> // loading

  return <span className="text-secondary">{subnet.name}</span>
}

NetworkingTab.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project, instance } = getInstanceSelector(params)
  await Promise.all([
    apiQueryClient.prefetchQuery('instanceNetworkInterfaceList', {
      query: { project, instance, limit: 25 },
    }),
    // This is covered by the InstancePage loader but there's no downside to
    // being redundant. If it were removed there, we'd still want it here.
    apiQueryClient.prefetchQuery('instanceView', {
      path: { instance },
      query: { project },
    }),
  ])
  return null
}

const colHelper = createColumnHelper<InstanceNetworkInterface>()
const staticCols = [
  colHelper.accessor((i) => ({ name: i.name, primary: i.primary }), {
    header: 'name',
    cell: (info) => (
      <>
        <span>{info.getValue().name}</span>
        {info.getValue().primary ? <Badge className="ml-2">primary</Badge> : null}
      </>
    ),
  }),
  Columns.description,
  colHelper.accessor('ip', {}),
  colHelper.accessor('vpcId', {
    header: 'vpc',
    cell: (info) => <VpcNameFromId value={info.getValue()} />,
  }),
  colHelper.accessor('subnetId', {
    header: 'subnet',
    cell: (info) => <SubnetNameFromId value={info.getValue()} />,
  }),
]

const updateNicStates = fancifyStates(instanceCan.updateNic.states)

export function NetworkingTab() {
  const instanceSelector = useInstanceSelector()

  const queryClient = useApiQueryClient()
  const addToast = useToast()

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editing, setEditing] = useState<InstanceNetworkInterface | null>(null)

  const createNic = useApiMutation('instanceNetworkInterfaceCreate', {
    onSuccess() {
      queryClient.invalidateQueries('instanceNetworkInterfaceList')
      setCreateModalOpen(false)
    },
  })

  const deleteNic = useApiMutation('instanceNetworkInterfaceDelete', {
    onSuccess() {
      queryClient.invalidateQueries('instanceNetworkInterfaceList')
      addToast({ content: 'Network interface deleted' })
    },
  })

  const editNic = useApiMutation('instanceNetworkInterfaceUpdate', {
    onSuccess() {
      queryClient.invalidateQueries('instanceNetworkInterfaceList')
    },
  })

  const { data: instance } = usePrefetchedApiQuery('instanceView', {
    path: { instance: instanceSelector.instance },
    query: { project: instanceSelector.project },
  })
  const canUpdateNic = instanceCan.updateNic(instance)

  const makeActions = useCallback(
    (nic: InstanceNetworkInterface): MenuAction[] => [
      {
        label: 'Make primary',
        onActivate() {
          editNic.mutate({
            path: { interface: nic.name },
            query: instanceSelector,
            body: { ...nic, primary: true },
          })
        },
        disabled: nic.primary
          ? 'This network interface is already set as primary'
          : !canUpdateNic && (
              <>
                The instance must be {updateNicStates} to change its primary network
                interface
              </>
            ),
      },
      {
        label: 'Edit',
        onActivate() {
          setEditing(nic)
        },
        disabled: !canUpdateNic && (
          <>
            The instance must be {updateNicStates} before editing a network interface&apos;s
            settings
          </>
        ),
      },
      {
        label: 'Delete',
        onActivate: confirmDelete({
          doDelete: () =>
            deleteNic.mutateAsync({
              path: { interface: nic.name },
              query: instanceSelector,
            }),
          label: nic.name,
        }),
        disabled: !canUpdateNic && (
          <>The instance must be {updateNicStates} to delete a network interface</>
        ),
      },
    ],
    [canUpdateNic, deleteNic, editNic, instanceSelector]
  )

  const emptyState = (
    <EmptyMessage
      icon={<Networking24Icon />}
      title="No network interfaces"
      body="You need to create a network interface to be able to see it here"
    />
  )

  const { Table } = useQueryTable('instanceNetworkInterfaceList', {
    query: instanceSelector,
  })

  const columns = useColsWithActions(staticCols, makeActions)

  return (
    <>
      <h2 id="nic-label" className="mb-4 text-mono-sm text-secondary">
        Network Interfaces
      </h2>
      <Table labeled-by="nic-label" columns={columns} emptyState={emptyState} />
      <div className="mt-4 flex flex-col gap-3">
        <div className="flex gap-3">
          <Button
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            disabled={!canUpdateNic}
            disabledReason={
              <>Can only create network interface when instance is {updateNicStates}</>
            }
          >
            Add network interface
          </Button>
        </div>
        {!canUpdateNic && (
          <span className="max-w-xs text-sans-md text-tertiary">
            A network interface cannot be created or edited unless the instance is{' '}
            {updateNicStates}.
          </span>
        )}
      </div>

      {createModalOpen && (
        <CreateNetworkInterfaceForm
          onDismiss={() => setCreateModalOpen(false)}
          onSubmit={(body) => createNic.mutate({ query: instanceSelector, body })}
          submitError={createNic.error}
        />
      )}
      {editing && (
        <EditNetworkInterfaceForm editing={editing} onDismiss={() => setEditing(null)} />
      )}
    </>
  )
}
