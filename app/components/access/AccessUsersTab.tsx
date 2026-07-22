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
  getEffectiveRole,
  q,
  queryClient,
  roleOrder,
  rolesByIdFromPolicy,
  useApiMutation,
  useGroupsByUserId,
  usePrefetchedQuery,
  type Group,
  type RoleKey,
  type User,
} from '@oxide/api'
import { Person24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { ListPlusCell } from '~/components/ListPlusCell'
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
import { TipIcon } from '~/ui/lib/TipIcon'
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

/**
 * A user's effective silo role: the strongest of their direct assignment and
 * any roles inherited from their groups. When no direct assignment covers the
 * effective role, `viaGroups` lists the groups it comes from.
 */
function effectiveSiloRole(
  userId: string,
  userGroups: Group[],
  roleById: Map<string, RoleKey>
): { role: RoleKey; viaGroups: Group[] } | null {
  const directRole = roleById.get(userId)
  const groupEntries = userGroups.flatMap((group) => {
    const role = roleById.get(group.id)
    return role ? [{ group, role }] : []
  })
  const role = getEffectiveRole([
    ...(directRole ? [directRole] : []),
    ...groupEntries.map((e) => e.role),
  ])
  if (!role) return null
  const directCovers = directRole && roleOrder[directRole] <= roleOrder[role]
  const viaGroups = directCovers
    ? []
    : groupEntries.filter((e) => roleOrder[e.role] <= roleOrder[role]).map((e) => e.group)
  return { role, viaGroups }
}

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
          const effective = effectiveSiloRole(row.original.id, userGroups, roleById)
          if (!effective) return <EmptyCell />
          return (
            <div className="flex items-center gap-1.5">
              <Badge color={roleColor[effective.role]}>silo.{effective.role}</Badge>
              {effective.viaGroups.length > 0 && (
                <TipIcon>
                  via{' '}
                  {effective.viaGroups.map((g, i) => (
                    <span key={g.id}>
                      {i > 0 && ', '}
                      {g.displayName}
                    </span>
                  ))}
                </TipIcon>
              )}
            </div>
          )
        },
      }),
    [groupsByUserId, roleById]
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
      const effective = effectiveSiloRole(user.id, userGroups, roleById)
      return buildRoleActions({
        name: user.displayName,
        directRole: roleById.get(user.id),
        effectiveRole: effective?.role,
        canEdit,
        isSelf: user.id === me.id,
        openEditModal: (defaultRole) => setEditingUser({ user, defaultRole }),
        doRemove: () => updatePolicy({ body: deleteRole(user.id, siloPolicy) }),
      })
    },
    [roleById, siloPolicy, updatePolicy, groupsByUserId, canEdit, me]
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
          scopedPolicies={[{ scope: 'silo', policy: siloPolicy }]}
          userGroups={groupsByUserId.get(selectedUser.id) ?? []}
        />
      )}
    </>
  )
}
