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
import { type LoaderFunctionArgs } from 'react-router'

import { api, getListQFn, queryClient, useApiMutation, type SiloIpPool } from '@oxide/api'
import { Networking24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { ComboboxField } from '~/components/form/fields/ComboboxField'
import { HL } from '~/components/HL'
import { IpVersionBadge } from '~/components/IpVersionBadge'
import { makeCrumb } from '~/hooks/use-crumbs'
import { getSiloSelector, useSiloSelector } from '~/hooks/use-params'
import { confirmAction } from '~/stores/confirm-action'
import { addToast } from '~/stores/toast'
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

const allPoolsQuery = getListQFn(api.ipPoolList, { query: { limit: ALL_ISH } })

const allSiloPoolsQuery = (silo: string) =>
  getListQFn(api.siloIpPoolList, { path: { silo }, query: { limit: ALL_ISH } })

// exported to call in silo page loader
export const siloIpPoolsQuery = (silo: string) =>
  getListQFn(api.siloIpPoolList, { path: { silo } })

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { silo } = getSiloSelector(params)
  await queryClient.prefetchQuery(siloIpPoolsQuery(silo).optionsFn())
  return null
}

export default function SiloIpPoolsTab() {
  const { silo } = useSiloSelector()
  const [showLinkModal, setShowLinkModal] = useState(false)

  // Fetch all_ish, but there should only be a few anyway. Not prefetched
  // because the prefetched one only gets 25 to match the query table. This req
  // is better to do async because they can't click make default that fast
  // anyway.
  const { data: allPoolsData } = useQuery(allSiloPoolsQuery(silo).optionsFn())
  const allPools = allPoolsData?.items

  const staticCols = useMemo(
    () => [
      colHelper.accessor('name', {
        cell: (info) => {
          const LinkCell = makeLinkCell((pool) => pb.ipPool({ pool }))
          return (
            <div className="relative flex items-center gap-1">
              <LinkCell {...info} />
              {info.row.original.isDefault && <Badge className="relative">default</Badge>}
            </div>
          )
        },
      }),
      colHelper.accessor('description', Columns.description),
      colHelper.accessor('ipVersion', {
        header: 'Version',
        cell: (info) => <IpVersionBadge ipVersion={info.getValue()} />,
      }),
      colHelper.accessor('poolType', {
        header: 'Type',
        cell: (info) => <Badge color="neutral">{info.getValue()}</Badge>,
      }),
    ],
    []
  )

  // used in change default confirm modal - find existing default for same version/type
  const findDefaultForVersionType = useCallback(
    (ipVersion: string, poolType: string) =>
      allPools?.find(
        (p) => p.isDefault && p.ipVersion === ipVersion && p.poolType === poolType
      )?.name,
    [allPools]
  )

  const { mutateAsync: updatePoolLink } = useApiMutation(api.ipPoolSiloUpdate, {
    onSuccess() {
      queryClient.invalidateEndpoint('siloIpPoolList')
    },
  })
  const { mutateAsync: unlinkPool } = useApiMutation(api.ipPoolSiloUnlink, {
    onSuccess() {
      queryClient.invalidateEndpoint('siloIpPoolList')
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
            const existingDefault = findDefaultForVersionType(pool.ipVersion, pool.poolType)
            const versionLabel = pool.ipVersion === 'v4' ? 'IPv4' : 'IPv6'
            const typeLabel = pool.poolType === 'unicast' ? 'unicast' : 'multicast'

            const modalContent = existingDefault ? (
              <p>
                Are you sure you want to change the default {versionLabel} {typeLabel} pool
                from <HL>{existingDefault}</HL> to <HL>{pool.name}</HL>?
              </p>
            ) : (
              <p>
                Are you sure you want to make <HL>{pool.name}</HL> the default{' '}
                {versionLabel} {typeLabel} pool for this silo?
              </p>
            )
            const verb = existingDefault ? 'change' : 'make'
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
    [findDefaultForVersionType, silo, unlinkPool, updatePoolLink]
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

export const handle = makeCrumb('IP Pools')

type LinkPoolFormValues = {
  pool: string | undefined
}

const defaultValues: LinkPoolFormValues = { pool: undefined }

function LinkPoolModal({ onDismiss }: { onDismiss: () => void }) {
  const { silo } = useSiloSelector()
  const { control, handleSubmit } = useForm({ defaultValues })

  const linkPool = useApiMutation(api.ipPoolSiloLink, {
    onSuccess() {
      queryClient.invalidateEndpoint('siloIpPoolList')
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
