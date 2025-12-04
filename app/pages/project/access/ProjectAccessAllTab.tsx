/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo, useState } from 'react'

import { deleteRole, usePrefetchedQuery, useUserRows } from '@oxide/api'
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
import { getActionsCol } from '~/table/columns/action-col'
import { Table } from '~/table/Table'
import type { ProjectAccessRow } from '~/types/access'
import { CreateButton } from '~/ui/lib/CreateButton'
import { TableActions } from '~/ui/lib/Table'
import { TipIcon } from '~/ui/lib/TipIcon'
import { identityTypeLabel, roleColor } from '~/util/access'

const colHelper = createColumnHelper<ProjectAccessRow>()

export default function ProjectAccessAllTab() {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingUserRow, setEditingUserRow] = useState<ProjectAccessRow | null>(null)
  const projectSelector = useProjectSelector()

  const { data: siloPolicy } = usePrefetchedQuery(accessQueries.siloPolicy())
  const siloRows = useUserRows(siloPolicy.roleAssignments, 'silo')

  const { data: projectPolicy } = usePrefetchedQuery(
    accessQueries.projectPolicy(projectSelector)
  )
  const projectRows = useUserRows(projectPolicy.roleAssignments, 'project')
  const rows = useProjectAccessRows(siloRows, projectRows, 'all')

  const { updatePolicy } = useProjectAccessMutations()

  // TODO: checkboxes and bulk delete? not sure
  // TODO: disable delete on permissions you can't delete

  const columns = useMemo(
    () => [
      colHelper.accessor('name', { header: 'Name' }),
      // TODO: Add member information for groups once API provides it. Ideally:
      //   1. A /groups/{groupId}/members endpoint to list members
      //   2. A memberCount field on the Group type
      // This would allow showing member count in the table and displaying members
      // in a tooltip or expandable row.
      // TODO: Add lastAccessed column for users once API provides it. The User type
      // should include a lastAccessed timestamp to show when users last logged in.
      colHelper.accessor('identityType', {
        header: 'Type',
        cell: (info) => identityTypeLabel[info.getValue()],
      }),
      colHelper.accessor('roleBadges', {
        header: () => (
          <span className="inline-flex items-center">
            Role
            <TipIcon className="ml-2">
              A user or group&apos;s effective role for this project is the strongest role
              on either the silo or project
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
          onActivate: () => setEditingUserRow(row),
          disabled:
            !row.projectRole && "You don't have permission to change this user's role",
        },
        // TODO: only show if you have permission to do this
        {
          label: 'Delete',
          onActivate: confirmDelete({
            doDelete: () =>
              updatePolicy({
                path: { project: projectSelector.project },
                // we know policy is there, otherwise there's no row to display
                body: deleteRole(row.id, projectPolicy),
              }),
            // TODO: explain that this will not affect the role inherited from
            // the silo or roles inherited from group membership. Ideally we'd
            // be able to say: this will cause the user to have an effective
            // role of X. However we would have to look at their groups too.
            label: (
              <span>
                the <HL>{row.projectRole}</HL> role for <HL>{row.name}</HL>
              </span>
            ),
          }),
          disabled: !row.projectRole && "You don't have permission to delete this user",
        },
      ]),
    ],
    [projectPolicy, projectSelector.project, updatePolicy]
  )

  const tableInstance = useReactTable({
    columns,
    data: rows,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
      <TableActions>
        <CreateButton onClick={() => setAddModalOpen(true)}>Add user or group</CreateButton>
      </TableActions>
      {addModalOpen && (
        <ProjectAccessAddUserSideModal
          onDismiss={() => setAddModalOpen(false)}
          policy={projectPolicy}
        />
      )}
      {editingUserRow?.projectRole && (
        <ProjectAccessEditUserSideModal
          onDismiss={() => setEditingUserRow(null)}
          policy={projectPolicy}
          name={editingUserRow.name}
          identityId={editingUserRow.id}
          identityType={editingUserRow.identityType}
          defaultValues={{ roleName: editingUserRow.projectRole }}
        />
      )}
      {rows.length === 0 ? (
        <AccessEmptyState
          scope="project"
          filter="all"
          onClick={() => setAddModalOpen(true)}
        />
      ) : (
        <Table table={tableInstance} />
      )}
    </>
  )
}
