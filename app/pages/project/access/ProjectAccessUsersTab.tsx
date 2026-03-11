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
import type { LoaderFunctionArgs } from 'react-router'
import * as R from 'remeda'

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
  type Policy,
  type RoleKey,
  type User,
} from '@oxide/api'
import { Person16Icon, Person24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { ReadOnlySideModalForm } from '~/components/form/ReadOnlySideModalForm'
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
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { ResourceLabel } from '~/ui/lib/SideModal'
import { Table } from '~/ui/lib/Table'
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

type UserDetailsSideModalProps = {
  user: User
  onDismiss: () => void
  siloPolicy: Policy
  projectPolicy: Policy
  userGroups: Group[]
}

type ProjectRoleEntry = {
  scope: 'silo' | 'project'
  roleName: RoleKey
  source: { type: 'direct' } | { type: 'silo' } | { type: 'group'; group: Group }
}

function UserDetailsSideModal({
  user,
  onDismiss,
  siloPolicy,
  projectPolicy,
  userGroups,
}: UserDetailsSideModalProps) {
  const roleEntries: ProjectRoleEntry[] = []

  const directProjectAssignment = projectPolicy.roleAssignments.find(
    (ra) => ra.identityId === user.id
  )
  if (directProjectAssignment) {
    roleEntries.push({
      scope: 'project',
      roleName: directProjectAssignment.roleName,
      source: { type: 'direct' },
    })
  }

  const directSiloAssignment = siloPolicy.roleAssignments.find(
    (ra) => ra.identityId === user.id
  )
  if (directSiloAssignment) {
    roleEntries.push({
      scope: 'silo',
      roleName: directSiloAssignment.roleName,
      source: { type: 'silo' },
    })
  }

  for (const group of userGroups) {
    const groupProjectAssignment = projectPolicy.roleAssignments.find(
      (ra) => ra.identityId === group.id
    )
    if (groupProjectAssignment) {
      roleEntries.push({
        scope: 'project',
        roleName: groupProjectAssignment.roleName,
        source: { type: 'group', group },
      })
    }

    const groupSiloAssignment = siloPolicy.roleAssignments.find(
      (ra) => ra.identityId === group.id
    )
    if (groupSiloAssignment) {
      roleEntries.push({
        scope: 'silo',
        roleName: groupSiloAssignment.roleName,
        source: { type: 'group', group },
      })
    }
  }

  roleEntries.sort((a, b) => roleOrder[a.roleName] - roleOrder[b.roleName])

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
      <div className="mt-6">
        <table className="ox-table text-sans-md w-full border-separate">
          <Table.Header>
            <Table.HeaderRow>
              <Table.HeadCell>Role</Table.HeadCell>
              <Table.HeadCell>Source</Table.HeadCell>
            </Table.HeaderRow>
          </Table.Header>
          <Table.Body>
            {roleEntries.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={2} className="text-secondary">
                  No roles assigned
                </Table.Cell>
              </Table.Row>
            ) : (
              roleEntries.map(({ scope, roleName, source }, i) => (
                <Table.Row key={i}>
                  <Table.Cell>
                    <Badge color={roleColor[roleName]}>
                      {scope}.{roleName}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {source.type === 'direct' && 'Assigned'}
                    {source.type === 'silo' && 'Inherited from silo'}
                    {source.type === 'group' &&
                      `Inherited from ${source.group.displayName}`}
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </table>
      </div>
      <div className="mt-6">
        <table className="ox-table text-sans-md w-full border-separate">
          <Table.Header>
            <Table.HeaderRow>
              <Table.HeadCell>Groups</Table.HeadCell>
            </Table.HeaderRow>
          </Table.Header>
          <Table.Body>
            {userGroups.length === 0 ? (
              <Table.Row>
                <Table.Cell className="text-secondary">
                  Not a member of any groups
                </Table.Cell>
              </Table.Row>
            ) : (
              userGroups.map((group) => (
                <Table.Row key={group.id}>
                  <Table.Cell>{group.displayName}</Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </table>
      </div>
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

export default function ProjectAccessUsersTab() {
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

  // direct role assignments by identity ID — siloRoleById used for via-group detection,
  // projectRoleById also used for action menu
  const siloRoleById = useMemo(
    () => new Map(siloPolicy.roleAssignments.map((a) => [a.identityId, a.roleName])),
    [siloPolicy]
  )
  const projectRoleById = useMemo(
    () => new Map(projectPolicy.roleAssignments.map((a) => [a.identityId, a.roleName])),
    [projectPolicy]
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
          const siloRole = userRoleFromPolicies(row.original, userGroups, [siloPolicy])
          const projectRole = userRoleFromPolicies(row.original, userGroups, [
            projectPolicy,
          ])

          const viaGroups = (
            effectiveRole: ReturnType<typeof userRoleFromPolicies>,
            directRole: ReturnType<typeof siloRoleById.get>,
            roleMap: typeof siloRoleById
          ) => {
            if (!effectiveRole) return []
            if (directRole && roleOrder[directRole] <= roleOrder[effectiveRole]) return []
            return userGroups.filter((g) => {
              const gr = roleMap.get(g.id)
              return gr !== undefined && roleOrder[gr] <= roleOrder[effectiveRole]
            })
          }

          const siloViaGroups = viaGroups(
            siloRole,
            siloRoleById.get(row.original.id),
            siloRoleById
          )
          const projectViaGroups = viaGroups(
            projectRole,
            projectRoleById.get(row.original.id),
            projectRoleById
          )

          const roles = R.sortBy(
            [
              siloRole && {
                roleName: siloRole,
                roleSource: 'silo' as const,
                viaGroups: siloViaGroups,
              },
              projectRole && {
                roleName: projectRole,
                roleSource: 'project' as const,
                viaGroups: projectViaGroups,
              },
            ].filter((r) => !!r),
            (r) => roleOrder[r.roleName]
          )
          if (roles.length === 0) return <EmptyCell />
          return (
            <ListPlusCell tooltipTitle="Other roles">
              {roles.map(({ roleName, roleSource, viaGroups }, i) => (
                <span key={roleSource} className="inline-flex items-center gap-1">
                  <Badge color={roleColor[roleName]}>
                    {roleSource}.{roleName}
                  </Badge>
                  {i === 0 && viaGroups.length > 0 && (
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
                </span>
              ))}
            </ListPlusCell>
          )
        },
      }),
    [groupsByUserId, siloPolicy, projectPolicy, siloRoleById, projectRoleById]
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
                <Badge color="neutral" key={g.id}>
                  {g.displayName}
                </Badge>
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
          siloPolicy={siloPolicy}
          projectPolicy={projectPolicy}
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
