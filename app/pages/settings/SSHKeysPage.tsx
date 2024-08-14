/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'
import { useCallback } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'

import { apiQueryClient, useApiMutation, useApiQueryClient, type SshKey } from '@oxide/api'
import { Key16Icon, Key24Icon } from '@oxide/design-system/icons/react'

import { DocsPopover } from '~/components/DocsPopover'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { PAGE_SIZE, useQueryTable } from '~/table/QueryTable'
import { buttonStyle } from '~/ui/lib/Button'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { TableActions } from '~/ui/lib/Table'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'

SSHKeysPage.loader = async () => {
  await apiQueryClient.prefetchQuery('currentUserSshKeyList', {
    query: { limit: PAGE_SIZE },
  })
  return null
}

const colHelper = createColumnHelper<SshKey>()
const staticCols = [
  colHelper.accessor('name', {}),
  colHelper.accessor('description', Columns.description),
  colHelper.accessor('timeModified', Columns.timeModified),
]

export function SSHKeysPage() {
  const navigate = useNavigate()

  const { Table } = useQueryTable('currentUserSshKeyList', {})
  const queryClient = useApiQueryClient()

  const deleteSshKey = useApiMutation('currentUserSshKeyDelete', {
    onSuccess: () => {
      queryClient.invalidateQueries('currentUserSshKeyList')
      addToast({ content: 'Your SSH key has been deleted' })
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

  const emptyState = (
    <EmptyMessage
      icon={<Key16Icon />}
      title="No SSH keys"
      body="Add a SSH key to see it here"
      buttonText="Add SSH key"
      onClick={() => navigate(pb.sshKeysNew())}
    />
  )

  const columns = useColsWithActions(staticCols, makeActions)

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Key24Icon />}>SSH Keys</PageTitle>
        <DocsPopover
          heading="SSH key management"
          icon={<Key16Icon />}
          summary="SSH keys are used to securely access VM instances."
          links={[docLinks.sshKeyCreate, docLinks.sshKeyManage]}
        />
      </PageHeader>
      <TableActions>
        <Link className={buttonStyle({ size: 'sm' })} to={pb.sshKeysNew()}>
          Add SSH key
        </Link>
      </TableActions>
      <Table columns={columns} emptyState={emptyState} />
      <Outlet />
    </>
  )
}
