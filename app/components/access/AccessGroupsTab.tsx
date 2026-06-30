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
  rolesByIdFromPolicy,
  usePrefetchedQuery,
  type AccessScope,
  type Group,
  type Policy,
  type RoleKey,
  type ScopedPolicy,
} from '@oxide/api'
import { PersonGroup24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { HL } from '~/components/HL'
import { type EditRoleModalProps } from '~/forms/access-util'
import { confirmDelete } from '~/stores/confirm-delete'
import { EmptyCell } from '~/table/cells/EmptyCell'
import { ButtonCell } from '~/table/cells/LinkCell'
import { MemberCountCell } from '~/table/cells/MemberCountCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { Table } from '~/table/Table'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { TableEmptyBox } from '~/ui/lib/Table'
import { roleColor } from '~/util/access'
import { ALL_ISH } from '~/util/consts'

import { GroupMembersSideModal } from './GroupMembersSideModal'

// The API only sorts groups by id, so fetch the full set and sort by name
// client-side. ALL_ISH is the practical ceiling; a silo with more groups than
// that would have its tail dropped in (arbitrary) id order.
const groupListAll = q(api.groupList, { query: { limit: ALL_ISH } })

const colHelper = createColumnHelper<Group>()

const GroupEmptyState = () => (
  <TableEmptyBox>
    <EmptyMessage
      icon={<PersonGroup24Icon />}
      title="No groups"
      body="No groups have been added to this silo"
    />
  </TableEmptyBox>
)

type EditingState = { group: Group; defaultRole: RoleKey | undefined }

type Props = {
  /** Policies that contribute to a group's effective role on this page. */
  scopedPolicies: ScopedPolicy[]
  /** Scope managed by this tab — its direct roles are assignable/removable. */
  managedScope: AccessScope
  /** Modal for assigning/editing a role on the managed policy. */
  EditModal: ComponentType<EditRoleModalProps>
  /** Update the managed policy. Called when removing a role. */
  updateManagedPolicy: (newPolicy: Policy) => Promise<unknown>
}

export function AccessGroupsTab({
  scopedPolicies,
  managedScope,
  EditModal,
  updateManagedPolicy,
}: Props) {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [editingGroup, setEditingGroup] = useState<EditingState | null>(null)

  const { data: groups } = usePrefetchedQuery(groupListAll)
  const sortedGroups = useMemo(
    () => R.sortBy(groups.items, (g) => g.displayName.toLowerCase()),
    [groups]
  )

  // non-null: caller is responsible for including the managed scope
  const managedPolicy = scopedPolicies.find((sp) => sp.scope === managedScope)!.policy

  const managedRoleById = useMemo(() => rolesByIdFromPolicy(managedPolicy), [managedPolicy])

  const roleCol = useMemo(
    () =>
      colHelper.display({
        id: 'role',
        header: 'Role',
        cell: ({ row }) => {
          // groups never inherit roles, so each scoped policy contributes at
          // most one direct entry
          const entries = scopedPolicies.flatMap(({ scope, policy }) => {
            const ra = policy.roleAssignments.find((r) => r.identityId === row.original.id)
            return ra
              ? [{ scope, roleName: ra.roleName, source: { type: 'direct' as const } }]
              : []
          })
          const effective = effectiveScopedRole(entries)
          if (!effective) return <EmptyCell />
          return (
            <Badge color={roleColor[effective.role]}>
              {effective.scope}.{effective.role}
            </Badge>
          )
        },
      }),
    [scopedPolicies]
  )

  const staticColumns = useMemo(
    () => [
      colHelper.accessor('displayName', {
        header: 'Name',
        cell: (info) => (
          <ButtonCell onClick={() => setSelectedGroup(info.row.original)}>
            {info.getValue()}
          </ButtonCell>
        ),
      }),
      roleCol,
      colHelper.display({
        id: 'memberCount',
        header: 'Users',
        cell: ({ row }) => <MemberCountCell groupId={row.original.id} />,
      }),
      colHelper.accessor('timeCreated', Columns.timeCreated),
    ],
    [roleCol]
  )

  const isProject = managedScope === 'project'
  const assignLabel = isProject ? 'Assign project role' : 'Assign role'
  const changeLabel = isProject ? 'Change project role' : 'Change role'
  const removeLabel = isProject ? 'Remove project role' : 'Remove role'

  const makeActions = useCallback(
    (group: Group): MenuAction[] => {
      const directManagedRole = managedRoleById.get(group.id)
      const entries = scopedPolicies.flatMap(({ scope, policy }) => {
        const ra = policy.roleAssignments.find((r) => r.identityId === group.id)
        return ra
          ? [{ scope, roleName: ra.roleName, source: { type: 'direct' as const } }]
          : []
      })
      const effective = effectiveScopedRole(entries)
      const removeAction = {
        label: directManagedRole ? removeLabel : 'Remove role',
        onActivate: confirmDelete({
          doDelete: () => updateManagedPolicy(deleteRole(group.id, managedPolicy)),
          label: (
            <span>
              the <HL>{directManagedRole}</HL> role for <HL>{group.displayName}</HL>
            </span>
          ),
          resourceKind: 'role assignment',
        }),
        disabled:
          !directManagedRole &&
          `Role is inherited from another scope; modify it there to revoke`,
      }
      if (!effective) {
        return [
          {
            label: assignLabel,
            onActivate: () => setEditingGroup({ group, defaultRole: undefined }),
          },
        ]
      }
      // On the project tab, a group's silo role isn't a project assignment to
      // change — frame it as assigning a project role.
      if (isProject && !directManagedRole) {
        return [
          {
            label: assignLabel,
            onActivate: () => setEditingGroup({ group, defaultRole: undefined }),
          },
          removeAction,
        ]
      }
      const defaultRole = directManagedRole ?? effective.role
      return [
        {
          label: changeLabel,
          onActivate: () => setEditingGroup({ group, defaultRole }),
        },
        removeAction,
      ]
    },
    [
      managedRoleById,
      managedPolicy,
      updateManagedPolicy,
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
    data: sortedGroups,
    getRowId: (group) => group.id,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
      {sortedGroups.length === 0 ? <GroupEmptyState /> : <Table table={table} />}
      {editingGroup && (
        <EditModal
          onDismiss={() => setEditingGroup(null)}
          policy={managedPolicy}
          name={editingGroup.group.displayName}
          identityId={editingGroup.group.id}
          identityType="silo_group"
          defaultValues={{ roleName: editingGroup.defaultRole }}
        />
      )}
      {selectedGroup && (
        <GroupMembersSideModal
          group={selectedGroup}
          onDismiss={() => setSelectedGroup(null)}
          scopedPolicies={scopedPolicies}
        />
      )}
    </>
  )
}
