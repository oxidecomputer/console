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
  type Policy,
  type RoleKey,
  type User,
} from '@oxide/api'
import { PersonGroup16Icon, PersonGroup24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { ReadOnlySideModalForm } from '~/components/form/ReadOnlySideModalForm'
import { HL } from '~/components/HL'
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
import { Table } from '~/ui/lib/Table'
import { roleColor } from '~/util/access'
import { ALL_ISH } from '~/util/consts'

const policyView = q(api.policyView, {})
const groupList = getListQFn(api.groupList, {})

export async function clientLoader() {
  await Promise.all([
    queryClient.prefetchQuery(policyView),
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
  siloPolicy: Policy
}

type SiloGroupRoleEntry = {
  scope: 'silo'
  roleName: RoleKey
  source: { type: 'direct' }
}

function GroupMembersSideModal({
  group,
  onDismiss,
  siloPolicy,
}: GroupMembersSideModalProps) {
  const { data } = useQuery(q(api.userList, { query: { group: group.id, limit: ALL_ISH } }))
  const members = data?.items ?? []

  const roleEntries: SiloGroupRoleEntry[] = []
  const directAssignment = siloPolicy.roleAssignments.find(
    (ra) => ra.identityId === group.id
  )
  if (directAssignment) {
    roleEntries.push({
      scope: 'silo',
      roleName: directAssignment.roleName,
      source: { type: 'direct' },
    })
  }
  roleEntries.sort((a, b) => roleOrder[a.roleName] - roleOrder[b.roleName])

  return (
    <ReadOnlySideModalForm
      title="Group"
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
        <PropertiesTable.DateRow label="Created" date={group.timeCreated} />
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
              roleEntries.map(({ scope, roleName }, i) => (
                <Table.Row key={i}>
                  <Table.Cell>
                    <Badge color={roleColor[roleName]}>
                      {scope}.{roleName}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>Assigned</Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </table>
      </div>
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
                <Table.HeadCell>Members</Table.HeadCell>
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

export default function SiloAccessGroupsTab() {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)

  const { data: siloPolicy } = usePrefetchedQuery(policyView)

  const { mutateAsync: updatePolicy } = useApiMutation(api.policyUpdate, {
    onSuccess: () => queryClient.invalidateEndpoint('policyView'),
  })

  const siloRoleById = useMemo(
    () => new Map(siloPolicy.roleAssignments.map((a) => [a.identityId, a.roleName])),
    [siloPolicy]
  )

  const siloRoleCol = useMemo(
    () =>
      colHelper.display({
        id: 'siloRole',
        header: 'Silo Role',
        cell: ({ row }) => {
          const role = siloRoleById.get(row.original.id)
          return role ? <Badge color={roleColor[role]}>silo.{role}</Badge> : <EmptyCell />
        },
      }),
    [siloRoleById]
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
      siloRoleCol,
      colHelper.display({
        id: 'memberCount',
        header: 'Users',
        cell: ({ row }) => <MemberCountCell groupId={row.original.id} />,
      }),
      colHelper.accessor('timeCreated', Columns.timeCreated),
    ],
    [siloRoleCol]
  )

  const makeActions = useCallback(
    (group: Group): MenuAction[] => {
      const role = siloRoleById.get(group.id)
      return [
        { label: 'Change role', onActivate: () => setEditingGroup(group) },
        {
          label: 'Remove role',
          onActivate: confirmDelete({
            doDelete: () => updatePolicy({ body: deleteRole(group.id, siloPolicy) }),
            label: (
              <span>
                the <HL>{role}</HL> role for <HL>{group.displayName}</HL>
              </span>
            ),
          }),
          disabled: !role && 'This group has no role to remove',
        },
      ]
    },
    [siloRoleById, siloPolicy, updatePolicy]
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
          siloPolicy={siloPolicy}
        />
      )}
      {editingGroup && (
        <SiloAccessEditUserSideModal
          name={editingGroup.displayName}
          identityId={editingGroup.id}
          identityType="silo_group"
          policy={siloPolicy}
          defaultValues={{ roleName: siloRoleById.get(editingGroup.id) }}
          onDismiss={() => setEditingGroup(null)}
        />
      )}
    </>
  )
}
