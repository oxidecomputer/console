import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo, useState } from 'react'

import type { Disk } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import type { MenuAction } from '@oxide/table'
import { DateCell, SizeCell, Table, getActionsCol } from '@oxide/table'
import { Button, EmptyMessage, Error16Icon, OpenLink12Icon, TableEmptyBox } from '@oxide/ui'

import { DiskStatusBadge } from 'app/components/StatusBadge'
import AttachDiskSideModalForm from 'app/forms/disk-attach'
import { CreateDiskSideModalForm } from 'app/forms/disk-create'
import { useRequiredParams, useToast } from 'app/hooks'

const OtherDisksEmpty = () => (
  <TableEmptyBox>
    <EmptyMessage
      title="No other attached disks"
      body="You need to attach another disk to this instance to see it here"
    />
  </TableEmptyBox>
)

const colHelper = createColumnHelper<Disk>()

const columns = [
  colHelper.accessor('name', {
    header: 'Name',
    cell: (info) => <div>{info.getValue()}</div>,
  }),
  colHelper.accessor('size', {
    header: 'Size',
    cell: (info) => <SizeCell value={info.getValue()} />,
  }),
  colHelper.accessor('state.state', {
    id: 'status',
    header: 'Status',
    cell: (info) => <DiskStatusBadge status={info.getValue()} />,
  }),
  colHelper.accessor('timeCreated', {
    header: 'Created',
    cell: (info) => <DateCell value={info.getValue()} />,
  }),
]

export function StorageTab() {
  const [showDiskCreate, setShowDiskCreate] = useState(false)
  const [showDiskAttach, setShowDiskAttach] = useState(false)

  const addToast = useToast()
  const queryClient = useApiQueryClient()
  const instanceParams = useRequiredParams('orgName', 'projectName', 'instanceName')

  const { data } = useApiQuery('instanceDiskList', { path: instanceParams })

  const detachDisk = useApiMutation('instanceDiskDetach', {})

  const instanceStopped =
    useApiQuery('instanceView', { path: instanceParams }).data?.runState === 'stopped'

  const makeActions = (disk: Disk): MenuAction[] => [
    {
      label: 'Detach',
      disabled: !instanceStopped,
      onActivate() {
        detachDisk.mutate(
          { body: { name: disk.name }, path: instanceParams },
          {
            onSuccess: () => {
              queryClient.invalidateQueries('instanceDiskList', { path: instanceParams })
            },
          }
        )
      },
    },
  ]

  const attachDisk = useApiMutation('instanceDiskAttach', {
    onSuccess() {
      queryClient.invalidateQueries('instanceDiskList', { path: instanceParams })
    },
    onError(err) {
      addToast({
        icon: <Error16Icon />,
        title: 'Failed to attach disk',
        content: err.error.message,
        variant: 'error',
      })
    },
  })

  const bootDisks = useMemo(() => data?.items.slice(0, 1) || [], [data])
  const otherDisks = useMemo(() => data?.items.slice(1) || [], [data])

  const bootDiskTable = useReactTable({
    columns: [...columns, getActionsCol(makeActions)],
    data: bootDisks,
    getCoreRowModel: getCoreRowModel(),
  })
  const bootLabelId = 'boot-disk-label'

  const otherDisksTable = useReactTable({
    columns: [...columns, getActionsCol(makeActions)],
    data: otherDisks,
    getCoreRowModel: getCoreRowModel(),
  })
  const attachedLabelId = 'attached-disks-label'

  if (!data) return null

  return (
    <div className="mt-8">
      <h2 id={bootLabelId} className="mb-4 text-mono-sm text-secondary">
        Boot disk
      </h2>
      {/* TODO: need 40px high rows. another table or a flag on Table (ew) */}
      {/* TODO: figure out how to align the columns of the two tables. simple
        way is just to explicitly specify the widths for both tables */}
      <Table table={bootDiskTable} rowClassName="!h-10" aria-labelledby={bootLabelId} />
      <h2 id={attachedLabelId} className="mt-12 mb-4 text-mono-sm text-secondary">
        Attached disks
      </h2>
      {otherDisks.length > 0 ? (
        <Table
          table={otherDisksTable}
          rowClassName="!h-10"
          aria-labelledby={attachedLabelId}
        />
      ) : (
        <OtherDisksEmpty />
      )}
      <div className="mt-4 flex flex-col gap-3">
        <div className="flex gap-3">
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowDiskCreate(true)}
            disabled={!instanceStopped}
          >
            Create new disk
          </Button>
          <Button
            variant="ghost"
            color="secondary"
            size="sm"
            onClick={() => setShowDiskAttach(true)}
            disabled={!instanceStopped}
          >
            Attach existing disk
          </Button>
        </div>
        {!instanceStopped && (
          <span className="max-w-xs text-sans-md text-tertiary">
            A disk cannot be added or attached without first{' '}
            <a href="#/" className="text-accent-secondary">
              stopping the instance
              <OpenLink12Icon className="ml-1 pt-[1px]" />
            </a>
          </span>
        )}
      </div>
      {showDiskCreate && (
        <CreateDiskSideModalForm
          onDismiss={() => setShowDiskCreate(false)}
          onSuccess={({ name }) => {
            attachDisk.mutate({ path: instanceParams, body: { name } })
          }}
        />
      )}
      <AttachDiskSideModalForm
        isOpen={showDiskAttach}
        onSuccess={() => {
          setShowDiskAttach(false)
        }}
        onDismiss={() => setShowDiskAttach(false)}
      />
    </div>
  )
}
