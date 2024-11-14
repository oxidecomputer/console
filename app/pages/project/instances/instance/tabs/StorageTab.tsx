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
import { EMBody, EmptyMessage } from '~/ui/lib/EmptyMessage'
import { TableControls, TableEmptyBox, TableTitle } from '~/ui/lib/Table'
import { links } from '~/util/links'

import { fancifyStates } from './common'

export async function loader({ params }: LoaderFunctionArgs) {
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

Component.displayName = 'StorageTab'
export function Component() {
  const [showDiskCreate, setShowDiskCreate] = useState(false)
  const [showDiskAttach, setShowDiskAttach] = useState(false)

  const queryClient = useApiQueryClient()
  const { instance: instanceName, project } = useInstanceSelector()
  const instancePathQuery = useMemo(
    () => ({ path: { instance: instanceName }, query: { project } }),
    [instanceName, project]
  )

  const { mutate: detachDisk } = useApiMutation('instanceDiskDetach', {
    onSuccess(disk) {
      queryClient.invalidateQueries('instanceDiskList')
      addToast(<>Disk <HL>{disk.name}</HL> detached</>) // prettier-ignore
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
    onSuccess(snapshot) {
      queryClient.invalidateQueries('snapshotList')
      addToast(<>Snapshot <HL>{snapshot.name}</HL> created</>) // prettier-ignore
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

  // shared between boot and other disks
  const getSnapshotAction = useCallback(
    (disk: InstanceDisk) => ({
      label: 'Snapshot',
      disabled: !diskCan.snapshot(disk) && (
        <>Only disks in state {fancifyStates(diskCan.snapshot.states)} can be snapshotted</>
      ),
      onActivate() {
        createSnapshot({
          query: { project },
          body: { name: genName(disk.name), disk: disk.name, description: '' },
        })
      },
    }),
    [createSnapshot, project]
  )

  const { data: disks } = usePrefetchedApiQuery('instanceDiskList', instancePathQuery)

  const [bootDisks, otherDisks] = useMemo(
    () => R.partition(disks.items, (d) => d.id === instance.bootDiskId),
    [disks.items, instance.bootDiskId]
  )

  const makeBootDiskActions = useCallback(
    (disk: InstanceDisk): MenuAction[] => [
      getSnapshotAction(disk),
      {
        label: 'Unset as boot disk',
        disabled: !instanceCan.update({ runState: disk.instanceState }) && (
          <>
            Instance must be <span className="text-default">stopped</span> before boot disk
            can be changed
          </>
        ),
        onActivate: () =>
          confirmAction({
            doAction: () =>
              instanceUpdate({
                path: { instance: instance.id },
                body: {
                  bootDisk: undefined,
                  // this would get unset if we left it out
                  autoRestartPolicy: instance.autoRestartPolicy,
                },
              }),
            errorTitle: 'Could not unset boot disk',
            modalTitle: 'Confirm unset boot disk',
            // TODO: copy + link to docs
            modalContent: (
              <div className="space-y-2">
                <p>
                  Are you sure you want to unset <HL>{disk.name}</HL> as the boot disk? It
                  will remain attached to the instance.
                </p>
                <p>
                  Setting a boot disk is recommended unless you intend to manage boot order
                  within the instance.
                </p>
              </div>
            ),
            actionType: 'primary',
            // TODO: add docs link to modal footer similar to LearnMore from
            // SettingsGroup.
          }),
      },
      {
        label: 'Detach',
        disabled: 'Boot disk must be unset before it can be detached',
        onActivate() {}, // it's always disabled, so noop is ok
      },
    ],
    [instanceUpdate, instance, getSnapshotAction]
  )

  const makeOtherDiskActions = useCallback(
    (disk: InstanceDisk): MenuAction[] => [
      getSnapshotAction(disk),
      {
        label: 'Set as boot disk',
        disabled: !instanceCan.update({ runState: disk.instanceState }) && (
          <>
            Instance must be <span className="text-default">stopped</span> before boot disk
            can be changed
          </>
        ),
        onActivate: () => {
          const bootDiskName = bootDisks.length > 0 ? bootDisks[0].name : undefined
          const verb = bootDiskName ? 'change' : 'set'
          return confirmAction({
            doAction: () =>
              instanceUpdate({
                path: { instance: instance.id },
                body: {
                  bootDisk: disk.id,
                  // this would get unset if we left it out
                  autoRestartPolicy: instance.autoRestartPolicy,
                },
              }),
            errorTitle: `Could not ${verb} boot disk`,
            modalTitle: `Confirm ${verb} boot disk`,
            modalContent: bootDiskName ? (
              <p>
                Are you sure you want to change the boot disk to <HL>{disk.name}</HL>?
                Current boot disk <HL>{bootDiskName}</HL> will remain attached to the
                instance.
              </p>
            ) : (
              <p>
                Are you sure you want to set <HL>{disk.name}</HL> as the boot disk?
              </p>
            ),
            actionType: 'primary',
            // TODO: add docs link to modal footer similar to LearnMore
            // from SettingsGroup. This probably requires a change to
            // `confirmAction`.
          })
        },
      },
      {
        label: 'Detach',
        disabled: !instanceCan.detachDisk({ runState: disk.instanceState }) && (
          <>
            Instance must be <span className="text-default">stopped</span> before disk can
            be detached
          </>
        ),
        onActivate() {
          detachDisk({ body: { disk: disk.name }, path: { instance: instance.id } })
        },
      },
    ],
    [detachDisk, instanceUpdate, instance, getSnapshotAction, bootDisks]
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

  const bootDisksTable = useReactTable({
    columns: useColsWithActions(staticCols, makeBootDiskActions),
    data: useMemo(
      () => bootDisks.map((disk) => ({ ...disk, instanceState: instance.runState })),
      [bootDisks, instance.runState]
    ),
    getCoreRowModel: getCoreRowModel(),
  })

  const otherDisksTable = useReactTable({
    columns: useColsWithActions(staticCols, makeOtherDiskActions),
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
        <BootDiskEmptyState otherDisks={otherDisks} />
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

function BootDiskEmptyState({ otherDisks }: { otherDisks: Disk[] }) {
  return (
    <TableEmptyBox>
      <EmptyMessage
        icon={<Storage24Icon />}
        title="No boot disk set"
        body={
          <>
            {otherDisks.length > 1 ? (
              <EMBody>
                Setting a boot disk is recommended unless you intend to manage boot order
                within the instance.
              </EMBody>
            ) : otherDisks.length === 1 ? (
              <EMBody>
                Instance will boot from <HL>{otherDisks[0].name}</HL> because it is the only
                disk.
              </EMBody>
            ) : (
              <EMBody>Attach a disk to be able to set a boot disk.</EMBody>
            )}
            <EMBody>
              Learn more in the{' '}
              <a
                href={links.instanceBootDiskDocs}
                rel="noreferrer"
                target="_blank"
                className="underline"
              >
                Instances
              </a>{' '}
              guide.
            </EMBody>
          </>
        }
      />
    </TableEmptyBox>
  )
}

function OtherDisksEmptyState() {
  return (
    <TableEmptyBox>
      <EmptyMessage
        icon={<Storage24Icon />}
        title="No other disks"
        body="Attach a disk to see it here"
      />
    </TableEmptyBox>
  )
}
