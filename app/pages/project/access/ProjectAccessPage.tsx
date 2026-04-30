/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import type { LoaderFunctionArgs } from 'react-router'

import {
  api,
  byGroupThenName,
  deleteRole,
  getEffectiveRole,
  q,
  queryClient,
  roleOrder,
  useApiMutation,
  rolesByIdFromPolicy,
  usePrefetchedQuery,
  type IdentityType,
  type RoleKey,
} from '@oxide/api'
import { Access16Icon, Access24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { DocsPopover } from '~/components/DocsPopover'
import { HL } from '~/components/HL'
import {
  ProjectAccessAddUserSideModal,
  ProjectAccessEditUserSideModal,
} from '~/forms/project-access'
import { getProjectSelector, useProjectSelector } from '~/hooks/use-params'
import { useQuickActions } from '~/hooks/use-quick-actions'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { getActionsCol } from '~/table/columns/action-col'
import { Table } from '~/table/Table'
import { CreateButton } from '~/ui/lib/CreateButton'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { TableActions, TableEmptyBox } from '~/ui/lib/Table'
import { TipIcon } from '~/ui/lib/TipIcon'
import { identityTypeLabel, roleColor } from '~/util/access'
import { ALL_ISH } from '~/util/consts'
import { docLinks } from '~/util/links'
import type * as PP from '~/util/path-params'

const policyView = q(api.policyView, {})
const projectPolicyView = ({ project }: PP.Project) =>
  q(api.projectPolicyView, { path: { project } })
const userList = q(api.userList, { query: { limit: ALL_ISH } })
const groupList = q(api.groupList, { query: { limit: ALL_ISH } })

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const selector = getProjectSelector(params)
  await Promise.all([
    queryClient.prefetchQuery(policyView),
    queryClient.prefetchQuery(projectPolicyView(selector)),
    queryClient.prefetchQuery(userList),
    queryClient.prefetchQuery(groupList),
  ])
  return null
}

export const handle = { crumb: 'Project Access' }

type AccessRow = {
  id: string
  name: string
  identityType: IdentityType
  effectiveScope: 'silo' | 'project'
  effectiveRole: RoleKey
  /** Direct project-level role only — the only one manageable on this page. */
  directProjectRole: RoleKey | undefined
}

const colHelper = createColumnHelper<AccessRow>()

const EmptyState = ({ onClick }: { onClick: () => void }) => (
  <TableEmptyBox>
    <EmptyMessage
      icon={<Access24Icon />}
      title="No project roles assigned"
      body="Give permission to view, edit, or administer this project."
      buttonText="Add user or group"
      onClick={onClick}
    />
  </TableEmptyBox>
)

export default function ProjectAccessPage() {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<AccessRow | null>(null)

  const projectSelector = useProjectSelector()
  const { project } = projectSelector

  const { data: siloPolicy } = usePrefetchedQuery(policyView)
  const { data: projectPolicy } = usePrefetchedQuery(projectPolicyView(projectSelector))
  const { data: users } = usePrefetchedQuery(userList)
  const { data: groups } = usePrefetchedQuery(groupList)

  const { mutateAsync: updatePolicy } = useApiMutation(api.projectPolicyUpdate, {
    onSuccess: () => {
      queryClient.invalidateEndpoint('projectPolicyView')
      addToast({ content: 'Access removed' })
    },
  })

  const siloRoleById = useMemo(() => rolesByIdFromPolicy(siloPolicy), [siloPolicy])
  const projectRoleById = useMemo(() => rolesByIdFromPolicy(projectPolicy), [projectPolicy])

  const rows: AccessRow[] = useMemo(() => {
    const userById = new Map(users.items.map((u) => [u.id, u]))
    const groupById = new Map(groups.items.map((g) => [g.id, g]))

    type IntermediateUserRow = {
      id: string
      name: string
      directSiloRole: RoleKey | undefined
      directProjectRole: RoleKey | undefined
    }

    const intermediateUserRows = new Map<string, IntermediateUserRow>()

    const ensureUserRow = (userId: string): IntermediateUserRow => {
      const existing = intermediateUserRows.get(userId)
      if (existing) return existing
      const row: IntermediateUserRow = {
        id: userId,
        name: userById.get(userId)?.displayName ?? userId,
        directSiloRole: undefined,
        directProjectRole: undefined,
      }
      intermediateUserRows.set(userId, row)
      return row
    }

    for (const ra of siloPolicy.roleAssignments) {
      if (ra.identityType === 'silo_user')
        ensureUserRow(ra.identityId).directSiloRole = ra.roleName
    }
    for (const ra of projectPolicy.roleAssignments) {
      if (ra.identityType === 'silo_user')
        ensureUserRow(ra.identityId).directProjectRole = ra.roleName
    }

    const userRows: AccessRow[] = []
    for (const row of intermediateUserRows.values()) {
      const allRoles: RoleKey[] = [
        ...(row.directSiloRole ? [row.directSiloRole] : []),
        ...(row.directProjectRole ? [row.directProjectRole] : []),
      ]
      const effectiveRole = getEffectiveRole(allRoles)
      if (!effectiveRole) continue

      // Scope is 'silo' if the direct silo role is at least as strong as the effective role
      const effectiveScope: 'silo' | 'project' =
        row.directSiloRole !== undefined &&
        roleOrder[row.directSiloRole] <= roleOrder[effectiveRole]
          ? 'silo'
          : 'project'

      userRows.push({
        id: row.id,
        name: row.name,
        identityType: 'silo_user',
        effectiveScope,
        effectiveRole,
        directProjectRole: row.directProjectRole,
      })
    }

    // Group rows: collect all groups from either policy
    const groupIds = new Set([
      ...siloPolicy.roleAssignments
        .filter((ra) => ra.identityType === 'silo_group')
        .map((ra) => ra.identityId),
      ...projectPolicy.roleAssignments
        .filter((ra) => ra.identityType === 'silo_group')
        .map((ra) => ra.identityId),
    ])

    const groupRows: AccessRow[] = Array.from(groupIds).map((groupId) => {
      const siloRole = siloRoleById.get(groupId)
      const projectRole = projectRoleById.get(groupId)
      const allGroupRoles = [siloRole, projectRole].filter(
        (r): r is RoleKey => r !== undefined
      )
      // non-null: group is in at least one policy so allGroupRoles is non-empty
      const effectiveRole = getEffectiveRole(allGroupRoles)!
      const effectiveScope: 'silo' | 'project' =
        siloRole !== undefined && roleOrder[siloRole] <= roleOrder[effectiveRole]
          ? 'silo'
          : 'project'
      return {
        id: groupId,
        name: groupById.get(groupId)?.displayName ?? groupId,
        identityType: 'silo_group' as IdentityType,
        effectiveScope,
        effectiveRole,
        directProjectRole: projectRole,
      }
    })

    return [...groupRows, ...userRows].sort(byGroupThenName)
  }, [siloPolicy, projectPolicy, users, groups, siloRoleById, projectRoleById])

  const columns = useMemo(
    () => [
      colHelper.accessor('name', { header: 'Name' }),
      colHelper.accessor('identityType', {
        header: 'Type',
        cell: (info) => identityTypeLabel[info.getValue()],
      }),
      colHelper.display({
        id: 'effectiveRole',
        header: () => (
          <div className="flex items-center gap-1">
            Role
            <TipIcon>
              A user or group&apos;s effective role for this project is the strongest role
              on either the silo or project
            </TipIcon>
          </div>
        ),
        cell: ({ row }) => {
          const { effectiveScope, effectiveRole } = row.original
          return (
            <Badge color={roleColor[effectiveRole]}>
              {effectiveScope}.{effectiveRole}
            </Badge>
          )
        },
      }),
      getActionsCol((row: AccessRow) => [
        {
          label: 'Change role',
          onActivate: () => setEditingRow(row),
          disabled:
            !row.directProjectRole && 'This identity has no direct project role to change',
        },
        {
          label: 'Remove role',
          onActivate: confirmDelete({
            doDelete: () =>
              updatePolicy({ path: { project }, body: deleteRole(row.id, projectPolicy) }),
            label: (
              <span>
                the <HL>{row.directProjectRole}</HL> role for <HL>{row.name}</HL>
              </span>
            ),
          }),
          disabled:
            !row.directProjectRole && 'This identity has no direct project role to remove',
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

  useQuickActions(
    () => [
      {
        value: 'Add user or group',
        navGroup: 'Actions',
        action: () => setAddModalOpen(true),
      },
    ],
    []
  )

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Access24Icon />}>Project Access</PageTitle>
        <DocsPopover
          heading="access"
          icon={<Access16Icon />}
          summary="Roles determine who can view, edit, or administer this project. Silo roles are inherited from the silo. If a user or group has both a silo and project role, the stronger role takes precedence."
          links={[docLinks.keyConceptsIam, docLinks.access, docLinks.identityProviders]}
        />
      </PageHeader>
      <TableActions>
        <CreateButton onClick={() => setAddModalOpen(true)}>Add user or group</CreateButton>
      </TableActions>
      {addModalOpen && (
        <ProjectAccessAddUserSideModal
          onDismiss={() => setAddModalOpen(false)}
          policy={projectPolicy}
        />
      )}
      {editingRow && (
        <ProjectAccessEditUserSideModal
          onDismiss={() => setEditingRow(null)}
          policy={projectPolicy}
          name={editingRow.name}
          identityId={editingRow.id}
          identityType={editingRow.identityType}
          defaultValues={{ roleName: editingRow.directProjectRole }}
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
