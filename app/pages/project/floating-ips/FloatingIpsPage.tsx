/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Outlet, useNavigate, type LoaderFunctionArgs } from 'react-router-dom'

import {
  apiQueryClient,
  useApiMutation,
  useApiQueryClient,
  usePrefetchedApiQuery,
  type FloatingIp,
  type Instance,
} from '@oxide/api'
import { IpGlobal24Icon, Networking24Icon } from '@oxide/design-system/icons/react'

import { HL } from '~/components/HL'
import { getProjectSelector, useProjectSelector } from '~/hooks'
import { confirmAction } from '~/stores/confirm-action'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { InstanceLinkCell } from '~/table/cells/InstanceLinkCell'
import type { MenuAction } from '~/table/columns/action-col'
import { useQueryTable } from '~/table/QueryTable'
import { buttonStyle } from '~/ui/lib/Button'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { Listbox } from '~/ui/lib/Listbox'
import { Message } from '~/ui/lib/Message'
import { Modal } from '~/ui/lib/Modal'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { TableActions } from '~/ui/lib/Table'
import { pb } from '~/util/path-builder'

const EmptyState = () => (
  <EmptyMessage
    icon={<Networking24Icon />}
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
      query: { project, limit: 25 },
    }),
    apiQueryClient.prefetchQuery('instanceList', {
      query: { project },
    }),
  ])
  return null
}

export function FloatingIpsPage() {
  const [floatingIpToModify, setFloatingIpToModify] = useState<FloatingIp | null>(null)
  const queryClient = useApiQueryClient()
  const { project } = useProjectSelector()
  const { data: instances } = usePrefetchedApiQuery('instanceList', {
    query: { project },
  })
  const navigate = useNavigate()
  const getInstanceName = (instanceId: string) =>
    instances.items.find((i) => i.id === instanceId)?.name

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
      addToast({ content: 'Your floating IP has been deleted' })
    },
  })

  const makeActions = (floatingIp: FloatingIp): MenuAction[] => {
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
              modalContent: (
                <p>
                  Are you sure you want to detach floating IP <HL>{floatingIp.name}</HL>{' '}
                  from instance{' '}
                  <HL>
                    {
                      // instanceId is guaranteed to be non-null here
                      getInstanceName(floatingIp.instanceId!)
                    }
                  </HL>
                  ? The instance will no longer be reachable at <HL>{floatingIp.ip}</HL>.
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
  }

  const { Table, Column } = useQueryTable('floatingIpList', { query: { project } })
  return (
    <>
      <PageHeader>
        <PageTitle icon={<IpGlobal24Icon />}>Floating IPs</PageTitle>
      </PageHeader>
      <TableActions>
        <Link to={pb.floatingIpsNew({ project })} className={buttonStyle({ size: 'sm' })}>
          New Floating IP
        </Link>
      </TableActions>
      <Table emptyState={<EmptyState />} makeActions={makeActions}>
        <Column accessor="name" />
        <Column accessor="description" />
        <Column accessor="ip" />
        <Column
          accessor="instanceId"
          header="Attached to instance"
          cell={InstanceLinkCell}
        />
      </Table>
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
      addToast({ content: 'Your Floating IP has been attached' })
      onDismiss()
    },
    onError: (err) => {
      addToast({ title: 'Error', content: err.message, variant: 'error' })
    },
  })
  const form = useForm({ defaultValues: { instanceId: '' } })

  return (
    <Modal isOpen title="Attach Floating IP" onDismiss={onDismiss}>
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
