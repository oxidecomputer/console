import type { NetworkInterface } from '@oxide/api'
import { useApiQueryClient, useApiMutation } from '@oxide/api'
import type { MenuAction } from '@oxide/table'
import { useQueryTable } from '@oxide/table'
import { Button, Delete16Icon, EmptyMessage, Networking24Icon, SideModal } from '@oxide/ui'
import CreateNetworkInterfaceForm from 'app/forms/network-interface-create'
import { useParams, useToast } from 'app/hooks'
import { useState } from 'react'

export function NetworkingTab() {
  const instanceParams = useParams('orgName', 'projectName', 'instanceName')
  const queryClient = useApiQueryClient()
  const addToast = useToast()

  const [createModalOpen, setCreateModalOpen] = useState(false)

  const getQuery = ['instanceNetworkInterfacesGet', instanceParams] as const

  const deleteNic = useApiMutation('instanceNetworkInterfacesDeleteInterface', {
    onSuccess() {
      queryClient.invalidateQueries(...getQuery)
      addToast({
        icon: <Delete16Icon />,
        title: 'Network interface deleted',
        timeout: 5000,
      })
    },
  })

  const makeActions = (nic: NetworkInterface): MenuAction[] => [
    {
      label: 'Delete',
      onActivate: () => {
        deleteNic.mutate({ ...instanceParams, interfaceName: nic.name })
      },
    },
  ]

  const emptyState = (
    <EmptyMessage
      icon={<Networking24Icon />}
      title="No network interfaces"
      body="You need to create a network interface to be able to see it here"
      buttonText="New network interface"
      onClick={() => setCreateModalOpen(true)}
    />
  )

  const { Table, Column } = useQueryTable(...getQuery)
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
      </div>
      <Table makeActions={makeActions} emptyState={emptyState}>
        <Column id="name" />
        <Column id="description" />
        {/* TODO: mark v4 or v6 explicitly? */}
        <Column id="ip" />
      </Table>
    </>
  )
}
