import { useState } from 'react'

import type { VpcSubnet } from '@oxide/api'
import type { MenuAction } from '@oxide/table'
import { DateCell, TwoLineCell, useQueryTable } from '@oxide/table'
import { Button, EmptyMessage } from '@oxide/ui'

import { CreateSubnetSideModalForm } from 'app/forms/subnet-create'
import { EditSubnetSideModalForm } from 'app/forms/subnet-edit'
import { useRequiredParams } from 'app/hooks'

export const VpcSubnetsTab = () => {
  const vpcParams = useRequiredParams('orgName', 'projectName', 'vpcName')

  const { Table, Column } = useQueryTable('vpcSubnetList', { path: vpcParams })
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editing, setEditing] = useState<VpcSubnet | null>(null)

  const makeActions = (subnet: VpcSubnet): MenuAction[] => [
    {
      label: 'Edit',
      onActivate: () => setEditing(subnet),
    },
  ]

  const emptyState = (
    <EmptyMessage
      title="No VPC subnets"
      body="You need to create a subnet to be able to see it here"
      buttonText="New subnet"
      onClick={() => setCreateModalOpen(true)}
    />
  )

  return (
    <>
      <div className="mb-3 flex justify-end space-x-4">
        <Button size="sm" variant="default" onClick={() => setCreateModalOpen(true)}>
          New subnet
        </Button>
        <CreateSubnetSideModalForm
          isOpen={createModalOpen}
          onDismiss={() => setCreateModalOpen(false)}
        />
        <EditSubnetSideModalForm
          isOpen={!!editing}
          initialValues={editing || {}}
          onDismiss={() => setEditing(null)}
        />
      </div>
      <Table makeActions={makeActions} emptyState={emptyState}>
        <Column accessor="name" />
        <Column
          id="ip-block"
          header="IP Block"
          accessor={(vpc) => [vpc.ipv4Block, vpc.ipv6Block]}
          cell={TwoLineCell}
        />
        <Column accessor="timeCreated" cell={DateCell} />
      </Table>
    </>
  )
}
