import { useTable } from 'react-table'

import type { Disk } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import {
  Button,
  EmptyMessage,
  Error16Icon,
  OpenLink12Icon,
  SideModal,
  TableEmptyBox,
} from '@oxide/ui'
import { Table } from '@oxide/table'
import { useParams, useToast } from 'app/hooks'
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

  const addToast = useToast()
  const queryClient = useApiQueryClient()
  const instanceParams = useParams('orgName', 'projectName', 'instanceName')

  const { data } = useApiQuery('instanceDisksGet', instanceParams, {
    refetchInterval: 5000,
  })

  const instanceStopped =
    useApiQuery('projectInstancesGetInstance', instanceParams).data?.runState === 'stopped'

  const attachDisk = useApiMutation('instanceDisksAttach', {
    onSuccess() {
      queryClient.invalidateQueries('instanceDisksGet', instanceParams)
    },
    onError(err) {
      addToast({
        icon: <Error16Icon />,
        title: 'Failed to attach disk',
        content: err.error.message,
        variant: 'error',
        timeout: 5000,
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
      <div className="mt-4 flex flex-col gap-3">
        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowDiskCreate(true)}
            disabled={!instanceStopped}
          >
            Create new disk
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowDiskAttach(true)}
            disabled={!instanceStopped}
          >
            Attach existing disk
          </Button>
        </div>
        {!instanceStopped && (
          <span className="max-w-xs text-sans-sm text-secondary">
            A disk cannot be added or attached without first{' '}
            <a href="#/" className="text-accent-secondary">
              powering down the instance
              <OpenLink12Icon className="ml-1 pt-[1px]" />
            </a>
          </span>
        )}
      </div>
      <SideModal
        id="create-disk-modal"
        isOpen={showDiskCreate}
        onDismiss={() => setShowDiskCreate(false)}
      >
        <CreateDiskForm
          onSuccess={(disk) => {
            setShowDiskCreate(false)
            attachDisk.mutate({
              ...instanceParams,
              body: {
                name: disk.name,
              },
            })
          }}
          onDismiss={() => setShowDiskCreate(false)}
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
          onDismiss={() => setShowDiskAttach(false)}
        />
      </SideModal>
    </div>
  )
}
