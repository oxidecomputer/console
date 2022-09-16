import { useState } from 'react'

import type { SshKey } from '@oxide/api'
import { apiQueryClient } from '@oxide/api'
import { useApiQueryClient } from '@oxide/api'
import { useApiMutation } from '@oxide/api'
import type { MenuAction } from '@oxide/table'
import { DateCell, useQueryTable } from '@oxide/table'
import {
  Button,
  EmptyMessage,
  Key16Icon,
  Key24Icon,
  PageHeader,
  PageTitle,
  TableActions,
} from '@oxide/ui'

import { CreateSSHKeySideModalForm } from 'app/forms/ssh-key-create'

SSHKeysPage.loader = async () => {
  await apiQueryClient.prefetchQuery('sessionSshkeyList', { limit: 10 })
}

export function SSHKeysPage() {
  const { Table, Column } = useQueryTable('sessionSshkeyList', {})
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const queryClient = useApiQueryClient()

  const deleteSshKey = useApiMutation('sessionSshkeyDelete', {})

  const makeActions = (sshKey: SshKey): MenuAction[] => [
    {
      label: 'Delete',
      onActivate() {
        deleteSshKey.mutate(
          { sshKeyName: sshKey.name },
          {
            onSuccess: () => {
              queryClient.invalidateQueries('sessionSshkeyList', {})
            },
          }
        )
      },
    },
  ]

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Key24Icon />}>SSH Keys</PageTitle>
      </PageHeader>
      <TableActions>
        <Button size="xs" variant="default" onClick={() => setCreateModalOpen(true)}>
          Add SSH key
        </Button>
        <CreateSSHKeySideModalForm
          isOpen={createModalOpen}
          onDismiss={() => setCreateModalOpen(false)}
        />
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
