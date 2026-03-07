/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useQueries } from '@tanstack/react-query'
import { createColumnHelper } from '@tanstack/react-table'
import { useCallback, useMemo, useState } from 'react'

import {
  api,
  deleteRole,
  getListQFn,
  q,
  queryClient,
  roleOrder,
  useApiMutation,
  usePrefetchedQuery,
  userRoleFromPolicies,
  type Group,
  type User,
} from '@oxide/api'
import { Person16Icon, Person24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { ReadOnlySideModalForm } from '~/components/form/ReadOnlySideModalForm'
import { HL } from '~/components/HL'
import { ListPlusCell } from '~/components/ListPlusCell'
import { SiloAccessEditUserSideModal } from '~/forms/silo-access'
import { titleCrumb } from '~/hooks/use-crumbs'
import { confirmDelete } from '~/stores/confirm-delete'
import { EmptyCell } from '~/table/cells/EmptyCell'
import { ButtonCell } from '~/table/cells/LinkCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { ResourceLabel } from '~/ui/lib/SideModal'
import { TipIcon } from '~/ui/lib/TipIcon'
import { roleColor } from '~/util/access'
import { ALL_ISH } from '~/util/consts'

const policyView = q(api.policyView, {})
const userList = getListQFn(api.userList, {})
const groupListAll = q(api.groupList, { query: { limit: ALL_ISH } })

export async function clientLoader() {
  const groups = await queryClient.fetchQuery(groupListAll)
  await Promise.all([
    queryClient.prefetchQuery(policyView),
    queryClient.prefetchQuery(userList.optionsFn()),
    ...groups.items.map((g) =>
      queryClient.prefetchQuery(q(api.userList, { query: { group: g.id, limit: ALL_ISH } }))
    ),
  ])
  return null
}

export const handle = titleCrumb('Users')

const colHelper = createColumnHelper<User>()

const timeCreatedCol = colHelper.accessor('timeCreated', Columns.timeCreated)

type UserDetailsSideModalProps = {
  user: User
  onDismiss: () => void
}

function UserDetailsSideModal({ user, onDismiss }: UserDetailsSideModalProps) {
  return (
    <ReadOnlySideModalForm
      title="User details"
      subtitle={
        <ResourceLabel>
          <Person16Icon /> {user.displayName}
        </ResourceLabel>
      }
      onDismiss={onDismiss}
      animate
    >
      <PropertiesTable>
        <PropertiesTable.IdRow id={user.id} />
        <PropertiesTable.DateRow label="Created" date={user.timeCreated} />
      </PropertiesTable>
    </ReadOnlySideModalForm>
  )
}

const EmptyState = () => (
  <EmptyMessage
    icon={<Person24Icon />}
    title="No users"
    body="No users have been added to this silo"
  />
)

export default function SiloAccessUsersTab() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const { data: siloPolicy } = usePrefetchedQuery(policyView)
  const { data: groups } = usePrefetchedQuery(groupListAll)

  const { mutateAsync: updatePolicy } = useApiMutation(api.policyUpdate, {
    onSuccess: () => queryClient.invalidateEndpoint('policyView'),
  })

  // direct role assignments by identity ID, used for action menu
  const siloRoleById = useMemo(
    () => new Map(siloPolicy.roleAssignments.map((a) => [a.identityId, a.roleName])),
    [siloPolicy]
  )

  const groupMemberQueries = useQueries({
    queries: groups.items.map((g) =>
      q(api.userList, { query: { group: g.id, limit: ALL_ISH } })
    ),
  })

  // map from user ID to the groups they belong to
  const groupsByUserId = useMemo(() => {
    const map = new Map<string, Group[]>()
    groups.items.forEach((group, i) => {
      const members = groupMemberQueries[i]?.data?.items ?? []
      members.forEach((member) => {
        map.set(member.id, [...(map.get(member.id) ?? []), group])
      })
    })
    return map
  }, [groups, groupMemberQueries])

  const siloRoleCol = useMemo(
    () =>
      colHelper.display({
        id: 'siloRole',
        header: 'Silo Role',
        cell: ({ row }) => {
          const userGroups = groupsByUserId.get(row.original.id) ?? []
          const role = userRoleFromPolicies(row.original, userGroups, [siloPolicy])
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
                      <Badge color="neutral">{g.displayName}</Badge>
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

  const displayNameCol = useMemo(
    () =>
      colHelper.accessor('displayName', {
        header: 'Name',
        cell: (info) => (
          <ButtonCell onClick={() => setSelectedUser(info.row.original)}>
            {info.getValue()}
          </ButtonCell>
        ),
      }),
    []
  )

  const staticColumns = useMemo(
    () => [displayNameCol, siloRoleCol, groupsCol, timeCreatedCol],
    [displayNameCol, siloRoleCol, groupsCol]
  )

  const makeActions = useCallback(
    (user: User): MenuAction[] => {
      const role = siloRoleById.get(user.id)
      return [
        { label: 'Change role', onActivate: () => setEditingUser(user) },
        {
          label: 'Remove role',
          onActivate: confirmDelete({
            doDelete: () => updatePolicy({ body: deleteRole(user.id, siloPolicy) }),
            label: (
              <span>
                the <HL>{role}</HL> role for <HL>{user.displayName}</HL>
              </span>
            ),
          }),
          disabled: !role && 'This user has no direct role to remove',
        },
      ]
    },
    [siloRoleById, siloPolicy, updatePolicy]
  )

  const columns = useColsWithActions(staticColumns, makeActions)

  const { table } = useQueryTable({ query: userList, columns, emptyState: <EmptyState /> })

  return (
    <>
      {table}
      {selectedUser && (
        <UserDetailsSideModal user={selectedUser} onDismiss={() => setSelectedUser(null)} />
      )}
      {editingUser && (
        <SiloAccessEditUserSideModal
          name={editingUser.displayName}
          identityId={editingUser.id}
          identityType="silo_user"
          policy={siloPolicy}
          defaultValues={{ roleName: siloRoleById.get(editingUser.id) }}
          onDismiss={() => setEditingUser(null)}
        />
      )}
    </>
  )
}
