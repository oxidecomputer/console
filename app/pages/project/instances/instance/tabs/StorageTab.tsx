/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'
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
} from '@oxide/api'
import { Storage24Icon } from '@oxide/design-system/icons/react'

import { DiskStatusBadge } from '~/components/StatusBadge'
import { AttachDiskSideModalForm } from '~/forms/disk-attach'
import { CreateDiskSideModalForm } from '~/forms/disk-create'
import { getInstanceSelector, useInstanceSelector } from '~/hooks'
import { addToast } from '~/stores/toast'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { Button } from '~/ui/lib/Button'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { TableTitle } from '~/ui/lib/Table'

import { fancifyStates } from './common'

StorageTab.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project, instance } = getInstanceSelector(params)
  await Promise.all([
    apiQueryClient.prefetchQuery('instanceDiskList', {
      path: { instance },
      query: { project, limit: 25 }, // querytable
    }),
    // This is covered by the InstancePage loader but there's no downside to
    // being redundant. If it were removed there, we'd still want it here.
    apiQueryClient.prefetchQuery('instanceView', {
      path: { instance },
      query: { project },
    }),
  ])
  return null
}

const colHelper = createColumnHelper<Disk>()
const staticCols = [
  colHelper.accessor('name', {}),
  colHelper.accessor('size', Columns.size),
  colHelper.accessor((row) => row.state.state, {
    header: 'status',
    cell: (info) => <DiskStatusBadge status={info.getValue()} />,
  }),
  colHelper.accessor('timeCreated', Columns.timeCreated),
]

const attachableStates = fancifyStates(instanceCan.attachDisk.states)
const detachableStates = fancifyStates(instanceCan.detachDisk.states)

export function StorageTab() {
  const [showDiskCreate, setShowDiskCreate] = useState(false)
  const [showDiskAttach, setShowDiskAttach] = useState(false)

  const queryClient = useApiQueryClient()
  const { instance: instanceName, project } = useInstanceSelector()
  const instancePathQuery = useMemo(
    () => ({ path: { instance: instanceName }, query: { project } }),
    [instanceName, project]
  )

  const detachDisk = useApiMutation('instanceDiskDetach', {
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
  const createSnapshot = useApiMutation('snapshotCreate', {
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
    (disk: Disk): MenuAction[] => [
      {
        label: 'Snapshot',
        disabled: !diskCan.snapshot(disk) && (
          <>
            Only disks in state {fancifyStates(diskCan.snapshot.states)} can be snapshotted
          </>
        ),
        onActivate() {
          createSnapshot.mutate({
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
        label: 'Detach',
        disabled: !instanceCan.detachDisk(instance) && (
          <>Instance must be in state {detachableStates} before disk can be detached</>
        ),
        onActivate() {
          detachDisk.mutate({ body: { disk: disk.name }, ...instancePathQuery })
        },
      },
    ],
    [detachDisk, instance, instancePathQuery, createSnapshot, project]
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

  const { Table } = useQueryTable('instanceDiskList', instancePathQuery)

  const emptyState = (
    <EmptyMessage
      icon={<Storage24Icon />}
      title="No disks"
      body="You need to attach a disk to this instance to be able to see it here"
    />
  )

  const columns = useColsWithActions(staticCols, makeActions)

  return (
    <>
      <TableTitle id="disks-label">Disks</TableTitle>
      {/* TODO: need 40px high rows. another table or a flag on Table (ew) */}

      <Table emptyState={emptyState} aria-labelledby="disks-label" columns={columns} />
      <div className="mt-4 flex flex-col gap-3">
        <div className="flex gap-3">
          <Button
            size="sm"
            onClick={() => setShowDiskCreate(true)}
            disabledReason={<>Instance must be {attachableStates} to create a disk</>}
            disabled={!instanceCan.attachDisk(instance)}
          >
            Create new disk
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowDiskAttach(true)}
            disabledReason={<>Instance must be {attachableStates} to attach a disk</>}
            disabled={!instanceCan.attachDisk(instance)}
          >
            Attach existing disk
          </Button>
        </div>
        {!instanceCan.attachDisk(instance) && (
          <span className="max-w-xs text-sans-md text-tertiary">
            A disk cannot be added or attached unless the instance is {attachableStates}.
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
