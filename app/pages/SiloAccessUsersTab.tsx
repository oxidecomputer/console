/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'
import { useCallback, useMemo, useState } from 'react'

import {
  api,
  deleteRole,
  getListQFn,
  q,
  queryClient,
  roleOrder,
  rolesByIdFromPolicy,
  useApiMutation,
  useGroupsByUserId,
  usePrefetchedQuery,
  userRoleFromPolicies,
  type SiloRole,
  type User,
} from '@oxide/api'
import { Person24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { UserDetailsSideModal } from '~/components/access/UserDetailsSideModal'
import { HL } from '~/components/HL'
import { ListPlusCell } from '~/components/ListPlusCell'
import { SiloAccessEditUserSideModal } from '~/forms/silo-access'
import { titleCrumb } from '~/hooks/use-crumbs'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { EmptyCell } from '~/table/cells/EmptyCell'
import { ButtonCell } from '~/table/cells/LinkCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { TipIcon } from '~/ui/lib/TipIcon'
import { roleColor } from '~/util/access'
import { ALL_ISH } from '~/util/consts'

// data fetching for both tabs lives in the parent SiloAccessPage loader
const policyView = q(api.policyView, {})
const userList = getListQFn(api.userList, {})
const groupListAll = q(api.groupList, { query: { limit: ALL_ISH } })

export const handle = titleCrumb('Users')

const colHelper = createColumnHelper<User>()

const timeCreatedCol = colHelper.accessor('timeCreated', Columns.timeCreated)

const EmptyState = () => (
  <EmptyMessage
    icon={<Person24Icon />}
    title="No users"
    body="No users have been added to this silo"
  />
)

type EditingState = { user: User; defaultRole: SiloRole | undefined }

export default function SiloAccessUsersTab() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editingUser, setEditingUser] = useState<EditingState | null>(null)

  const { data: siloPolicy } = usePrefetchedQuery(policyView)
  const { data: groups } = usePrefetchedQuery(groupListAll)

  const siloRoleById = useMemo(() => rolesByIdFromPolicy(siloPolicy), [siloPolicy])

  const groupsByUserId = useGroupsByUserId(groups.items)

  const { mutateAsync: updatePolicy } = useApiMutation(api.policyUpdate, {
    onSuccess: () => {
      queryClient.invalidateEndpoint('policyView')
      addToast({ content: 'Role removed' })
    },
  })

  const siloRoleCol = useMemo(
    () =>
      colHelper.display({
        id: 'siloRole',
        header: 'Silo Role',
        cell: ({ row }) => {
          const userGroups = groupsByUserId.get(row.original.id) ?? []
          const role = userRoleFromPolicies(row.original, userGroups, siloPolicy)
          if (!role) return <EmptyCell />
          const directRole = siloRoleById.get(row.original.id)
          // groups that have a role at least as strong as the effective role,
          // only relevant when a group is boosting beyond the user's direct assignment
          const viaGroups =
            !directRole || roleOrder[role] < roleOrder[directRole]
              ? userGroups.filter((g) => {
                  const gr = siloRoleById.get(g.id)
                  return gr !== undefined && roleOrder[gr] <= roleOrder[role]
                })
              : []
          return (
            <div className="flex items-center gap-1.5">
              <Badge color={roleColor[role]}>silo.{role}</Badge>
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
    [groupsByUserId, siloPolicy, siloRoleById]
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
      siloRoleCol,
      groupsCol,
      timeCreatedCol,
    ],
    [siloRoleCol, groupsCol]
  )

  const makeActions = useCallback(
    (user: User): MenuAction[] => {
      const directRole = siloRoleById.get(user.id)
      const userGroups = groupsByUserId.get(user.id) ?? []
      const effectiveRole = userRoleFromPolicies(user, userGroups, siloPolicy)
      // Only show "Assign role" when there's no role at all — direct or inherited.
      // If there's any role in the badge, we show Change/Remove (Remove is
      // disabled for inherited-only since there's no direct assignment to delete).
      if (!effectiveRole) {
        return [
          {
            label: 'Assign role',
            onActivate: () => setEditingUser({ user, defaultRole: undefined }),
          },
        ]
      }
      return [
        {
          label: 'Change role',
          // pre-fill with the inherited role when there's no direct assignment,
          // so the modal opens in 'edit' mode rather than 'assign' mode and the
          // user can see what role is currently in effect
          onActivate: () =>
            setEditingUser({ user, defaultRole: directRole ?? effectiveRole }),
        },
        {
          label: 'Remove role',
          onActivate: confirmDelete({
            doDelete: () => updatePolicy({ body: deleteRole(user.id, siloPolicy) }),
            label: (
              <span>
                the <HL>{directRole}</HL> role for <HL>{user.displayName}</HL>
              </span>
            ),
          }),
          disabled:
            !directRole && 'Role is inherited from a group; modify the group to revoke',
        },
      ]
    },
    [siloRoleById, siloPolicy, updatePolicy, groupsByUserId]
  )

  const columns = useColsWithActions(staticColumns, makeActions)

  const { table } = useQueryTable({ query: userList, columns, emptyState: <EmptyState /> })

  return (
    <>
      {table}
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
          policy={siloPolicy}
          userGroups={groupsByUserId.get(selectedUser.id) ?? []}
        />
      )}
    </>
  )
}
