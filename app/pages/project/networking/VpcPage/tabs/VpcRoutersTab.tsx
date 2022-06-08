import { useState } from 'react'

import type { VpcRouter } from '@oxide/api'
import type { MenuAction } from '@oxide/table'
import { DateCell, LabelCell, useQueryTable } from '@oxide/table'
import { Button, EmptyMessage, SideModal } from '@oxide/ui'

import { CreateVpcRouterForm } from 'app/forms/vpc-router-create'
import { EditVpcRouterForm } from 'app/forms/vpc-router-edit'
import { useParams } from 'app/hooks'

export const VpcRoutersTab = () => {
  const vpcParams = useParams('orgName', 'projectName', 'vpcName')

  const { Table, Column } = useQueryTable('vpcRoutersGet', vpcParams)

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
        <Button size="xs" variant="secondary" onClick={() => setCreateModalOpen(true)}>
          New router
        </Button>
        <SideModal
          id="create-router-modal"
          isOpen={createModalOpen}
          onDismiss={() => setCreateModalOpen(false)}
        >
          <CreateVpcRouterForm
            onSuccess={() => setCreateModalOpen(false)}
            onDismiss={() => setCreateModalOpen(false)}
          />
        </SideModal>
        <SideModal
          id="edit-router-modal"
          isOpen={!!editing}
          onDismiss={() => setEditing(null)}
        >
          {editing && (
            <EditVpcRouterForm
              initialValues={editing}
              onSuccess={() => setEditing(null)}
              onDismiss={() => setEditing(null)}
            />
          )}
        </SideModal>
      </div>
      <Table makeActions={makeActions} emptyState={emptyState}>
        <Column accessor="name" />
        <Column accessor="kind" header="type" cell={LabelCell} />
        <Column accessor="timeCreated" header="Created" cell={DateCell} />
      </Table>
    </>
  )
}
