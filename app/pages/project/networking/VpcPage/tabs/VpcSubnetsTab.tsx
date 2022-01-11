import React, { useState } from 'react'
import { useParams } from 'app/hooks'
import type { MenuAction } from '@oxide/table'
import { useQueryTable, TwoLineCell, DateCell } from '@oxide/table'
import { Button } from '@oxide/ui'
import { CreateVpcSubnetModal, EditVpcSubnetModal } from '../modals/vpc-subnets'
import type { VpcSubnet } from '@oxide/api'

export const VpcSubnetsTab = () => {
  const vpcParams = useParams('orgName', 'projectName', 'vpcName')

  const { Table, Column } = useQueryTable('vpcSubnetsGet', vpcParams)

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editing, setEditing] = useState<VpcSubnet | null>(null)

  const actions = (subnet: VpcSubnet): MenuAction[] => [
    {
      label: 'Edit',
      onActivate: () => setEditing(subnet),
    },
  ]

  return (
    <>
      <div className="mb-3 flex justify-end space-x-4">
        <Button
          size="xs"
          variant="dim"
          onClick={() => setCreateModalOpen(true)}
        >
          New subnet
        </Button>
        <CreateVpcSubnetModal
          {...vpcParams}
          isOpen={createModalOpen}
          onDismiss={() => setCreateModalOpen(false)}
        />
        <EditVpcSubnetModal
          {...vpcParams}
          originalSubnet={editing} // modal is open if this is non-null
          onDismiss={() => setEditing(null)}
        />
      </div>
      <Table selectable actions={actions}>
        <Column id="name" />
        <Column
          id="ip-block"
          header="IP Block"
          accessor={(vpc) => [vpc.ipv4_block, vpc.ipv6_block]}
          cell={TwoLineCell}
        />
        <Column id="created" accessor="timeCreated" cell={DateCell} />
      </Table>
    </>
  )
}
