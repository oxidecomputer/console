/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Link, Outlet, type LoaderFunctionArgs } from 'react-router-dom'

import {
  apiQueryClient,
  diskCan,
  genName,
  useApiMutation,
  useApiQueryClient,
  type Disk,
} from '@oxide/api'
import { PageHeader, PageTitle, Storage24Icon, TableActions } from '@oxide/ui'

import { DateCell } from '~/table/cells/DateCell'
import { InstanceLinkCell } from '~/table/cells/InstanceLinkCell'
import { SizeCell } from '~/table/cells/SizeCell'
import type { MenuAction } from '~/table/columns/action-col'
import { useQueryTable } from '~/table/QueryTable'
import { buttonStyle } from '~/ui/lib/Button'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { DiskStatusBadge } from 'app/components/StatusBadge'
import { getProjectSelector, useProjectSelector, useToast } from 'app/hooks'
import { confirmDelete } from 'app/stores/confirm-delete'
import { pb } from 'app/util/path-builder'

import { fancifyStates } from '../instances/instance/tabs/common'

const EmptyState = () => (
  <EmptyMessage
    icon={<Storage24Icon />}
    title="No disks"
    body="You need to create a disk to be able to see it here"
    buttonText="New disk"
    buttonTo={pb.diskNew(useProjectSelector())}
  />
)

DisksPage.loader = async ({ params }: LoaderFunctionArgs) => {
  await apiQueryClient.prefetchQuery('diskList', {
    query: { ...getProjectSelector(params), limit: 25 },
  })
  return null
}

export function DisksPage() {
  const queryClient = useApiQueryClient()
  const projectSelector = useProjectSelector()
  const { Table, Column } = useQueryTable('diskList', { query: projectSelector })
  const addToast = useToast()

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

  const makeActions = (disk: Disk): MenuAction[] => [
    {
      label: 'Snapshot',
      onActivate() {
        addToast({ title: `Creating snapshot of disk '${disk.name}'` })
        createSnapshot.mutate({
          query: projectSelector,
          body: {
            name: genName(disk.name),
            disk: disk.name,
            description: '',
          },
        })
      },
      disabled: !diskCan.snapshot(disk) && (
        <>Only disks in state {fancifyStates(diskCan.snapshot.states)} can be snapshotted</>
      ),
    },
    {
      label: 'Delete',
      onActivate: confirmDelete({
        doDelete: () =>
          deleteDisk.mutateAsync({ path: { disk: disk.name }, query: projectSelector }),
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
  ]

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Storage24Icon />}>Disks</PageTitle>
      </PageHeader>
      <TableActions>
        <Link to={pb.diskNew(projectSelector)} className={buttonStyle({ size: 'sm' })}>
          New Disk
        </Link>
      </TableActions>
      <Table emptyState={<EmptyState />} makeActions={makeActions}>
        <Column accessor="name" />
        {/* TODO: show info about the instance it's attached to */}
        <Column
          id="attached-to"
          header="Attached To"
          accessor={(disk) =>
            // sneaky: rather than looking at particular states, just look at
            // whether it has an instance field
            'instance' in disk.state ? disk.state.instance : null
          }
          cell={InstanceLinkCell}
        />
        <Column header="Size" accessor="size" cell={SizeCell} />
        <Column
          id="status"
          accessor={(row) => row.state.state}
          cell={({ value }) => <DiskStatusBadge status={value} />}
        />
        <Column header="Created" accessor="timeCreated" cell={DateCell} />
      </Table>
      <Outlet />
    </>
  )
}
