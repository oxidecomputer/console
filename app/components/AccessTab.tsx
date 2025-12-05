/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo, useState, type ReactNode } from 'react'

import { deleteRole, usePrefetchedQuery, useUserRows, type Policy } from '@oxide/api'
import { Badge } from '@oxide/design-system/ui'

import { accessQueries } from '~/api/access-queries'
import { AccessEmptyState } from '~/components/AccessEmptyState'
import { HL } from '~/components/HL'
import { ListPlusCell } from '~/components/ListPlusCell'
import {
  ProjectAccessAddUserSideModal,
  ProjectAccessEditUserSideModal,
} from '~/forms/project-access'
import {
  SiloAccessAddUserSideModal,
  SiloAccessEditUserSideModal,
} from '~/forms/silo-access'
import {
  useProjectAccessMutations,
  useSiloAccessMutations,
} from '~/hooks/use-access-mutations'
import { useProjectAccessRows, useSiloAccessRows } from '~/hooks/use-access-rows'
import { useProjectSelector } from '~/hooks/use-params'
import { confirmDelete } from '~/stores/confirm-delete'
import { getActionsCol } from '~/table/columns/action-col'
import { Table } from '~/table/Table'
import type { ProjectAccessRow, SiloAccessRow } from '~/types/access'
import { CreateButton } from '~/ui/lib/CreateButton'
import { TableActions } from '~/ui/lib/Table'
import { TipIcon } from '~/ui/lib/TipIcon'
import { identityTypeLabel, roleColor } from '~/util/access'

type IdentityFilter = 'all' | 'users' | 'groups'

type AccessTabProps = {
  /** Filter to apply to rows (all, users, or groups) */
  filter: IdentityFilter
  /** Scope for the access (silo or project) */
  scope: 'silo' | 'project'
  /** Optional additional content to render before the table */
  children?: ReactNode
}

// Helper functions for repeated logic
const getIdentityLabel = (identityType: string) =>
  identityType === 'silo_user' ? 'user' : 'group'

const getNoPermissionMessage = (action: 'change' | 'delete', identityType: string) =>
  `You don't have permission to ${action} this ${getIdentityLabel(identityType)}'s role`

const getFilterEntityLabel = (filter: IdentityFilter) =>
  filter === 'all' ? 'user or group' : filter === 'users' ? 'user' : 'group'

// Shared identity type column definition (using any for cell to work with both row types)
const identityTypeColumnDef = {
  header: 'Type',
  cell: (info: { getValue: () => keyof typeof identityTypeLabel }) =>
    identityTypeLabel[info.getValue()],
}

// Type-safe table component for project scope
function ProjectAccessTable({
  filter,
  rows,
  policy,
  projectName,
  onEditRow,
}: {
  filter: IdentityFilter
  rows: ProjectAccessRow[]
  policy: Policy
  projectName: string
  onEditRow: (row: ProjectAccessRow) => void
}) {
  const { updatePolicy } = useProjectAccessMutations()

  // TODO: checkboxes and bulk delete? not sure
  const columns = useMemo(() => {
    const colHelper = createColumnHelper<ProjectAccessRow>()

    return [
      colHelper.accessor('name', { header: 'Name' }),
      // TODO: Add member information for groups once API provides it. Ideally:
      //   1. A /groups/{groupId}/members endpoint to list members
      //   2. A memberCount field on the Group type
      // This would allow showing member count in the table and displaying members
      // in a tooltip or expandable row.
      // TODO: Add lastAccessed column for users once API provides it. The User type
      // should include a lastAccessed timestamp to show when users last logged in.
      ...(filter === 'all'
        ? [colHelper.accessor('identityType', identityTypeColumnDef)]
        : []),
      colHelper.accessor('roleBadges', {
        header: () => (
          <span className="inline-flex items-center">
            Role
            <TipIcon className="ml-2">
              A {getFilterEntityLabel(filter)}&apos;s effective role for this project is the
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
      // TODO: tooltips on disabled elements explaining why
      getActionsCol((row: ProjectAccessRow) => [
        {
          label: 'Change role',
          onActivate: () => onEditRow(row),
          disabled: !row.projectRole && getNoPermissionMessage('change', row.identityType),
        },
        {
          label: 'Delete',
          // TODO: explain that delete will not affect the role inherited from the silo or
          // roles inherited from group membership. Ideally we'd be able to say: this will
          // cause the user to have an effective role of X. However we would have to look at
          // their groups too.
          onActivate: confirmDelete({
            doDelete: async () =>
              await updatePolicy({
                path: { project: projectName },
                body: deleteRole(row.id, policy),
              }),
            label: (
              <span>
                the <HL>{row.projectRole}</HL> role for <HL>{row.name}</HL>
              </span>
            ),
          }),
          disabled: !row.projectRole && getNoPermissionMessage('delete', row.identityType),
        },
      ]),
    ]
  }, [filter, policy, projectName, updatePolicy, onEditRow])

  const tableInstance = useReactTable<ProjectAccessRow>({
    columns,
    data: rows,
    getCoreRowModel: getCoreRowModel(),
  })

  return <Table table={tableInstance} />
}

// Type-safe table component for silo scope
function SiloAccessTable({
  filter,
  rows,
  policy,
  onEditRow,
}: {
  filter: IdentityFilter
  rows: SiloAccessRow[]
  policy: Policy
  onEditRow: (row: SiloAccessRow) => void
}) {
  const { updatePolicy } = useSiloAccessMutations()

  // TODO: checkboxes and bulk delete? not sure
  const columns = useMemo(() => {
    const colHelper = createColumnHelper<SiloAccessRow>()

    return [
      colHelper.accessor('name', { header: 'Name' }),
      // TODO: Add member information for groups once API provides it. Ideally:
      //   1. A /groups/{groupId}/members endpoint to list members
      //   2. A memberCount field on the Group type
      // This would allow showing member count in the table and displaying members
      // in a tooltip or expandable row.
      // TODO: Add lastAccessed column for users once API provides it. The User type
      // should include a lastAccessed timestamp to show when users last logged in.
      ...(filter === 'all'
        ? [colHelper.accessor('identityType', identityTypeColumnDef)]
        : []),
      colHelper.accessor('siloRole', {
        header: 'Role',
        cell: (info) => {
          const role = info.getValue()
          return role ? <Badge color={roleColor[role]}>silo.{role}</Badge> : null
        },
      }),
      // TODO: tooltips on disabled elements explaining why
      getActionsCol((row: SiloAccessRow) => [
        {
          label: 'Change role',
          onActivate: () => onEditRow(row),
          disabled: !row.siloRole && getNoPermissionMessage('change', row.identityType),
        },
        {
          label: 'Delete',
          // TODO: only show delete if you have permission to do this
          onActivate: confirmDelete({
            doDelete: async () =>
              await updatePolicy({
                body: deleteRole(row.id, policy),
              }),
            label: (
              <span>
                the <HL>{row.siloRole}</HL> role for <HL>{row.name}</HL>
              </span>
            ),
          }),
          // TODO: disable delete on permissions you can't delete
          disabled: !row.siloRole && getNoPermissionMessage('delete', row.identityType),
        },
      ]),
    ]
  }, [filter, policy, updatePolicy, onEditRow])

  const tableInstance = useReactTable<SiloAccessRow>({
    columns,
    data: rows,
    getCoreRowModel: getCoreRowModel(),
  })

  return <Table table={tableInstance} />
}

/**
 * Shared component for access control tabs (project and silo, all/users/groups).
 * Handles the common table structure, modals, columns, and empty states.
 */
export function AccessTab({ filter, scope, children }: AccessTabProps) {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<ProjectAccessRow | SiloAccessRow | null>(
    null
  )

  // Get project selector (only used when scope === 'project')
  const projectSelector = useProjectSelector()

  // Fetch policies based on scope
  const { data: siloPolicy } = usePrefetchedQuery(accessQueries.siloPolicy())
  const { data: projectPolicy } = usePrefetchedQuery(
    accessQueries.projectPolicy(projectSelector)
  )
  const policy = scope === 'project' ? projectPolicy : siloPolicy

  // Generate rows based on scope and filter
  const siloRows = useUserRows(siloPolicy.roleAssignments, 'silo')
  const projectRows = useUserRows(projectPolicy.roleAssignments, 'project')
  const siloAccessRows = useSiloAccessRows(siloRows, filter)
  const projectAccessRows = useProjectAccessRows(siloRows, projectRows, filter)

  const rows = scope === 'project' ? projectAccessRows : siloAccessRows

  // Generate button text based on filter
  const addButtonText = `Add ${getFilterEntityLabel(filter)}`

  // Get role name based on scope - TypeScript allows us to access properties that exist on either type
  const getRoleName = (row: ProjectAccessRow | SiloAccessRow) =>
    'projectRole' in row ? row.projectRole : row.siloRole

  const editingRoleName = editingRow ? getRoleName(editingRow) : undefined

  // Select the appropriate modals based on scope
  const AddModal =
    scope === 'project' ? ProjectAccessAddUserSideModal : SiloAccessAddUserSideModal
  const EditModal =
    scope === 'project' ? ProjectAccessEditUserSideModal : SiloAccessEditUserSideModal

  return (
    <>
      <TableActions>
        <CreateButton onClick={() => setAddModalOpen(true)}>{addButtonText}</CreateButton>
      </TableActions>
      {addModalOpen && (
        <AddModal onDismiss={() => setAddModalOpen(false)} policy={policy} />
      )}
      {editingRow && editingRoleName && (
        <EditModal
          onDismiss={() => setEditingRow(null)}
          policy={policy}
          name={editingRow.name}
          identityId={editingRow.id}
          identityType={editingRow.identityType}
          defaultValues={{ roleName: editingRoleName }}
        />
      )}
      {children}
      {rows.length === 0 ? (
        <AccessEmptyState
          scope={scope}
          filter={filter}
          onClick={() => setAddModalOpen(true)}
        />
      ) : scope === 'project' ? (
        <ProjectAccessTable
          filter={filter}
          rows={projectAccessRows}
          policy={projectPolicy}
          projectName={projectSelector.project}
          onEditRow={(row) => setEditingRow(row)}
        />
      ) : (
        <SiloAccessTable
          filter={filter}
          rows={siloAccessRows}
          policy={siloPolicy}
          onEditRow={(row) => setEditingRow(row)}
        />
      )}
    </>
  )
}
