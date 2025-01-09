/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useCallback, useMemo, useState } from 'react'
import { type LoaderFunctionArgs } from 'react-router'

import {
  apiQueryClient,
  instanceCan,
  useApiMutation,
  useApiQuery,
  useApiQueryClient,
  usePrefetchedApiQuery,
  type ExternalIp,
  type InstanceNetworkInterface,
  type InstanceState,
} from '@oxide/api'
import { IpGlobal24Icon, Networking24Icon } from '@oxide/design-system/icons/react'

import { AttachEphemeralIpModal } from '~/components/AttachEphemeralIpModal'
import { AttachFloatingIpModal } from '~/components/AttachFloatingIpModal'
import { orderIps } from '~/components/ExternalIps'
import { HL } from '~/components/HL'
import { ListPlusCell } from '~/components/ListPlusCell'
import { CreateNetworkInterfaceForm } from '~/forms/network-interface-create'
import { EditNetworkInterfaceForm } from '~/forms/network-interface-edit'
import {
  getInstanceSelector,
  useInstanceSelector,
  useProjectSelector,
} from '~/hooks/use-params'
import { confirmAction } from '~/stores/confirm-action'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { DescriptionCell } from '~/table/cells/DescriptionCell'
import { EmptyCell, SkeletonCell } from '~/table/cells/EmptyCell'
import { LinkCell } from '~/table/cells/LinkCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { Table } from '~/table/Table'
import { Badge } from '~/ui/lib/Badge'
import { CopyableIp } from '~/ui/lib/CopyableIp'
import { CreateButton } from '~/ui/lib/CreateButton'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { TableControls, TableEmptyBox, TableTitle } from '~/ui/lib/Table'
import { TipIcon } from '~/ui/lib/TipIcon'
import { ALL_ISH } from '~/util/consts'
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

  return <span className="text-default">{subnet.name}</span>
}

export async function loader({ params }: LoaderFunctionArgs) {
  const { project, instance } = getInstanceSelector(params)
  await Promise.all([
    apiQueryClient.prefetchQuery('instanceNetworkInterfaceList', {
      // we want this to cover all NICs; TODO: determine actual limit?
      query: { project, instance, limit: ALL_ISH },
    }),
    apiQueryClient.prefetchQuery('floatingIpList', { query: { project, limit: ALL_ISH } }),
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
    // This is used in AttachEphemeralIpModal
    apiQueryClient.prefetchQuery('projectIpPoolList', { query: { limit: ALL_ISH } }),
  ])
  return null
}

// Bit of a hack: by putting the instance state in the row data, we can avoid
// remaking the row actions callback whenever the instance state changes, which
// causes the whole table to get re-rendered, which jarringly closes any open
// row actions menus
type NicRow = InstanceNetworkInterface & {
  instanceState: InstanceState
}

const colHelper = createColumnHelper<NicRow>()
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
  colHelper.accessor('ip', {
    header: 'Private IP',
    cell: (info) => <CopyableIp ip={info.getValue()} isLinked={false} />,
  }),
  colHelper.accessor('vpcId', {
    header: 'vpc',
    cell: (info) => <VpcNameFromId value={info.getValue()} />,
  }),
  colHelper.accessor('subnetId', {
    header: 'subnet',
    cell: (info) => <SubnetNameFromId value={info.getValue()} />,
  }),
  colHelper.accessor('transitIps', {
    header: 'Transit IPs',
    cell: (info) => (
      <ListPlusCell tooltipTitle="Other transit IPs">
        {info.getValue()?.map((ip) => <div key={ip}>{ip}</div>)}
      </ListPlusCell>
    ),
  }),
]

const updateNicStates = fancifyStates(instanceCan.updateNic.states)

const ipColHelper = createColumnHelper<ExternalIp>()
const staticIpCols = [
  ipColHelper.accessor('ip', {
    cell: (info) => <CopyableIp ip={info.getValue()} />,
  }),
  ipColHelper.accessor('kind', {
    header: () => (
      <>
        Kind
        <TipIcon className="ml-2">
          Floating IPs can be detached from this instance and attached to another.
        </TipIcon>
      </>
    ),
    cell: (info) => <Badge color="neutral">{info.getValue()}</Badge>,
  }),
  ipColHelper.accessor('name', {
    cell: (info) => (info.getValue() ? info.getValue() : <EmptyCell />),
  }),
  ipColHelper.accessor((row) => ('description' in row ? row.description : undefined), {
    header: 'description',
    cell: (info) => <DescriptionCell text={info.getValue()} />,
  }),
]

Component.displayName = 'NetworkingTab'
export function Component() {
  const instanceSelector = useInstanceSelector()
  const { instance: instanceName, project } = instanceSelector

  const queryClient = useApiQueryClient()

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editing, setEditing] = useState<InstanceNetworkInterface | null>(null)
  const [attachEphemeralModalOpen, setAttachEphemeralModalOpen] = useState(false)
  const [attachFloatingModalOpen, setAttachFloatingModalOpen] = useState(false)

  // Fetch the floating IPs to show in the "Attach floating IP" modal
  const { data: ips } = usePrefetchedApiQuery('floatingIpList', {
    query: { project, limit: ALL_ISH },
  })
  // Filter out the IPs that are already attached to an instance
  const availableIps = useMemo(() => ips.items.filter((ip) => !ip.instanceId), [ips])

  const createNic = useApiMutation('instanceNetworkInterfaceCreate', {
    onSuccess() {
      queryClient.invalidateQueries('instanceNetworkInterfaceList')
      setCreateModalOpen(false)
    },
  })
  const { mutateAsync: deleteNic } = useApiMutation('instanceNetworkInterfaceDelete', {
    onSuccess(_data, variables) {
      queryClient.invalidateQueries('instanceNetworkInterfaceList')
      addToast(<>Network interface <HL>{variables.path.interface}</HL> deleted</>) // prettier-ignore
    },
  })
  const { mutate: editNic } = useApiMutation('instanceNetworkInterfaceUpdate', {
    onSuccess() {
      queryClient.invalidateQueries('instanceNetworkInterfaceList')
    },
  })

  const { data: instance } = usePrefetchedApiQuery('instanceView', {
    path: { instance: instanceName },
    query: { project },
  })

  const makeActions = useCallback(
    (nic: NicRow): MenuAction[] => {
      const canUpdateNic = instanceCan.updateNic({ runState: nic.instanceState })
      return [
        {
          label: 'Make primary',
          onActivate() {
            editNic({
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
              The instance must be {updateNicStates} before editing a network
              interface&apos;s settings
            </>
          ),
        },
        {
          label: 'Delete',
          onActivate: confirmDelete({
            doDelete: () =>
              deleteNic({
                path: { interface: nic.name },
                query: instanceSelector,
              }),
            label: nic.name,
          }),
          disabled: !canUpdateNic && (
            <>The instance must be {updateNicStates} to delete a network interface</>
          ),
        },
      ]
    },
    [deleteNic, editNic, instanceSelector]
  )

  const columns = useColsWithActions(staticCols, makeActions)

  const nics = usePrefetchedApiQuery('instanceNetworkInterfaceList', {
    query: { ...instanceSelector, limit: ALL_ISH },
  }).data.items

  const nicRows = useMemo(
    () => nics.map((nic) => ({ ...nic, instanceState: instance.runState })),
    [nics, instance]
  )

  const tableInstance = useReactTable({
    columns,
    data: nicRows,
    getCoreRowModel: getCoreRowModel(),
  })

  // Attached IPs Table
  const { data: eips } = usePrefetchedApiQuery('instanceExternalIpList', {
    path: { instance: instanceName },
    query: { project },
  })

  const { mutateAsync: ephemeralIpDetach } = useApiMutation('instanceEphemeralIpDetach', {
    onSuccess() {
      queryClient.invalidateQueries('instanceExternalIpList')
      addToast({ content: 'Ephemeral IP detached' })
    },
    onError: (err) => {
      addToast({ title: 'Error', content: err.message, variant: 'error' })
    },
  })

  const { mutateAsync: floatingIpDetach } = useApiMutation('floatingIpDetach', {
    onSuccess(_data, variables) {
      queryClient.invalidateQueries('floatingIpList')
      queryClient.invalidateQueries('instanceExternalIpList')
      addToast(<>Floating IP <HL>{variables.path.floatingIp}</HL> detached</>) // prettier-ignore
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

      const doAction =
        externalIp.kind === 'floating'
          ? () =>
              floatingIpDetach({
                path: { floatingIp: externalIp.name },
                query: { project },
              })
          : () =>
              ephemeralIpDetach({
                path: { instance: instanceName },
                query: { project },
              })

      return [
        copyAction,
        {
          label: 'Detach',
          onActivate: () =>
            confirmAction({
              actionType: 'danger',
              doAction,
              modalTitle: `Confirm detach ${externalIp.kind} IP`,
              modalContent: (
                <p>
                  Are you sure you want to detach{' '}
                  {externalIp.kind === 'ephemeral' ? (
                    'this ephemeral IP'
                  ) : (
                    <>
                      floating IP <HL>{externalIp.name}</HL>
                    </>
                  )}{' '}
                  from <HL>{instanceName}</HL>? The instance will no longer be reachable at{' '}
                  <HL>{externalIp.ip}</HL>.
                </p>
              ),
              errorTitle: `Error detaching ${externalIp.kind} IP`,
            }),
        },
      ]
    },
    [ephemeralIpDetach, floatingIpDetach, instanceName, project]
  )

  const ipTableInstance = useReactTable({
    columns: useColsWithActions(staticIpCols, makeIpActions),
    data: orderIps(eips.items),
    getCoreRowModel: getCoreRowModel(),
  })

  // If there's already an ephemeral IP, or if there are no network interfaces,
  // they shouldn't be able to attach an ephemeral IP
  const enableEphemeralAttachButton =
    eips.items.filter((ip) => ip.kind === 'ephemeral').length === 0 && nics.length > 0

  const floatingDisabledReason =
    eips.items.filter((ip) => ip.kind === 'floating').length >= 32
      ? 'Floating IP address limit of 32 reached for this instance'
      : availableIps.length === 0
        ? 'No available floating IPs'
        : null

  return (
    <>
      <TableControls>
        <TableTitle id="attached-ips-label">External IPs</TableTitle>
        <div className="flex gap-3">
          {/*
            We normally wouldn't hide this button and would just have a disabled state on it,
            but it is very rare for this button to be necessary, and it would be disabled
            most of the time, for most users. To reduce clutter on the screen, we're hiding it.
           */}
          {enableEphemeralAttachButton && (
            <CreateButton onClick={() => setAttachEphemeralModalOpen(true)}>
              Attach ephemeral IP
            </CreateButton>
          )}
          <CreateButton
            onClick={() => setAttachFloatingModalOpen(true)}
            disabled={!!floatingDisabledReason}
            disabledReason={floatingDisabledReason}
          >
            Attach floating IP
          </CreateButton>
        </div>
        {attachEphemeralModalOpen && (
          <AttachEphemeralIpModal onDismiss={() => setAttachEphemeralModalOpen(false)} />
        )}
        {attachFloatingModalOpen && (
          <AttachFloatingIpModal
            floatingIps={availableIps}
            instance={instance}
            onDismiss={() => setAttachFloatingModalOpen(false)}
          />
        )}
      </TableControls>
      {eips.items.length > 0 ? (
        <Table aria-labelledby="attached-ips-label" table={ipTableInstance} />
      ) : (
        <TableEmptyBox>
          <EmptyMessage
            icon={<IpGlobal24Icon />}
            title="No external IPs"
            body="Attach an external IP to see it here"
          />
        </TableEmptyBox>
      )}

      <TableControls className="mt-8">
        <TableTitle id="nics-label">Network interfaces</TableTitle>
        <CreateButton
          onClick={() => setCreateModalOpen(true)}
          disabled={!instanceCan.updateNic(instance)}
          disabledReason={
            <>
              A network interface cannot be created or edited unless the instance is{' '}
              {updateNicStates}.
            </>
          }
        >
          Add network interface
        </CreateButton>
        {createModalOpen && (
          <CreateNetworkInterfaceForm
            onDismiss={() => setCreateModalOpen(false)}
            onSubmit={(body) => createNic.mutate({ query: instanceSelector, body })}
            submitError={createNic.error}
          />
        )}
      </TableControls>
      {nics.length > 0 ? (
        <Table aria-labelledby="nics-label" table={tableInstance} />
      ) : (
        <TableEmptyBox>
          <EmptyMessage
            icon={<Networking24Icon />}
            title="No network interfaces"
            body="Create a network interface to see it here"
          />
        </TableEmptyBox>
      )}

      {editing && (
        <EditNetworkInterfaceForm editing={editing} onDismiss={() => setEditing(null)} />
      )}
    </>
  )
}
