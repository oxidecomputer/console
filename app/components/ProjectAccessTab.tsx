/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo, useState, type ReactNode } from 'react'
import * as R from 'remeda'

import {
  api,
  byGroupThenName,
  deleteRole,
  q,
  queryClient,
  roleOrder,
  useApiMutation,
  usePrefetchedQuery,
  useUserRows,
  type IdentityType,
  type Policy,
  type RoleKey,
  type RoleSource,
  type UserAccessRow,
} from '@oxide/api'
import { Badge } from '@oxide/design-system/ui'

import { AccessEmptyState } from '~/components/AccessEmptyState'
import { GroupMembersModal } from '~/components/GroupMembersModal'
import { HL } from '~/components/HL'
import { ListPlusCell } from '~/components/ListPlusCell'
import {
  ProjectAccessAddUserSideModal,
  ProjectAccessEditUserSideModal,
} from '~/forms/project-access'
import { useProjectSelector } from '~/hooks/use-params'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { MembersCell } from '~/table/cells/MembersCell'
import { getActionsCol } from '~/table/columns/action-col'
import { Table } from '~/table/Table'
import { CreateButton } from '~/ui/lib/CreateButton'
import { TableActions } from '~/ui/lib/Table'
import { TipIcon } from '~/ui/lib/TipIcon'
import {
  filterByIdentityType,
  identityFilterLabel,
  identityTypeLabel,
  roleColor,
  type IdentityFilter,
} from '~/util/access'
import { groupBy } from '~/util/array'

type ProjectAccessRow = {
  id: string
  identityType: IdentityType
  name: string
  projectRole: RoleKey | undefined
  roleBadges: { roleSource: RoleSource; roleName: RoleKey }[]
}

type ProjectAccessTabProps = {
  filter: IdentityFilter
  children?: ReactNode
}

function useProjectAccessRows(
  siloRows: UserAccessRow[],
  projectRows: UserAccessRow[],
  filter: IdentityFilter
): ProjectAccessRow[] {
  return useMemo(() => {
    const rows = groupBy(siloRows.concat(projectRows), (u) => u.id).map(
      ([userId, userAssignments]) => {
        const { name, identityType } = userAssignments[0]
        const siloAccessRow = userAssignments.find((a) => a.roleSource === 'silo')
        const projectAccessRow = userAssignments.find((a) => a.roleSource === 'project')

        // Filter out undefined values, then map to expected shape
        const roleBadges = R.sortBy(
          [siloAccessRow, projectAccessRow].filter(
            (r): r is UserAccessRow => r !== undefined
          ),
          (r) => roleOrder[r.roleName] // sorts strongest role first
        ).map((r) => ({
          roleSource: r.roleSource,
          roleName: r.roleName,
        }))

        return {
          id: userId,
          identityType,
          name,
          projectRole: projectAccessRow?.roleName,
          roleBadges,
        } satisfies ProjectAccessRow
      }
    )

    return filterByIdentityType(rows, filter).sort(byGroupThenName)
  }, [siloRows, projectRows, filter])
}

/**
 * Message explaining that an inherited silo role cannot be modified at the project level
 */
const getInheritedRoleMessage = (action: 'change' | 'delete', identityType: IdentityType) =>
  `Cannot ${action} inherited silo role. This ${identityTypeLabel[identityType].toLowerCase()}'s role is set at the silo level.`

function ProjectAccessTable({
  filter,
  rows,
  policy,
  projectName,
  onEditRow,
  onViewMembers,
}: {
  filter: IdentityFilter
  rows: ProjectAccessRow[]
  policy: Policy
  projectName: string
  onEditRow: (row: ProjectAccessRow) => void
  onViewMembers: (row: ProjectAccessRow) => void
}) {
  const { mutateAsync: updatePolicy } = useApiMutation(api.projectPolicyUpdate, {
    onSuccess: () => {
      queryClient.invalidateEndpoint('projectPolicyView')
    },
  })

  const columns = useMemo(() => {
    const colHelper = createColumnHelper<ProjectAccessRow>()

    return [
      colHelper.accessor('name', { header: 'Name' }),
      // TODO: Add lastAccessed column for users once API provides it.
      ...(filter === 'all'
        ? [
            colHelper.accessor('identityType', {
              header: 'Type',
              cell: (info) => identityTypeLabel[info.getValue()],
            }),
          ]
        : []),
      colHelper.accessor('roleBadges', {
        header: () => (
          <span className="inline-flex items-center">
            Role
            <TipIcon className="ml-2">
              A {identityFilterLabel[filter]}&apos;s effective role for this project is the
              strongest role on either the silo or project
            </TipIcon>
          </span>
        ),
        cell: (info) => (
          <ListPlusCell tooltipTitle="Other roles">
            {info.getValue().map(({ roleName, roleSource }) => (
              <Badge key={roleSource} color={roleColor[roleName]}>
                {roleSource}.{roleName}
              </Badge>
            ))}
          </ListPlusCell>
        ),
      }),
      ...(filter === 'groups'
        ? [
            colHelper.display({
              id: 'users',
              header: 'Users',
              cell: (info) => {
                const row = info.row.original
                return (
                  <MembersCell groupId={row.id} onViewMembers={() => onViewMembers(row)} />
                )
              },
            }),
          ]
        : []),
      getActionsCol((row: ProjectAccessRow) => [
        {
          label: 'Change role',
          onActivate: () => onEditRow(row),
          disabled: !row.projectRole && getInheritedRoleMessage('change', row.identityType),
        },
        {
          label: 'Delete',
          // TODO: explain that delete will not affect the role inherited from the silo or
          // roles inherited from group membership. Ideally we'd be able to say: this will
          // cause the user to have an effective role of X. However we would have to look at
          // their groups too.
          onActivate: confirmDelete({
            doDelete: async () => {
              await updatePolicy({
                path: { project: projectName },
                body: deleteRole(row.id, policy),
              })
              addToast({ content: 'Access removed' })
            },
            label: (
              <span>
                the <HL>{row.projectRole}</HL> role for <HL>{row.name}</HL>
              </span>
            ),
          }),
          disabled: !row.projectRole && getInheritedRoleMessage('delete', row.identityType),
        },
      ]),
    ]
  }, [filter, policy, projectName, updatePolicy, onEditRow, onViewMembers])

  const tableInstance = useReactTable<ProjectAccessRow>({
    columns,
    data: rows,
    getCoreRowModel: getCoreRowModel(),
  })

  return <Table table={tableInstance} />
}

/**
 * Access control tab for project-level permissions.
 * Displays users and groups with their project and inherited silo roles,
 * and allows adding/editing/deleting role assignments.
 */
export function ProjectAccessTab({ filter, children }: ProjectAccessTabProps) {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<ProjectAccessRow | null>(null)
  const [viewingMembersRow, setViewingMembersRow] = useState<ProjectAccessRow | null>(null)

  const { project } = useProjectSelector()

  const { data: siloPolicy } = usePrefetchedQuery(q(api.policyView, {}))
  const { data: projectPolicy } = usePrefetchedQuery(
    q(api.projectPolicyView, { path: { project } })
  )

  const siloRows = useUserRows(siloPolicy.roleAssignments, 'silo')
  const projectRows = useUserRows(projectPolicy.roleAssignments, 'project')
  const rows = useProjectAccessRows(siloRows, projectRows, filter)

  const addButtonText = `Add ${identityFilterLabel[filter]}`

  return (
    <>
      <TableActions>
        <CreateButton onClick={() => setAddModalOpen(true)}>{addButtonText}</CreateButton>
      </TableActions>
      {projectPolicy && addModalOpen && (
        <ProjectAccessAddUserSideModal
          onDismiss={() => setAddModalOpen(false)}
          policy={projectPolicy}
          filter={filter}
        />
      )}
      {projectPolicy && editingRow && editingRow.projectRole && (
        <ProjectAccessEditUserSideModal
          onDismiss={() => setEditingRow(null)}
          policy={projectPolicy}
          name={editingRow.name}
          identityId={editingRow.id}
          identityType={editingRow.identityType}
          defaultValues={{ roleName: editingRow.projectRole }}
        />
      )}
      {viewingMembersRow && (
        <GroupMembersModal
          groupId={viewingMembersRow.id}
          groupName={viewingMembersRow.name}
          onDismiss={() => setViewingMembersRow(null)}
        />
      )}
      {children}
      {rows.length === 0 ? (
        <AccessEmptyState
          scope="project"
          filter={filter}
          onClick={() => setAddModalOpen(true)}
        />
      ) : (
        <ProjectAccessTable
          filter={filter}
          rows={rows}
          policy={projectPolicy}
          projectName={project}
          onEditRow={setEditingRow}
          onViewMembers={setViewingMembersRow}
        />
      )}
    </>
  )
}
