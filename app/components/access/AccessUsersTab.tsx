/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useCallback, useMemo, useState } from 'react'
import { Outlet } from 'react-router'
import * as R from 'remeda'
import { match } from 'ts-pattern'

import {
  groupsOfUser,
  rolesByIdFromPolicy,
  sortRoleEntries,
  useGroupsByUserId,
  usePrefetchedQuery,
  userScopedRoleEntries,
  type RoleKey,
  type User,
} from '@oxide/api'
import { Person24Icon, PersonGroup16Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { ListPlusCell } from '~/components/ListPlusCell'
import { useCurrentUser } from '~/hooks/use-current-user'
import { EmptyCell, ErrorCell, SkeletonCell } from '~/table/cells/EmptyCell'
import { LinkCell } from '~/table/cells/LinkCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { Table } from '~/table/Table'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { TableEmptyBox } from '~/ui/lib/Table'
import { TipIcon } from '~/ui/lib/TipIcon'
import { roleColor } from '~/util/access'

import { groupListAll, userListAll, type PolicyScope } from './policy-scope'
import { identityRoleActions } from './roleActions'
import { useCanEditPolicy } from './use-can-edit-policy'

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

export function AccessUsersTab({ scope }: { scope: PolicyScope }) {
  const { managedScope, siloPolicy, projectPolicy, managedPolicy, EditModal } = scope
  const { removeRole, userPath } = scope
  const [editingUser, setEditingUser] = useState<EditingState | null>(null)

  const { data: users } = usePrefetchedQuery(userListAll)
  const sortedUsers = useMemo(
    () => R.sortBy(users.items, (u) => u.displayName.toLowerCase()),
    [users]
  )

  const { data: groups } = usePrefetchedQuery(groupListAll)
  const groupsByUserId = useGroupsByUserId(groups.items)

  const managedRoleById = useMemo(() => rolesByIdFromPolicy(managedPolicy), [managedPolicy])

  const canEdit = useCanEditPolicy(siloPolicy, projectPolicy)
  const { me } = useCurrentUser()

  const nameCol = useMemo(
    () =>
      colHelper.accessor('displayName', {
        header: 'Name',
        cell: (info) => (
          <LinkCell to={userPath(info.row.original.id)}>{info.getValue()}</LinkCell>
        ),
      }),
    [userPath]
  )

  const roleCol = useMemo(
    () =>
      colHelper.display({
        id: 'role',
        header: 'Role',
        cell: ({ row }) =>
          match(groupsOfUser(groupsByUserId, row.original.id))
            .with({ status: 'pending' }, () => <SkeletonCell />)
            .with({ status: 'error' }, () => <ErrorCell />)
            .with({ status: 'success' }, ({ data: userGroups }) => {
              // strongest assignment is the effective role; any others are
              // shown in the user detail side modal, reached by clicking the name
              const effective = sortRoleEntries(
                userScopedRoleEntries(
                  row.original.id,
                  userGroups,
                  siloPolicy,
                  projectPolicy
                )
              ).at(0)
              if (!effective) return <EmptyCell />
              return (
                <div className="flex items-center gap-2">
                  <Badge color={roleColor[effective.roleName]}>
                    {effective.scope}.{effective.roleName}
                  </Badge>
                  {/* call out when the effective role is inherited rather than direct */}
                  {effective.source.type === 'group' && (
                    <TipIcon
                      icon={<PersonGroup16Icon className="text-quaternary h-3 w-3" />}
                    >
                      via {effective.source.group.displayName}
                    </TipIcon>
                  )}
                </div>
              )
            })
            .exhaustive(),
      }),
    [groupsByUserId, siloPolicy, projectPolicy]
  )

  const groupsCol = useMemo(
    () =>
      colHelper.display({
        id: 'groups',
        header: 'Groups',
        cell: ({ row }) =>
          match(groupsOfUser(groupsByUserId, row.original.id))
            .with({ status: 'pending' }, () => <SkeletonCell />)
            .with({ status: 'error' }, () => <ErrorCell />)
            .with({ status: 'success' }, ({ data: userGroups }) => (
              <ListPlusCell tooltipTitle="Groups">
                {userGroups.map((g) => (
                  <span key={g.id}>{g.displayName}</span>
                ))}
              </ListPlusCell>
            ))
            .exhaustive(),
      }),
    [groupsByUserId]
  )

  const staticColumns = useMemo(
    () => [nameCol, roleCol, groupsCol, timeCreatedCol],
    [nameCol, roleCol, groupsCol]
  )

  const makeActions = useCallback(
    (user: User): MenuAction[] => {
      // menus open on click, by which point memberships have almost always
      // loaded. If they haven't (or failed), only direct roles drive the actions.
      const groupsState = groupsOfUser(groupsByUserId, user.id)
      const userGroups = groupsState.status === 'success' ? groupsState.data : []
      const effective = sortRoleEntries(
        userScopedRoleEntries(user.id, userGroups, siloPolicy, projectPolicy)
      ).at(0)
      return identityRoleActions({
        scope: managedScope,
        canEdit,
        name: user.displayName,
        directRole: managedRoleById.get(user.id),
        effective,
        isSelf: user.id === me.id,
        onEdit: (defaultRole) => setEditingUser({ user, defaultRole }),
        doRemove: () => removeRole(user.id),
      })
    },
    [
      groupsByUserId,
      siloPolicy,
      projectPolicy,
      managedScope,
      canEdit,
      managedRoleById,
      me,
      removeRole,
    ]
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
        <EditModal
          onDismiss={() => setEditingUser(null)}
          policy={managedPolicy}
          name={editingUser.user.displayName}
          identityId={editingUser.user.id}
          identityType="silo_user"
          defaultValues={{ roleName: editingUser.defaultRole }}
        />
      )}
      <Outlet />
    </>
  )
}
