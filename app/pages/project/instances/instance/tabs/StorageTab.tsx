/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useCallback, useMemo, useState } from 'react'
import type { LoaderFunctionArgs } from 'react-router-dom'

import {
  apiQueryClient,
  diskCan,
  genName,
  instanceCan,
  useApiMutation,
  useApiQueryClient,
  usePrefetchedApiQuery,
  type Disk,
  type InstanceState,
} from '@oxide/api'
import { Storage24Icon } from '@oxide/design-system/icons/react'

import { DiskStateBadge } from '~/components/StateBadge'
import { AttachDiskSideModalForm } from '~/forms/disk-attach'
import { CreateDiskSideModalForm } from '~/forms/disk-create'
import { getInstanceSelector, useInstanceSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { Table } from '~/table/Table'
import { Badge } from '~/ui/lib/Badge'
import { Button } from '~/ui/lib/Button'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { TableEmptyBox } from '~/ui/lib/Table'

import { fancifyStates } from './common'

const EmptyState = () => (
  <TableEmptyBox>
    <EmptyMessage
      icon={<Storage24Icon />}
      title="No disks"
      body="Attach a disk to this instance to see it here"
    />
  </TableEmptyBox>
)

StorageTab.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project, instance } = getInstanceSelector(params)
  const selector = { path: { instance }, query: { project } }
  await Promise.all([
    // don't bother with page size because this will never paginate. max disks
    // per instance is 8
    // https://github.com/oxidecomputer/omicron/blob/40fc3835/nexus/db-queries/src/db/queries/disk.rs#L16-L21
    apiQueryClient.prefetchQuery('instanceDiskList', selector),
    // This is covered by the InstancePage loader but there's no downside to
    // being redundant. If it were removed there, we'd still want it here.
    apiQueryClient.prefetchQuery('instanceView', selector),
  ])
  return null
}

// Bit of a hack: by putting the instance state in the row data, we can avoid
// remaking the row actions callback whenever the instance state changes, which
// causes the whole table to get re-rendered, which jarringly closes any open
// row actions menus
type InstanceDisk = Disk & {
  instanceState: InstanceState
  isBootDisk: boolean
}

const colHelper = createColumnHelper<InstanceDisk>()
const staticCols = [
  colHelper.accessor('name', {
    header: 'Disk',
    cell: (info) => {
      return (
        <>
          <span>{info.getValue()}</span>
          {info.row.original.isBootDisk && <Badge className="ml-3">Boot</Badge>}
        </>
      )
    },
  }),
  colHelper.accessor('size', Columns.size),
  colHelper.accessor((row) => row.state.state, {
    header: 'state',
    cell: (info) => <DiskStateBadge state={info.getValue()} />,
  }),
  colHelper.accessor('timeCreated', Columns.timeCreated),
]

export function StorageTab() {
  const [showDiskCreate, setShowDiskCreate] = useState(false)
  const [showDiskAttach, setShowDiskAttach] = useState(false)

  const queryClient = useApiQueryClient()
  const { instance: instanceName, project } = useInstanceSelector()
  const instancePathQuery = useMemo(
    () => ({ path: { instance: instanceName }, query: { project } }),
    [instanceName, project]
  )

  const { mutate: detachDisk } = useApiMutation('instanceDiskDetach', {
    onSuccess() {
      queryClient.invalidateQueries('instanceDiskList')
      addToast({ content: 'Disk detached' })
    },
    onError(err) {
      addToast({
        title: 'Failed to detach disk',
        content: err.message,
        variant: 'error',
      })
    },
  })
  const { mutate: createSnapshot } = useApiMutation('snapshotCreate', {
    onSuccess() {
      queryClient.invalidateQueries('snapshotList')
      addToast({ content: 'Snapshot created' })
    },
    onError(err) {
      addToast({
        title: 'Failed to create snapshot',
        content: err.message,
        variant: 'error',
      })
    },
  })

  const { data: instance } = usePrefetchedApiQuery('instanceView', instancePathQuery)

  const makeActions = useCallback(
    (disk: InstanceDisk): MenuAction[] => [
      {
        label: 'Snapshot',
        disabled: !diskCan.snapshot(disk) && (
          <>
            Only disks in state {fancifyStates(diskCan.snapshot.states)} can be snapshotted
          </>
        ),
        onActivate() {
          createSnapshot({
            query: { project },
            body: {
              name: genName(disk.name),
              disk: disk.name,
              description: '',
            },
          })
        },
      },
      {
        // don't bother checking disk state: assume that if it is showing up
        // in this list, it can be detached
        label: 'Detach',
        disabled: !instanceCan.detachDisk({ runState: disk.instanceState }) && (
          <>
            Instance must be <span className="text-default">stopped</span> before disk can
            be detached
          </>
        ),
        onActivate() {
          detachDisk({ body: { disk: disk.name }, ...instancePathQuery })
        },
      },
    ],
    [detachDisk, instancePathQuery, createSnapshot, project]
  )

  const attachDisk = useApiMutation('instanceDiskAttach', {
    onSuccess() {
      queryClient.invalidateQueries('instanceDiskList')
      // cover all our bases. this is called by both modals
      setShowDiskCreate(false)
      setShowDiskAttach(false)
    },
    onError(err) {
      addToast({
        title: 'Failed to attach disk',
        content: err.message,
        variant: 'error',
      })
    },
  })

  const { data: disks } = usePrefetchedApiQuery('instanceDiskList', instancePathQuery)

  const rows = useMemo(
    () =>
      disks.items.map((disk) => ({
        ...disk,
        instanceState: instance.runState,
        isBootDisk: instance.bootDiskId === disk.id,
      })),
    [disks.items, instance.runState, instance.bootDiskId]
  )

  const table = useReactTable({
    columns: useColsWithActions(staticCols, makeActions),
    data: rows,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
      {disks.items.length > 0 ? <Table table={table} /> : <EmptyState />}
      <div className="mt-4 flex flex-col gap-3">
        <div className="flex gap-3">
          <Button
            size="sm"
            onClick={() => setShowDiskCreate(true)}
            disabledReason={
              <>
                Instance must be <span className="text-default">stopped</span> to create and
                attach a disk
              </>
            }
            disabled={!instanceCan.attachDisk(instance)}
          >
            Create new disk
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowDiskAttach(true)}
            disabledReason={
              <>
                Instance must be <span className="text-default">stopped</span> to attach a
                disk
              </>
            }
            disabled={!instanceCan.attachDisk(instance)}
          >
            Attach existing disk
          </Button>
        </div>
        {!instanceCan.attachDisk(instance) && (
          <span className="max-w-xs text-sans-md text-tertiary">
            The instance must be <span className="text-default">stopped</span> to add or
            attach a disk.
          </span>
        )}
      </div>
      {showDiskCreate && (
        <CreateDiskSideModalForm
          onDismiss={() => setShowDiskCreate(false)}
          onSuccess={({ name }) => {
            // TODO: this should probably be done with `mutateAsync` and
            // awaited, but it's a pain, so punt for now
            attachDisk.mutate({ ...instancePathQuery, body: { disk: name } })
          }}
        />
      )}
      {showDiskAttach && (
        <AttachDiskSideModalForm
          onDismiss={() => setShowDiskAttach(false)}
          onSubmit={({ name }) => {
            attachDisk.mutate({ ...instancePathQuery, body: { disk: name } })
          }}
          loading={attachDisk.isPending}
          submitError={attachDisk.error}
        />
      )}
    </>
  )
}
