/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
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
  rolesByIdFromPolicy,
  usePrefetchedQuery,
  type Group,
} from '@oxide/api'
import { PersonGroup24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { GroupMembersSideModal } from '~/components/access/GroupMembersSideModal'
import { ListPlusCell } from '~/components/ListPlusCell'
import { titleCrumb } from '~/hooks/use-crumbs'
import { getProjectSelector, useProjectSelector } from '~/hooks/use-params'
import { EmptyCell } from '~/table/cells/EmptyCell'
import { ButtonCell } from '~/table/cells/LinkCell'
import { MemberCountCell } from '~/table/cells/MemberCountCell'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { TipIcon } from '~/ui/lib/TipIcon'
import { roleColor } from '~/util/access'
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

const GroupEmptyState = () => (
  <EmptyMessage
    icon={<PersonGroup24Icon />}
    title="No groups"
    body="No groups have been added to this project"
  />
)

export default function ProjectUsersAndGroupsGroupsTab() {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const projectSelector = useProjectSelector()

  const { data: siloPolicy } = usePrefetchedQuery(policyView)
  const { data: projectPolicy } = usePrefetchedQuery(projectPolicyView(projectSelector))

  const siloRoleById = useMemo(() => rolesByIdFromPolicy(siloPolicy), [siloPolicy])
  const projectRoleById = useMemo(() => rolesByIdFromPolicy(projectPolicy), [projectPolicy])

  const rolesCol = useMemo(
    () =>
      colHelper.display({
        id: 'roles',
        header: () => (
          <span className="inline-flex items-center">
            Role
            <TipIcon className="ml-2">
              A group&apos;s effective role for this project is the strongest role on either
              the silo or project. Groups without an assigned role have no access to this
              project.
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
    [siloRoleById, projectRoleById]
  )

  const staticColumns = useMemo(
    () => [
      colHelper.accessor('displayName', {
        header: 'Name',
        cell: (info) => (
          <ButtonCell onClick={() => setSelectedGroup(info.row.original)}>
            {info.getValue()}
          </ButtonCell>
        ),
      }),
      rolesCol,
      colHelper.display({
        id: 'memberCount',
        header: 'Users',
        cell: ({ row }) => <MemberCountCell groupId={row.original.id} />,
      }),
      colHelper.accessor('timeCreated', Columns.timeCreated),
    ],
    [rolesCol]
  )

  const columns = staticColumns

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
          scopedPolicies={[
            { scope: 'project', policy: projectPolicy, sourceLabel: 'Assigned' },
            { scope: 'silo', policy: siloPolicy, sourceLabel: 'Inherited from silo' },
          ]}
        />
      )}
    </>
  )
}
