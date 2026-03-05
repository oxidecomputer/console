/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useQuery } from '@tanstack/react-query'
import { createColumnHelper } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import type { LoaderFunctionArgs } from 'react-router'
import * as R from 'remeda'

import {
  api,
  getListQFn,
  q,
  queryClient,
  roleOrder,
  usePrefetchedQuery,
  type Group,
  type User,
} from '@oxide/api'
import { PersonGroup24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { ReadOnlySideModalForm } from '~/components/form/ReadOnlySideModalForm'
import { ListPlusCell } from '~/components/ListPlusCell'
import { titleCrumb } from '~/hooks/use-crumbs'
import { getProjectSelector, useProjectSelector } from '~/hooks/use-params'
import { EmptyCell } from '~/table/cells/EmptyCell'
import { ButtonCell } from '~/table/cells/LinkCell'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { TipIcon } from '~/ui/lib/TipIcon'
import { roleColor } from '~/util/access'
import { ALL_ISH } from '~/util/consts'
import type * as PP from '~/util/path-params'

const policyView = q(api.policyView, {})
const projectPolicyView = ({ project }: PP.Project) =>
  q(api.projectPolicyView, { path: { project } })
const groupList = getListQFn(api.groupList, {})

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const selector = getProjectSelector(params)
  await Promise.all([
    queryClient.prefetchQuery(policyView),
    queryClient.prefetchQuery(projectPolicyView(selector)),
    queryClient.prefetchQuery(groupList.optionsFn()),
  ])
  return null
}

export const handle = titleCrumb('Groups')

const colHelper = createColumnHelper<Group>()
const idColumn = colHelper.accessor('id', Columns.id)

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
}

function GroupMembersSideModal({ group, onDismiss }: GroupMembersSideModalProps) {
  const { data } = useQuery(q(api.userList, { query: { group: group.id, limit: ALL_ISH } }))
  const members = data?.items ?? []

  return (
    <ReadOnlySideModalForm
      title="Group members"
      subtitle={group.displayName}
      onDismiss={onDismiss}
      animate
    >
      {members.length === 0 ? (
        <EmptyMessage
          icon={<PersonGroup24Icon />}
          title="No members"
          body="This group has no members"
        />
      ) : (
        <ul className="space-y-2">
          {members.map((member: User) => (
            <li key={member.id} className="text-default">
              {member.displayName}
            </li>
          ))}
        </ul>
      )}
    </ReadOnlySideModalForm>
  )
}

export default function ProjectAccessGroupsTab() {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const projectSelector = useProjectSelector()

  const { data: siloPolicy } = usePrefetchedQuery(policyView)
  const { data: projectPolicy } = usePrefetchedQuery(projectPolicyView(projectSelector))

  const siloRoleById = useMemo(
    () => new Map(siloPolicy.roleAssignments.map((a) => [a.identityId, a.roleName])),
    [siloPolicy]
  )
  const projectRoleById = useMemo(
    () => new Map(projectPolicy.roleAssignments.map((a) => [a.identityId, a.roleName])),
    [projectPolicy]
  )

  const columns = useMemo(
    () => [
      colHelper.accessor('displayName', {
        header: 'Name',
        cell: (info) => (
          <ButtonCell onClick={() => setSelectedGroup(info.row.original)}>
            {info.getValue()}
          </ButtonCell>
        ),
      }),
      colHelper.display({
        id: 'memberCount',
        header: 'Members',
        cell: ({ row }) => <MemberCountCell groupId={row.original.id} />,
      }),
      colHelper.display({
        id: 'roles',
        header: () => (
          <span className="inline-flex items-center">
            Role
            <TipIcon className="ml-2">
              A group&apos;s effective role for this project is the strongest role on either
              the silo or project
            </TipIcon>
          </span>
        ),
        cell: ({ row }) => {
          const siloRole = siloRoleById.get(row.original.id)
          const projectRole = projectRoleById.get(row.original.id)
          const roles = R.sortBy(
            [
              siloRole && { roleName: siloRole, roleSource: 'silo' as const },
              projectRole && { roleName: projectRole, roleSource: 'project' as const },
            ].filter((r) => !!r),
            (r) => roleOrder[r.roleName]
          )
          if (roles.length === 0) return <EmptyCell />
          return (
            <ListPlusCell tooltipTitle="Other roles">
              {roles.map(({ roleName, roleSource }) => (
                <Badge key={roleSource} color={roleColor[roleName]}>
                  {roleSource}.{roleName}
                </Badge>
              ))}
            </ListPlusCell>
          )
        },
      }),
      idColumn,
    ],
    [setSelectedGroup, siloRoleById, projectRoleById]
  )

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
        />
      )}
    </>
  )
}
