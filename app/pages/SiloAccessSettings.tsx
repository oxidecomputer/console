/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo } from 'react'

import { apiq, queryClient, usePrefetchedQuery } from '@oxide/api'

import { makeCrumb } from '~/hooks/use-crumbs'
import { Table } from '~/table/Table'
import { formatDurationSeconds } from '~/util/date'

const authSettingsView = apiq('authSettingsView', {})

export const handle = makeCrumb('Settings')

export async function clientLoader() {
  await queryClient.prefetchQuery(authSettingsView)
  return null
}

type SettingsRow = {
  setting: string
  value: string
}

const colHelper = createColumnHelper<SettingsRow>()
const columns = [
  colHelper.accessor('setting', { header: 'Setting' }),
  colHelper.accessor('value', { header: 'Value' }),
]

// TODO: Need a button to open the form to update settings, but you can only see
// it if you are a silo admin. With fleet viewer we have a pretty easy way to tell

export default function SiloAccessSettings() {
  const { data: settings } = usePrefetchedQuery(authSettingsView)

  const rows = useMemo((): SettingsRow[] => {
    const ttl = settings.deviceTokenMaxTtlSeconds
    return [
      {
        setting: 'Max lifetime for device access tokens',
        value: typeof ttl === 'number' ? formatDurationSeconds(ttl) : 'No limit',
      },
    ]
  }, [settings])

  const table = useReactTable({
    columns,
    data: rows,
    getCoreRowModel: getCoreRowModel(),
  })

  return <Table table={table} />
}
