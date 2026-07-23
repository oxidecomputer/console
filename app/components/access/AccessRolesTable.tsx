/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo, useState, type ComponentType } from 'react'

import {
  api,
  byGroupThenName,
  deleteRole,
  q,
  roleOrder,
  rolesByIdFromPolicy,
  useGroupsByUserId,
  usePrefetchedQuery,
  type AccessScope,
  type Group,
  type IdentityType,
  type Policy,
  type RoleKey,
  type User,
} from '@oxide/api'
import { Access24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { ListPlusCell } from '~/components/ListPlusCell'
import { type EditRoleModalProps } from '~/forms/access-util'
import { useCurrentUser } from '~/hooks/use-current-user'
import { ButtonCell } from '~/table/cells/LinkCell'
import { getActionsCol } from '~/table/columns/action-col'
import { Table } from '~/table/Table'
import { CreateButton } from '~/ui/lib/CreateButton'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { TableActions, TableEmptyBox } from '~/ui/lib/Table'
import { TipIcon } from '~/ui/lib/TipIcon'
import { identityTypeLabel, roleColor } from '~/util/access'
import { ALL_ISH } from '~/util/consts'

import { GroupMembersSideModal } from './GroupMembersSideModal'
import {
  buildRemoveRoleAction,
  noRolePermissionReason,
  roleActionLabel,
} from './roleActions'
import { useCanEditPolicy } from './use-can-edit-policy'
import { UserDetailsSideModal } from './UserDetailsSideModal'

// full lists to resolve names and back the detail side modals; the API only
// sorts by id
const userListAll = q(api.userList, { query: { limit: ALL_ISH } })
const groupListAll = q(api.groupList, { query: { limit: ALL_ISH } })

type AccessRow = {
  id: string
  identityType: IdentityType
  name: string
  /** Direct role in the managed scope, if any (drives edit/remove). */
  managedRole: RoleKey | undefined
  /** One badge per scope where the identity has a direct role, strongest first. */
  roleBadges: { scope: AccessScope; roleName: RoleKey }[]
}

const colHelper = createColumnHelper<AccessRow>()

type Props = {
  /** Silo roles contribute to an identity's effective role on both pages. */
  siloPolicy: Policy
  /**
   * Present on the Project Access page only. The managed scope — the one whose
   * direct roles are editable/removable — is the project when this is given,
   * otherwise the silo.
   */
  projectPolicy?: Policy
  /** Modal for editing a role on the managed policy. */
  EditModal: ComponentType<EditRoleModalProps>
  /** Update the managed policy. Called when removing a role. */
  updateManagedPolicy: (newPolicy: Policy) => Promise<unknown>
  /** Open the add-user-or-group modal (from the empty state and header). */
  onAddClick: () => void
}

/**
 * Table of identities with a direct role in one of the given scopes. Clicking a
 * name opens a read-only detail side modal; row actions edit or remove the role
 * in the managed scope. Shared by the Silo Access and Project Access pages.
 */
export function AccessRolesTable({
  siloPolicy,
  projectPolicy,
  EditModal,
  updateManagedPolicy,
  onAddClick,
}: Props) {
  const [editing, setEditing] = useState<{
    row: AccessRow
    defaultRole: RoleKey | undefined
  } | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)

  const { me } = useCurrentUser()
  const { data: users } = usePrefetchedQuery(userListAll)
  const { data: groups } = usePrefetchedQuery(groupListAll)

  const groupsByUserId = useGroupsByUserId(groups.items)
  const usersById = useMemo(() => new Map(users.items.map((u) => [u.id, u])), [users])
  const groupsById = useMemo(() => new Map(groups.items.map((g) => [g.id, g])), [groups])

  const managedScope: AccessScope = projectPolicy ? 'project' : 'silo'
  const managedPolicy = projectPolicy ?? siloPolicy

  const canEditRoles = useCanEditPolicy(siloPolicy, projectPolicy)

  const rows = useMemo(() => {
    const nameById = new Map(
      [...users.items, ...groups.items].map((u) => [u.id, u.displayName])
    )
    const siloRoleById = rolesByIdFromPolicy(siloPolicy)
    const projectRoleById = projectPolicy && rolesByIdFromPolicy(projectPolicy)
    const managedRoleById = projectRoleById ?? siloRoleById

    // an identity appears if it has a direct role in either policy
    const identities = new Map<string, IdentityType>()
    for (const ra of siloPolicy.roleAssignments) {
      identities.set(ra.identityId, ra.identityType)
    }
    for (const ra of projectPolicy?.roleAssignments ?? []) {
      identities.set(ra.identityId, ra.identityType)
    }

    return [...identities.entries()]
      .map(([id, identityType]) => {
        const roleBadges: AccessRow['roleBadges'] = []
        const siloRole = siloRoleById.get(id)
        if (siloRole) roleBadges.push({ scope: 'silo', roleName: siloRole })
        const projectRole = projectRoleById?.get(id)
        if (projectRole) roleBadges.push({ scope: 'project', roleName: projectRole })
        roleBadges.sort((a, b) => roleOrder[a.roleName] - roleOrder[b.roleName]) // strongest first

        return {
          id,
          identityType,
          name: nameById.get(id) ?? id,
          managedRole: managedRoleById.get(id),
          roleBadges,
        } satisfies AccessRow
      })
      .sort(byGroupThenName)
  }, [siloPolicy, projectPolicy, users, groups])

  const multiScope = !!projectPolicy

  const columns = useMemo(
    () => [
      colHelper.accessor('name', {
        header: 'Name',
        cell: (info) => {
          const row = info.row.original
          const user = row.identityType === 'silo_user' ? usersById.get(row.id) : undefined
          const group =
            row.identityType === 'silo_group' ? groupsById.get(row.id) : undefined
          if (user) {
            return (
              <ButtonCell onClick={() => setSelectedUser(user)}>
                {info.getValue()}
              </ButtonCell>
            )
          }
          if (group) {
            return (
              <ButtonCell onClick={() => setSelectedGroup(group)}>
                {info.getValue()}
              </ButtonCell>
            )
          }
          // identity isn't in this silo's user/group list (e.g. cross-silo), so
          // there's no detail to show
          return info.getValue()
        },
      }),
      colHelper.accessor('identityType', {
        header: 'Type',
        cell: (info) => identityTypeLabel[info.getValue()],
      }),
      colHelper.accessor('roleBadges', {
        header: () =>
          multiScope ? (
            <span className="inline-flex items-center">
              Role
              <TipIcon className="ml-2">
                A user or group&apos;s effective role is the strongest role across the silo
                and this project
              </TipIcon>
            </span>
          ) : (
            'Role'
          ),
        cell: (info) => (
          <ListPlusCell tooltipTitle="Other roles">
            {info.getValue().map(({ scope, roleName }) => (
              <Badge key={scope} color={roleColor[roleName]}>
                {scope}.{roleName}
              </Badge>
            ))}
          </ListPlusCell>
        ),
      }),
      getActionsCol((row: AccessRow) => {
        // A row can appear here because of a role in another scope (silo roles
        // show on the project page) without a direct role in the managed scope.
        // There's nothing to change or remove in that case, but a managed-scope
        // role can still be added.
        const editVerb = row.managedRole ? 'change' : 'add'
        return [
          {
            label: roleActionLabel(managedScope, editVerb),
            onActivate: () => setEditing({ row, defaultRole: row.managedRole }),
            disabled: !canEditRoles && noRolePermissionReason(managedScope, editVerb),
          },
          buildRemoveRoleAction({
            name: row.name,
            role: row.managedRole,
            scope: managedScope,
            isSelf: row.id === me.id,
            disabledReason: !canEditRoles
              ? noRolePermissionReason(managedScope, 'remove')
              : // no direct role in this scope to remove — it's inherited from the silo
                !row.managedRole
                ? 'This role is inherited from the silo'
                : undefined,
            doRemove: () => updateManagedPolicy(deleteRole(row.id, managedPolicy)),
          }),
        ]
      }),
    ],
    [
      canEditRoles,
      managedPolicy,
      managedScope,
      updateManagedPolicy,
      me,
      usersById,
      groupsById,
      multiScope,
    ]
  )

  const table = useReactTable({
    columns,
    data: rows,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
      <TableActions>
        <CreateButton onClick={onAddClick}>Add user or group</CreateButton>
      </TableActions>
      {editing && (
        <EditModal
          onDismiss={() => setEditing(null)}
          policy={managedPolicy}
          name={editing.row.name}
          identityId={editing.row.id}
          identityType={editing.row.identityType}
          defaultValues={{ roleName: editing.defaultRole }}
        />
      )}
      {selectedUser && (
        <UserDetailsSideModal
          user={selectedUser}
          onDismiss={() => setSelectedUser(null)}
          siloPolicy={siloPolicy}
          projectPolicy={projectPolicy}
          userGroups={groupsByUserId.get(selectedUser.id) ?? []}
        />
      )}
      {selectedGroup && (
        <GroupMembersSideModal
          group={selectedGroup}
          onDismiss={() => setSelectedGroup(null)}
          siloPolicy={siloPolicy}
          projectPolicy={projectPolicy}
        />
      )}
      {rows.length === 0 ? (
        <TableEmptyBox>
          <EmptyMessage
            icon={<Access24Icon />}
            title="No authorized users"
            body={`Give permission to view, edit, or administer this ${managedScope}`}
            buttonText="Add user or group"
            onClick={onAddClick}
          />
        </TableEmptyBox>
      ) : (
        <Table table={table} />
      )}
    </>
  )
}
