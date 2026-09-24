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
  type User,
} from '@oxide/api'
import { Person24Icon, PersonGroup16Icon } from '@oxide/design-system/icons/react'
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

import { roleActions } from './roleActions'
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
          // strongest assignment is the effective role; any others are shown in
          // the user detail side modal, reached by clicking the name
          const effective = sortRoleEntries(
            userScopedRoleEntries(row.original.id, userGroups, siloPolicy)
          ).at(0)
          if (!effective) return <EmptyCell />
          return (
            <div className="flex items-center gap-2">
              <Badge color={roleColor[effective.roleName]}>silo.{effective.roleName}</Badge>
              {/* call out when the effective role is inherited rather than direct */}
              {effective.source.type === 'group' && (
                <TipIcon icon={<PersonGroup16Icon className="text-quaternary h-3 w-3" />}>
                  via {effective.source.group.displayName}
                </TipIcon>
              )}
            </div>
          )
        },
      }),
    [groupsByUserId, siloPolicy]
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
      const directRole = roleById.get(user.id)
      const entries = sortRoleEntries(
        userScopedRoleEntries(user.id, userGroups, siloPolicy)
      )
      const effectiveRole = entries[0]?.roleName
      const actions = roleActions('silo', canEdit)
      // No role at all, either direct or inherited.
      if (!effectiveRole) {
        return [actions.add(() => setEditingUser({ user, defaultRole: undefined }))]
      }
      return [
        // An inherited role can be promoted to a direct assignment; prefill the
        // modal with the role the user already has.
        actions.change(() =>
          setEditingUser({ user, defaultRole: directRole ?? effectiveRole })
        ),
        actions.remove({
          name: user.displayName,
          directRole,
          isSelf: user.id === me.id,
          inheritedReason:
            'Role is inherited from a group; it can only be removed from the group.',
          doRemove: () => updatePolicy({ body: deleteRole(user.id, siloPolicy) }),
        }),
      ]
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
          siloPolicy={siloPolicy}
          userGroups={groupsByUserId.get(selectedUser.id) ?? []}
        />
      )}
    </>
  )
}
