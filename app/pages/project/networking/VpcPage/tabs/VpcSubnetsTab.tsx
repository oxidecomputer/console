import React, { useState } from 'react'
import { useParams } from '../../../../../hooks'
import { useQueryTable, TwoLineCell, DateCell } from '@oxide/table'
import { Button } from '@oxide/ui'
import { CreateVpcSubnetModal } from '../modals/create-subnet'

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
      </div>
      <Table selectable>
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
