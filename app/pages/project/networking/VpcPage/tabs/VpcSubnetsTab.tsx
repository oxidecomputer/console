import React from 'react'
import { useParams } from 'app/hooks'
import type { MenuAction } from '@oxide/table'
import { useQueryTable, TwoLineCell, DateCell } from '@oxide/table'
import { Button } from '@oxide/ui'
import type { VpcSubnet } from '@oxide/api'
import { useForm } from 'app/hooks/use-form'

export const VpcSubnetsTab = () => {
  const vpcParams = useParams('orgName', 'projectName', 'vpcName')

  const { Table, Column } = useQueryTable('vpcSubnetsGet', vpcParams)
  const [createSubnetForm, showCreateSubnet] = useForm('create-subnet')
  const [editSubnetForm, showEditSubnet] = useForm('edit-subnet')

  const makeActions = (subnet: VpcSubnet): MenuAction[] => [
    {
      label: 'Edit',
      onActivate: () => showEditSubnet({ initialValues: subnet }),
    },
  ]

  return (
    <>
      <div className="mb-3 flex justify-end space-x-4">
        <Button
          size="xs"
          variant="secondary"
          onClick={() => showCreateSubnet()}
        >
          New subnet
        </Button>
        {createSubnetForm}
        {editSubnetForm}
      </div>
      <Table makeActions={makeActions}>
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
