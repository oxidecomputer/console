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
  apiq,
  diskCan,
  genName,
  getListQFn,
  queryClient,
  useApiMutation,
  type Disk,
} from '@oxide/api'
import { Storage16Icon, Storage24Icon } from '@oxide/design-system/icons/react'

import { DocsPopover } from '~/components/DocsPopover'
import { HL } from '~/components/HL'
import { DiskStateBadge } from '~/components/StateBadge'
import { getProjectSelector, useProjectSelector } from '~/hooks/use-params'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { InstanceLinkCell } from '~/table/cells/InstanceLinkCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { CreateLink } from '~/ui/lib/CreateButton'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { TableActions } from '~/ui/lib/Table'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

import { fancifyStates } from '../instances/instance/tabs/common'

const EmptyState = () => (
  <EmptyMessage
    icon={<Storage24Icon />}
    title="No disks"
    body="Create a disk to see it here"
    buttonText="New disk"
    buttonTo={pb.disksNew(useProjectSelector())}
  />
)

const instanceList = ({ project }: PP.Project) =>
  getListQFn('instanceList', { query: { project, limit: 200 } })
const diskList = (query: PP.Project) => getListQFn('diskList', { query })

DisksPage.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project } = getProjectSelector(params)
  await Promise.all([
    queryClient.prefetchQuery(diskList({ project }).optionsFn()),

    // fetch instances and preload into RQ cache so fetches by ID in
    // InstanceLinkCell can be mostly instant yet gracefully fall back to
    // fetching individually if we don't fetch them all here
    queryClient.fetchQuery(instanceList({ project }).optionsFn()).then((instances) => {
      for (const instance of instances.items) {
        const { queryKey } = apiq('instanceView', { path: { instance: instance.id } })
        queryClient.setQueryData(queryKey, instance)
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
    header: 'state',
    cell: (info) => <DiskStateBadge state={info.getValue()} />,
  }),
  colHelper.accessor('timeCreated', Columns.timeCreated),
]

export function DisksPage() {
  const { project } = useProjectSelector()

  const { mutateAsync: deleteDisk } = useApiMutation('diskDelete', {
    onSuccess(_data, variables) {
      queryClient.invalidateEndpoint('diskList')
      addToast(<>Disk <HL>{variables.path.disk}</HL> deleted</>) // prettier-ignore
    },
  })

  const { mutate: createSnapshot } = useApiMutation('snapshotCreate', {
    onSuccess(_data, variables) {
      queryClient.invalidateEndpoint('snapshotList')
      addToast(<>Snapshot <HL>{variables.body.name}</HL> created</>) // prettier-ignore
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
          addToast(<>Creating snapshot of disk <HL>{disk.name}</HL></>) // prettier-ignore
          createSnapshot({
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
          doDelete: () => deleteDisk({ path: { disk: disk.name }, query: { project } }),
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
  const { table } = useQueryTable({
    query: diskList({ project }),
    columns,
    emptyState: <EmptyState />,
  })

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Storage24Icon />}>Disks</PageTitle>
        <DocsPopover
          heading="disks"
          icon={<Storage16Icon />}
          summary="Disks are persistent volumes that can be managed independently from VM instances."
          links={[docLinks.disks]}
        />
      </PageHeader>
      <TableActions>
        <CreateLink to={pb.disksNew({ project })}>New Disk</CreateLink>
      </TableActions>
      {table}
      <Outlet />
    </>
  )
}
