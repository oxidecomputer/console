/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'
import { useCallback, useMemo } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'

import {
  getListQFn,
  queryClient,
  useApiMutation,
  useApiQueryClient,
  type SshKey,
} from '@oxide/api'
import { Key16Icon, Key24Icon } from '@oxide/design-system/icons/react'

import { DocsPopover } from '~/components/DocsPopover'
import { HL } from '~/components/HL'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { makeLinkCell } from '~/table/cells/LinkCell'
import { getActionsCol, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { buttonStyle } from '~/ui/lib/Button'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { TableActions } from '~/ui/lib/Table'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'

const sshKeyList = () => getListQFn('currentUserSshKeyList', {})
export async function loader() {
  await queryClient.prefetchQuery(sshKeyList().optionsFn())
  return null
}

const colHelper = createColumnHelper<SshKey>()

Component.displayName = 'SSHKeysPage'
export function Component() {
  const navigate = useNavigate()

  const queryClient = useApiQueryClient()

  const { mutateAsync: deleteSshKey } = useApiMutation('currentUserSshKeyDelete', {
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries('currentUserSshKeyList')
      addToast(<>SSH key <HL>{variables.path.sshKey}</HL> deleted</>) // prettier-ignore
    },
  })

  const makeActions = useCallback(
    (sshKey: SshKey): MenuAction[] => [
      {
        label: 'Delete',
        onActivate: confirmDelete({
          doDelete: () => deleteSshKey({ path: { sshKey: sshKey.name } }),
          label: sshKey.name,
        }),
      },
    ],
    [deleteSshKey]
  )

  const columns = useMemo(() => {
    return [
      colHelper.accessor('name', {
        cell: makeLinkCell((sshKey) => pb.sshKeyEdit({ sshKey: sshKey })),
      }),
      colHelper.accessor('description', Columns.description),
      getActionsCol(makeActions),
    ]
  }, [makeActions])

  const emptyState = (
    <EmptyMessage
      icon={<Key16Icon />}
      title="No SSH keys"
      body="Add a SSH key to see it here"
      buttonText="Add SSH key"
      onClick={() => navigate(pb.sshKeysNew())}
    />
  )
  const { table } = useQueryTable({ query: sshKeyList(), columns, emptyState })

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Key24Icon />}>SSH Keys</PageTitle>
        <DocsPopover
          heading="SSH keys"
          icon={<Key16Icon />}
          summary="SSH keys are used to securely access VM instances."
          links={[docLinks.sshKeys]}
        />
      </PageHeader>
      <TableActions>
        <Link className={buttonStyle({ size: 'sm' })} to={pb.sshKeysNew()}>
          Add SSH key
        </Link>
      </TableActions>
      {table}
      <Outlet />
    </>
  )
}
