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
import * as R from 'remeda'

import {
  api,
  byGroupThenName,
  deleteRole,
  q,
  queryClient,
  roleOrder,
  useApiMutation,
  useGroupsByUserId,
  usePrefetchedQuery,
  type Group,
  type IdentityType,
  type RoleKey,
  type ScopedPolicy,
  type User,
} from '@oxide/api'
import { Access16Icon, Access24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { GroupMembersSideModal } from '~/components/access/GroupMembersSideModal'
import { UserDetailsSideModal } from '~/components/access/UserDetailsSideModal'
import { DocsPopover } from '~/components/DocsPopover'
import { HL } from '~/components/HL'
import { ListPlusCell } from '~/components/ListPlusCell'
import {
  ProjectAccessAddUserSideModal,
  ProjectAccessEditUserSideModal,
} from '~/forms/project-access'
import { getProjectSelector, useProjectSelector } from '~/hooks/use-params'
import { useQuickActions } from '~/hooks/use-quick-actions'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { ButtonCell } from '~/table/cells/LinkCell'
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
// full lists to resolve names and back the detail side modals; the API only
// sorts by id
const userListAll = q(api.userList, { query: { limit: ALL_ISH } })
const groupListAll = q(api.groupList, { query: { limit: ALL_ISH } })

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

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const selector = getProjectSelector(params)
  // groups must resolve before fanning out per-group member fetches
  const groups = await queryClient.fetchQuery(groupListAll)
  // Fire per-group member prefetches but don't await them: they back the user
  // details modal's group list and fill in as they resolve.
  groups.items.forEach((g) =>
    queryClient.prefetchQuery(q(api.userList, { query: { group: g.id, limit: ALL_ISH } }))
  )
  await Promise.all([
    queryClient.prefetchQuery(policyView),
    queryClient.prefetchQuery(projectPolicyView(selector)),
    queryClient.prefetchQuery(userListAll),
  ])
  return null
}

export const handle = { crumb: 'Project Access' }

type UserRow = {
  id: string
  identityType: IdentityType
  name: string
  projectRole: RoleKey | undefined
  roleBadges: { roleSource: string; roleName: RoleKey }[]
}

const colHelper = createColumnHelper<UserRow>()

export default function ProjectAccessPage() {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingUserRow, setEditingUserRow] = useState<UserRow | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const projectSelector = useProjectSelector()

  const { data: siloPolicy } = usePrefetchedQuery(policyView)
  const { data: projectPolicy } = usePrefetchedQuery(projectPolicyView(projectSelector))
  const { data: users } = usePrefetchedQuery(userListAll)
  const { data: groups } = usePrefetchedQuery(groupListAll)

  const groupsByUserId = useGroupsByUserId(groups.items)

  const usersById = useMemo(() => new Map(users.items.map((u) => [u.id, u])), [users])
  const groupsById = useMemo(() => new Map(groups.items.map((g) => [g.id, g])), [groups])

  const scopedPolicies = useMemo(
    () =>
      [
        { scope: 'silo', policy: siloPolicy },
        { scope: 'project', policy: projectPolicy },
      ] satisfies ScopedPolicy[],
    [siloPolicy, projectPolicy]
  )

  const rows = useMemo(() => {
    const nameById = new Map(
      [...users.items, ...groups.items].map((u) => [u.id, u.displayName])
    )
    // an identity appears here if it has a direct role on the silo or the project
    const identities = new Map<string, IdentityType>()
    for (const ra of [...siloPolicy.roleAssignments, ...projectPolicy.roleAssignments]) {
      identities.set(ra.identityId, ra.identityType)
    }

    return [...identities.entries()]
      .map(([id, identityType]) => {
        const siloRole = siloPolicy.roleAssignments.find(
          (ra) => ra.identityId === id
        )?.roleName
        const projectRole = projectPolicy.roleAssignments.find(
          (ra) => ra.identityId === id
        )?.roleName

        const roleBadges = R.sortBy(
          [
            siloRole ? { roleSource: 'silo', roleName: siloRole } : undefined,
            projectRole ? { roleSource: 'project', roleName: projectRole } : undefined,
          ].filter((r) => !!r),
          (r) => roleOrder[r.roleName] // strongest role first
        )

        return {
          id,
          identityType,
          name: nameById.get(id) ?? id,
          projectRole,
          roleBadges,
        } satisfies UserRow
      })
      .sort(byGroupThenName)
  }, [siloPolicy, projectPolicy, users, groups])

  const { mutateAsync: updatePolicy } = useApiMutation(api.projectPolicyUpdate, {
    onSuccess: () => {
      queryClient.invalidateEndpoint('projectPolicyView')
      addToast({ content: 'Access removed' })
    },
  })

  const columns = useMemo(
    () => [
      colHelper.accessor('name', {
        header: 'Name',
        cell: (info) => {
          const row = info.row.original
          const user = row.identityType === 'silo_user' ? usersById.get(row.id) : undefined
          const group =
            row.identityType === 'silo_group' ? groupsById.get(row.id) : undefined
          if (user) {
            return (
              <ButtonCell onClick={() => setSelectedUser(user)}>
                {info.getValue()}
              </ButtonCell>
            )
          }
          if (group) {
            return (
              <ButtonCell onClick={() => setSelectedGroup(group)}>
                {info.getValue()}
              </ButtonCell>
            )
          }
          // identity isn't in this silo's user/group list (e.g. cross-silo), so
          // there's no detail to show
          return info.getValue()
        },
      }),
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

      getActionsCol((row: UserRow) => [
        {
          label: 'Change role',
          onActivate: () => setEditingUserRow(row),
          disabled:
            !row.projectRole && "You don't have permission to change this user's role",
        },
        {
          label: 'Delete',
          onActivate: confirmDelete({
            doDelete: () =>
              updatePolicy({
                path: { project: projectSelector.project },
                body: deleteRole(row.id, projectPolicy),
              }),
            label: (
              <span>
                the <HL>{row.projectRole}</HL> role for <HL>{row.name}</HL>
              </span>
            ),
            resourceKind: 'role assignment',
          }),
          disabled: !row.projectRole && "You don't have permission to delete this user",
        },
      ]),
    ],
    [projectPolicy, projectSelector.project, updatePolicy, usersById, groupsById]
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
      {selectedUser && (
        <UserDetailsSideModal
          user={selectedUser}
          onDismiss={() => setSelectedUser(null)}
          scopedPolicies={scopedPolicies}
          userGroups={groupsByUserId.get(selectedUser.id) ?? []}
        />
      )}
      {selectedGroup && (
        <GroupMembersSideModal
          group={selectedGroup}
          onDismiss={() => setSelectedGroup(null)}
          scopedPolicies={scopedPolicies}
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
