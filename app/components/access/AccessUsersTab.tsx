/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useCallback, useMemo, useState } from 'react'
import * as R from 'remeda'

import {
  api,
  deleteRole,
  q,
  queryClient,
  rolesByIdFromPolicy,
  sortRoleEntries,
  useApiMutation,
  useGroupsByUserId,
  usePrefetchedQuery,
  userScopedRoleEntries,
  type RoleKey,
  type ScopedPolicy,
  type ScopedRoleEntry,
  type User,
} from '@oxide/api'
import { Person24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { ListPlusCell, ListPlusOverflow } from '~/components/ListPlusCell'
import { SiloAccessEditUserSideModal } from '~/forms/silo-access'
import { useCurrentUser } from '~/hooks/use-current-user'
import { addToast } from '~/stores/toast'
import { EmptyCell } from '~/table/cells/EmptyCell'
import { ButtonCell } from '~/table/cells/LinkCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { Table } from '~/table/Table'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { TableEmptyBox } from '~/ui/lib/Table'
import { roleColor } from '~/util/access'
import { ALL_ISH } from '~/util/consts'

import { buildRoleActions } from './roleActions'
import { useCanEditSiloPolicy } from './use-can-edit-policy'
import { UserDetailsSideModal } from './UserDetailsSideModal'

// The API only sorts users by id, so fetch the full set and sort by name
// client-side. ALL_ISH is the practical ceiling; a silo with more users than
// that would have its tail dropped in (arbitrary) id order.
const userListAll = q(api.userList, { query: { limit: ALL_ISH } })
const groupListAll = q(api.groupList, { query: { limit: ALL_ISH } })
const policyView = q(api.policyView, {})

const colHelper = createColumnHelper<User>()

const timeCreatedCol = colHelper.accessor('timeCreated', Columns.timeCreated)

const EmptyState = () => (
  <TableEmptyBox>
    <EmptyMessage
      icon={<Person24Icon />}
      title="No users"
      body="No users have been added to this silo"
    />
  </TableEmptyBox>
)

/** How a user came to hold a role, shown as the source in the "other roles" tooltip. */
const sourceLabel = (source: ScopedRoleEntry['source']) =>
  source.type === 'direct' ? 'Assigned' : `via ${source.group.displayName}`

type EditingState = { user: User; defaultRole: RoleKey | undefined }

export function AccessUsersTab() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editingUser, setEditingUser] = useState<EditingState | null>(null)

  const { data: users } = usePrefetchedQuery(userListAll)
  const sortedUsers = useMemo(
    () => R.sortBy(users.items, (u) => u.displayName.toLowerCase()),
    [users]
  )

  const { data: groups } = usePrefetchedQuery(groupListAll)
  const groupsByUserId = useGroupsByUserId(groups.items)

  const { data: siloPolicy } = usePrefetchedQuery(policyView)
  const roleById = useMemo(() => rolesByIdFromPolicy(siloPolicy), [siloPolicy])
  // silo is the only scope on this page, but userScopedRoleEntries takes a list
  const scopedPolicies = useMemo(
    () => [{ scope: 'silo', policy: siloPolicy }] satisfies ScopedPolicy[],
    [siloPolicy]
  )

  const canEdit = useCanEditSiloPolicy(siloPolicy)
  const { me } = useCurrentUser()

  const { mutateAsync: updatePolicy } = useApiMutation(api.policyUpdate, {
    onSuccess: () => {
      queryClient.invalidateEndpoint('policyView')
      addToast({ content: 'Role removed' })
    },
  })

  const roleCol = useMemo(
    () =>
      colHelper.display({
        id: 'role',
        header: 'Role',
        cell: ({ row }) => {
          const userGroups = groupsByUserId.get(row.original.id) ?? []
          const entries = sortRoleEntries(
            userScopedRoleEntries(row.original.id, userGroups, scopedPolicies)
          )
          if (entries.length === 0) return <EmptyCell />
          // strongest is the effective role; the rest go in the +N tooltip
          const [effective, ...rest] = entries
          return (
            <div className="flex items-center gap-2">
              <Badge color={roleColor[effective.roleName]}>silo.{effective.roleName}</Badge>
              <ListPlusOverflow tooltipTitle="Other roles">
                {rest.map((entry, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Badge color={roleColor[entry.roleName]}>silo.{entry.roleName}</Badge>
                    <span className="text-secondary">{sourceLabel(entry.source)}</span>
                  </div>
                ))}
              </ListPlusOverflow>
            </div>
          )
        },
      }),
    [groupsByUserId, scopedPolicies]
  )

  const groupsCol = useMemo(
    () =>
      colHelper.display({
        id: 'groups',
        header: 'Groups',
        cell: ({ row }) => {
          const userGroups = groupsByUserId.get(row.original.id) ?? []
          return (
            <ListPlusCell tooltipTitle="Groups">
              {userGroups.map((g) => (
                <span key={g.id}>{g.displayName}</span>
              ))}
            </ListPlusCell>
          )
        },
      }),
    [groupsByUserId]
  )

  const staticColumns = useMemo(
    () => [
      colHelper.accessor('displayName', {
        header: 'Name',
        cell: (info) => (
          <ButtonCell onClick={() => setSelectedUser(info.row.original)}>
            {info.getValue()}
          </ButtonCell>
        ),
      }),
      roleCol,
      groupsCol,
      timeCreatedCol,
    ],
    [roleCol, groupsCol]
  )

  const makeActions = useCallback(
    (user: User): MenuAction[] => {
      const userGroups = groupsByUserId.get(user.id) ?? []
      const entries = sortRoleEntries(
        userScopedRoleEntries(user.id, userGroups, scopedPolicies)
      )
      return buildRoleActions({
        name: user.displayName,
        directRole: roleById.get(user.id),
        effectiveRole: entries[0]?.roleName,
        canEdit,
        isSelf: user.id === me.id,
        openEditModal: (defaultRole) => setEditingUser({ user, defaultRole }),
        doRemove: () => updatePolicy({ body: deleteRole(user.id, siloPolicy) }),
      })
    },
    [roleById, siloPolicy, updatePolicy, groupsByUserId, scopedPolicies, canEdit, me]
  )

  const columns = useColsWithActions(staticColumns, makeActions)

  const table = useReactTable({
    columns,
    data: sortedUsers,
    getRowId: (user) => user.id,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
      {sortedUsers.length === 0 ? <EmptyState /> : <Table table={table} />}
      {editingUser && (
        <SiloAccessEditUserSideModal
          onDismiss={() => setEditingUser(null)}
          policy={siloPolicy}
          name={editingUser.user.displayName}
          identityId={editingUser.user.id}
          identityType="silo_user"
          defaultValues={{ roleName: editingUser.defaultRole }}
        />
      )}
      {selectedUser && (
        <UserDetailsSideModal
          user={selectedUser}
          onDismiss={() => setSelectedUser(null)}
          siloPolicy={siloPolicy}
          userGroups={groupsByUserId.get(selectedUser.id) ?? []}
        />
      )}
    </>
  )
}
