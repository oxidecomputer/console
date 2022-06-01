import type { NetworkInterface } from '@oxide/api'
import { useApiMutation, useApiQuery, useApiQueryClient } from '@oxide/api'
import type { MenuAction } from '@oxide/table'
import { useQueryTable } from '@oxide/table'
import {
  Button,
  Delete16Icon,
  EmptyMessage,
  Info16Icon,
  Networking24Icon,
  Tooltip,
} from '@oxide/ui'
import CreateNetworkInterfaceSideModalForm from 'app/forms/network-interface-create'
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

  const instanceStopped =
    useApiQuery('projectInstancesGetInstance', instanceParams).data?.runState === 'stopped'

  const { Table, Column } = useQueryTable(...getQuery)
  return (
    <>
      <div className="mb-3 flex items-center justify-end space-x-4">
        {
          // TODO: update icon color
          // TODO: the tooltip pops up on the right edge of the icon instead of
          // the middle, wtf. not worth fixing because we're going to redo
          // Tooltip anyway
          // TODO: would be cool to also show the tooltip on button hover when it's disabled
          !instanceStopped && (
            <Tooltip
              id="add-nic-tooltip"
              content="A network interface cannot be added unless the instance is stopped."
            >
              <Info16Icon className="cursor-default text-secondary" />
            </Tooltip>
          )
        }
        <Button
          size="xs"
          variant="secondary"
          onClick={() => setCreateModalOpen(true)}
          disabled={!instanceStopped}
        >
          Add network interface
        </Button>
        <CreateNetworkInterfaceSideModalForm
          isOpen={createModalOpen}
          onDismiss={() => setCreateModalOpen(false)}
          onSuccess={() => setCreateModalOpen(false)}
        />
      </div>
      <Table makeActions={makeActions} emptyState={emptyState}>
        <Column accessor="name" />
        <Column accessor="description" />
        {/* TODO: mark v4 or v6 explicitly? */}
        <Column accessor="ip" />
      </Table>
    </>
  )
}
