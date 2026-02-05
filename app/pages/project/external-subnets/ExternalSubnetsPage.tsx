/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Outlet, useNavigate, type LoaderFunctionArgs } from 'react-router'

import {
  api,
  getListQFn,
  q,
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
  type ExternalSubnet,
  type Instance,
} from '@oxide/api'
import { Networking16Icon, Networking24Icon } from '@oxide/design-system/icons/react'

import { DocsPopover } from '~/components/DocsPopover'
import { ListboxField } from '~/components/form/fields/ListboxField'
import { ModalForm } from '~/components/form/ModalForm'
import { HL } from '~/components/HL'
import { makeCrumb } from '~/hooks/use-crumbs'
import { getProjectSelector, useProjectSelector } from '~/hooks/use-params'
import { confirmAction } from '~/stores/confirm-action'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { InstanceLinkCell } from '~/table/cells/InstanceLinkCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { CreateLink } from '~/ui/lib/CreateButton'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { TableActions } from '~/ui/lib/Table'
import { ALL_ISH } from '~/util/consts'
import { pb } from '~/util/path-builder'

const EmptyState = () => (
  <EmptyMessage
    icon={<Networking24Icon />}
    title="No external subnets"
    body="Create an external subnet to see it here"
    buttonText="New External Subnet"
    buttonTo={pb.externalSubnetsNew(useProjectSelector())}
  />
)

const subnetList = (project: string) =>
  getListQFn(api.externalSubnetList, { query: { project } })
const instanceList = (project: string) =>
  getListQFn(api.instanceList, { query: { project, limit: ALL_ISH } })

export const handle = makeCrumb('External Subnets', (p) =>
  pb.externalSubnets(getProjectSelector(p))
)

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { project } = getProjectSelector(params)
  await Promise.all([
    queryClient.fetchQuery(subnetList(project).optionsFn()),
    queryClient.fetchQuery(instanceList(project).optionsFn()),
  ])
  return null
}

const colHelper = createColumnHelper<ExternalSubnet>()
const staticCols = [
  colHelper.accessor('name', {}),
  colHelper.accessor('description', Columns.description),
  colHelper.accessor('subnet', {
    header: 'Subnet',
    cell: (info) => <span className="text-secondary">{info.getValue()}</span>,
  }),
  colHelper.accessor('instanceId', {
    header: 'Attached to instance',
    cell: (info) => <InstanceLinkCell instanceId={info.getValue()} />,
  }),
]

export default function ExternalSubnetsPage() {
  const [subnetToAttach, setSubnetToAttach] = useState<ExternalSubnet | null>(null)
  const { project } = useProjectSelector()
  const { data: instances } = usePrefetchedQuery(instanceList(project).optionsFn())
  const navigate = useNavigate()

  const { mutateAsync: externalSubnetDetach } = useApiMutation(api.externalSubnetDetach, {
    onSuccess(subnet) {
      queryClient.invalidateEndpoint('externalSubnetList')
      // prettier-ignore
      addToast(<>External subnet <HL>{subnet.name}</HL> detached</>)
    },
    onError: (err) => {
      addToast({ title: 'Error', content: err.message, variant: 'error' })
    },
  })
  const { mutateAsync: deleteExternalSubnet } = useApiMutation(api.externalSubnetDelete, {
    onSuccess(_data, variables) {
      queryClient.invalidateEndpoint('externalSubnetList')
      // prettier-ignore
      addToast(<>External subnet <HL>{variables.path.externalSubnet}</HL> deleted</>)
    },
  })

  const makeActions = useCallback(
    (subnet: ExternalSubnet): MenuAction[] => {
      const instanceName = subnet.instanceId
        ? instances.items.find((i) => i.id === subnet.instanceId)?.name
        : undefined
      const fromInstance = instanceName ? (
        <>
          {' '}
          from instance <HL>{instanceName}</HL>
        </>
      ) : null

      const isAttached = !!subnet.instanceId
      const attachOrDetachAction = isAttached
        ? {
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
                    Are you sure you want to detach external subnet <HL>{subnet.name}</HL>
                    {fromInstance}?
                  </p>
                ),
                errorTitle: 'Error detaching external subnet',
              }),
          }
        : {
            label: 'Attach',
            onActivate() {
              setSubnetToAttach(subnet)
            },
          }
      return [
        {
          label: 'Edit',
          onActivate: () => {
            // Seed cache so edit form can show data immediately
            const { queryKey } = q(api.externalSubnetView, {
              path: { externalSubnet: subnet.name },
              query: { project },
            })
            queryClient.setQueryData(queryKey, subnet)
            navigate(pb.externalSubnetEdit({ project, externalSubnet: subnet.name }))
          },
        },
        attachOrDetachAction,
        {
          label: 'Delete',
          disabled: isAttached
            ? 'This external subnet must be detached from the instance before it can be deleted'
            : false,
          onActivate: confirmDelete({
            doDelete: () =>
              deleteExternalSubnet({
                path: { externalSubnet: subnet.name },
                query: { project },
              }),
            label: subnet.name,
          }),
        },
      ]
    },
    [deleteExternalSubnet, externalSubnetDetach, navigate, project, instances]
  )

  const columns = useColsWithActions(staticCols, makeActions)
  const { table } = useQueryTable({
    query: subnetList(project),
    columns,
    emptyState: <EmptyState />,
  })

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Networking24Icon />}>External Subnets</PageTitle>
        <DocsPopover
          heading="external subnets"
          icon={<Networking16Icon />}
          summary="External subnets provide a range of IP addresses from a subnet pool that can be attached to instances."
          links={[]}
        />
      </PageHeader>
      <TableActions>
        <CreateLink to={pb.externalSubnetsNew({ project })}>New External Subnet</CreateLink>
      </TableActions>
      {table}
      <Outlet />
      {subnetToAttach && (
        <AttachExternalSubnetModal
          subnetName={subnetToAttach.name}
          subnetCidr={subnetToAttach.subnet}
          instances={instances.items}
          project={project}
          onDismiss={() => setSubnetToAttach(null)}
        />
      )}
    </>
  )
}

const AttachExternalSubnetModal = ({
  subnetName,
  subnetCidr,
  instances,
  project,
  onDismiss,
}: {
  subnetName: string
  subnetCidr: string
  instances: Array<Instance>
  project: string
  onDismiss: () => void
}) => {
  const externalSubnetAttach = useApiMutation(api.externalSubnetAttach, {
    onSuccess(subnet) {
      queryClient.invalidateEndpoint('externalSubnetList')
      // prettier-ignore
      addToast(<>External subnet <HL>{subnet.name}</HL> attached</>)
      onDismiss()
    },
    onError: (err) => {
      addToast({ title: 'Error', content: err.message, variant: 'error' })
    },
  })

  const form = useForm({ defaultValues: { instanceId: '' } })

  return (
    <ModalForm
      title="Attach external subnet"
      form={form}
      onSubmit={({ instanceId }) => {
        externalSubnetAttach.mutate({
          path: { externalSubnet: subnetName },
          query: { project },
          body: { instance: instanceId },
        })
      }}
      submitLabel="Attach"
      submitError={externalSubnetAttach.error}
      loading={externalSubnetAttach.isPending}
      onDismiss={onDismiss}
    >
      <p className="text-sans-md text-secondary">
        Attach subnet <HL>{subnetCidr}</HL> to an instance
      </p>
      <ListboxField
        control={form.control}
        name="instanceId"
        items={instances.map((i) => ({ value: i.id, label: i.name }))}
        label="Instance"
        required
        placeholder="Select an instance"
      />
    </ModalForm>
  )
}
