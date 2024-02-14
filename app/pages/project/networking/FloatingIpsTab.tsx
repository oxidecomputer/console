/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useState } from 'react'
import { Link, Outlet, type LoaderFunctionArgs } from 'react-router-dom'

import {
  apiQueryClient,
  useApiMutation,
  useApiQueryClient,
  usePrefetchedApiQuery,
  type FloatingIp,
} from '@oxide/api'
import { useQueryTable, type MenuAction } from '@oxide/table'
import { buttonStyle, EmptyMessage, Modal, Networking24Icon } from '@oxide/ui'

import { getProjectSelector, useProjectSelector } from 'app/hooks'
import { confirmDelete } from 'app/stores/confirm-delete'
import { addToast } from 'app/stores/toast'
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
  const [attachModalOpen, setAttachModalOpen] = useState(false)
  const [detachModalOpen, setDetachModalOpen] = useState(false)
  const [floatingIpToModify, setFloatingIpToModify] = useState<FloatingIp | null>(null)
  const queryClient = useApiQueryClient()
  const { project } = useProjectSelector()
  const { data: instances } = usePrefetchedApiQuery('instanceList', {
    query: { project },
  })

  const deleteFloatingIp = useApiMutation('floatingIpDelete', {
    onSuccess() {
      queryClient.invalidateQueries('floatingIpList')
      addToast({ content: 'Your Floating IP has been deleted' })
    },
  })

  const makeActions = (floatingIp: FloatingIp): MenuAction[] => {
    const isAttachedToAnInstance = !!floatingIp.instanceId
    return [
      {
        label: 'Attach',
        disabled: isAttachedToAnInstance
          ? 'This floating IP must be detached from the existing instance before it can be attached to a new one'
          : false,
        onActivate() {
          setFloatingIpToModify(floatingIp)
          setAttachModalOpen(true)
        },
      },
      {
        label: 'Detach',
        disabled: isAttachedToAnInstance
          ? false
          : 'This floating IP is not attached to an instance',
        onActivate() {
          setFloatingIpToModify(floatingIp)
          setDetachModalOpen(true)
        },
      },
      {
        label: 'Delete',
        disabled: isAttachedToAnInstance
          ? 'This floating IP must be detached from the instance before it can be deleted'
          : false,
        onActivate: () => {
          confirmDelete({
            doDelete: () =>
              deleteFloatingIp.mutateAsync({
                path: { floatingIp: floatingIp.name },
                query: { project },
              }),
            label: floatingIp.name,
          }),
            setFloatingIpToModify(null)
        },
      },
    ]
  }

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
        <Column accessor="name" />
        <Column accessor="description" />
        <Column accessor="ip" />
        <Column
          accessor="instanceId"
          header="Attached to instance"
          cell={({ value: instanceId }) => getInstanceName(instanceId)}
        />
      </Table>
      <Outlet />
      {attachModalOpen && (
        <AttachFloatingIpModal onDismiss={() => setAttachModalOpen(false)} />
      )}
      {detachModalOpen && floatingIpToModify?.instanceId && (
        <DetachFloatingIpModal
          floatingIp={floatingIpToModify.name}
          instance={getInstanceName(floatingIpToModify.instanceId) || 'this instance'}
          project={project}
          onDismiss={() => setDetachModalOpen(false)}
        />
      )}
    </>
  )
}

const AttachFloatingIpModal = ({ onDismiss }: { onDismiss: () => void }) => {
  return (
    <Modal isOpen title="Attach Floating IP" onDismiss={onDismiss}>
      <Modal.Body>
        <Modal.Section>Select an instance to attach $name to</Modal.Section>
      </Modal.Body>
      <Modal.Footer
        actionText="Attach"
        onAction={() => alert('hi')}
        onDismiss={onDismiss}
      ></Modal.Footer>
    </Modal>
  )
}

const DetachFloatingIpModal = ({
  floatingIp,
  instance,
  project,
  onDismiss,
}: {
  floatingIp: string
  instance: string
  project: string
  onDismiss: () => void
}) => {
  const queryClient = useApiQueryClient()
  const floatingIpDetach = useApiMutation('floatingIpDetach', {
    onSuccess() {
      queryClient.invalidateQueries('floatingIpList')
      addToast({ content: 'Your Floating IP has been detached' })
      onDismiss()
    },
    onError: (err) => {
      addToast({ title: 'Error', content: err.message, variant: 'error' })
    },
  })
  return (
    <Modal isOpen title="Detach Floating IP" onDismiss={onDismiss}>
      <Modal.Body>
        <Modal.Section>
          Detach {floatingIp} from {instance}?
        </Modal.Section>
      </Modal.Body>
      <Modal.Footer
        actionText="Detach"
        onAction={() =>
          floatingIpDetach.mutate({ path: { floatingIp }, query: { project } })
        }
        onDismiss={onDismiss}
      ></Modal.Footer>
    </Modal>
  )
}
