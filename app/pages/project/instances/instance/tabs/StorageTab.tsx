import { useCallback, useState } from 'react'
import type { LoaderFunctionArgs } from 'react-router-dom'

import {
  type Disk,
  apiQueryClient,
  useApiMutation,
  useApiQuery,
  useApiQueryClient,
} from '@oxide/api'
import type { MenuAction } from '@oxide/table'
import { DateCell, SizeCell, useQueryTable } from '@oxide/table'
import { Button, EmptyMessage, OpenLink12Icon, Storage24Icon } from '@oxide/ui'
import { toPathQuery } from '@oxide/util'

import { DiskStatusBadge } from 'app/components/StatusBadge'
import AttachDiskSideModalForm from 'app/forms/disk-attach'
import { CreateDiskSideModalForm } from 'app/forms/disk-create'
import { getInstanceSelector, useInstanceSelector, useToast } from 'app/hooks'

StorageTab.loader = async ({ params }: LoaderFunctionArgs) => {
  const instancePathQuery = toPathQuery('instance', getInstanceSelector(params))
  await Promise.all([
    apiQueryClient.prefetchQuery('instanceDiskList', instancePathQuery),
    // This is covered by the InstancePage loader but there's no downside to
    // being redundant. If it were removed there, we'd still want it here.
    apiQueryClient.prefetchQuery('instanceView', instancePathQuery),
  ])
  return null
}

export function StorageTab() {
  const [showDiskCreate, setShowDiskCreate] = useState(false)
  const [showDiskAttach, setShowDiskAttach] = useState(false)

  const addToast = useToast()
  const queryClient = useApiQueryClient()
  const instancePathQuery = toPathQuery('instance', useInstanceSelector())

  const { data } = useApiQuery('instanceDiskList', instancePathQuery)

  const detachDisk = useApiMutation('instanceDiskDetach', {})

  const instanceStopped =
    useApiQuery('instanceView', instancePathQuery).data?.runState === 'stopped'

  const makeActions = useCallback(
    (disk: Disk): MenuAction[] => [
      {
        label: 'Detach',
        disabled:
          !instanceStopped && 'Instance must be stopped before disk can be detached',
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
    [detachDisk, instanceStopped, queryClient, instancePathQuery]
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

  const getQuery = ['instanceDiskList', instancePathQuery] as const
  const { Table, Column } = useQueryTable(...getQuery)

  if (!data) return null

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
              <OpenLink12Icon className="ml-1 align-middle" />
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
