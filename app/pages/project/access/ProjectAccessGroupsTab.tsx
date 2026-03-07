/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useQuery } from '@tanstack/react-query'
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
  type Group,
  type User,
} from '@oxide/api'
import { PersonGroup16Icon, PersonGroup24Icon } from '@oxide/design-system/icons/react'
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
const groupList = getListQFn(api.groupList, {})

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const selector = getProjectSelector(params)
  await Promise.all([
    queryClient.prefetchQuery(policyView),
    queryClient.prefetchQuery(projectPolicyView(selector)),
    queryClient.prefetchQuery(groupList.optionsFn()),
  ])
  return null
}

export const handle = titleCrumb('Groups')

const colHelper = createColumnHelper<Group>()

function MemberCountCell({ groupId }: { groupId: string }) {
  const { data } = useQuery(q(api.userList, { query: { group: groupId, limit: ALL_ISH } }))
  return data ? <>{data.items.length}</> : null
}

const GroupEmptyState = () => (
  <EmptyMessage
    icon={<PersonGroup24Icon />}
    title="No groups"
    body="No groups have been added to this silo"
  />
)

type GroupMembersSideModalProps = {
  group: Group
  onDismiss: () => void
}

function GroupMembersSideModal({ group, onDismiss }: GroupMembersSideModalProps) {
  const { data } = useQuery(q(api.userList, { query: { group: group.id, limit: ALL_ISH } }))
  const members = data?.items ?? []

  return (
    <ReadOnlySideModalForm
      title="Group members"
      subtitle={
        <ResourceLabel>
          <PersonGroup16Icon /> {group.displayName}
        </ResourceLabel>
      }
      onDismiss={onDismiss}
      animate
    >
      <PropertiesTable>
        <PropertiesTable.IdRow id={group.id} />
      </PropertiesTable>
      <div className="mt-6">
        {members.length === 0 ? (
          <EmptyMessage
            icon={<PersonGroup24Icon />}
            title="No members"
            body="This group has no members"
          />
        ) : (
          <table className="ox-table text-sans-md w-full border-separate">
            <Table.Header>
              <Table.HeaderRow>
                <Table.HeadCell>Name</Table.HeadCell>
              </Table.HeaderRow>
            </Table.Header>
            <Table.Body>
              {members.map((member: User) => (
                <Table.Row key={member.id}>
                  <Table.Cell>{member.displayName}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </table>
        )}
      </div>
    </ReadOnlySideModalForm>
  )
}

export default function ProjectAccessGroupsTab() {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const projectSelector = useProjectSelector()
  const { project } = projectSelector

  const { data: siloPolicy } = usePrefetchedQuery(policyView)
  const { data: projectPolicy } = usePrefetchedQuery(projectPolicyView(projectSelector))

  const { mutateAsync: updatePolicy } = useApiMutation(api.projectPolicyUpdate, {
    onSuccess: () => {
      queryClient.invalidateEndpoint('projectPolicyView')
      addToast({ content: 'Role updated' })
    },
  })

  const siloRoleById = useMemo(
    () => new Map(siloPolicy.roleAssignments.map((a) => [a.identityId, a.roleName])),
    [siloPolicy]
  )
  const projectRoleById = useMemo(
    () => new Map(projectPolicy.roleAssignments.map((a) => [a.identityId, a.roleName])),
    [projectPolicy]
  )

  const rolesCol = useMemo(
    () =>
      colHelper.display({
        id: 'roles',
        header: () => (
          <span className="inline-flex items-center">
            Role
            <TipIcon className="ml-2">
              A group&apos;s effective role for this project is the strongest role on either
              the silo or project. Groups without an assigned role have no access to this
              project.
            </TipIcon>
          </span>
        ),
        cell: ({ row }) => {
          const siloRole = siloRoleById.get(row.original.id)
          const projectRole = projectRoleById.get(row.original.id)
          const roles = R.sortBy(
            [
              siloRole && { roleName: siloRole, roleSource: 'silo' as const },
              projectRole && { roleName: projectRole, roleSource: 'project' as const },
            ].filter((r) => !!r),
            (r) => roleOrder[r.roleName]
          )
          if (roles.length === 0) return <EmptyCell />
          return (
            <ListPlusCell tooltipTitle="Other roles">
              {roles.map(({ roleName, roleSource }) => (
                <Badge key={roleSource} color={roleColor[roleName]}>
                  {roleSource}.{roleName}
                </Badge>
              ))}
            </ListPlusCell>
          )
        },
      }),
    [siloRoleById, projectRoleById]
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
      rolesCol,
      colHelper.display({
        id: 'memberCount',
        header: 'Users',
        cell: ({ row }) => <MemberCountCell groupId={row.original.id} />,
      }),
      colHelper.accessor('timeCreated', Columns.timeCreated),
    ],
    [rolesCol]
  )

  const makeActions = useCallback(
    (group: Group): MenuAction[] => {
      const projectRole = projectRoleById.get(group.id)
      return [
        { label: 'Change role', onActivate: () => setEditingGroup(group) },
        {
          label: 'Remove role',
          onActivate: confirmDelete({
            doDelete: () =>
              updatePolicy({
                path: { project },
                body: deleteRole(group.id, projectPolicy),
              }),
            label: (
              <span>
                the <HL>{projectRole}</HL> role for <HL>{group.displayName}</HL>
              </span>
            ),
          }),
          disabled: !projectRole && 'This group has no project role to remove',
        },
      ]
    },
    [projectRoleById, projectPolicy, project, updatePolicy]
  )

  const columns = useColsWithActions(staticColumns, makeActions)

  const { table } = useQueryTable({
    query: groupList,
    columns,
    emptyState: <GroupEmptyState />,
  })

  return (
    <>
      {table}
      {selectedGroup && (
        <GroupMembersSideModal
          group={selectedGroup}
          onDismiss={() => setSelectedGroup(null)}
        />
      )}
      {editingGroup && (
        <ProjectAccessEditUserSideModal
          name={editingGroup.displayName}
          identityId={editingGroup.id}
          identityType="silo_group"
          policy={projectPolicy}
          defaultValues={{ roleName: projectRoleById.get(editingGroup.id) }}
          onDismiss={() => setEditingGroup(null)}
        />
      )}
    </>
  )
}
