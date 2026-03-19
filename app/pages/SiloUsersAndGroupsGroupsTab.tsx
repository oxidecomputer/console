/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'
import { useMemo, useState } from 'react'

import {
  api,
  getListQFn,
  q,
  queryClient,
  rolesByIdFromPolicy,
  usePrefetchedQuery,
  type Group,
} from '@oxide/api'
import { PersonGroup24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { GroupMembersSideModal } from '~/components/access/GroupMembersSideModal'
import { titleCrumb } from '~/hooks/use-crumbs'
import { EmptyCell } from '~/table/cells/EmptyCell'
import { ButtonCell } from '~/table/cells/LinkCell'
import { MemberCountCell } from '~/table/cells/MemberCountCell'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { roleColor } from '~/util/access'

const policyView = q(api.policyView, {})
const groupList = getListQFn(api.groupList, {})

export async function clientLoader() {
  await Promise.all([
    queryClient.prefetchQuery(policyView),
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
    body="No groups have been added to this silo"
  />
)

export default function SiloUsersAndGroupsGroupsTab() {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)

  const { data: siloPolicy } = usePrefetchedQuery(policyView)

  const siloRoleById = useMemo(() => rolesByIdFromPolicy(siloPolicy), [siloPolicy])

  const siloRoleCol = useMemo(
    () =>
      colHelper.display({
        id: 'siloRole',
        header: 'Silo Role',
        cell: ({ row }) => {
          const role = siloRoleById.get(row.original.id)
          return role ? <Badge color={roleColor[role]}>silo.{role}</Badge> : <EmptyCell />
        },
      }),
    [siloRoleById]
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
      siloRoleCol,
      colHelper.display({
        id: 'memberCount',
        header: 'Users',
        cell: ({ row }) => <MemberCountCell groupId={row.original.id} />,
      }),
      colHelper.accessor('timeCreated', Columns.timeCreated),
    ],
    [siloRoleCol]
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
          policy={siloPolicy}
        />
      )}
    </>
  )
}
