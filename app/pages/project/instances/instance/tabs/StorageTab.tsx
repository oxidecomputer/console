import { useCallback, useMemo, useState } from 'react'
import type { LoaderFunctionArgs } from 'react-router-dom'

import {
  type Disk,
  apiQueryClient,
  toApiSelector,
  toPathQuery,
  useApiMutation,
  useApiQuery,
  useApiQueryClient,
} from '@oxide/api'
import type { MenuAction } from '@oxide/table'
import {
  DateCell,
  SizeCell,
  Table,
  createColumnHelper,
  getActionsCol,
  useReactTable,
} from '@oxide/table'
import { Button, EmptyMessage, Error16Icon, OpenLink12Icon, TableEmptyBox } from '@oxide/ui'

import { DiskStatusBadge } from 'app/components/StatusBadge'
import AttachDiskSideModalForm from 'app/forms/disk-attach'
import { CreateDiskSideModalForm } from 'app/forms/disk-create'
import { requireInstanceParams, useRequiredParams, useToast } from 'app/hooks'

const OtherDisksEmpty = () => (
  <TableEmptyBox>
    <EmptyMessage
      title="No other attached disks"
      body="You need to attach another disk to this instance to see it here"
    />
  </TableEmptyBox>
)

const colHelper = createColumnHelper<Disk>()

const staticCols = [
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

StorageTab.loader = async ({ params }: LoaderFunctionArgs) => {
  const instanceParams = requireInstanceParams(params)
  const instanceSelector = toPathQuery('instance', toApiSelector(instanceParams))
  await Promise.all([
    apiQueryClient.prefetchQuery('instanceDiskListV1', instanceSelector),
    // This is covered by the InstancePage loader but there's no downside to
    // being redundant. If it were removed there, we'd still want it here.
    apiQueryClient.prefetchQuery('instanceViewV1', instanceSelector),
  ])
  return null
}

export function StorageTab() {
  const [showDiskCreate, setShowDiskCreate] = useState(false)
  const [showDiskAttach, setShowDiskAttach] = useState(false)

  const addToast = useToast()
  const queryClient = useApiQueryClient()
  const instanceParams = useRequiredParams('orgName', 'projectName', 'instanceName')
  const instanceSelector = toPathQuery('instance', toApiSelector(instanceParams))

  const { data } = useApiQuery('instanceDiskListV1', instanceSelector)

  const detachDisk = useApiMutation('instanceDiskDetachV1', {})

  const instanceStopped =
    useApiQuery('instanceViewV1', instanceSelector).data?.runState === 'stopped'

  const makeActions = useCallback(
    (disk: Disk): MenuAction[] => [
      {
        label: 'Detach',
        disabled:
          !instanceStopped && 'Instance must be stopped before disk can be detached',
        onActivate() {
          detachDisk.mutate(
            { body: { disk: disk.name }, ...instanceSelector },
            {
              onSuccess: () => {
                queryClient.invalidateQueries('instanceDiskListV1', instanceSelector)
              },
            }
          )
        },
      },
    ],
    [detachDisk, instanceStopped, queryClient, instanceSelector]
  )

  const attachDisk = useApiMutation('instanceDiskAttachV1', {
    onSuccess() {
      console.log('disk atttach success')
      queryClient.invalidateQueries('instanceDiskListV1', instanceSelector)
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

  const columns = useMemo(() => [...staticCols, getActionsCol(makeActions)], [makeActions])

  const bootDiskTable = useReactTable({ columns, data: bootDisks })
  const bootLabelId = 'boot-disk-label'

  const otherDisksTable = useReactTable({ columns, data: otherDisks })
  const attachedLabelId = 'attached-disks-label'

  if (!data) return null

  return (
    <>
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
            size="sm"
            onClick={() => setShowDiskCreate(true)}
            disabledReason="Instance must be stopped to create a disk"
            disabled={!instanceStopped}
          >
            Create new disk
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowDiskAttach(true)}
            disabledReason="Instance must be stopped to attach a disk"
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
            // TODO: this should probably be done with `mutateAsync` and
            // awaited, but it's a pain, so punt for now
            attachDisk.mutate({ ...instanceSelector, body: { disk: name } })
          }}
        />
      )}
      {showDiskAttach && (
        <AttachDiskSideModalForm onDismiss={() => setShowDiskAttach(false)} />
      )}
    </>
  )
}
