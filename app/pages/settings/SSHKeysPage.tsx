/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useCallback } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'

import { apiQueryClient, useApiMutation, useApiQueryClient, type SshKey } from '@oxide/api'
import { Key16Icon, Key24Icon } from '@oxide/design-system/icons/react'

import { confirmDelete } from '~/stores/confirm-delete'
import { DateCell } from '~/table/cells/DateCell'
import type { MenuAction } from '~/table/columns/action-col'
import { useQueryTable } from '~/table/QueryTable'
import { buttonStyle } from '~/ui/lib/Button'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { TableActions } from '~/ui/lib/Table'
import { pb } from '~/util/path-builder'

SSHKeysPage.loader = async () => {
  await apiQueryClient.prefetchQuery('currentUserSshKeyList', { query: { limit: 25 } })
  return null
}

export function SSHKeysPage() {
  const navigate = useNavigate()

  const { Table, Column } = useQueryTable('currentUserSshKeyList', {})
  const queryClient = useApiQueryClient()

  const deleteSshKey = useApiMutation('currentUserSshKeyDelete', {
    onSuccess: () => {
      queryClient.invalidateQueries('currentUserSshKeyList')
    },
  })

  const makeActions = useCallback(
    (sshKey: SshKey): MenuAction[] => [
      {
        label: 'Delete',
        onActivate: confirmDelete({
          doDelete: () => deleteSshKey.mutateAsync({ path: { sshKey: sshKey.name } }),
          label: sshKey.name,
        }),
      },
    ],
    [deleteSshKey]
  )

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Key24Icon />}>SSH Keys</PageTitle>
      </PageHeader>
      <TableActions>
        <Link className={buttonStyle({ size: 'sm' })} to={pb.sshKeysNew()}>
          Add SSH key
        </Link>
      </TableActions>
      <Table
        makeActions={makeActions}
        emptyState={
          <EmptyMessage
            icon={<Key16Icon />}
            title="No SSH keys"
            body="You need to add a SSH key to be able to see it here"
            buttonText="Add SSH key"
            onClick={() => navigate(pb.sshKeysNew())}
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
