import { useState } from 'react'
import { useParams } from 'app/hooks'
import type { MenuAction } from '@oxide/table'
import { useQueryTable, TwoLineCell, DateCell } from '@oxide/table'
import { Button, EmptyMessage, SideModal } from '@oxide/ui'
import type { VpcSubnet } from '@oxide/api'
import { CreateSubnetForm } from 'app/forms/subnet-create'
import { EditSubnetForm } from 'app/forms/subnet-edit'

export const VpcSubnetsTab = () => {
  const vpcParams = useParams('orgName', 'projectName', 'vpcName')

  const { Table, Column } = useQueryTable('vpcSubnetsGet', vpcParams)
  const [showCreate, setShowCreate] = useState(false)
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
      onClick={() => setShowCreate(true)}
    />
  )

  return (
    <>
      <div className="mb-3 flex justify-end space-x-4">
        <Button size="xs" variant="secondary" onClick={() => setShowCreate(true)}>
          New subnet
        </Button>
        <SideModal
          id="create-subnet-modal"
          isOpen={showCreate}
          onDismiss={() => setShowCreate(false)}
        >
          <CreateSubnetForm onSuccess={() => setShowCreate(false)} />
        </SideModal>
        <SideModal
          id="edit-subnet-modal"
          isOpen={!!editing}
          onDismiss={() => setEditing(null)}
        >
          {editing && (
            <EditSubnetForm initialValues={editing} onSuccess={() => setEditing(null)} />
          )}
        </SideModal>
      </div>
      <Table makeActions={makeActions} emptyState={emptyState}>
        <Column id="name" />
        <Column
          id="ip-block"
          header="IP Block"
          accessor={(vpc) => [vpc.ipv4Block, vpc.ipv6Block]}
          cell={TwoLineCell}
        />
        <Column id="created" accessor="timeCreated" cell={DateCell} />
      </Table>
    </>
  )
}
