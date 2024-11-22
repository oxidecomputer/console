/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useQuery } from '@tanstack/react-query'
import { createColumnHelper } from '@tanstack/react-table'
import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import { getListQFn, useApiMutation, useApiQueryClient, type SiloIpPool } from '@oxide/api'
import { Networking24Icon } from '@oxide/design-system/icons/react'

import { ComboboxField } from '~/components/form/fields/ComboboxField'
import { HL } from '~/components/HL'
import { useSiloSelector } from '~/hooks/use-params'
import { confirmAction } from '~/stores/confirm-action'
import { addToast } from '~/stores/toast'
import { DefaultPoolCell } from '~/table/cells/DefaultPoolCell'
import { makeLinkCell } from '~/table/cells/LinkCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { toComboboxItems } from '~/ui/lib/Combobox'
import { CreateButton } from '~/ui/lib/CreateButton'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { Message } from '~/ui/lib/Message'
import { Modal } from '~/ui/lib/Modal'
import { ALL_ISH } from '~/util/consts'
import { pb } from '~/util/path-builder'

const EmptyState = () => (
  <EmptyMessage
    icon={<Networking24Icon />}
    title="No IP pools"
    body="Create an IP pool to see it here"
    buttonText="New IP pool"
    buttonTo={pb.ipPoolsNew()}
  />
)

const colHelper = createColumnHelper<SiloIpPool>()

const staticCols = [
  colHelper.accessor('name', { cell: makeLinkCell((pool) => pb.ipPool({ pool })) }),
  colHelper.accessor('description', Columns.description),
  colHelper.accessor('isDefault', {
    header: 'Default',
    cell: (info) => <DefaultPoolCell isDefault={info.getValue()} />,
  }),
]

const allPoolsQuery = getListQFn('ipPoolList', { query: { limit: ALL_ISH } })

const allSiloPoolsQuery = (silo: string) =>
  getListQFn('siloIpPoolList', { path: { silo }, query: { limit: ALL_ISH } })

// exported to call in silo page loader
export const siloIpPoolsQuery = (silo: string) =>
  getListQFn('siloIpPoolList', { path: { silo } })

export function SiloIpPoolsTab() {
  const { silo } = useSiloSelector()
  const [showLinkModal, setShowLinkModal] = useState(false)
  const queryClient = useApiQueryClient()

  // Fetch all_ish, but there should only be a few anyway. Not prefetched
  // because the prefetched one only gets 25 to match the query table. This req
  // is better to do async because they can't click make default that fast
  // anyway.
  const { data: allPools } = useQuery(allSiloPoolsQuery(silo).optionsFn())

  // used in change default confirm modal
  const defaultPool = useMemo(
    () => (allPools ? allPools.items.find((p) => p.isDefault)?.name : undefined),
    [allPools]
  )

  const { mutateAsync: updatePoolLink } = useApiMutation('ipPoolSiloUpdate', {
    onSuccess() {
      queryClient.invalidateQueries('siloIpPoolList')
    },
  })
  const { mutateAsync: unlinkPool } = useApiMutation('ipPoolSiloUnlink', {
    onSuccess() {
      queryClient.invalidateQueries('siloIpPoolList')
      // We only have the ID, so will show a generic confirmation message
      addToast({ content: 'IP pool unlinked' })
    },
  })

  // this is all very extra. I'm sorry. it's for the users
  const makeActions = useCallback(
    (pool: SiloIpPool): MenuAction[] => [
      {
        label: pool.isDefault ? 'Clear default' : 'Make default',
        className: pool.isDefault ? 'destructive' : undefined,
        onActivate() {
          if (pool.isDefault) {
            confirmAction({
              doAction: () =>
                updatePoolLink({
                  path: { silo, pool: pool.id },
                  body: { isDefault: false },
                }),
              modalTitle: 'Confirm clear default',
              modalContent: (
                <p>
                  Are you sure you want <HL>{pool.name}</HL> to stop being the default pool
                  for this silo? If there is no default, users in this silo will have to
                  specify a pool when allocating IPs.
                </p>
              ),
              errorTitle: 'Could not clear default',
              actionType: 'danger',
            })
          } else {
            const modalContent = defaultPool ? (
              <p>
                Are you sure you want to change the default pool from <HL>{defaultPool}</HL>{' '}
                to <HL>{pool.name}</HL>?
              </p>
            ) : (
              <p>
                Are you sure you want to make <HL>{pool.name}</HL> the default pool for this
                silo?
              </p>
            )
            const verb = defaultPool ? 'change' : 'make'
            confirmAction({
              doAction: () =>
                updatePoolLink({
                  path: { silo, pool: pool.id },
                  body: { isDefault: true },
                }),
              modalTitle: `Confirm ${verb} default`,
              modalContent,
              errorTitle: `Could not ${verb} default`,
              actionType: 'primary',
            })
          }
        },
      },
      {
        label: 'Unlink',
        className: 'destructive',
        onActivate() {
          confirmAction({
            doAction: () => unlinkPool({ path: { silo, pool: pool.id } }),
            modalTitle: `Confirm unlink pool`,
            modalContent: (
              <p>
                Are you sure you want to unlink <HL>{pool.name}</HL>? Users in this silo
                will no longer be able to allocate IPs from this pool. Unlink will fail if
                there are any IPs from <HL>{pool.name}</HL> in use in this silo.
              </p>
            ),
            errorTitle: `Could not unlink pool`,
            actionType: 'danger',
          })
        },
      },
    ],
    [defaultPool, silo, unlinkPool, updatePoolLink]
  )

  const columns = useColsWithActions(staticCols, makeActions)
  const { table } = useQueryTable({
    query: siloIpPoolsQuery(silo),
    columns,
    emptyState: <EmptyState />,
  })

  return (
    <>
      <div className="mb-3 flex justify-end">
        <CreateButton onClick={() => setShowLinkModal(true)}>Link pool</CreateButton>
      </div>
      {table}
      {showLinkModal && <LinkPoolModal onDismiss={() => setShowLinkModal(false)} />}
    </>
  )
}

type LinkPoolFormValues = {
  pool: string | undefined
}

const defaultValues: LinkPoolFormValues = { pool: undefined }

function LinkPoolModal({ onDismiss }: { onDismiss: () => void }) {
  const queryClient = useApiQueryClient()
  const { silo } = useSiloSelector()
  const { control, handleSubmit } = useForm({ defaultValues })

  const linkPool = useApiMutation('ipPoolSiloLink', {
    onSuccess() {
      queryClient.invalidateQueries('siloIpPoolList')
    },
    onError(err) {
      addToast({ title: 'Could not link pool', content: err.message, variant: 'error' })
    },
    onSettled: onDismiss,
  })

  function onSubmit({ pool }: LinkPoolFormValues) {
    if (!pool) return // can't happen, silo is required
    linkPool.mutate({ path: { pool }, body: { silo, isDefault: false } })
  }

  const allLinkedPools = useQuery(allSiloPoolsQuery(silo).optionsFn())
  const allPools = useQuery(allPoolsQuery.optionsFn())

  // in order to get the list of remaining unlinked pools, we have to get the
  // list of all pools and remove the already linked ones

  const linkedPoolIds = useMemo(
    () =>
      allLinkedPools.data ? new Set(allLinkedPools.data.items.map((p) => p.id)) : undefined,
    [allLinkedPools]
  )
  const unlinkedPoolItems = useMemo(
    () =>
      allPools.data && linkedPoolIds
        ? toComboboxItems(allPools.data.items.filter((p) => !linkedPoolIds.has(p.id)))
        : [],
    [allPools, linkedPoolIds]
  )

  return (
    <Modal isOpen onDismiss={onDismiss} title="Link pool">
      <Modal.Body>
        <Modal.Section>
          <form
            autoComplete="off"
            onSubmit={(e) => {
              e.stopPropagation()
              handleSubmit(onSubmit)(e)
            }}
            className="space-y-4"
          >
            <Message
              variant="info"
              content="Users in this silo will be able to allocate IPs from the selected pool."
            />

            <ComboboxField
              placeholder="Select a pool"
              name="pool"
              label="IP pool"
              items={unlinkedPoolItems}
              isLoading={allLinkedPools.isPending || allPools.isPending}
              required
              control={control}
            />
          </form>
        </Modal.Section>
      </Modal.Body>
      <Modal.Footer
        onDismiss={onDismiss}
        onAction={handleSubmit(onSubmit)}
        actionText="Link"
        actionLoading={linkPool.isPending}
      />
    </Modal>
  )
}
