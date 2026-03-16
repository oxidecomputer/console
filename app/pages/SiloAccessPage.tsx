/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo, useState } from 'react'

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
  useGroupsByUserId,
  usePrefetchedQuery,
  type Group,
  type IdentityType,
  type SiloRole,
} from '@oxide/api'
import { Access16Icon, Access24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { DocsPopover } from '~/components/DocsPopover'
import { HL } from '~/components/HL'
import {
  SiloAccessAddUserSideModal,
  SiloAccessEditUserSideModal,
} from '~/forms/silo-access'
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

const policyView = q(api.policyView, {})
const userListQ = q(api.userList, {})
const groupListAll = q(api.groupList, { query: { limit: ALL_ISH } })

export async function clientLoader() {
  const [groups, policy] = await Promise.all([
    queryClient.fetchQuery(groupListAll),
    queryClient.fetchQuery(policyView),
  ])
  const groupsWithRoles = new Set(
    policy.roleAssignments
      .filter((ra) => ra.identityType === 'silo_group')
      .map((ra) => ra.identityId)
  )
  await Promise.all([
    queryClient.prefetchQuery(userListQ),
    ...groups.items
      .filter((g) => groupsWithRoles.has(g.id))
      .map((g) =>
        queryClient.prefetchQuery(
          q(api.userList, { query: { group: g.id, limit: ALL_ISH } })
        )
      ),
  ])
  return null
}

export const handle = { crumb: 'Silo Access' }

type AccessRow = {
  id: string
  name: string
  identityType: IdentityType
  effectiveRole: SiloRole
  /** Groups that provide or boost the effective role. Empty if role is purely direct. */
  viaGroups: Group[]
  /** Undefined if access is only via a group, no direct role assignment. */
  directRole: SiloRole | undefined
}

const colHelper = createColumnHelper<AccessRow>()

const EmptyState = ({ onClick }: { onClick: () => void }) => (
  <TableEmptyBox>
    <EmptyMessage
      icon={<Access24Icon />}
      title="No silo roles assigned"
      body="Give permission to view, edit, or administer this silo."
      buttonText="Add user or group"
      onClick={onClick}
    />
  </TableEmptyBox>
)

export default function SiloAccessPage() {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<AccessRow | null>(null)

  const { data: siloPolicy } = usePrefetchedQuery(policyView)
  const { data: users } = usePrefetchedQuery(userListQ)
  const { data: groups } = usePrefetchedQuery(groupListAll)

  const { mutateAsync: updatePolicy } = useApiMutation(api.policyUpdate, {
    onSuccess: () => {
      queryClient.invalidateEndpoint('policyView')
      addToast({ content: 'Access removed' })
    },
  })

  const siloRoleById = useMemo(() => rolesByIdFromPolicy(siloPolicy), [siloPolicy])

  // Only fetch memberships for groups that have silo roles — their members have group-based access
  const groupsWithRoles = useMemo(
    () => groups.items.filter((g) => siloRoleById.has(g.id)),
    [groups, siloRoleById]
  )

  // userId → groups[] (only role-bearing groups, so only users with group-based access appear)
  const groupsByUserId = useGroupsByUserId(groupsWithRoles)

  const rows: AccessRow[] = useMemo(() => {
    const userById = new Map(users.items.map((u) => [u.id, u]))
    const groupById = new Map(groups.items.map((g) => [g.id, g]))

    type IntermediateUserRow = {
      id: string
      name: string
      directRole: SiloRole | undefined
      memberOfGroups: Group[]
    }

    const intermediateUserRows = new Map<string, IntermediateUserRow>()

    // Collect directly assigned users
    for (const ra of siloPolicy.roleAssignments) {
      if (ra.identityType === 'silo_user') {
        intermediateUserRows.set(ra.identityId, {
          id: ra.identityId,
          name: userById.get(ra.identityId)?.displayName ?? ra.identityId,
          directRole: ra.roleName,
          memberOfGroups: [],
        })
      }
    }

    // Merge in users who have access via groups
    for (const [userId, memberGroups] of groupsByUserId) {
      const existing = intermediateUserRows.get(userId)
      if (existing) {
        existing.memberOfGroups = memberGroups
      } else {
        intermediateUserRows.set(userId, {
          id: userId,
          name: userById.get(userId)?.displayName ?? userId,
          directRole: undefined,
          memberOfGroups: memberGroups,
        })
      }
    }

    // Build final user rows with effective roles
    const userRows: AccessRow[] = []
    for (const row of intermediateUserRows.values()) {
      const groupRoles = row.memberOfGroups
        .map((g) => siloRoleById.get(g.id))
        .filter((r): r is SiloRole => r !== undefined)
      const allRoles: SiloRole[] = [
        ...(row.directRole ? [row.directRole] : []),
        ...groupRoles,
      ]
      const effectiveRole = getEffectiveRole(allRoles)
      if (!effectiveRole) continue

      // Show viaGroups when effective role comes from or is boosted by a group
      const viaGroups =
        !row.directRole || roleOrder[effectiveRole] < roleOrder[row.directRole]
          ? row.memberOfGroups.filter((g) => {
              const gr = siloRoleById.get(g.id)
              return gr !== undefined && roleOrder[gr] <= roleOrder[effectiveRole]
            })
          : []

      userRows.push({
        id: row.id,
        name: row.name,
        identityType: 'silo_user',
        effectiveRole,
        viaGroups,
        directRole: row.directRole,
      })
    }

    // Group rows from direct policy assignments
    const groupRows: AccessRow[] = siloPolicy.roleAssignments
      .filter((ra) => ra.identityType === 'silo_group')
      .map((ra) => ({
        id: ra.identityId,
        name: groupById.get(ra.identityId)?.displayName ?? ra.identityId,
        identityType: 'silo_group' as IdentityType,
        effectiveRole: ra.roleName,
        viaGroups: [],
        directRole: ra.roleName,
      }))

    return [...groupRows, ...userRows].sort(byGroupThenName)
  }, [siloPolicy, users, groups, groupsByUserId, siloRoleById])

  const columns = useMemo(
    () => [
      colHelper.accessor('name', { header: 'Name' }),
      colHelper.accessor('identityType', {
        header: 'Type',
        cell: (info) => identityTypeLabel[info.getValue()],
      }),
      colHelper.display({
        id: 'effectiveRole',
        header: 'Silo Role',
        cell: ({ row }) => {
          const { effectiveRole, viaGroups } = row.original
          return (
            <div className="flex items-center gap-1.5">
              <Badge color={roleColor[effectiveRole]}>silo.{effectiveRole}</Badge>
              {viaGroups.length > 0 && (
                <TipIcon>
                  via{' '}
                  {viaGroups.map((g, i) => (
                    <span key={g.id}>
                      {i > 0 && ', '}
                      {g.displayName}
                    </span>
                  ))}
                </TipIcon>
              )}
            </div>
          )
        },
      }),
      getActionsCol((row: AccessRow) => [
        {
          label: 'Change role',
          onActivate: () => setEditingRow(row),
          disabled: !row.directRole && 'This identity has no direct role to change',
        },
        {
          label: 'Remove role',
          onActivate: confirmDelete({
            doDelete: () => updatePolicy({ body: deleteRole(row.id, siloPolicy) }),
            label: (
              <span>
                the <HL>{row.directRole}</HL> role for <HL>{row.name}</HL>
              </span>
            ),
          }),
          disabled: !row.directRole && 'This identity has no direct role to remove',
        },
      ]),
    ],
    [siloPolicy, updatePolicy]
  )

  const tableInstance = useReactTable({
    columns,
    data: rows,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Access24Icon />}>Silo Access</PageTitle>
        <DocsPopover
          heading="access"
          icon={<Access16Icon />}
          summary="Roles determine who can view, edit, or administer this silo and the projects within it. If a user or group has both a silo and project role, the stronger role takes precedence."
          links={[docLinks.keyConceptsIam, docLinks.access, docLinks.identityProviders]}
        />
      </PageHeader>
      <TableActions>
        <CreateButton onClick={() => setAddModalOpen(true)}>Add user or group</CreateButton>
      </TableActions>
      {addModalOpen && (
        <SiloAccessAddUserSideModal
          onDismiss={() => setAddModalOpen(false)}
          policy={siloPolicy}
        />
      )}
      {editingRow && (
        <SiloAccessEditUserSideModal
          onDismiss={() => setEditingRow(null)}
          policy={siloPolicy}
          name={editingRow.name}
          identityId={editingRow.id}
          identityType={editingRow.identityType}
          defaultValues={{ roleName: editingRow.directRole }}
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
