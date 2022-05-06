import type { NetworkInterface } from '@oxide/api'
import type { MenuAction } from '@oxide/table'
import { useQueryTable } from '@oxide/table'
import { Button, EmptyMessage, Networking24Icon, SideModal } from '@oxide/ui'
import CreateNetworkInterfaceForm from 'app/forms/network-interface-create'
import { useParams } from 'app/hooks'
import { useState } from 'react'

const EmptyState = () => (
  <EmptyMessage
    icon={<Networking24Icon />}
    title="No network interfaces"
    body="You need to create a network interface to be able to see it here"
    // TODO: can you even add NICs after instance create?
    // buttonText="New network interface"
    // buttonTo="new"
  />
)

export function NetworkingTab() {
  const instanceParams = useParams('orgName', 'projectName', 'instanceName')

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editing, setEditing] = useState<NetworkInterface | null>(null)

  const makeActions = (nic: NetworkInterface): MenuAction[] => [
    {
      label: 'Edit',
      onActivate: () => setEditing(nic),
    },
  ]

  const { Table, Column } = useQueryTable('instanceNetworkInterfacesGet', instanceParams)
  return (
    <>
      <div className="mb-3 flex justify-end space-x-4">
        <Button size="xs" variant="secondary" onClick={() => setCreateModalOpen(true)}>
          Add network interface
        </Button>
        <SideModal
          id="create-nic-modal"
          isOpen={createModalOpen}
          onDismiss={() => setCreateModalOpen(false)}
        >
          <CreateNetworkInterfaceForm
            onSuccess={() => setCreateModalOpen(false)}
            onDismiss={() => setCreateModalOpen(false)}
          />
        </SideModal>
        <SideModal
          id="edit-nic-modal"
          isOpen={!!editing}
          onDismiss={() => setEditing(null)}
        >
          {editing && null}
        </SideModal>
      </div>
      <Table makeActions={makeActions} emptyState={<EmptyState />}>
        <Column id="name" />
        <Column id="description" />
        {/* TODO: mark v4 or v6 explicitly? */}
        <Column id="ip" />
      </Table>
    </>
  )
}
