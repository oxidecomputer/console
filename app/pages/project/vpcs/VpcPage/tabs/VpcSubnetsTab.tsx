/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useState } from 'react'

import { useApiMutation, useApiQueryClient, type VpcSubnet } from '@oxide/api'

import { CreateSubnetForm } from '~/forms/subnet-create'
import { EditSubnetForm } from '~/forms/subnet-edit'
import { useVpcSelector } from '~/hooks'
import { confirmDelete } from '~/stores/confirm-delete'
import { DateCell } from '~/table/cells/DateCell'
import { TwoLineCell } from '~/table/cells/TwoLineCell'
import type { MenuAction } from '~/table/columns/action-col'
import { useQueryTable } from '~/table/QueryTable'
import { Button } from '~/ui/lib/Button'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'

export const VpcSubnetsTab = () => {
  const vpcSelector = useVpcSelector()
  const queryClient = useApiQueryClient()

  const { Table, Column } = useQueryTable('vpcSubnetList', { query: vpcSelector })
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<VpcSubnet | null>(null)

  const deleteSubnet = useApiMutation('vpcSubnetDelete', {
    onSuccess() {
      queryClient.invalidateQueries('vpcSubnetList')
    },
  })

  const makeActions = (subnet: VpcSubnet): MenuAction[] => [
    {
      label: 'Edit',
      onActivate: () => setEditing(subnet),
    },
    // TODO: only show if you have permission to do this
    {
      label: 'Delete',
      onActivate: confirmDelete({
        doDelete: () => deleteSubnet.mutateAsync({ path: { subnet: subnet.id } }),
        label: subnet.name,
      }),
    },
  ]

  const emptyState = (
    <EmptyMessage
      title="No VPC subnets"
      body="You need to create a subnet to be able to see it here"
      buttonText="New subnet"
      onClick={() => setCreating(true)}
    />
  )

  return (
    <>
      <div className="mb-3 flex justify-end space-x-2">
        <Button size="sm" onClick={() => setCreating(true)}>
          New subnet
        </Button>
        {creating && <CreateSubnetForm onDismiss={() => setCreating(false)} />}
        {editing && <EditSubnetForm editing={editing} onDismiss={() => setEditing(null)} />}
      </div>
      <Table makeActions={makeActions} emptyState={emptyState}>
        <Column accessor="name" />
        <Column
          id="ip-block"
          header="IP Block"
          accessor={(vpc) => [vpc.ipv4Block, vpc.ipv6Block]}
          cell={TwoLineCell}
        />
        <Column accessor="timeCreated" header="Created" cell={DateCell} />
      </Table>
    </>
  )
}
