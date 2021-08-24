import React from 'react'
import { useParams } from 'react-router'
import { useTable } from 'react-table'

import type { DiskAttachment } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import { Button, Table } from '@oxide/ui'

const COLUMNS = [
  {
    accessor: 'diskName' as const,
    // TODO: there has to be a better way to do this left padding
    Header: () => <div className="text-left ml-4">Name</div>,
    Cell: ({ value }: { value: string }) => <div className="ml-4">{value}</div>,
  },
  {
    accessor: (_d: DiskAttachment) => '50', // TODO: real data
    id: 'size',
    Header: () => (
      <div className="text-left">
        Size <span className="!normal-case">(GiB)</span>
      </div>
    ),
  },
  {
    accessor: (_d: DiskAttachment) => 'Read/Write', // TODO: real data
    id: 'mode',
    Header: () => <div className="text-left">Mode</div>,
  },
]

function Storage() {
  const columns = React.useMemo(() => COLUMNS, [])
  const { projectName, instanceName } = useParams()
  const { data } = useApiQuery('instanceDisksGet', {
    projectName,
    instanceName,
  })

  const bootDisks = data?.slice(0, 1) || []
  const otherDisks = data?.slice(1) || []

  const bootDiskTable = useTable({ columns, data: bootDisks })
  const otherDisksTable = useTable({ columns, data: otherDisks })

  if (!data) return <div>loading</div>

  return (
    <div className="mt-16">
      <h2 className="text-display-lg mb-4">Boot disk</h2>
      {/* TODO: need 40px high rows. another table or a flag on Table (ew) */}
      {/* TODO: figure out how to align the columns of the two tables. simple 
        way is just to explicitly specify the widths for both tables */}
      <Table table={bootDiskTable} />
      <h2 className="text-display-lg mt-12 mb-4">Other disks</h2>
      <Table table={otherDisksTable} />
      <div className="mt-4">
        <Button>Create new disk</Button>
        <Button className="ml-3">Attach existing disk</Button>
      </div>
    </div>
  )
}

export default Storage
