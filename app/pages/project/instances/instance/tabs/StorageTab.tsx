import React from 'react'
import { createTable } from '@tanstack/react-table'

import type { Disk } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import { Button } from '@oxide/ui'
import { Table2 } from '@oxide/table'
import { useParams } from 'app/hooks'
import { DiskStatusBadge } from 'app/components/StatusBadge'

const table = createTable().RowType<Disk>()

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

  const bootDiskTable = table.useTable({ columns, data: bootDisks })
  const otherDisksTable = table.useTable({ columns, data: otherDisks })

  if (!data) return null

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-mono-sm text-secondary">Boot disk</h2>
      {/* TODO: need 40px high rows. another table or a flag on Table (ew) */}
      {/* TODO: figure out how to align the columns of the two tables. simple 
        way is just to explicitly specify the widths for both tables */}
      <Table2 table={bootDiskTable} rowClassName="!h-10" />
      <h2 className="mt-12 mb-4 text-mono-sm text-secondary">Attached Disks</h2>
      <Table2 table={otherDisksTable} rowClassName="!h-10" />
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
