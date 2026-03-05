/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'
import { useMemo } from 'react'

import { api, getListQFn, q, queryClient, usePrefetchedQuery, type User } from '@oxide/api'
import { Person24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { titleCrumb } from '~/hooks/use-crumbs'
import { EmptyCell } from '~/table/cells/EmptyCell'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { roleColor } from '~/util/access'

const policyView = q(api.policyView, {})
const userList = getListQFn(api.userList, {})

export async function clientLoader() {
  await Promise.all([
    queryClient.prefetchQuery(policyView),
    queryClient.prefetchQuery(userList.optionsFn()),
  ])
  return null
}

export const handle = titleCrumb('Users')

const colHelper = createColumnHelper<User>()

const EmptyState = () => (
  <EmptyMessage
    icon={<Person24Icon />}
    title="No users"
    body="No users have been added to this silo"
  />
)

export default function SiloAccessUsersTab() {
  const { data: siloPolicy } = usePrefetchedQuery(policyView)

  const roleById = useMemo(
    () => new Map(siloPolicy.roleAssignments.map((a) => [a.identityId, a.roleName])),
    [siloPolicy]
  )

  const columns = useMemo(
    () => [
      colHelper.accessor('displayName', { header: 'Name' }),
      colHelper.display({
        id: 'siloRole',
        header: 'Silo Role',
        cell: ({ row }) => {
          const role = roleById.get(row.original.id)
          return role ? <Badge color={roleColor[role]}>silo.{role}</Badge> : <EmptyCell />
        },
      }),
      colHelper.accessor('id', Columns.id),
    ],
    [roleById]
  )

  const { table } = useQueryTable({ query: userList, columns, emptyState: <EmptyState /> })
  return table
}
