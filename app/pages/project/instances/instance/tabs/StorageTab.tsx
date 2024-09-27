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
import * as R from 'remeda'

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

import { HL } from '~/components/HL'
import { DiskStateBadge } from '~/components/StateBadge'
import { AttachDiskSideModalForm } from '~/forms/disk-attach'
import { CreateDiskSideModalForm } from '~/forms/disk-create'
import { getInstanceSelector, useInstanceSelector } from '~/hooks/use-params'
import { confirmAction } from '~/stores/confirm-action'
import { addToast } from '~/stores/toast'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { Table } from '~/table/Table'
import { Button } from '~/ui/lib/Button'
import { CreateButton } from '~/ui/lib/CreateButton'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { TableControls, TableEmptyBox, TableTitle } from '~/ui/lib/Table'

import { fancifyStates } from './common'

const BootDiskEmptyState = () => (
  <TableEmptyBox>
    <EmptyMessage
      icon={<Storage24Icon />}
      title="No boot disk set"
      // TODO: boot order docs link
      body="Read about boot order LINK HERE"
    />
  </TableEmptyBox>
)

const OtherDisksEmptyState = () => (
  <TableEmptyBox>
    <EmptyMessage
      icon={<Storage24Icon />}
      title="No other disks"
      body="Attach a disk to see it here"
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
}

const colHelper = createColumnHelper<InstanceDisk>()
const staticCols = [
  colHelper.accessor('name', { header: 'Disk' }),
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

  const { mutateAsync: instanceUpdate } = useApiMutation('instanceUpdate', {
    onSuccess() {
      apiQueryClient.invalidateQueries('instanceView')
    },
  })

  const makeActions = useCallback(
    // TODO: don't do this, just have two separate lists. come on
    (isBootDisk: boolean) =>
      (disk: InstanceDisk): MenuAction[] => [
        {
          label: 'Snapshot',
          disabled: !diskCan.snapshot(disk) && (
            <>
              Only disks in state {fancifyStates(diskCan.snapshot.states)} can be
              snapshotted
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
          disabled: isBootDisk
            ? 'Boot disk must be unset before it can be detached'
            : !instanceCan.detachDisk({ runState: disk.instanceState }) && (
                <>
                  Instance must be <span className="text-default">stopped</span> before disk
                  can be detached
                </>
              ),
          onActivate() {
            detachDisk({ body: { disk: disk.name }, path: { instance: instance.id } })
          },
        },
        {
          label: isBootDisk ? 'Unset boot disk' : 'Set as boot disk',
          disabled: !instanceCan.update({ runState: disk.instanceState }) && (
            <>
              Instance must be <span className="text-default">stopped</span> before boot
              disk can be changed
            </>
          ),
          onActivate: () => {
            const verb = isBootDisk ? 'unset' : 'set'
            return confirmAction({
              doAction: () =>
                instanceUpdate({
                  path: { instance: instance.id },
                  body: { bootDisk: isBootDisk ? undefined : disk.id },
                }),
              errorTitle: `Could not ${verb} boot disk`,
              modalTitle: `Confirm ${verb} boot disk`,
              // TODO: copy + link to docs in both cases
              modalContent: isBootDisk ? (
                <p>
                  Are you sure you want to unset <HL>{disk.name}</HL> as the boot disk? This
                  will TODO COPY RE: WHAT HAPPENS HERE
                </p>
              ) : (
                <p>
                  Are you sure you want to set <HL>{disk.name}</HL> as the boot disk?
                </p>
              ),
              actionType: 'primary',
            })
          },
        },
      ],
    [detachDisk, createSnapshot, project, instanceUpdate, instance.id]
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

  const [bootDisks, otherDisks] = useMemo(
    () => R.partition(disks.items, (d) => d.id === instance.bootDiskId),
    [disks.items, instance.bootDiskId]
  )

  const bootDisksTable = useReactTable({
    columns: useColsWithActions(staticCols, makeActions(true)),
    data: useMemo(
      () => bootDisks.map((disk) => ({ ...disk, instanceState: instance.runState })),
      [bootDisks, instance.runState]
    ),
    getCoreRowModel: getCoreRowModel(),
  })

  const otherDisksTable = useReactTable({
    columns: useColsWithActions(staticCols, makeActions(false)),
    data: useMemo(
      () => otherDisks.map((disk) => ({ ...disk, instanceState: instance.runState })),
      [otherDisks, instance.runState]
    ),
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
      <TableControls>
        <TableTitle id="boot-disks-label">Boot disk</TableTitle>
      </TableControls>
      {bootDisks.length > 0 ? (
        <Table aria-labelledby="boot-disks-label" table={bootDisksTable} />
      ) : (
        <BootDiskEmptyState />
      )}

      <TableControls className="mt-10">
        <TableTitle id="other-disks-label">Other disks</TableTitle>
      </TableControls>

      {otherDisks.length > 0 ? (
        <Table aria-labelledby="other-disks-label" table={otherDisksTable} />
      ) : (
        <OtherDisksEmptyState />
      )}

      <div className="mt-4 flex gap-3">
        <CreateButton
          onClick={() => setShowDiskCreate(true)}
          disabledReason={
            <>
              Instance must be <span className="text-default">stopped</span> to create and
              attach a disk
            </>
          }
          disabled={!instanceCan.attachDisk(instance)}
        >
          Create disk
        </CreateButton>
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
