import { Link, Outlet, useNavigate } from 'react-router-dom'

import type { SshKey } from '@oxide/api'
import { apiQueryClient } from '@oxide/api'
import { useApiQueryClient } from '@oxide/api'
import { useApiMutation } from '@oxide/api'
import type { MenuAction } from '@oxide/table'
import { DateCell, useQueryTable } from '@oxide/table'
import {
  EmptyMessage,
  Key16Icon,
  Key24Icon,
  PageHeader,
  PageTitle,
  TableActions,
  buttonStyle,
} from '@oxide/ui'

import { pb } from 'app/util/path-builder'

SSHKeysPage.loader = async () => {
  await apiQueryClient.prefetchQuery('sessionSshkeyList', { query: { limit: 10 } })
  return null
}

export function SSHKeysPage() {
  const navigate = useNavigate()

  const { Table, Column } = useQueryTable('sessionSshkeyList', {})
  const queryClient = useApiQueryClient()

  const deleteSshKey = useApiMutation('sessionSshkeyDelete', {})

  const makeActions = (sshKey: SshKey): MenuAction[] => [
    {
      label: 'Delete',
      onActivate() {
        deleteSshKey.mutate(
          { path: { sshKeyName: sshKey.name } },
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
        <Link className={buttonStyle({ size: 'sm' })} to={pb.sshKeyNew()}>
          Add SSH key
        </Link>
      </TableActions>
      <Table
        makeActions={makeActions}
        emptyState={
          <EmptyMessage
            icon={<Key16Icon />}
            title="No SSH keys"
            body="You need to create an ssh key to be able to see it here"
            buttonText="Add SSH key"
            onClick={() => navigate(pb.sshKeyNew())}
          />
        }
      >
        <Column accessor="name" header="Name" />
        <Column accessor="description" header="Description" />
        <Column accessor="timeModified" header="Last updated" cell={DateCell} />
      </Table>
      <Outlet />
    </>
  )
}
