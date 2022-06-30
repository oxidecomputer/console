import { useState } from 'react'

import type { NetworkInterface, NetworkInterfaceUpdate } from '@oxide/api'
import { useApiMutation, useApiQuery, useApiQueryClient } from '@oxide/api'
import type { MenuAction } from '@oxide/table'
import { useQueryTable } from '@oxide/table'
import {
  Badge,
  Button,
  Delete16Icon,
  EmptyMessage,
  Networking24Icon,
  OpenLink12Icon,
  Success12Icon,
} from '@oxide/ui'

import CreateNetworkInterfaceSideModalForm from 'app/forms/network-interface-create'
import EditNetworkInterfaceSideModalForm from 'app/forms/network-interface-edit'
import { useParams, useToast } from 'app/hooks'

export function NetworkingTab() {
  const instanceParams = useParams('orgName', 'projectName', 'instanceName')
  const queryClient = useApiQueryClient()
  const addToast = useToast()

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editing, setEditing] = useState<NetworkInterfaceUpdate | null>(null)

  const getQuery = ['instanceNetworkInterfacesGet', instanceParams] as const

  const deleteNic = useApiMutation('instanceNetworkInterfacesDeleteInterface', {
    onSuccess() {
      queryClient.invalidateQueries(...getQuery)
      addToast({
        icon: <Delete16Icon />,
        title: 'Network interface deleted',
      })
    },
  })

  const editNic = useApiMutation('instanceNetworkInterfacesPutInterface', {
    onSuccess() {
      queryClient.invalidateQueries(...getQuery)
    },
  })

  const instanceStopped =
    useApiQuery('projectInstancesGetInstance', instanceParams).data?.runState === 'stopped'

  const makeActions = (nic: NetworkInterface): MenuAction[] => [
    {
      label: 'Make primary',
      onActivate() {
        editNic.mutate({
          ...instanceParams,
          interfaceName: nic.name,
          body: { ...nic, makePrimary: true },
        })
      },
      disabled: nic.primary || !instanceStopped,
    },
    {
      label: 'Edit',
      onActivate() {
        // TODO: Revisit after https://github.com/oxidecomputer/omicron/pull/1288 is merged
        setEditing({ ...nic, makePrimary: nic.primary })
      },
      disabled: !instanceStopped,
    },
    {
      label: 'Delete',
      className: 'destructive',
      onActivate: () => {
        deleteNic.mutate({ ...instanceParams, interfaceName: nic.name })
      },
      disabled: !instanceStopped,
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
      <h2 id="network-interfaces" className="mb-4 text-mono-sm text-secondary">
        Network Interfaces
      </h2>
      <Table makeActions={makeActions} emptyState={emptyState}>
        <Column accessor="name" />
        <Column accessor="description" />
        {/* TODO: mark v4 or v6 explicitly? */}
        <Column accessor="ip" />
        <Column
          accessor="primary"
          cell={({ value }) =>
            value && (
              <>
                <Success12Icon className="text-accent mr-1" />
                <Badge variant="secondary">primary</Badge>
              </>
            )
          }
        />
      </Table>
      <div className="mt-4 flex flex-col gap-3">
        <div className="flex gap-3">
          <Button
            size="xs"
            variant="default"
            onClick={() => setCreateModalOpen(true)}
            disabled={!instanceStopped}
          >
            Add network interface
          </Button>
        </div>
        {!instanceStopped && (
          <span className="max-w-xs text-sans-sm text-secondary">
            A network interface cannot be created or edited without{' '}
            <a href="#/" className="text-accent-secondary">
              stopping the instance
              <OpenLink12Icon className="ml-1 pt-[1px]" />
            </a>
          </span>
        )}
      </div>

      <CreateNetworkInterfaceSideModalForm
        isOpen={createModalOpen}
        onDismiss={() => setCreateModalOpen(false)}
      />
      <EditNetworkInterfaceSideModalForm
        isOpen={!!editing}
        initialValues={editing || {}}
        onDismiss={() => setEditing(null)}
      />
    </>
  )
}
