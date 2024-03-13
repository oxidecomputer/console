/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import type { LoaderFunctionArgs } from 'react-router-dom'

import {
  apiQueryClient,
  byGroupThenName,
  deleteRole,
  getEffectiveRole,
  useApiMutation,
  useApiQueryClient,
  usePrefetchedApiQuery,
  useUserRows,
  type IdentityType,
  type RoleKey,
} from '@oxide/api'
import { Access24Icon } from '@oxide/design-system/icons/react'

import { AccessNameCell } from '~/components/AccessNameCell'
import { AccessTypeCell } from '~/components/AccessTypeCell'
import { HL } from '~/components/HL'
import { RoleBadgeCell } from '~/components/RoleBadgeCell'
import {
  ProjectAccessAddUserSideModal,
  ProjectAccessEditUserSideModal,
} from '~/forms/project-access'
import { getProjectSelector, useProjectSelector } from '~/hooks'
import { confirmDelete } from '~/stores/confirm-delete'
import { getActionsCol } from '~/table/columns/action-col'
import { Table } from '~/table/Table'
import { Button } from '~/ui/lib/Button'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { TableActions, TableEmptyBox } from '~/ui/lib/Table'
import { groupBy, isTruthy } from '~/util/array'

const EmptyState = ({ onClick }: { onClick: () => void }) => (
  <TableEmptyBox>
    <EmptyMessage
      icon={<Access24Icon />}
      title="No authorized users"
      body="Give permission to view, edit, or administer this project"
      buttonText="Add user or group to project"
      onClick={onClick}
    />
  </TableEmptyBox>
)

ProjectAccessPage.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project } = getProjectSelector(params)
  await Promise.all([
    apiQueryClient.prefetchQuery('policyView', {}),
    apiQueryClient.prefetchQuery('projectPolicyView', { path: { project } }),
    // used to resolve user names
    apiQueryClient.prefetchQuery('userList', {}),
    apiQueryClient.prefetchQuery('groupList', {}),
  ])
  return null
}

type UserRow = {
  id: string
  identityType: IdentityType
  name: string
  siloRole: RoleKey | undefined
  projectRole: RoleKey | undefined
  effectiveRole: RoleKey
}

const colHelper = createColumnHelper<UserRow>()

export function ProjectAccessPage() {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingUserRow, setEditingUserRow] = useState<UserRow | null>(null)
  const { project } = useProjectSelector()

  const { data: siloPolicy } = usePrefetchedApiQuery('policyView', {})
  const siloRows = useUserRows(siloPolicy.roleAssignments, 'silo')

  const { data: projectPolicy } = usePrefetchedApiQuery('projectPolicyView', {
    path: { project },
  })
  const projectRows = useUserRows(projectPolicy.roleAssignments, 'project')

  const rows = useMemo(() => {
    return groupBy(siloRows.concat(projectRows), (u) => u.id)
      .map(([userId, userAssignments]) => {
        const siloRole = userAssignments.find((a) => a.roleSource === 'silo')?.roleName
        const projectRole = userAssignments.find(
          (a) => a.roleSource === 'project'
        )?.roleName

        const roles = [siloRole, projectRole].filter(isTruthy)

        const { name, identityType } = userAssignments[0]

        const row: UserRow = {
          id: userId,
          identityType,
          name,
          siloRole,
          projectRole,
          // we know there has to be at least one
          effectiveRole: getEffectiveRole(roles)!,
        }

        return row
      })
      .sort(byGroupThenName)
  }, [siloRows, projectRows])

  const queryClient = useApiQueryClient()
  const updatePolicy = useApiMutation('projectPolicyUpdate', {
    onSuccess: () => queryClient.invalidateQueries('projectPolicyView'),
    // TODO: handle 403
  })

  // TODO: checkboxes and bulk delete? not sure
  // TODO: disable delete on permissions you can't delete

  const columns = useMemo(
    () => [
      colHelper.accessor('name', { header: 'Name', cell: AccessNameCell }),
      colHelper.accessor('identityType', { header: 'Type', cell: AccessTypeCell }),
      colHelper.accessor('siloRole', {
        header: 'Silo role',
        cell: RoleBadgeCell,
      }),
      colHelper.accessor('projectRole', {
        header: 'Project role',
        cell: RoleBadgeCell,
      }),
      // TODO: tooltips on disabled elements explaining why
      getActionsCol((row: UserRow) => [
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
              updatePolicy.mutateAsync({
                path: { project },
                // we know policy is there, otherwise there's no row to display
                body: deleteRole(row.id, projectPolicy!),
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
    [projectPolicy, project, updatePolicy]
  )

  const tableInstance = useReactTable({
    columns,
    data: rows,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Access24Icon />}>Access &amp; IAM</PageTitle>
      </PageHeader>

      <TableActions>
        <Button size="sm" onClick={() => setAddModalOpen(true)}>
          Add user or group
        </Button>
      </TableActions>
      {projectPolicy && addModalOpen && (
        <ProjectAccessAddUserSideModal
          onDismiss={() => setAddModalOpen(false)}
          policy={projectPolicy}
        />
      )}
      {projectPolicy && editingUserRow?.projectRole && (
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
        <EmptyState onClick={() => setAddModalOpen(true)} />
      ) : (
        <Table table={tableInstance} />
      )}
    </>
  )
}
