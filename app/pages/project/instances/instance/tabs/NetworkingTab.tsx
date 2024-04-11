/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useCallback, useMemo, useState } from 'react'
import { type LoaderFunctionArgs } from 'react-router-dom'

import {
  apiQueryClient,
  instanceCan,
  useApiMutation,
  useApiQuery,
  useApiQueryClient,
  usePrefetchedApiQuery,
  type ExternalIp,
  type InstanceNetworkInterface,
} from '@oxide/api'
import { Networking24Icon } from '@oxide/design-system/icons/react'

import { HL } from '~/components/HL'
import { CreateNetworkInterfaceForm } from '~/forms/network-interface-create'
import { EditNetworkInterfaceForm } from '~/forms/network-interface-edit'
import { getInstanceSelector, useInstanceSelector, useProjectSelector } from '~/hooks'
import { AttachFloatingIpModal } from '~/pages/project/floating-ips/AttachFloatingIpModal'
import { confirmAction } from '~/stores/confirm-action'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { EmptyCell, SkeletonCell } from '~/table/cells/EmptyCell'
import { LinkCell } from '~/table/cells/LinkCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns, DescriptionCell } from '~/table/columns/common'
import { Table } from '~/table/Table'
import { Badge } from '~/ui/lib/Badge'
import { Button } from '~/ui/lib/Button'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { TableControls, TableEmptyBox, TableTitle } from '~/ui/lib/Table'
import { pb } from '~/util/path-builder'

import { fancifyStates } from './common'

const VpcNameFromId = ({ value }: { value: string }) => {
  const { project } = useProjectSelector()
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
  return <LinkCell to={pb.vpc({ project, vpc: vpc.name })}>{vpc.name}</LinkCell>
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
      // we want this to cover all NICs; TODO: determine actual limit?
      query: { project, instance, limit: 1000 },
    }),
    apiQueryClient.prefetchQuery('floatingIpList', {
      query: { project, limit: 1000 },
    }),
    // dupe of page-level fetch but that's fine, RQ dedupes
    apiQueryClient.prefetchQuery('instanceExternalIpList', {
      path: { instance },
      query: { project },
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
  colHelper.accessor('name', {
    header: 'name',
    cell: (info) => (
      <>
        <span>{info.getValue()}</span>
        {info.row.original.primary && <Badge className="ml-2">primary</Badge>}
      </>
    ),
  }),
  colHelper.accessor('description', Columns.description),
  colHelper.accessor('ip', { header: 'Private IP' }),
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
  const { instance: instanceName, project } = instanceSelector

  const queryClient = useApiQueryClient()

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editing, setEditing] = useState<InstanceNetworkInterface | null>(null)
  const [attachModalOpen, setAttachModalOpen] = useState(false)

  // Fetch the floating IPs to show in the "Attach floating IP" modal
  const { data: ips } = usePrefetchedApiQuery('floatingIpList', {
    query: { project, limit: 1000 },
  })
  // Filter out the IPs that are already attached to an instance
  const availableIps = useMemo(() => ips.items.filter((ip) => !ip.instanceId), [ips])

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
    path: { instance: instanceName },
    query: { project },
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

  const columns = useColsWithActions(staticCols, makeActions)

  const rows = usePrefetchedApiQuery('instanceNetworkInterfaceList', {
    query: { ...instanceSelector, limit: 1000 },
  }).data.items

  const tableInstance = useReactTable({
    columns,
    data: rows || [],
    getCoreRowModel: getCoreRowModel(),
  })

  // Attached IPs Table
  const { data: eips } = usePrefetchedApiQuery('instanceExternalIpList', {
    path: { instance: instanceName },
    query: { project },
  })

  const ipColHelper = createColumnHelper<ExternalIp>()
  const staticIpCols = [
    ipColHelper.accessor('ip', {
      cell: (info) => (
        <>
          {info.getValue()}
          {info.row.original.kind === 'ephemeral' && (
            <Badge color="neutral" className="ml-2">
              ephemeral
            </Badge>
          )}
        </>
      ),
    }),
    ipColHelper.accessor('name', {
      cell: (info) => (info.getValue() ? info.getValue() : <EmptyCell />),
    }),
    ipColHelper.accessor((row) => ('description' in row ? row.description : undefined), {
      header: 'description',
      cell: (info) => <DescriptionCell text={info.getValue()} />,
    }),
  ]

  const floatingIpDetach = useApiMutation('floatingIpDetach', {
    onSuccess() {
      queryClient.invalidateQueries('floatingIpList')
      queryClient.invalidateQueries('instanceExternalIpList')
      addToast({ content: 'Your floating IP has been detached' })
    },
    onError: (err) => {
      addToast({ title: 'Error', content: err.message, variant: 'error' })
    },
  })

  const makeIpActions = useCallback(
    (externalIp: ExternalIp): MenuAction[] => {
      const copyAction = {
        label: 'Copy IP address',
        onActivate: () => {
          window.navigator.clipboard.writeText(externalIp.ip)
        },
      }

      if (externalIp.kind === 'floating') {
        return [
          copyAction,
          {
            label: 'Detach',
            onActivate: () =>
              confirmAction({
                actionType: 'danger',
                doAction: () =>
                  floatingIpDetach.mutateAsync({
                    path: { floatingIp: externalIp.name },
                    query: { project },
                  }),
                modalTitle: 'Detach Floating IP',
                modalContent: (
                  <p>
                    Are you sure you want to detach floating IP <HL>{externalIp.name}</HL>?{' '}
                    The instance <HL>{instanceName}</HL> will no longer be reachable at{' '}
                    <HL>{externalIp.ip}</HL>.
                  </p>
                ),
                errorTitle: 'Error detaching floating IP',
              }),
          },
        ]
      }
      return [copyAction]
    },
    [floatingIpDetach, instanceName, project]
  )

  const ipTableInstance = useReactTable({
    columns: useColsWithActions(staticIpCols, makeIpActions),
    data: eips?.items || [],
    getCoreRowModel: getCoreRowModel(),
  })

  const disabledReason =
    eips.items.length >= 32
      ? 'IP address limit of 32 reached for this instance'
      : availableIps.length === 0
        ? 'No available floating IPs'
        : null

  return (
    <>
      <TableControls>
        <TableTitle id="attached-ips-label">External IPs</TableTitle>
        <Button
          size="sm"
          onClick={() => setAttachModalOpen(true)}
          disabled={!!disabledReason}
          disabledReason={disabledReason}
        >
          Attach floating IP
        </Button>
        {attachModalOpen && (
          <AttachFloatingIpModal
            floatingIps={availableIps}
            instance={instance}
            onDismiss={() => setAttachModalOpen(false)}
            project={project}
          />
        )}
      </TableControls>
      <Table aria-labelledby="attached-ips-label" table={ipTableInstance} />

      <TableControls className="mt-8">
        <TableTitle id="nics-label">Network interfaces</TableTitle>
        <Button
          size="sm"
          onClick={() => setCreateModalOpen(true)}
          disabled={!canUpdateNic}
          disabledReason={
            <>
              A network interface cannot be created or edited unless the instance is{' '}
              {updateNicStates}.
            </>
          }
        >
          Add network interface
        </Button>
        {createModalOpen && (
          <CreateNetworkInterfaceForm
            onDismiss={() => setCreateModalOpen(false)}
            onSubmit={(body) => createNic.mutate({ query: instanceSelector, body })}
            submitError={createNic.error}
          />
        )}
      </TableControls>
      {rows?.length && rows.length > 0 ? (
        <Table aria-labelledby="nics-label" table={tableInstance} />
      ) : (
        <TableEmptyBox>
          <EmptyMessage
            icon={<Networking24Icon />}
            title="No network interfaces"
            body="You need to create a network interface to be able to see it here"
          />
        </TableEmptyBox>
      )}

      {editing && (
        <EditNetworkInterfaceForm editing={editing} onDismiss={() => setEditing(null)} />
      )}
    </>
  )
}
