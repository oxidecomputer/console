import { useState } from 'react'

import type { SshKey } from '@oxide/api'
import { useApiQueryClient } from '@oxide/api'
import { useApiMutation } from '@oxide/api'
import type { MenuAction } from '@oxide/table'
import { DateCell, useQueryTable } from '@oxide/table'
import {
  Button,
  EmptyMessage,
  Key16Icon,
  PageHeader,
  PageTitle,
  SideModal,
  TableActions,
} from '@oxide/ui'

import { CreateSSHKeyForm } from 'app/forms/ssh-key-create'

export function SSHKeysPage() {
  const { Table, Column } = useQueryTable('sshkeysGet', {})
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const queryClient = useApiQueryClient()

  const deleteSshKey = useApiMutation('sshkeysDeleteKey', {})

  const makeActions = (sshKey: SshKey): MenuAction[] => [
    {
      label: 'Delete',
      onActivate() {
        deleteSshKey.mutate(
          { sshKeyName: sshKey.name },
          {
            onSuccess: () => {
              queryClient.invalidateQueries('sshkeysGet', {})
            },
          }
        )
      },
    },
  ]

  return (
    <>
      <PageHeader>
        <PageTitle>SSH Keys</PageTitle>
      </PageHeader>
      <TableActions>
        <Button size="xs" variant="secondary" onClick={() => setCreateModalOpen(true)}>
          Add SSH Key
        </Button>
        <SideModal
          id="create-ssh-key-modal"
          isOpen={createModalOpen}
          onDismiss={() => setCreateModalOpen(false)}
        >
          <CreateSSHKeyForm
            onSuccess={() => setCreateModalOpen(false)}
            onDismiss={() => setCreateModalOpen(false)}
          />
        </SideModal>
      </TableActions>
      <Table
        makeActions={makeActions}
        emptyState={
          <EmptyMessage
            icon={<Key16Icon />}
            title="No SSH keys"
            body="You need to create an ssh key to be able to see it here"
            buttonText="Add SSH key"
            onClick={() => setCreateModalOpen(true)}
          />
        }
      >
        <Column accessor="name" header="Name" />
        <Column accessor="description" header="Description" />
        <Column accessor="timeModified" header="Last updated" cell={DateCell} />
      </Table>
    </>
  )
}
