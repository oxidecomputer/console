import { useState } from 'react'
import { useParams } from 'app/hooks'
import { Button, EmptyMessage, SideModal } from '@oxide/ui'
import type { MenuAction } from '@oxide/table'
import { useQueryTable, DateCell, LabelCell } from '@oxide/table'
import type { VpcRouter } from '@oxide/api'
import { CreateVpcRouterForm } from 'app/forms/vpc-router-create'
import { EditVpcRouterForm } from 'app/forms/vpc-router-edit'

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
        <Column id="name" header="Name" />
        <Column id="kind" header="type" cell={LabelCell} />
        <Column id="created" header="Created" accessor="timeCreated" cell={DateCell} />
      </Table>
    </>
  )
}
