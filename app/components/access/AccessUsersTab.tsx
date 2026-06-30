/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useCallback, useMemo, useState, type ComponentType } from 'react'
import * as R from 'remeda'

import {
  api,
  deleteRole,
  effectiveScopedRole,
  q,
  roleOrder,
  rolesByIdFromPolicy,
  useGroupsByUserId,
  usePrefetchedQuery,
  userScopedRoleEntries,
  type AccessScope,
  type Policy,
  type RoleKey,
  type ScopedPolicy,
  type User,
} from '@oxide/api'
import { Person24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { HL } from '~/components/HL'
import { ListPlusCell } from '~/components/ListPlusCell'
import { type EditRoleModalProps } from '~/forms/access-util'
import { confirmDelete } from '~/stores/confirm-delete'
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

import { UserDetailsSideModal } from './UserDetailsSideModal'

// The API only sorts users by id, so fetch the full set and sort by name
// client-side. ALL_ISH is the practical ceiling; a silo with more users than
// that would have its tail dropped in (arbitrary) id order.
const userListAll = q(api.userList, { query: { limit: ALL_ISH } })
const groupListAll = q(api.groupList, { query: { limit: ALL_ISH } })

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

type Props = {
  /** Policies that contribute to a user's effective role on this page. */
  scopedPolicies: ScopedPolicy[]
  /** Scope managed by this tab — its direct roles are assignable/removable. */
  managedScope: AccessScope
  /** Modal for assigning/editing a role on the managed policy. */
  EditModal: ComponentType<EditRoleModalProps>
  /** Update the managed policy. Called when removing a role. */
  updateManagedPolicy: (newPolicy: Policy) => Promise<unknown>
}

export function AccessUsersTab({
  scopedPolicies,
  managedScope,
  EditModal,
  updateManagedPolicy,
}: Props) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editingUser, setEditingUser] = useState<EditingState | null>(null)

  const { data: users } = usePrefetchedQuery(userListAll)
  const sortedUsers = useMemo(
    () => R.sortBy(users.items, (u) => u.displayName.toLowerCase()),
    [users]
  )

  const { data: groups } = usePrefetchedQuery(groupListAll)
  const groupsByUserId = useGroupsByUserId(groups.items)

  // non-null: caller is responsible for including the managed scope
  const managedPolicy = scopedPolicies.find((sp) => sp.scope === managedScope)!.policy

  const managedRoleById = useMemo(() => rolesByIdFromPolicy(managedPolicy), [managedPolicy])

  const roleCol = useMemo(
    () =>
      colHelper.display({
        id: 'role',
        header: 'Role',
        cell: ({ row }) => {
          const userGroups = groupsByUserId.get(row.original.id) ?? []
          const entries = userScopedRoleEntries(row.original.id, userGroups, scopedPolicies)
          const effective = effectiveScopedRole(entries)
          if (!effective) return <EmptyCell />
          // show "via groups" tooltip when the displayed role+scope isn't
          // covered by a direct assignment in that scope. (a direct project
          // role doesn't suppress the tooltip if the displayed badge is the
          // silo scope coming via a group, since silo wins ties.)
          const displayedScopeHasDirect = entries.some(
            (e) =>
              e.source.type === 'direct' &&
              e.scope === effective.scope &&
              roleOrder[e.roleName] <= roleOrder[effective.role]
          )
          const viaGroupsMap = new Map<string, { id: string; displayName: string }>()
          if (!displayedScopeHasDirect) {
            for (const e of entries) {
              if (
                e.source.type === 'group' &&
                e.scope === effective.scope &&
                roleOrder[e.roleName] <= roleOrder[effective.role]
              ) {
                viaGroupsMap.set(e.source.group.id, e.source.group)
              }
            }
          }
          const viaGroups = [...viaGroupsMap.values()]
          return (
            <div className="flex items-center gap-1.5">
              <Badge color={roleColor[effective.role]}>
                {effective.scope}.{effective.role}
              </Badge>
              {viaGroups.length > 0 && (
                <TipIcon>
                  via{' '}
                  {viaGroups.map((g, i) => (
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

  const isProject = managedScope === 'project'
  const assignLabel = isProject ? 'Assign project role' : 'Assign role'
  const changeLabel = isProject ? 'Change project role' : 'Change role'
  const removeLabel = isProject ? 'Remove project role' : 'Remove role'

  const makeActions = useCallback(
    (user: User): MenuAction[] => {
      const directManagedRole = managedRoleById.get(user.id)
      const userGroups = groupsByUserId.get(user.id) ?? []
      const entries = userScopedRoleEntries(user.id, userGroups, scopedPolicies)
      const effective = effectiveScopedRole(entries)
      const removeAction = {
        label: directManagedRole ? removeLabel : 'Remove role',
        onActivate: confirmDelete({
          doDelete: () => updateManagedPolicy(deleteRole(user.id, managedPolicy)),
          label: (
            <span>
              the <HL>{directManagedRole}</HL> role for <HL>{user.displayName}</HL>
            </span>
          ),
          resourceKind: 'role assignment',
        }),
        // a direct role on the managed policy is required to remove anything
        disabled:
          !directManagedRole &&
          `Role is inherited; modify the source ${
            entries.find((e) => e.source.type === 'group') ? 'group' : 'silo assignment'
          } to revoke`,
      }
      // No role at all — direct or inherited.
      if (!effective) {
        return [
          {
            label: assignLabel,
            onActivate: () => setEditingUser({ user, defaultRole: undefined }),
          },
        ]
      }
      // For the project tab, an inherited silo role doesn't give us anything to
      // "change" on the project policy — frame it as assigning a project role.
      // For the silo tab, an inherited (via group) role can be promoted to a
      // direct silo assignment via "Change role" pre-filled with the effective
      // role.
      if (isProject && !directManagedRole) {
        return [
          {
            label: assignLabel,
            onActivate: () => setEditingUser({ user, defaultRole: undefined }),
          },
          removeAction,
        ]
      }
      // Pre-fill with the direct managed role if any; otherwise the effective
      // role so the modal opens in 'edit' mode showing the role currently in
      // effect.
      const defaultRole = directManagedRole ?? effective.role
      return [
        {
          label: changeLabel,
          onActivate: () => setEditingUser({ user, defaultRole }),
        },
        removeAction,
      ]
    },
    [
      managedRoleById,
      managedPolicy,
      updateManagedPolicy,
      groupsByUserId,
      scopedPolicies,
      isProject,
      assignLabel,
      changeLabel,
      removeLabel,
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
      {selectedUser && (
        <UserDetailsSideModal
          user={selectedUser}
          onDismiss={() => setSelectedUser(null)}
          scopedPolicies={scopedPolicies}
          userGroups={groupsByUserId.get(selectedUser.id) ?? []}
        />
      )}
    </>
  )
}
