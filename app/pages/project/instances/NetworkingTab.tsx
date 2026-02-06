/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useQuery } from '@tanstack/react-query'
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { type LoaderFunctionArgs } from 'react-router'
import { match } from 'ts-pattern'

import {
  api,
  instanceCan,
  q,
  qErrorsAllowed,
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
  type ExternalIp,
  type ExternalSubnet,
  type InstanceNetworkInterface,
  type InstanceState,
  type IpVersion,
} from '@oxide/api'
import { IpGlobal24Icon, Networking24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { AttachEphemeralIpModal } from '~/components/AttachEphemeralIpModal'
import { AttachFloatingIpModal } from '~/components/AttachFloatingIpModal'
import { orderIps } from '~/components/ExternalIps'
import { ListboxField } from '~/components/form/fields/ListboxField'
import { ModalForm } from '~/components/form/ModalForm'
import { HL } from '~/components/HL'
import { IpVersionBadge } from '~/components/IpVersionBadge'
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
import { IpPoolCell } from '~/table/cells/IpPoolCell'
import { LinkCell } from '~/table/cells/LinkCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { Table } from '~/table/Table'
import { Button } from '~/ui/lib/Button'
import { CardBlock } from '~/ui/lib/CardBlock'
import { CopyableIp } from '~/ui/lib/CopyableIp'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { TableEmptyBox } from '~/ui/lib/Table'
import { TipIcon } from '~/ui/lib/TipIcon'
import { Tooltip } from '~/ui/lib/Tooltip'
import { ALL_ISH } from '~/util/consts'
import { getCompatibleVersionsFromNics, ipHasVersion, parseIp } from '~/util/ip'
import { pb } from '~/util/path-builder'

import { fancifyStates } from './common'

const VpcNameFromId = ({ value }: { value: string }) => {
  const { project } = useProjectSelector()
  const { data: vpc, isError } = useQuery(
    q(api.vpcView, { path: { vpc: value } }, { throwOnError: false })
  )

  // If we can't find it, it must have been deleted. This is probably not
  // possible because you can't delete a VPC that has child resources, but let's
  // be safe
  if (isError) return <Badge color="neutral">Deleted</Badge>
  if (!vpc) return <SkeletonCell />
  return <LinkCell to={pb.vpc({ project, vpc: vpc.name })}>{vpc.name}</LinkCell>
}

const SubnetNameFromId = ({ value }: { value: string }) => {
  const { data: subnet, isError } = useQuery(
    q(api.vpcSubnetView, { path: { subnet: value } }, { throwOnError: false })
  )

  // same deal as VPC: probably not possible but let's be safe
  if (isError) return <Badge color="neutral">Deleted</Badge>
  if (!subnet) return <SkeletonCell /> // loading

  return <span className="text-default">{subnet.name}</span>
}

const NonFloatingEmptyCell = ({ kind }: { kind: 'snat' | 'ephemeral' }) => (
  <Tooltip
    content={`${kind === 'snat' ? 'SNAT' : 'Ephemeral'} IPs don’t have names or descriptions`}
    placement="top"
  >
    <div>
      <EmptyCell />
    </div>
  </Tooltip>
)

const PrivateIpCell = ({ ipVersion, ip }: { ipVersion: IpVersion; ip: string }) => (
  <div className="flex items-center gap-2">
    <IpVersionBadge ipVersion={ipVersion} />
    <CopyableIp ip={ip} isLinked={false} />
  </div>
)

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { project, instance } = getInstanceSelector(params)
  await Promise.all([
    queryClient.fetchQuery(
      q(api.instanceNetworkInterfaceList, {
        // we want this to cover all NICs; TODO: determine actual limit?
        query: { project, instance, limit: ALL_ISH },
      })
    ),
    queryClient.fetchQuery(q(api.floatingIpList, { query: { project, limit: ALL_ISH } })),
    queryClient.fetchQuery(
      q(api.externalSubnetList, { query: { project, limit: ALL_ISH } })
    ),
    queryClient.fetchQuery(
      q(api.instanceExternalSubnetList, {
        path: { instance },
        query: { project },
      })
    ),
    // dupe of page-level fetch but that's fine, RQ dedupes
    queryClient.fetchQuery(
      q(api.instanceExternalIpList, { path: { instance }, query: { project } })
    ),
    // This is covered by the InstancePage loader but there's no downside to
    // being redundant. If it were removed there, we'd still want it here.
    queryClient.fetchQuery(q(api.instanceView, { path: { instance }, query: { project } })),
    // Fetch IP Pools and preload into RQ cache so fetches by ID in
    // IpPoolCell and AttachFloatingIpModal can be mostly instant
    queryClient
      .fetchQuery(q(api.projectIpPoolList, { query: { limit: ALL_ISH } }))
      .then((pools) => {
        for (const pool of pools.items) {
          // both IpPoolCell and the fetch in the model use errors-allowed
          // versions to avoid blowing up in the unlikely event of an error
          const { queryKey } = qErrorsAllowed(api.projectIpPoolView, {
            path: { pool: pool.id },
          })
          queryClient.setQueryData(queryKey, { type: 'success', data: pool })
        }
      }),
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
  colHelper.display({
    id: 'ip',
    header: 'Private IP',
    cell: (info) => {
      const nic = info.row.original
      const { ipStack } = nic

      if (ipStack.type === 'dual_stack') {
        return (
          <div className="flex flex-col gap-0">
            <PrivateIpCell ipVersion="v4" ip={ipStack.value.v4.ip} />
            <PrivateIpCell ipVersion="v6" ip={ipStack.value.v6.ip} />
          </div>
        )
      }
      return <PrivateIpCell ipVersion={ipStack.type} ip={ipStack.value.ip} />
    },
  }),
  colHelper.accessor('vpcId', {
    header: 'vpc',
    cell: (info) => <VpcNameFromId value={info.getValue()} />,
  }),
  colHelper.accessor('subnetId', {
    header: 'subnet',
    cell: (info) => <SubnetNameFromId value={info.getValue()} />,
  }),
  colHelper.display({
    id: 'transitIps',
    header: 'Transit IPs',
    cell: (info) => {
      const nic = info.row.original
      const { ipStack } = nic

      let transitIps: string[] = []
      if (ipStack.type === 'v4' || ipStack.type === 'v6') {
        transitIps = ipStack.value.transitIps
      } else if (ipStack.type === 'dual_stack') {
        // Combine both v4 and v6 transit IPs for dual-stack
        transitIps = [...ipStack.value.v4.transitIps, ...ipStack.value.v6.transitIps]
      }
      return (
        <ListPlusCell tooltipTitle="Other transit IPs">
          {transitIps?.map((ip) => (
            <div key={ip}>{ip}</div>
          ))}
        </ListPlusCell>
      )
    },
  }),
]

const updateNicStates = fancifyStates(instanceCan.updateNic.states)

const ipColHelper = createColumnHelper<ExternalIp>()
const staticIpCols = [
  ipColHelper.accessor('ip', {
    cell: (info) => (
      <div className="flex items-center gap-2">
        <CopyableIp ip={info.getValue()} />
        {info.row.original.kind === 'snat' && (
          <Tooltip content="Outbound traffic uses this IP and port range" placement="top">
            {/* div needed for Tooltip */}
            <div>
              <Badge color="neutral">
                {info.row.original.firstPort}–{info.row.original.lastPort}
              </Badge>
            </div>
          </Tooltip>
        )}
      </div>
    ),
  }),
  ipColHelper.accessor('kind', {
    header: () => (
      <>
        Kind
        <TipIcon className="ml-2">
          Floating IPs can be detached from this instance and attached to another. SNAT IPs
          cannot receive traffic; they are used for outbound traffic when there are no
          ephemeral or floating IPs.
        </TipIcon>
      </>
    ),
    cell: (info) => <Badge color="neutral">{info.getValue()}</Badge>,
  }),
  ipColHelper.accessor('ip', {
    id: 'version',
    header: 'Version',
    cell: (info) => {
      const parsed = parseIp(info.getValue())
      if (parsed.type === 'error') return <EmptyCell />
      return <IpVersionBadge ipVersion={parsed.type} />
    },
  }),
  ipColHelper.accessor('ipPoolId', {
    header: 'IP pool',
    cell: (info) => <IpPoolCell ipPoolId={info.getValue()} />,
  }),
  ipColHelper.accessor('name', {
    cell: (info) =>
      info.row.original.kind === 'floating' ? (
        info.getValue()
      ) : (
        <NonFloatingEmptyCell kind={info.row.original.kind} />
      ),
  }),
  ipColHelper.accessor((row) => ('description' in row ? row.description : undefined), {
    header: 'description',
    cell: (info) =>
      info.row.original.kind === 'floating' ? (
        <DescriptionCell text={info.getValue()} />
      ) : (
        <NonFloatingEmptyCell kind={info.row.original.kind} />
      ),
  }),
]

export const handle = { crumb: 'Networking' }

export default function NetworkingTab() {
  const instanceSelector = useInstanceSelector()
  const { instance: instanceName, project } = instanceSelector

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editing, setEditing] = useState<InstanceNetworkInterface | null>(null)
  const [attachEphemeralModalOpen, setAttachEphemeralModalOpen] = useState(false)
  const [attachFloatingModalOpen, setAttachFloatingModalOpen] = useState(false)
  const [attachSubnetModalOpen, setAttachSubnetModalOpen] = useState(false)

  // Fetch the floating IPs to show in the "Attach floating IP" modal
  const { data: ips } = usePrefetchedQuery(
    q(api.floatingIpList, { query: { project, limit: ALL_ISH } })
  )

  // Fetch external subnets for this project and this instance
  const { data: allSubnets } = usePrefetchedQuery(
    q(api.externalSubnetList, { query: { project, limit: ALL_ISH } })
  )
  const { data: instanceSubnets } = usePrefetchedQuery(
    q(api.instanceExternalSubnetList, {
      path: { instance: instanceName },
      query: { project },
    })
  )
  const availableSubnets = useMemo(
    () => allSubnets.items.filter((s) => !s.instanceId),
    [allSubnets]
  )

  const nics = usePrefetchedQuery(
    q(api.instanceNetworkInterfaceList, {
      query: { ...instanceSelector, limit: ALL_ISH },
    })
  ).data.items

  // Determine compatible IP versions from the instance's primary NIC
  // External IPs route through the primary interface, so only its IP stack matters
  const compatibleVersions = useMemo(() => getCompatibleVersionsFromNics(nics), [nics])

  // Filter out the IPs that are already attached to an instance and filter by IP version compatibility
  const availableIps = useMemo(
    () => ips.items.filter((ip) => !ip.instanceId).filter(ipHasVersion(compatibleVersions)),
    [ips, compatibleVersions]
  )

  const createNic = useApiMutation(api.instanceNetworkInterfaceCreate, {
    onSuccess() {
      queryClient.invalidateEndpoint('instanceNetworkInterfaceList')
      setCreateModalOpen(false)
    },
  })
  const { mutateAsync: deleteNic } = useApiMutation(api.instanceNetworkInterfaceDelete, {
    onSuccess(_data, variables) {
      queryClient.invalidateEndpoint('instanceNetworkInterfaceList')
      // prettier-ignore
      addToast(<>Network interface <HL>{variables.path.interface}</HL> deleted</>)
    },
  })
  const { mutate: editNic } = useApiMutation(api.instanceNetworkInterfaceUpdate, {
    onSuccess() {
      queryClient.invalidateEndpoint('instanceNetworkInterfaceList')
    },
  })

  const { data: instance } = usePrefetchedQuery(
    q(api.instanceView, { path: { instance: instanceName }, query: { project } })
  )

  const multipleNics = nics.length > 1

  const makeActions = useCallback(
    (nic: NicRow): MenuAction[] => {
      const canUpdateNic = instanceCan.updateNic({ runState: nic.instanceState })

      const deleteDisabledReason = () => {
        if (!canUpdateNic) {
          return <>The instance must be {updateNicStates} to delete a network interface</>
        }
        // If the NIC is primary, we can't delete it if there are other NICs. Per Ben N:
        // > There is always zero or one primary NIC. There may zero or more secondary NICs (up to 7 today), but only if there is already a primary.
        // > The primary NIC is where we attach all the external networking state, like external addresses, and the VPC information like routes, subnet information, internet gateways, etc.
        // > You may delete any secondary NIC. You may delete the primary NIC only if it's the only NIC (there are no secondary NICs).
        if (nic.primary && multipleNics) {
          return 'The primary interface can’t be deleted while other interfaces are attached. To delete it, make another interface primary.'
        }
        return undefined
      }

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
          disabled: deleteDisabledReason(),
        },
      ]
    },
    [deleteNic, editNic, instanceSelector, multipleNics]
  )

  const columns = useColsWithActions(staticCols, makeActions)

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
  const { data: eips } = usePrefetchedQuery(
    q(api.instanceExternalIpList, {
      path: { instance: instanceName },
      query: { project },
    })
  )

  const { mutateAsync: ephemeralIpDetach } = useApiMutation(api.instanceEphemeralIpDetach, {
    onSuccess() {
      queryClient.invalidateEndpoint('instanceExternalIpList')
      addToast({ content: 'Ephemeral IP detached' })
    },
    onError: (err) => {
      addToast({ title: 'Error', content: err.message, variant: 'error' })
    },
  })

  const { mutateAsync: floatingIpDetach } = useApiMutation(api.floatingIpDetach, {
    onSuccess(_data, variables) {
      queryClient.invalidateEndpoint('floatingIpList')
      queryClient.invalidateEndpoint('instanceExternalIpList')
      // prettier-ignore
      addToast(<>Floating IP <HL>{variables.path.floatingIp}</HL> detached</>)
    },
    onError: (err) => {
      addToast({ title: 'Error', content: err.message, variant: 'error' })
    },
  })

  const { mutateAsync: externalSubnetDetach } = useApiMutation(api.externalSubnetDetach, {
    onSuccess(subnet) {
      queryClient.invalidateEndpoint('externalSubnetList')
      queryClient.invalidateEndpoint('instanceExternalSubnetList')
      // prettier-ignore
      addToast(<>External subnet <HL>{subnet.name}</HL> detached</>)
    },
    onError: (err) => {
      addToast({ title: 'Error', content: err.message, variant: 'error' })
    },
  })

  const makeSubnetActions = useCallback(
    (subnet: ExternalSubnet): MenuAction[] => [
      {
        label: 'Detach',
        onActivate: () =>
          confirmAction({
            actionType: 'danger',
            doAction: () =>
              externalSubnetDetach({
                path: { externalSubnet: subnet.name },
                query: { project },
              }),
            modalTitle: 'Detach External Subnet',
            modalContent: (
              <p>
                Are you sure you want to detach external subnet <HL>{subnet.name}</HL> from{' '}
                <HL>{instanceName}</HL>?
              </p>
            ),
            errorTitle: 'Error detaching external subnet',
          }),
      },
    ],
    [externalSubnetDetach, instanceName, project]
  )

  const subnetColHelper = createColumnHelper<ExternalSubnet>()
  const subnetCols = useMemo(
    () => [
      subnetColHelper.accessor('name', {}),
      subnetColHelper.accessor('subnet', { header: 'Subnet' }),
      subnetColHelper.accessor('description', Columns.description),
    ],
    [subnetColHelper]
  )
  const subnetTableCols = useColsWithActions(subnetCols, makeSubnetActions)
  const subnetTableInstance = useReactTable({
    columns: subnetTableCols,
    data: instanceSubnets.items,
    getCoreRowModel: getCoreRowModel(),
  })

  const makeIpActions = useCallback(
    (externalIp: ExternalIp): MenuAction[] => {
      const copyAction = {
        label: 'Copy IP address',
        onActivate: () => {
          window.navigator.clipboard.writeText(externalIp.ip)
        },
      }

      if (externalIp.kind === 'snat') {
        return [
          copyAction,
          {
            label: 'Detach',
            disabled: "SNAT IPs can't be detached",
            onActivate: () => {},
          },
        ]
      }

      const doDetach = match(externalIp)
        .with(
          { kind: 'ephemeral' },
          () => () =>
            ephemeralIpDetach({ path: { instance: instanceName }, query: { project } })
        )
        .with(
          { kind: 'floating' },
          ({ name }) =>
            () =>
              floatingIpDetach({ path: { floatingIp: name }, query: { project } })
        )
        .exhaustive()

      const label = match(externalIp)
        .with({ kind: 'ephemeral' }, () => 'this ephemeral IP')
        .with(
          { kind: 'floating' },
          // prettier-ignore
          ({ name }) => <>floating IP <HL>{name}</HL></>
        )
        .exhaustive()

      return [
        copyAction,
        {
          label: 'Detach',
          onActivate: () =>
            confirmAction({
              actionType: 'danger',
              doAction: doDetach,
              modalTitle: `Confirm detach ${externalIp.kind} IP`,
              modalContent: (
                <p>
                  Are you sure you want to detach {label} from <HL>{instanceName}</HL>? The
                  instance will no longer be reachable at <HL>{externalIp.ip}</HL>.
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
    data: useMemo(() => orderIps(eips.items), [eips]),
    getCoreRowModel: getCoreRowModel(),
  })

  const ephemeralDisabledReason =
    nics.length === 0
      ? 'Instance has no network interfaces'
      : eips.items.some((ip) => ip.kind === 'ephemeral')
        ? 'Instance already has an ephemeral IP'
        : null

  const floatingDisabledReason =
    eips.items.filter((ip) => ip.kind === 'floating').length >= 32
      ? 'Floating IP address limit of 32 reached for this instance'
      : availableIps.length === 0
        ? 'No available floating IPs'
        : null

  return (
    <div className="space-y-5">
      <CardBlock>
        <CardBlock.Header title="External IPs" titleId="attached-ips-label">
          <div className="flex gap-3">
            <Button
              size="sm"
              onClick={() => setAttachEphemeralModalOpen(true)}
              disabled={!!ephemeralDisabledReason}
              disabledReason={ephemeralDisabledReason}
            >
              Attach ephemeral IP
            </Button>
            <Button
              size="sm"
              onClick={() => setAttachFloatingModalOpen(true)}
              disabled={!!floatingDisabledReason}
              disabledReason={floatingDisabledReason}
            >
              Attach floating IP
            </Button>
          </div>
        </CardBlock.Header>

        <CardBlock.Body>
          {eips.items.length > 0 ? (
            <Table
              aria-labelledby="attached-ips-label"
              table={ipTableInstance}
              className="table-inline"
            />
          ) : (
            <TableEmptyBox border={false}>
              <EmptyMessage
                icon={<IpGlobal24Icon />}
                title="No external IPs"
                body="Attach an external IP to see it here"
              />
            </TableEmptyBox>
          )}
        </CardBlock.Body>

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
      </CardBlock>

      <CardBlock>
        <CardBlock.Header title="Network interfaces" titleId="nics-label">
          <Button
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            disabled={!instanceCan.updateNic(instance)}
            disabledReason={
              <>
                A network interface cannot be created or edited unless the instance is{' '}
                {updateNicStates}
              </>
            }
          >
            Add network interface
          </Button>
        </CardBlock.Header>

        <CardBlock.Body>
          {nics.length > 0 ? (
            <Table
              aria-labelledby="nics-label"
              table={tableInstance}
              className="table-inline"
              rowHeight="large"
            />
          ) : (
            <TableEmptyBox border={false}>
              <EmptyMessage
                icon={<Networking24Icon />}
                title="No network interfaces"
                body="Create a network interface to see it here"
              />
            </TableEmptyBox>
          )}
        </CardBlock.Body>

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
      </CardBlock>

      <CardBlock>
        <CardBlock.Header title="External Subnets" titleId="attached-subnets-label">
          <Button
            size="sm"
            onClick={() => setAttachSubnetModalOpen(true)}
            disabled={availableSubnets.length === 0}
            disabledReason={
              availableSubnets.length === 0 ? 'No available external subnets' : undefined
            }
          >
            Attach external subnet
          </Button>
        </CardBlock.Header>

        <CardBlock.Body>
          {instanceSubnets.items.length > 0 ? (
            <Table
              aria-labelledby="attached-subnets-label"
              table={subnetTableInstance}
              className="table-inline"
            />
          ) : (
            <TableEmptyBox border={false}>
              <EmptyMessage
                icon={<Networking24Icon />}
                title="No external subnets"
                body="Attach an external subnet to see it here"
              />
            </TableEmptyBox>
          )}
        </CardBlock.Body>

        {attachSubnetModalOpen && (
          <AttachExternalSubnetModal
            subnets={availableSubnets}
            instanceName={instanceName}
            project={project}
            onDismiss={() => setAttachSubnetModalOpen(false)}
          />
        )}
      </CardBlock>
    </div>
  )
}

const AttachExternalSubnetModal = ({
  subnets,
  instanceName,
  project,
  onDismiss,
}: {
  subnets: ExternalSubnet[]
  instanceName: string
  project: string
  onDismiss: () => void
}) => {
  const externalSubnetAttach = useApiMutation(api.externalSubnetAttach, {
    onSuccess(subnet) {
      queryClient.invalidateEndpoint('externalSubnetList')
      queryClient.invalidateEndpoint('instanceExternalSubnetList')
      // prettier-ignore
      addToast(<>External subnet <HL>{subnet.name}</HL> attached</>)
      onDismiss()
    },
    onError: (err) => {
      addToast({ title: 'Error', content: err.message, variant: 'error' })
    },
  })

  const form = useForm({ defaultValues: { subnetName: '' } })

  return (
    <ModalForm
      title="Attach external subnet"
      form={form}
      onSubmit={({ subnetName }) => {
        externalSubnetAttach.mutate({
          path: { externalSubnet: subnetName },
          query: { project },
          body: { instance: instanceName },
        })
      }}
      submitLabel="Attach"
      submitError={externalSubnetAttach.error}
      loading={externalSubnetAttach.isPending}
      onDismiss={onDismiss}
    >
      <ListboxField
        control={form.control}
        name="subnetName"
        items={subnets.map((s) => ({
          value: s.name,
          label: `${s.name} (${s.subnet})`,
        }))}
        label="External subnet"
        required
        placeholder="Select an external subnet"
      />
    </ModalForm>
  )
}
