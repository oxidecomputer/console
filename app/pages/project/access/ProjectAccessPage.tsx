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
  roleOrder,
  useApiMutation,
  useApiQueryClient,
  usePrefetchedApiQuery,
  useUserRows,
  type IdentityType,
  type RoleKey,
} from '@oxide/api'
import { Access16Icon, Access24Icon } from '@oxide/design-system/icons/react'

import { DocsPopover } from '~/components/DocsPopover'
import { HL } from '~/components/HL'
import { ListPlusCell } from '~/components/ListPlusCell'
import {
  ProjectAccessAddUserSideModal,
  ProjectAccessEditUserSideModal,
} from '~/forms/project-access'
import { getProjectSelector, useProjectSelector } from '~/hooks'
import { confirmDelete } from '~/stores/confirm-delete'
import { getActionsCol } from '~/table/columns/action-col'
import { Table } from '~/table/Table'
import { Badge } from '~/ui/lib/Badge'
import { CreateButton } from '~/ui/lib/CreateButton'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { TableActions, TableEmptyBox } from '~/ui/lib/Table'
import { TipIcon } from '~/ui/lib/TipIcon'
import { identityTypeLabel, roleColor } from '~/util/access'
import { groupBy, isTruthy, sortBy } from '~/util/array'
import { docLinks } from '~/util/links'

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
  projectRole: RoleKey | undefined
  roleBadges: { roleSource: string; roleName: RoleKey }[]
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
        const { name, identityType } = userAssignments[0]

        const siloAccessRow = userAssignments.find((a) => a.roleSource === 'silo')
        const projectAccessRow = userAssignments.find((a) => a.roleSource === 'project')

        const roleBadges = sortBy(
          [siloAccessRow, projectAccessRow].filter(isTruthy),
          (r) => roleOrder[r.roleName] // sorts strongest role first
        )

        return {
          id: userId,
          identityType,
          name,
          projectRole: projectAccessRow?.roleName,
          roleBadges,
        } satisfies UserRow
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
      colHelper.accessor('name', { header: 'Name' }),
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
              on either the silo or project.
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
        <PageTitle icon={<Access24Icon />}>Access</PageTitle>
        <DocsPopover
          heading="Access"
          icon={<Access16Icon />}
          summary="Identity and access management roles determine who can view, edit, or administer this project. Silo roles are inherited from the organization, while project roles are specific to this project."
          links={[docLinks.keyConceptsIam, docLinks.access]}
        />
      </PageHeader>

      <TableActions>
        <CreateButton onClick={() => setAddModalOpen(true)}>Add user or group</CreateButton>
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
