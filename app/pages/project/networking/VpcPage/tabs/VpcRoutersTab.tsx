import React, { useState } from 'react'
import { useParams } from '../../../../../hooks'
import { Button } from '@oxide/ui'
import type { MenuAction } from '@oxide/table'
import { useQueryTable, DateCell, LabelCell } from '@oxide/table'
import type { VpcRouter } from '@oxide/api'
import { CreateVpcRouterModal, EditVpcRouterModal } from '../modals/vpc-routers'

export const VpcRoutersTab = () => {
  const { orgName, projectName, vpcName } = useParams(
    'orgName',
    'projectName',
    'vpcName'
  )

  const { Table, Column } = useQueryTable('vpcRoutersGet', {
    orgName,
    projectName,
    vpcName,
  })

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editing, setEditing] = useState<VpcRouter | null>(null)

  const actions = (router: VpcRouter): MenuAction[] => [
    {
      label: 'Edit',
      onActivate: () => setEditing(router),
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
          New router
        </Button>
        <CreateVpcRouterModal
          orgName={orgName}
          projectName={projectName}
          vpcName={vpcName}
          isOpen={createModalOpen}
          onDismiss={() => setCreateModalOpen(false)}
        />
        <EditVpcRouterModal
          orgName={orgName}
          projectName={projectName}
          vpcName={vpcName}
          originalRouter={editing} // modal is open if this is non-null
          onDismiss={() => setEditing(null)}
        />
      </div>
      <Table selectable actions={actions}>
        <Column id="name" header="Name" accessor="identity.name" />
        <Column id="kind" header="type" accessor="kind" cell={LabelCell} />
        <Column
          id="created"
          header="Created"
          accessor="identity.timeCreated"
          cell={DateCell}
        />
      </Table>
    </>
  )
}
