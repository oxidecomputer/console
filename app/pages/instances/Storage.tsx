import React from 'react'
import { useTable } from 'react-table'

import type { DiskAttachment, DiskState } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import { Button } from '@oxide/ui'
import { Table } from '@oxide/table'
import { useParams } from '../../hooks'
import { DiskStatusBadge } from '../../components/StatusBadge'

const columns = [
  {
    accessor: 'diskName' as const,
    // TODO: there might be a better way to add this margin to both
    Header: 'Name',
    Cell: ({ value }: { value: string }) => <div>{value}</div>,
  },
  {
    id: 'status',
    accessor: (d: DiskAttachment) => d.diskState.state,
    Header: 'Status',
    Cell: ({ value }: { value: DiskState['state'] }) => (
      <DiskStatusBadge status={value} />
    ),
    className: 'w-56',
  },
]

function Storage() {
  const { orgName, projectName, instanceName } = useParams(
    'orgName',
    'projectName',
    'instanceName'
  )
  const { data } = useApiQuery(
    'instanceDisksGet',
    { organizationName: orgName, projectName, instanceName },
    { refetchInterval: 5000 }
  )

  const bootDisks = data?.slice(0, 1) || []
  const otherDisks = data?.slice(1) || []

  const bootDiskTable = useTable({ columns, data: bootDisks })
  const otherDisksTable = useTable({ columns, data: otherDisks })

  if (!data) return null

  return (
    <div className="mt-8">
      <h2 className="text-display-lg mb-4">Boot disk</h2>
      {/* TODO: need 40px high rows. another table or a flag on Table (ew) */}
      {/* TODO: figure out how to align the columns of the two tables. simple 
        way is just to explicitly specify the widths for both tables */}
      <Table table={bootDiskTable} rowClassName="!h-10" />
      <h2 className="text-display-lg mt-12 mb-4">Other disks</h2>
      <Table table={otherDisksTable} rowClassName="!h-10" />
      <div className="mt-4">
        <Button size="sm">Create new disk</Button>
        <Button size="sm" className="ml-3">
          Attach existing disk
        </Button>
      </div>
    </div>
  )
}

export default Storage
