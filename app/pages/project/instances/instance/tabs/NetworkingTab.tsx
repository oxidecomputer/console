import { useState } from 'react'
import { Link } from 'react-router-dom'

import type { NetworkInterface } from '@oxide/api'
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

import CreateNetworkInterfaceForm from 'app/forms/network-interface-create'
import EditNetworkInterfaceForm from 'app/forms/network-interface-edit'
import { useRequiredParams, useToast } from 'app/hooks'
import { pb } from 'app/util/path-builder'

const VpcNameFromId = ({ value }: { value: string }) => {
  const { orgName, projectName } = useRequiredParams('orgName', 'projectName')
  const { data: vpc } = useApiQuery('vpcViewById', { path: { id: value } })
  if (!vpc) return null
  return (
    <Link
      className="text-sans-semi-md text-default hover:underline"
      to={pb.vpc({ orgName, projectName, vpcName: vpc.name })}
    >
      {vpc.name}
    </Link>
  )
}

const SubnetNameFromId = ({ value }: { value: string }) => (
  <span className="text-secondary">
    {useApiQuery('vpcSubnetViewById', { path: { id: value } }).data?.name}
  </span>
)

function ExternalIpsFromInstanceName({ value: primary }: { value: boolean }) {
  const instanceParams = useRequiredParams('orgName', 'projectName', 'instanceName')
  const { data } = useApiQuery('instanceExternalIpList', { path: instanceParams })
  const ips = data?.items.map((eip) => eip.ip).join(', ')
  return <span className="text-secondary">{primary ? ips : <>&mdash;</>}</span>
}

export function NetworkingTab() {
  const instanceParams = useRequiredParams('orgName', 'projectName', 'instanceName')
  const queryClient = useApiQueryClient()
  const addToast = useToast()

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editing, setEditing] = useState<NetworkInterface | null>(null)

  const getQuery = ['instanceNetworkInterfaceList', { path: instanceParams }] as const

  const deleteNic = useApiMutation('instanceNetworkInterfaceDelete', {
    onSuccess() {
      queryClient.invalidateQueries(...getQuery)
      addToast({
        icon: <Delete16Icon />,
        title: 'Network interface deleted',
      })
    },
  })

  const editNic = useApiMutation('instanceNetworkInterfaceUpdate', {
    onSuccess() {
      queryClient.invalidateQueries(...getQuery)
    },
  })

  const instanceStopped =
    useApiQuery('instanceView', { path: instanceParams }).data?.runState === 'stopped'

  const makeActions = (nic: NetworkInterface): MenuAction[] => [
    {
      label: 'Make primary',
      onActivate() {
        editNic.mutate({
          path: { ...instanceParams, interfaceName: nic.name },
          body: { ...nic, primary: true },
        })
      },
      disabled: nic.primary || !instanceStopped,
    },
    {
      label: 'Edit',
      onActivate() {
        setEditing(nic)
      },
      disabled: !instanceStopped,
    },
    {
      label: 'Delete',
      className: 'destructive',
      onActivate: () => {
        deleteNic.mutate({ path: { ...instanceParams, interfaceName: nic.name } })
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
          header="External IP"
          // we use primary to decide whether to show the IP in that row
          accessor="primary"
          id="external_ip"
          cell={ExternalIpsFromInstanceName}
        />
        <Column header="vpc" accessor="vpcId" cell={VpcNameFromId} />
        <Column header="subnet" accessor="subnetId" cell={SubnetNameFromId} />
        <Column
          accessor="primary"
          cell={({ value }) =>
            value && (
              <>
                <Success12Icon className="mr-1 text-accent" />
                <Badge>primary</Badge>
              </>
            )
          }
        />
      </Table>
      <div className="mt-4 flex flex-col gap-3">
        <div className="flex gap-3">
          <Button
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            disabled={!instanceStopped}
          >
            Add network interface
          </Button>
        </div>
        {!instanceStopped && (
          <span className="max-w-xs text-sans-md text-tertiary">
            A network interface cannot be created or edited without{' '}
            <a href="#/" className="text-accent-secondary">
              stopping the instance
              <OpenLink12Icon className="ml-1 pt-[1px]" />
            </a>
          </span>
        )}
      </div>

      {createModalOpen && (
        <CreateNetworkInterfaceForm onDismiss={() => setCreateModalOpen(false)} />
      )}
      {editing && (
        <EditNetworkInterfaceForm editing={editing} onDismiss={() => setEditing(null)} />
      )}
    </>
  )
}
