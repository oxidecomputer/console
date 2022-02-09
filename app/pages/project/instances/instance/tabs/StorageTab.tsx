import React from 'react'
import { useTable } from 'react-table'

import type { Disk } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import { Button } from '@oxide/ui'
import { Table } from '@oxide/table'
import { useParams } from 'app/hooks'
import { DiskStatusBadge } from 'app/components/StatusBadge'

const columns = [
  {
    accessor: 'name' as const,
    // TODO: there might be a better way to add this margin to both
    Header: 'Name',
    Cell: ({ value }: { value: string }) => <div>{value}</div>,
  },
  {
    id: 'status',
    accessor: (d: Disk) => d.state.state,
    Header: 'Status',
    Cell: ({ value }: { value: Disk['state']['state'] }) => (
      <DiskStatusBadge status={value} />
    ),
    className: 'w-56',
  },
]

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
  );

  const bootDisks = data?.items.slice(0, 1) || []
  const otherDisks = data?.items.slice(1) || []

  const bootDiskTable = useTable({ columns, data: bootDisks })
  const otherDisksTable = useTable({ columns, data: otherDisks })

  if (!data) return null

  return (
    <div className="mt-8">
      <h2 className="mb-4 uppercase text-gray-200 text-mono-sm">Boot disk</h2>
      {/* TODO: need 40px high rows. another table or a flag on Table (ew) */}
      {/* TODO: figure out how to align the columns of the two tables. simple 
        way is just to explicitly specify the widths for both tables */}
      <Table table={bootDiskTable} rowClassName="!h-10" />
      <h2 className="mt-12 mb-4 uppercase text-gray-200 text-mono-sm">
        Attached Disks
      </h2>
      <Table table={otherDisksTable} rowClassName="!h-10" />
      <div className="mt-4">
        <Button variant="dim" size="sm">
          Create new disk
        </Button>
        <Button variant="dim" size="sm" className="ml-3">
          Attach existing disk
        </Button>
      </div>
    </div>
  )
}
