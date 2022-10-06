import { useState } from 'react'

import type { VpcRouter } from '@oxide/api'
import type { MenuAction } from '@oxide/table'
import { DateCell, LabelCell, useQueryTable } from '@oxide/table'
import { Button, EmptyMessage } from '@oxide/ui'

import { CreateVpcRouterForm } from 'app/forms/vpc-router-create'
import { EditVpcRouterForm } from 'app/forms/vpc-router-edit'
import { useRequiredParams } from 'app/hooks'

export const VpcRoutersTab = () => {
  const vpcParams = useRequiredParams('orgName', 'projectName', 'vpcName')

  const { Table, Column } = useQueryTable('vpcRouterList', vpcParams)

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editing, setEditing] = useState<VpcRouter | null>(null)

  const makeActions = (router: VpcRouter): MenuAction[] => [
    {
      label: 'Edit',
      onActivate: () => setEditing(router),
    },
  ]

  const emptyState = (
    <EmptyMessage
      title="No VPC routers"
      body="You need to create a router to be able to see it here"
      buttonText="New router"
      onClick={() => setCreateModalOpen(true)}
    />
  )

  return (
    <>
      <div className="mb-3 flex justify-end space-x-4">
        <Button size="sm" variant="default" onClick={() => setCreateModalOpen(true)}>
          New router
        </Button>
        <CreateVpcRouterForm
          isOpen={createModalOpen}
          onDismiss={() => setCreateModalOpen(false)}
        />
        <EditVpcRouterForm
          isOpen={!!editing}
          initialValues={editing || {}}
          onDismiss={() => setEditing(null)}
        />
      </div>
      <Table makeActions={makeActions} emptyState={emptyState}>
        <Column accessor="name" />
        <Column accessor="kind" header="type" cell={LabelCell} />
        <Column accessor="timeCreated" header="Created" cell={DateCell} />
      </Table>
    </>
  )
}
