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
import { useProjectAccessMutations } from '~/hooks/use-access-mutations'
import { useProjectAccessRows } from '~/hooks/use-access-rows'
import { useProjectSelector } from '~/hooks/use-params'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { getActionsCol } from '~/table/columns/action-col'
import { Table } from '~/table/Table'
import type { IdentityFilter, ProjectAccessRow } from '~/types/access'
import { CreateButton } from '~/ui/lib/CreateButton'
import { TableActions } from '~/ui/lib/Table'
import { TipIcon } from '~/ui/lib/TipIcon'
import { identityFilterLabel, identityTypeLabel, roleColor } from '~/util/access'

type ProjectAccessTabProps = {
  filter: IdentityFilter
  children?: ReactNode
}

/**
 * Converts an identity type to a user-friendly label
 */
const getIdentityLabel = (identityType: string) =>
  identityType === 'silo_user' ? 'user' : 'group'

/**
 * Message explaining that an inherited silo role cannot be modified at the project level
 */
const getInheritedRoleMessage = (action: 'change' | 'delete', identityType: string) =>
  `Cannot ${action} inherited silo role. This ${getIdentityLabel(identityType)}'s role is set at the silo level.`

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
  }, [filter, policy, projectName, updatePolicy, onEditRow])

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

  const projectSelector = useProjectSelector()

  const { data: siloPolicy } = usePrefetchedQuery(accessQueries.siloPolicy())
  const { data: projectPolicy } = usePrefetchedQuery(
    accessQueries.projectPolicy(projectSelector)
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
          projectName={projectSelector.project}
          onEditRow={setEditingRow}
        />
      )}
    </>
  )
}
