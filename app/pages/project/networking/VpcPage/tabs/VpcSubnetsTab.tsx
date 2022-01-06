import React, { useState } from 'react'
import { useParams } from '../../../../../hooks'
import type { MenuAction } from '@oxide/table'
import { useQueryTable, TwoLineCell, DateCell } from '@oxide/table'
import { Button } from '@oxide/ui'
import { CreateVpcSubnetModal } from '../modals/create-subnet'
import { EditVpcSubnetModal } from '../modals/edit-subnet'
import type { VpcSubnet } from '@oxide/api'

export const VpcSubnetsTab = () => {
  const { orgName, projectName, vpcName } = useParams(
    'orgName',
    'projectName',
    'vpcName'
  )

  const { Table, Column } = useQueryTable('vpcSubnetsGet', {
    organizationName: orgName,
    projectName,
    vpcName,
  })

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editingSubnet, setEditingSubnet] = useState<VpcSubnet | null>(null)

  const actions = (subnet: VpcSubnet): MenuAction[] => [
    {
      label: 'Edit',
      onActivate: () => setEditingSubnet(subnet),
      // TODO: disable for default? can you edit it?
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
          New Subnet
        </Button>
        <CreateVpcSubnetModal
          orgName={orgName}
          projectName={projectName}
          vpcName={vpcName}
          isOpen={createModalOpen}
          onDismiss={() => setCreateModalOpen(false)}
        />
        <EditVpcSubnetModal
          orgName={orgName}
          projectName={projectName}
          vpcName={vpcName}
          originalSubnet={editingSubnet} // modal is open if this is non-null
          onDismiss={() => setEditingSubnet(null)}
        />
      </div>
      <Table selectable actions={actions}>
        <Column id="name" accessor="identity.name" />
        <Column
          id="ip-block"
          header="IP Block"
          accessor={(vpc) => [vpc.ipv4_block, vpc.ipv6_block]}
          cell={TwoLineCell}
        />
        <Column id="created" accessor="identity.timeCreated" cell={DateCell} />
      </Table>
    </>
  )
}
