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
import { Outlet, useNavigate, type LoaderFunctionArgs } from 'react-router-dom'

import {
  apiQueryClient,
  useApiMutation,
  useApiQuery,
  useApiQueryClient,
  usePrefetchedApiQuery,
  type FloatingIp,
  type Instance,
} from '@oxide/api'
import { IpGlobal16Icon, IpGlobal24Icon } from '@oxide/design-system/icons/react'

import { DocsPopover } from '~/components/DocsPopover'
import { HL } from '~/components/HL'
import { getProjectSelector, useProjectSelector } from '~/hooks'
import { confirmAction } from '~/stores/confirm-action'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { EmptyCell } from '~/table/cells/EmptyCell'
import { InstanceLinkCell } from '~/table/cells/InstanceLinkCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { PAGE_SIZE, useQueryTable } from '~/table/QueryTable'
import { CreateLink } from '~/ui/lib/CreateButton'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { Listbox } from '~/ui/lib/Listbox'
import { Message } from '~/ui/lib/Message'
import { Modal } from '~/ui/lib/Modal'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { TableActions } from '~/ui/lib/Table'
import { Tooltip } from '~/ui/lib/Tooltip'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'

const EmptyState = () => (
  <EmptyMessage
    icon={<IpGlobal24Icon />}
    title="No floating IPs"
    body="You need to create a floating IP to be able to see it here"
    buttonText="New Floating IP"
    buttonTo={pb.floatingIpsNew(useProjectSelector())}
  />
)

FloatingIpsPage.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project } = getProjectSelector(params)
  await Promise.all([
    apiQueryClient.prefetchQuery('floatingIpList', {
      query: { project, limit: PAGE_SIZE },
    }),
    apiQueryClient.prefetchQuery('instanceList', {
      query: { project },
    }),
    apiQueryClient
      .fetchQuery('projectIpPoolList', { query: { limit: 1000 } })
      .then((pools) => {
        for (const pool of pools.items) {
          apiQueryClient.setQueryData(
            'projectIpPoolView',
            { path: { pool: pool.id } },
            pool
          )
        }
      }),
  ])
  return null
}

const IpPoolCell = ({ ipPoolId }: { ipPoolId: string }) => {
  const pool = useApiQuery('projectIpPoolView', { path: { pool: ipPoolId } }).data
  if (!pool) return <EmptyCell />
  return pool.description ? (
    <Tooltip content={pool.description} placement="right">
      <span>{pool.name}</span>
    </Tooltip>
  ) : (
    <>{pool.name}</>
  )
}

const colHelper = createColumnHelper<FloatingIp>()
const staticCols = [
  colHelper.accessor('name', {}),
  colHelper.accessor('description', Columns.description),
  colHelper.accessor('ip', {
    header: 'IP address',
  }),
  colHelper.accessor('ipPoolId', {
    cell: (info) => <IpPoolCell ipPoolId={info.getValue()} />,
    header: 'IP pool',
  }),
  colHelper.accessor('instanceId', {
    cell: (info) => <InstanceLinkCell instanceId={info.getValue()} />,
    header: 'Attached to instance',
  }),
]

export function FloatingIpsPage() {
  const [floatingIpToModify, setFloatingIpToModify] = useState<FloatingIp | null>(null)
  const queryClient = useApiQueryClient()
  const { project } = useProjectSelector()
  const { data: instances } = usePrefetchedApiQuery('instanceList', {
    query: { project },
  })
  const navigate = useNavigate()

  const floatingIpDetach = useApiMutation('floatingIpDetach', {
    onSuccess() {
      queryClient.invalidateQueries('floatingIpList')
      addToast({ content: 'Your floating IP has been detached' })
    },
    onError: (err) => {
      addToast({ title: 'Error', content: err.message, variant: 'error' })
    },
  })
  const deleteFloatingIp = useApiMutation('floatingIpDelete', {
    onSuccess() {
      queryClient.invalidateQueries('floatingIpList')
      queryClient.invalidateQueries('ipPoolUtilizationView')
      addToast({ content: 'Your floating IP has been deleted' })
    },
  })

  const makeActions = useCallback(
    (floatingIp: FloatingIp): MenuAction[] => {
      const instanceName = floatingIp.instanceId
        ? instances.items.find((i) => i.id === floatingIp.instanceId)?.name
        : undefined
      // handling the rather unlikely case where the instance is not in the 1000 we fetched
      const fromInstance = instanceName ? (
        <>
          {' ' /* important */}
          from instance <HL>{instanceName}</HL>
        </>
      ) : null

      const isAttachedToAnInstance = !!floatingIp.instanceId
      const attachOrDetachAction = isAttachedToAnInstance
        ? {
            label: 'Detach',
            onActivate: () =>
              confirmAction({
                actionType: 'danger',
                doAction: () =>
                  floatingIpDetach.mutateAsync({
                    path: { floatingIp: floatingIp.name },
                    query: { project },
                  }),
                modalTitle: 'Detach Floating IP',
                // instanceName! non-null because we only see this if there is an instance
                modalContent: (
                  <p>
                    Are you sure you want to detach floating IP <HL>{floatingIp.name}</HL>
                    {fromInstance}? The instance will no longer be reachable at{' '}
                    <HL>{floatingIp.ip}</HL>.
                  </p>
                ),
                errorTitle: 'Error detaching floating IP',
              }),
          }
        : {
            label: 'Attach',
            onActivate() {
              setFloatingIpToModify(floatingIp)
            },
          }
      return [
        {
          label: 'Edit',
          onActivate: () => {
            apiQueryClient.setQueryData(
              'floatingIpView',
              {
                path: { floatingIp: floatingIp.name },
                query: { project },
              },
              floatingIp
            )
            navigate(pb.floatingIpEdit({ project, floatingIp: floatingIp.name }))
          },
        },
        attachOrDetachAction,
        {
          label: 'Delete',
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
    },
    [deleteFloatingIp, floatingIpDetach, navigate, project, instances]
  )

  const { Table } = useQueryTable('floatingIpList', { query: { project } })

  const columns = useColsWithActions(staticCols, makeActions)

  return (
    <>
      <PageHeader>
        <PageTitle icon={<IpGlobal24Icon />}>Floating IPs</PageTitle>
        <DocsPopover
          heading="floating IPs"
          icon={<IpGlobal16Icon />}
          summary="Floating IPs exist independently of instances and can be attached to and detached from them as needed."
          links={[docLinks.floatingIps]}
        />
      </PageHeader>
      <TableActions>
        <CreateLink to={pb.floatingIpsNew({ project })}>New Floating IP</CreateLink>
      </TableActions>
      <Table columns={columns} emptyState={<EmptyState />} />
      <Outlet />
      {floatingIpToModify && (
        <AttachFloatingIpModal
          floatingIp={floatingIpToModify.name}
          address={floatingIpToModify.ip}
          instances={instances.items}
          project={project}
          onDismiss={() => setFloatingIpToModify(null)}
        />
      )}
    </>
  )
}

const AttachFloatingIpModal = ({
  floatingIp,
  address,
  instances,
  project,
  onDismiss,
}: {
  floatingIp: string
  address: string
  instances: Array<Instance>
  project: string
  onDismiss: () => void
}) => {
  const queryClient = useApiQueryClient()
  const floatingIpAttach = useApiMutation('floatingIpAttach', {
    onSuccess() {
      queryClient.invalidateQueries('floatingIpList')
      addToast({ content: 'Your floating IP has been attached' })
      onDismiss()
    },
    onError: (err) => {
      addToast({ title: 'Error', content: err.message, variant: 'error' })
    },
  })
  const form = useForm({ defaultValues: { instanceId: '' } })

  return (
    <Modal isOpen title="Attach floating IP" onDismiss={onDismiss}>
      <Modal.Body>
        <Modal.Section>
          <Message
            variant="info"
            content={
              <>
                The selected instance will be reachable at <HL>{address}</HL>
              </>
            }
          ></Message>
          <form>
            <Listbox
              name="instanceId"
              items={instances.map((i) => ({ value: i.id, label: i.name }))}
              label="Instance"
              onChange={(e) => {
                form.setValue('instanceId', e)
              }}
              required
              placeholder="Select instance"
              selected={form.watch('instanceId')}
            />
          </form>
        </Modal.Section>
      </Modal.Body>
      <Modal.Footer
        actionText="Attach"
        disabled={!form.getValues('instanceId')}
        onAction={() =>
          floatingIpAttach.mutate({
            path: { floatingIp },
            query: { project },
            body: { kind: 'instance', parent: form.getValues('instanceId') },
          })
        }
        onDismiss={onDismiss}
      ></Modal.Footer>
    </Modal>
  )
}
