/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'
import { useCallback, useMemo, useState } from 'react'
import type { LoaderFunctionArgs } from 'react-router'
import * as R from 'remeda'

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
  userScopedRoleEntries,
  type User,
} from '@oxide/api'
import { Person24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { UserDetailsSideModal } from '~/components/access/UserDetailsSideModal'
import { HL } from '~/components/HL'
import { ListPlusCell } from '~/components/ListPlusCell'
import { ProjectAccessEditUserSideModal } from '~/forms/project-access'
import { titleCrumb } from '~/hooks/use-crumbs'
import { getProjectSelector, useProjectSelector } from '~/hooks/use-params'
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
import type * as PP from '~/util/path-params'

const policyView = q(api.policyView, {})
const projectPolicyView = ({ project }: PP.Project) =>
  q(api.projectPolicyView, { path: { project } })
const userList = getListQFn(api.userList, {})
const groupListAll = q(api.groupList, { query: { limit: ALL_ISH } })

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const selector = getProjectSelector(params)
  const groups = await queryClient.fetchQuery(groupListAll)
  await Promise.all([
    queryClient.prefetchQuery(policyView),
    queryClient.prefetchQuery(projectPolicyView(selector)),
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

export default function ProjectUsersAndGroupsUsersTab() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const projectSelector = useProjectSelector()
  const { project } = projectSelector

  const { data: siloPolicy } = usePrefetchedQuery(policyView)
  const { data: projectPolicy } = usePrefetchedQuery(projectPolicyView(projectSelector))
  const { data: groups } = usePrefetchedQuery(groupListAll)

  const { mutateAsync: updatePolicy } = useApiMutation(api.projectPolicyUpdate, {
    onSuccess: () => {
      queryClient.invalidateEndpoint('projectPolicyView')
      addToast({ content: 'Role updated' })
    },
  })

  // direct role assignments by identity ID, used for action menu
  const projectRoleById = useMemo(() => rolesByIdFromPolicy(projectPolicy), [projectPolicy])

  const groupsByUserId = useGroupsByUserId(groups.items)

  const rolesCol = useMemo(
    () =>
      colHelper.display({
        id: 'roles',
        header: () => (
          <span className="inline-flex items-center">
            Role
            <TipIcon className="ml-2">
              A user&apos;s effective role for this project is the strongest role on either
              the silo or project, including roles inherited via group membership. Users
              without any assigned role have no access to this project.
            </TipIcon>
          </span>
        ),
        cell: ({ row }) => {
          const userGroups = groupsByUserId.get(row.original.id) ?? []
          const roles = R.sortBy(
            userScopedRoleEntries(row.original.id, userGroups, [
              { scope: 'silo', policy: siloPolicy },
              { scope: 'project', policy: projectPolicy },
            ]),
            (e) => roleOrder[e.roleName]
          )
          if (roles.length === 0) return <EmptyCell />
          return (
            <ListPlusCell tooltipTitle="Other roles">
              {roles.map(({ scope, roleName, source }, i) => (
                <span
                  key={`${scope}-${roleName}-${source.type === 'group' ? source.group.id : 'direct'}`}
                  className="inline-flex items-center gap-1"
                >
                  <Badge color={roleColor[roleName]}>
                    {scope}.{roleName}
                  </Badge>
                  {i > 0 && source.type === 'group' && ` via ${source.group.displayName}`}
                  {i === 0 && source.type === 'group' && (
                    <TipIcon>via {source.group.displayName}</TipIcon>
                  )}
                </span>
              ))}
            </ListPlusCell>
          )
        },
      }),
    [groupsByUserId, siloPolicy, projectPolicy]
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
    () => [displayNameCol, rolesCol, groupsCol, timeCreatedCol],
    [displayNameCol, rolesCol, groupsCol]
  )

  const makeActions = useCallback(
    (user: User): MenuAction[] => {
      const projectRole = projectRoleById.get(user.id)
      return [
        { label: 'Change role', onActivate: () => setEditingUser(user) },
        {
          label: 'Remove role',
          onActivate: confirmDelete({
            doDelete: () =>
              updatePolicy({ path: { project }, body: deleteRole(user.id, projectPolicy) }),
            label: (
              <span>
                the <HL>{projectRole}</HL> role for <HL>{user.displayName}</HL>
              </span>
            ),
          }),
          disabled: !projectRole && 'This user has no direct project role to remove',
        },
      ]
    },
    [projectRoleById, projectPolicy, project, updatePolicy]
  )

  const columns = useColsWithActions(staticColumns, makeActions)

  const { table } = useQueryTable({ query: userList, columns, emptyState: <EmptyState /> })

  return (
    <>
      {table}
      {selectedUser && (
        <UserDetailsSideModal
          user={selectedUser}
          onDismiss={() => setSelectedUser(null)}
          scopedPolicies={[
            { scope: 'silo', policy: siloPolicy },
            { scope: 'project', policy: projectPolicy },
          ]}
          userGroups={groupsByUserId.get(selectedUser.id) ?? []}
        />
      )}
      {editingUser && (
        <ProjectAccessEditUserSideModal
          name={editingUser.displayName}
          identityId={editingUser.id}
          identityType="silo_user"
          policy={projectPolicy}
          defaultValues={{ roleName: projectRoleById.get(editingUser.id) }}
          onDismiss={() => setEditingUser(null)}
        />
      )}
    </>
  )
}
