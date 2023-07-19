/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useCallback, useState } from 'react'
import type { LoaderFunctionArgs } from 'react-router-dom'

import {
  type Disk,
  apiQueryClient,
  instanceCan,
  useApiMutation,
  useApiQuery,
  useApiQueryClient,
} from '@oxide/api'
import type { MenuAction } from '@oxide/table'
import { DateCell, SizeCell, useQueryTable } from '@oxide/table'
import { Button, EmptyMessage, Storage24Icon } from '@oxide/ui'
import { invariant, toPathQuery } from '@oxide/util'

import { DiskStatusBadge } from 'app/components/StatusBadge'
import AttachDiskSideModalForm from 'app/forms/disk-attach'
import { CreateDiskSideModalForm } from 'app/forms/disk-create'
import { getInstanceSelector, useInstanceSelector, useToast } from 'app/hooks'

import { fancifyStates } from './common'

StorageTab.loader = async ({ params }: LoaderFunctionArgs) => {
  const { path, query } = toPathQuery('instance', getInstanceSelector(params))
  await Promise.all([
    apiQueryClient.prefetchQuery('instanceDiskList', {
      path,
      query: { ...query, limit: 10 }, // querytable
    }),
    // This is covered by the InstancePage loader but there's no downside to
    // being redundant. If it were removed there, we'd still want it here.
    apiQueryClient.prefetchQuery('instanceView', { path, query }),
  ])
  return null
}

const attachableStates = fancifyStates(instanceCan.attachDisk.states)
const detachableStates = fancifyStates(instanceCan.detachDisk.states)

export function StorageTab() {
  const [showDiskCreate, setShowDiskCreate] = useState(false)
  const [showDiskAttach, setShowDiskAttach] = useState(false)

  const addToast = useToast()
  const queryClient = useApiQueryClient()
  const instancePathQuery = toPathQuery('instance', useInstanceSelector())

  const detachDisk = useApiMutation('instanceDiskDetach', {})

  const { data: instance } = useApiQuery('instanceView', instancePathQuery)
  invariant(instance, 'Instance must be prefetched')

  const makeActions = useCallback(
    (disk: Disk): MenuAction[] => [
      {
        label: 'Detach',
        disabled: !instanceCan.detachDisk(instance) && (
          <>Instance must be in state {detachableStates} before disk can be detached</>
        ),
        onActivate() {
          detachDisk.mutate(
            { body: { disk: disk.name }, ...instancePathQuery },
            {
              onSuccess: () => {
                queryClient.invalidateQueries('instanceDiskList', instancePathQuery)
              },
            }
          )
        },
      },
    ],
    [detachDisk, instance, queryClient, instancePathQuery]
  )

  const attachDisk = useApiMutation('instanceDiskAttach', {
    onSuccess() {
      queryClient.invalidateQueries('instanceDiskList', instancePathQuery)
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

  const { Table, Column } = useQueryTable('instanceDiskList', instancePathQuery)

  const emptyState = (
    <EmptyMessage
      icon={<Storage24Icon />}
      title="No disks"
      body="You need to attach a disk to this instance to be able to see it here"
    />
  )

  return (
    <>
      <h2 id="disks-label" className="mb-4 text-mono-sm text-secondary">
        Disks
      </h2>
      {/* TODO: need 40px high rows. another table or a flag on Table (ew) */}

      <Table
        emptyState={emptyState}
        makeActions={makeActions}
        aria-labelledby="disks-label"
      >
        <Column accessor="name" />
        <Column header="Size" accessor="size" cell={SizeCell} />
        <Column
          id="status"
          accessor={(row) => row.state.state}
          cell={({ value }) => <DiskStatusBadge status={value} />}
        />
        <Column header="Created" accessor="timeCreated" cell={DateCell} />
      </Table>
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
          loading={attachDisk.isLoading}
          submitError={attachDisk.error}
        />
      )}
    </>
  )
}
