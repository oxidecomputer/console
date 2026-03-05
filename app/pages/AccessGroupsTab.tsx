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

import { api, getListQFn, q, queryClient, type Group, type User } from '@oxide/api'
import { PersonGroup24Icon } from '@oxide/design-system/icons/react'

import { ReadOnlySideModalForm } from '~/components/form/ReadOnlySideModalForm'
import { titleCrumb } from '~/hooks/use-crumbs'
import { ButtonCell } from '~/table/cells/LinkCell'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { ALL_ISH } from '~/util/consts'

const groupList = getListQFn(api.groupList, {})

export async function clientLoader() {
  await queryClient.prefetchQuery(groupList.optionsFn())
  return null
}

export const handle = titleCrumb('Groups')

const colHelper = createColumnHelper<Group>()
const idColumn = colHelper.accessor('id', Columns.id)

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

export default function AccessGroupsTab() {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)

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
      idColumn,
    ],
    [setSelectedGroup]
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
