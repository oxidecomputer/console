/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'
import { useMemo, useState } from 'react'

import {
  api,
  getListQFn,
  q,
  queryClient,
  roleOrder,
  rolesByIdFromPolicy,
  useGroupsByUserId,
  usePrefetchedQuery,
  userRoleFromPolicies,
  type User,
} from '@oxide/api'
import { Person24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { UserDetailsSideModal } from '~/components/access/UserDetailsSideModal'
import { ListPlusCell } from '~/components/ListPlusCell'
import { titleCrumb } from '~/hooks/use-crumbs'
import { EmptyCell } from '~/table/cells/EmptyCell'
import { ButtonCell } from '~/table/cells/LinkCell'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
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

const EmptyState = () => (
  <EmptyMessage
    icon={<Person24Icon />}
    title="No users"
    body="No users have been added to this silo"
  />
)

export default function SiloUsersAndGroupsUsersTab() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const { data: siloPolicy } = usePrefetchedQuery(policyView)
  const { data: groups } = usePrefetchedQuery(groupListAll)

  const siloRoleById = useMemo(() => rolesByIdFromPolicy(siloPolicy), [siloPolicy])

  const groupsByUserId = useGroupsByUserId(groups.items)

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

  const columns = useMemo(
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

  const { table } = useQueryTable({ query: userList, columns, emptyState: <EmptyState /> })

  return (
    <>
      {table}
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
