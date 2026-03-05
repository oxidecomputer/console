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

import {
  api,
  getListQFn,
  q,
  queryClient,
  usePrefetchedQuery,
  type Group,
  type User,
} from '@oxide/api'
import { PersonGroup24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { ReadOnlySideModalForm } from '~/components/form/ReadOnlySideModalForm'
import { titleCrumb } from '~/hooks/use-crumbs'
import { EmptyCell } from '~/table/cells/EmptyCell'
import { ButtonCell } from '~/table/cells/LinkCell'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { roleColor } from '~/util/access'
import { ALL_ISH } from '~/util/consts'

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

export default function SiloAccessGroupsTab() {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)

  const { data: siloPolicy } = usePrefetchedQuery(policyView)

  const roleById = useMemo(
    () => new Map(siloPolicy.roleAssignments.map((a) => [a.identityId, a.roleName])),
    [siloPolicy]
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
        id: 'siloRole',
        header: 'Silo Role',
        cell: ({ row }) => {
          const role = roleById.get(row.original.id)
          return role ? <Badge color={roleColor[role]}>silo.{role}</Badge> : <EmptyCell />
        },
      }),
      idColumn,
    ],
    [setSelectedGroup, roleById]
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
