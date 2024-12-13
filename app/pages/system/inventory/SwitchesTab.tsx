/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'

import { getListQFn, queryClient, type Switch } from '@oxide/api'
import { Servers24Icon } from '@oxide/design-system/icons/react'

import { useQueryTable } from '~/table/QueryTable'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'

const switchList = getListQFn('switchList', {})

export async function loader() {
  await queryClient.prefetchQuery(switchList.optionsFn())
  return null
}

const colHelper = createColumnHelper<Switch>()
const columns = [
  colHelper.accessor('id', {}),
  colHelper.accessor('baseboard.part', { header: 'part number' }),
  colHelper.accessor('baseboard.serial', { header: 'serial number' }),
  colHelper.accessor('baseboard.revision', { header: 'revision' }),
]

Component.displayName = 'SwitchesTab'
export function Component() {
  const emptyState = <EmptyMessage icon={<Servers24Icon />} title="No switches found" />
  const { table } = useQueryTable({ query: switchList, columns, emptyState })
  return table
}
