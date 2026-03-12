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
  useApiMutation,
  useGroupsByUserId,
  usePrefetchedQuery,
  userScopedRoleEntries,
  type Group,
  type Policy,
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

function UserDetailsSideModal({
  user,
  onDismiss,
  siloPolicy,
  projectPolicy,
  userGroups,
}: UserDetailsSideModalProps) {
  const roleEntries = userScopedRoleEntries(user.id, userGroups, [
    { scope: 'silo', policy: siloPolicy },
    { scope: 'project', policy: projectPolicy },
  ]).sort(
    (a, b) =>
      roleOrder[a.roleName] - roleOrder[b.roleName] ||
      (a.scope === 'silo' ? -1 : 1) - (b.scope === 'silo' ? -1 : 1)
  )

  return (
    <ReadOnlySideModalForm
      title="User"
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
                    {source.type === 'group' && `via ${source.group.displayName}`}
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

  // direct role assignments by identity ID, used for action menu
  const projectRoleById = useMemo(
    () => new Map(projectPolicy.roleAssignments.map((a) => [a.identityId, a.roleName])),
    [projectPolicy]
  )

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
