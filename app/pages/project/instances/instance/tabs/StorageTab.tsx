import { useTable } from 'react-table'

import type { Disk } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import { Button, EmptyMessage, SideModal, TableEmptyBox } from '@oxide/ui'
import { Table } from '@oxide/table'
import { useParams } from 'app/hooks'
import { DiskStatusBadge } from 'app/components/StatusBadge'
import { useState } from 'react'
import AttachDiskForm from 'app/forms/disk-attach'
import CreateDiskForm from 'app/forms/disk-create'

const OtherDisksEmpty = () => (
  <TableEmptyBox>
    <EmptyMessage
      title="No other attached disks"
      body="You need to attach another disk to this instance to see it here"
    />
  </TableEmptyBox>
)

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
  const [showDiskCreate, setShowDiskCreate] = useState(false)
  const [showDiskAttach, setShowDiskAttach] = useState(false)

  const queryClient = useApiQueryClient()
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

  const attachDisk = useApiMutation('instanceDisksAttach', {
    onSuccess() {
      queryClient.invalidateQueries('instanceDisksGet', {
        orgName,
        projectName,
        instanceName,
      })
    },
  })

  const bootDisks = data?.items.slice(0, 1) || []
  const otherDisks = data?.items.slice(1) || []

  const bootDiskTable = useTable({ columns, data: bootDisks })
  const otherDisksTable = useTable({ columns, data: otherDisks })

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
        <Button variant="secondary" size="sm" onClick={() => setShowDiskCreate(true)}>
          Create new disk
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="ml-3"
          onClick={() => setShowDiskAttach(true)}
        >
          Attach existing disk
        </Button>
      </div>
      <SideModal
        id="create-disk-modal"
        isOpen={showDiskCreate}
        onDismiss={() => setShowDiskCreate(false)}
      >
        <CreateDiskForm
          onSuccess={async (disk) => {
            await attachDisk.mutateAsync({
              instanceName,
              orgName,
              projectName,
              body: {
                name: disk.name,
              },
            })
            setShowDiskCreate(false)
          }}
        />
      </SideModal>
      <SideModal
        id="attach-disk-modal"
        isOpen={showDiskAttach}
        onDismiss={() => setShowDiskAttach(false)}
      >
        <AttachDiskForm
          onSuccess={() => {
            setShowDiskAttach(false)
          }}
        />
      </SideModal>
    </div>
  )
}
