import React from 'react'
import { createTable, getCoreRowModelSync, useTableInstance } from '@tanstack/react-table'

import type { Disk } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import { Button, EmptyMessage, TableEmptyBox } from '@oxide/ui'
import { Table } from '@oxide/table'
import { useParams } from 'app/hooks'
import { DiskStatusBadge } from 'app/components/StatusBadge'

const OtherDisksEmpty = () => (
  <TableEmptyBox>
    <EmptyMessage
      title="No other attached disks"
      body="You need to attach another disk to this instance to see it here"
    />
  </TableEmptyBox>
)

const table = createTable<{ Row: Disk }>()

const columns = table.createColumns([
  table.createDataColumn('name', {
    header: 'Name',
    cell: ({ value }) => <div>{value}</div>,
  }),
  table.createDataColumn((d) => d.state.state, {
    id: 'status',
    header: 'Status',
    cell: ({ value }) => <DiskStatusBadge status={value} />,
    // TODO: need to figure out how to specify width on a column
  }),
])

export function StorageTab() {
  const { orgName, projectName, instanceName } = useParams(
    'orgName',
    'projectName',
    'instanceName'
  )
  const { data } = useApiQuery(
    'instanceDisksGet',
    { orgName, projectName, instanceName },
    { refetchInterval: 5000 }
  )

  const bootDisks = React.useMemo(() => data?.items.slice(0, 1) || [], [data])
  const otherDisks = React.useMemo(() => data?.items.slice(1) || [], [data])

  const bootDiskTable = useTableInstance(table, {
    columns,
    data: bootDisks,
    getCoreRowModel: getCoreRowModelSync(),
  })
  const otherDisksTable = useTableInstance(table, {
    columns,
    data: otherDisks,
    getCoreRowModel: getCoreRowModelSync(),
  })

  if (!data) return null

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-mono-sm text-secondary">Boot disk</h2>
      {/* TODO: need 40px high rows. another table or a flag on Table (ew) */}
      {/* TODO: figure out how to align the columns of the two tables. simple 
        way is just to explicitly specify the widths for both tables */}
      <Table table={bootDiskTable} rowClassName="!h-10" />
      <h2 className="mt-12 mb-4 text-mono-sm text-secondary">Attached Disks</h2>
      {otherDisks.length > 0 ? (
        <Table table={otherDisksTable} rowClassName="!h-10" />
      ) : (
        <OtherDisksEmpty />
      )}
      <div className="mt-4">
        <Button variant="secondary" size="sm">
          Create new disk
        </Button>
        <Button variant="secondary" size="sm" className="ml-3">
          Attach existing disk
        </Button>
      </div>
    </div>
  )
}
