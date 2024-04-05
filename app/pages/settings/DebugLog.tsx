/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useQuery } from '@tanstack/react-query'
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo } from 'react'

import { queryClient } from '~/api/client'
import { clearLog, getLog, LOG_KEY, type LogItem } from '~/api/log'
import { dateCell } from '~/table/columns/common'
import { Table } from '~/table/Table'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { TableActions, TableControlsButton } from '~/ui/lib/Table'

const colHelper = createColumnHelper<LogItem>()
const columns = [
  colHelper.accessor('timestamp', { cell: dateCell }),
  colHelper.accessor('path', { header: 'Console page' }),
  colHelper.accessor('data.message', { header: 'Message' }),
  colHelper.accessor('statusCode', { header: 'HTTP Status' }),
]

const QUERY_KEY = [LOG_KEY]

function clear() {
  clearLog()
  queryClient.invalidateQueries()
}

export function DebugLog() {
  const { data: log } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: getLog,
    refetchInterval: 2000, // no problem to refetch constantly, it's local
  })
  const data = useMemo(() => log || [], [log])
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() })
  return (
    <>
      <PageHeader>
        <PageTitle>Error Log</PageTitle>
      </PageHeader>
      <TableActions>
        <TableControlsButton onClick={clear}>Clear log</TableControlsButton>
      </TableActions>
      <Table table={table} />
    </>
  )
}
