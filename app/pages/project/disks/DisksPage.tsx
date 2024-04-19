/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createColumnHelper } from '@tanstack/react-table'
import { useCallback } from 'react'
import { Outlet, type LoaderFunctionArgs } from 'react-router-dom'

import {
  apiQueryClient,
  diskCan,
  genName,
  useApiMutation,
  useApiQueryClient,
  type Disk,
} from '@oxide/api'
import { Storage24Icon } from '@oxide/design-system/icons/react'

import { DiskStatusBadge } from '~/components/StatusBadge'
import { getProjectSelector, useProjectSelector } from '~/hooks'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { InstanceLinkCell } from '~/table/cells/InstanceLinkCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { PAGE_SIZE, useQueryTable } from '~/table/QueryTable'
import { CreateLink } from '~/ui/lib/CreateButton'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { TableActions } from '~/ui/lib/Table'
import { pb } from '~/util/path-builder'

import { fancifyStates } from '../instances/instance/tabs/common'

const EmptyState = () => (
  <EmptyMessage
    icon={<Storage24Icon />}
    title="No disks"
    body="You need to create a disk to be able to see it here"
    buttonText="New disk"
    buttonTo={pb.disksNew(useProjectSelector())}
  />
)

DisksPage.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project } = getProjectSelector(params)
  await Promise.all([
    apiQueryClient.prefetchQuery('diskList', {
      query: { project, limit: PAGE_SIZE },
    }),

    // fetch instances and preload into RQ cache so fetches by ID in
    // InstanceLinkCell can be mostly instant yet gracefully fall back to
    // fetching individually if we don't fetch them all here
    apiQueryClient
      .fetchQuery('instanceList', { query: { project, limit: 200 } })
      .then((instances) => {
        for (const instance of instances.items) {
          apiQueryClient.setQueryData(
            'instanceView',
            { path: { instance: instance.id } },
            instance
          )
        }
      }),
  ])
  return null
}

const colHelper = createColumnHelper<Disk>()

const staticCols = [
  colHelper.accessor('name', {}),
  // sneaky: rather than looking at particular states, just look at
  // whether it has an instance field
  colHelper.accessor(
    (disk) => ('instance' in disk.state ? disk.state.instance : undefined),
    {
      header: 'Attached to',
      cell: (info) => <InstanceLinkCell instanceId={info.getValue()} />,
    }
  ),
  colHelper.accessor('size', Columns.size),
  colHelper.accessor('state.state', {
    header: 'Status',
    cell: (info) => <DiskStatusBadge status={info.getValue()} />,
  }),
  colHelper.accessor('timeCreated', Columns.timeCreated),
]

export function DisksPage() {
  const queryClient = useApiQueryClient()
  const { project } = useProjectSelector()
  const { Table } = useQueryTable('diskList', { query: { project } })

  const deleteDisk = useApiMutation('diskDelete', {
    onSuccess() {
      queryClient.invalidateQueries('diskList')
    },
  })

  const createSnapshot = useApiMutation('snapshotCreate', {
    onSuccess() {
      queryClient.invalidateQueries('snapshotList')
      addToast({ content: 'Snapshot successfully created' })
    },
    onError(err) {
      addToast({
        title: 'Failed to create snapshot',
        content: err.message,
        variant: 'error',
      })
    },
  })

  const makeActions = useCallback(
    (disk: Disk): MenuAction[] => [
      {
        label: 'Snapshot',
        onActivate() {
          addToast({ title: `Creating snapshot of disk '${disk.name}'` })
          createSnapshot.mutate({
            query: { project },
            body: {
              name: genName(disk.name),
              disk: disk.name,
              description: '',
            },
          })
        },
        disabled: !diskCan.snapshot(disk) && (
          <>
            Only disks in state {fancifyStates(diskCan.snapshot.states)} can be snapshotted
          </>
        ),
      },
      {
        label: 'Delete',
        onActivate: confirmDelete({
          doDelete: () =>
            deleteDisk.mutateAsync({ path: { disk: disk.name }, query: { project } }),
          label: disk.name,
        }),
        disabled:
          !diskCan.delete(disk) &&
          (disk.state.state === 'attached' ? (
            'Disk must be detached before it can be deleted'
          ) : (
            <>Only disks in state {fancifyStates(diskCan.delete.states)} can be deleted</>
          )),
      },
    ],
    [createSnapshot, deleteDisk, project]
  )

  const columns = useColsWithActions(staticCols, makeActions)

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Storage24Icon />}>Disks</PageTitle>
      </PageHeader>
      <TableActions>
        <CreateLink to={pb.disksNew({ project })}>New Disk</CreateLink>
      </TableActions>
      <Table columns={columns} emptyState={<EmptyState />} />
      <Outlet />
    </>
  )
}
