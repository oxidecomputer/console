import { useState } from 'react'

import type { VpcSubnet } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import type { MenuAction } from '@oxide/table'
import { DateCell, TwoLineCell, useQueryTable } from '@oxide/table'
import { Button, EmptyMessage } from '@oxide/ui'

import { CreateSubnetForm } from 'app/forms/subnet-create'
import { EditSubnetForm } from 'app/forms/subnet-edit'
import { useVpcSelector } from 'app/hooks'
import { confirmDelete } from 'app/stores/confirm-delete'

export const VpcSubnetsTab = () => {
  const vpcSelector = useVpcSelector()
  const queryClient = useApiQueryClient()

  const { Table, Column } = useQueryTable('vpcSubnetList', { query: vpcSelector })
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<VpcSubnet | null>(null)

  const deleteSubnet = useApiMutation('vpcSubnetDelete', {
    onSuccess() {
      queryClient.invalidateQueries('vpcSubnetList')
    },
  })

  const makeActions = (subnet: VpcSubnet): MenuAction[] => [
    {
      label: 'Edit',
      onActivate: () => setEditing(subnet),
    },
    // TODO: only show if you have permission to do this
    {
      label: 'Delete',
      onActivate: confirmDelete({
        doDelete: () => deleteSubnet.mutateAsync({ path: { subnet: subnet.id } }),
        label: subnet.name,
      }),
    },
  ]

  const emptyState = (
    <EmptyMessage
      title="No VPC subnets"
      body="You need to create a subnet to be able to see it here"
      buttonText="New subnet"
      onClick={() => setCreating(true)}
    />
  )

  return (
    <>
      <div className="mb-3 flex justify-end space-x-2">
        <Button size="sm" onClick={() => setCreating(true)}>
          New subnet
        </Button>
        {creating && <CreateSubnetForm onDismiss={() => setCreating(false)} />}
        {editing && <EditSubnetForm editing={editing} onDismiss={() => setEditing(null)} />}
      </div>
      <Table makeActions={makeActions} emptyState={emptyState}>
        <Column accessor="name" />
        <Column
          id="ip-block"
          header="IP Block"
          accessor={(vpc) => [vpc.ipv4Block, vpc.ipv6Block]}
          cell={TwoLineCell}
        />
        <Column accessor="timeCreated" header="Created" cell={DateCell} />
      </Table>
    </>
  )
}
