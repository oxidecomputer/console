import { useState } from 'react'

import type { VpcRouter } from '@oxide/api'
import type { MenuAction } from '@oxide/table'
import { DateCell, LabelCell, useQueryTable } from '@oxide/table'
import { Button, EmptyMessage } from '@oxide/ui'

import { CreateVpcRouterForm } from 'app/forms/vpc-router-create'
import { EditVpcRouterForm } from 'app/forms/vpc-router-edit'
import { useVpcSelector } from 'app/hooks'

export const VpcRoutersTab = () => {
  const vpcSelector = useVpcSelector()

  const { Table, Column } = useQueryTable('vpcRouterList', { query: vpcSelector })

  const [creating, setCreating] = useState(false)
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
      onClick={() => setCreating(true)}
    />
  )

  return (
    <>
      <div className="mb-3 flex justify-end space-x-2">
        <Button size="sm" onClick={() => setCreating(true)}>
          New router
        </Button>
        {creating && <CreateVpcRouterForm onDismiss={() => setCreating(false)} />}
        {editing && (
          <EditVpcRouterForm editing={editing} onDismiss={() => setEditing(null)} />
        )}
      </div>
      <Table makeActions={makeActions} emptyState={emptyState}>
        <Column accessor="name" />
        <Column accessor="kind" header="type" cell={LabelCell} />
        <Column accessor="timeCreated" header="Created" cell={DateCell} />
      </Table>
    </>
  )
}
