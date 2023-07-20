/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useState } from 'react'
import type { LoaderFunctionArgs } from 'react-router-dom'
import { Link } from 'react-router-dom'

import type { InstanceNetworkInterface } from '@oxide/api'
import {
  apiQueryClient,
  instanceCan,
  useApiMutation,
  useApiQuery,
  useApiQueryClient,
  usePrefetchedApiQuery,
} from '@oxide/api'
import type { MenuAction } from '@oxide/table'
import { useQueryTable } from '@oxide/table'
import { Badge, Button, EmptyMessage, Networking24Icon, Success12Icon } from '@oxide/ui'
import { toPathQuery } from '@oxide/util'

import CreateNetworkInterfaceForm from 'app/forms/network-interface-create'
import EditNetworkInterfaceForm from 'app/forms/network-interface-edit'
import {
  getInstanceSelector,
  useInstanceSelector,
  useProjectSelector,
  useToast,
} from 'app/hooks'
import { confirmDelete } from 'app/stores/confirm-delete'
import { pb } from 'app/util/path-builder'

import { fancifyStates } from './common'

const VpcNameFromId = ({ value }: { value: string }) => {
  const projectSelector = useProjectSelector()
  const { data: vpc } = useApiQuery('vpcView', { path: { vpc: value } })
  if (!vpc) return null
  return (
    <Link
      className="text-sans-semi-md text-default hover:underline"
      to={pb.vpc({ ...projectSelector, vpc: vpc.name })}
    >
      {vpc.name}
    </Link>
  )
}

const SubnetNameFromId = ({ value }: { value: string }) => (
  <span className="text-secondary">
    {useApiQuery('vpcSubnetView', { path: { subnet: value } }).data?.name}
  </span>
)

function ExternalIpsFromInstanceName({ value: primary }: { value: boolean }) {
  const { project, instance } = useInstanceSelector()
  const { data } = useApiQuery('instanceExternalIpList', {
    path: { instance },
    query: { project },
  })
  const ips = data?.items.map((eip) => eip.ip).join(', ')
  return <span className="text-secondary">{primary ? ips : <>&mdash;</>}</span>
}

NetworkingTab.loader = async ({ params }: LoaderFunctionArgs) => {
  const instanceSelector = getInstanceSelector(params)
  await Promise.all([
    apiQueryClient.prefetchQuery('instanceNetworkInterfaceList', {
      query: { ...instanceSelector, limit: 10 },
    }),
    // This is covered by the InstancePage loader but there's no downside to
    // being redundant. If it were removed there, we'd still want it here.
    apiQueryClient.prefetchQuery('instanceView', toPathQuery('instance', instanceSelector)),
  ])
  return null
}

const updateNicStates = fancifyStates(instanceCan.updateNic.states)

export function NetworkingTab() {
  const instanceSelector = useInstanceSelector()

  const queryClient = useApiQueryClient()
  const addToast = useToast()

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editing, setEditing] = useState<InstanceNetworkInterface | null>(null)

  const getQuery = ['instanceNetworkInterfaceList', { query: instanceSelector }] as const

  const createNic = useApiMutation('instanceNetworkInterfaceCreate', {
    onSuccess() {
      queryClient.invalidateQueries('instanceNetworkInterfaceList', {
        query: instanceSelector,
      })
      setCreateModalOpen(false)
    },
  })

  const deleteNic = useApiMutation('instanceNetworkInterfaceDelete', {
    onSuccess() {
      queryClient.invalidateQueries(...getQuery)
      addToast({
        title: 'Network interface deleted',
      })
    },
  })

  const editNic = useApiMutation('instanceNetworkInterfaceUpdate', {
    onSuccess() {
      queryClient.invalidateQueries(...getQuery)
    },
  })

  const { data: instance } = usePrefetchedApiQuery(
    'instanceView',
    toPathQuery('instance', instanceSelector)
  )
  const canUpdateNic = instanceCan.updateNic(instance)

  const makeActions = (nic: InstanceNetworkInterface): MenuAction[] => [
    {
      label: 'Make primary',
      onActivate() {
        editNic.mutate({
          path: { interface: nic.name },
          query: instanceSelector,
          body: { ...nic, primary: true },
        })
      },
      disabled: nic.primary
        ? 'This network interface is already set as primary'
        : !canUpdateNic && (
            <>
              The instance must be {updateNicStates} to change its primary network interface
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
          The instance must be {updateNicStates} before editing a network interface&apos;s
          settings
        </>
      ),
    },
    {
      label: 'Delete',
      onActivate: confirmDelete({
        doDelete: () =>
          deleteNic.mutateAsync({ path: { interface: nic.name }, query: instanceSelector }),
        label: nic.name,
      }),
      disabled: !canUpdateNic && (
        <>The instance must be {updateNicStates} to delete a network interface</>
      ),
    },
  ]

  const emptyState = (
    <EmptyMessage
      icon={<Networking24Icon />}
      title="No network interfaces"
      body="You need to create a network interface to be able to see it here"
    />
  )

  const { Table, Column } = useQueryTable(...getQuery)
  return (
    <>
      <h2 id="nic-label" className="mb-4 text-mono-sm text-secondary">
        Network Interfaces
      </h2>
      <Table labeled-by="nic-label" makeActions={makeActions} emptyState={emptyState}>
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
            disabled={!canUpdateNic}
            disabledReason={
              <>Can only create network interface when instance is {updateNicStates}</>
            }
          >
            Add network interface
          </Button>
        </div>
        {!canUpdateNic && (
          <span className="max-w-xs text-sans-md text-tertiary">
            A network interface cannot be created or edited unless the instance is{' '}
            {updateNicStates}.
          </span>
        )}
      </div>

      {createModalOpen && (
        <CreateNetworkInterfaceForm
          onDismiss={() => setCreateModalOpen(false)}
          onSubmit={(body) => createNic.mutate({ query: instanceSelector, body })}
        />
      )}
      {editing && (
        <EditNetworkInterfaceForm editing={editing} onDismiss={() => setEditing(null)} />
      )}
    </>
  )
}
