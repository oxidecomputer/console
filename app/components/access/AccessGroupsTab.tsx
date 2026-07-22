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
  useApiMutation,
  usePrefetchedQuery,
  type Group,
  type RoleKey,
} from '@oxide/api'
import { PersonGroup24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { SiloAccessEditUserSideModal } from '~/forms/silo-access'
import { addToast } from '~/stores/toast'
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
import { buildRoleActions } from './roleActions'
import { useCanEditSiloPolicy } from './use-can-edit-policy'

// The API only sorts groups by id, so fetch the full set and sort by name
// client-side. ALL_ISH is the practical ceiling; a silo with more groups than
// that would have its tail dropped in (arbitrary) id order.
const groupListAll = q(api.groupList, { query: { limit: ALL_ISH } })
const policyView = q(api.policyView, {})

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

export function AccessGroupsTab() {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [editingGroup, setEditingGroup] = useState<EditingState | null>(null)

  const { data: groups } = usePrefetchedQuery(groupListAll)
  const sortedGroups = useMemo(
    () => R.sortBy(groups.items, (g) => g.displayName.toLowerCase()),
    [groups]
  )

  const { data: siloPolicy } = usePrefetchedQuery(policyView)
  const roleById = useMemo(() => rolesByIdFromPolicy(siloPolicy), [siloPolicy])

  const canEdit = useCanEditSiloPolicy(siloPolicy)

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
          // groups never inherit, so their only silo role is a direct one
          const role = roleById.get(row.original.id)
          if (!role) return <EmptyCell />
          return <Badge color={roleColor[role]}>silo.{role}</Badge>
        },
      }),
    [roleById]
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

  const makeActions = useCallback(
    (group: Group): MenuAction[] => {
      const directRole = roleById.get(group.id)
      return buildRoleActions({
        name: group.displayName,
        directRole,
        effectiveRole: directRole,
        canEdit,
        isSelf: false, // a group is never the current user
        openEditModal: (defaultRole) => setEditingGroup({ group, defaultRole }),
        doRemove: () => updatePolicy({ body: deleteRole(group.id, siloPolicy) }),
      })
    },
    [roleById, siloPolicy, updatePolicy, canEdit]
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
        <SiloAccessEditUserSideModal
          onDismiss={() => setEditingGroup(null)}
          policy={siloPolicy}
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
          scopedPolicies={[{ scope: 'silo', policy: siloPolicy }]}
        />
      )}
    </>
  )
}
