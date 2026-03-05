/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'

import { api, getListQFn, queryClient, type User } from '@oxide/api'
import { Person24Icon } from '@oxide/design-system/icons/react'

import { titleCrumb } from '~/hooks/use-crumbs'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'

const userList = getListQFn(api.userList, {})

export async function clientLoader() {
  await queryClient.prefetchQuery(userList.optionsFn())
  return null
}

export const handle = titleCrumb('Users')

const colHelper = createColumnHelper<User>()
const columns = [
  colHelper.accessor('displayName', { header: 'Name' }),
  colHelper.accessor('id', Columns.id),
]

const EmptyState = () => (
  <EmptyMessage
    icon={<Person24Icon />}
    title="No users"
    body="No users have been added to this silo"
  />
)

export default function AccessUsersTab() {
  const { table } = useQueryTable({ query: userList, columns, emptyState: <EmptyState /> })
  return table
}
