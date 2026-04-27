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

import {
  api,
  getListQFn,
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
  type SiloSubnetPool,
  type SubnetPool,
} from '@oxide/api'
import { Networking24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { ComboboxField } from '~/components/form/fields/ComboboxField'
import { HL } from '~/components/HL'
import { IpVersionBadge } from '~/components/IpVersionBadge'
import { makeCrumb } from '~/hooks/use-crumbs'
import { getSiloSelector, useSiloSelector } from '~/hooks/use-params'
import { confirmAction } from '~/stores/confirm-action'
import { addToast } from '~/stores/toast'
import { LinkCell } from '~/table/cells/LinkCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import type { ComboboxItem } from '~/ui/lib/Combobox'
import { CreateButton } from '~/ui/lib/CreateButton'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { Message } from '~/ui/lib/Message'
import { Modal } from '~/ui/lib/Modal'
import { Tooltip } from '~/ui/lib/Tooltip'
import { ALL_ISH } from '~/util/consts'
import { pb } from '~/util/path-builder'

function toSubnetPoolComboboxItem(p: SubnetPool): ComboboxItem {
  return {
    value: p.name,
    selectedLabel: p.name,
    label: (
      <div className="flex items-center gap-1.5">
        {p.name}
        <IpVersionBadge ipVersion={p.ipVersion} />
      </div>
    ),
  }
}

function EmptyState({ onLinkPool }: { onLinkPool: () => void }) {
  const { data: allPools } = usePrefetchedQuery(allPoolsQuery.optionsFn())
  const emptyProps = allPools.items.length
    ? {
        body: 'Link a subnet pool to this silo to see it here',
        buttonText: 'Link pool',
        onClick: onLinkPool,
      }
    : {
        body: 'Create and link a subnet pool to see it here',
        buttonText: 'New subnet pool',
        buttonTo: pb.subnetPoolsNew(),
      }
  return (
    <EmptyMessage
      icon={<Networking24Icon />}
      title="No linked subnet pools"
      {...emptyProps}
    />
  )
}

const colHelper = createColumnHelper<SiloSubnetPool>()

const allPoolsQuery = getListQFn(api.systemSubnetPoolList, { query: { limit: ALL_ISH } })

const allSiloPoolsQuery = (silo: string) =>
  getListQFn(api.siloSubnetPoolList, { path: { silo }, query: { limit: ALL_ISH } })

export const siloSubnetPoolsQuery = (silo: string) =>
  getListQFn(api.siloSubnetPoolList, { path: { silo } })

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { silo } = getSiloSelector(params)
  await Promise.all([
    queryClient.prefetchQuery(siloSubnetPoolsQuery(silo).optionsFn()),
    queryClient.prefetchQuery(allPoolsQuery.optionsFn()),
  ])
  return null
}

export default function SiloSubnetPoolsTab() {
  const { silo } = useSiloSelector()
  const [showLinkModal, setShowLinkModal] = useState(false)

  const { data: allPoolsData } = useQuery(allSiloPoolsQuery(silo).optionsFn())
  const allPools = allPoolsData?.items

  const staticCols = useMemo(
    () => [
      colHelper.accessor('name', {
        cell: (info) => (
          <LinkCell to={pb.subnetPool({ subnetPool: info.row.original.id })}>
            {info.getValue()}
            {info.row.original.isDefault && (
              <Tooltip content="Default for version">
                <span className="ml-2">
                  <Badge>default</Badge>
                </span>
              </Tooltip>
            )}
          </LinkCell>
        ),
      }),
      colHelper.accessor('description', Columns.description),
      colHelper.accessor('ipVersion', {
        header: 'Version',
        cell: (info) => <IpVersionBadge ipVersion={info.getValue()} />,
      }),
    ],
    []
  )

  const findDefaultForVersion = useCallback(
    (ipVersion: string) =>
      allPools?.find((p) => p.isDefault && p.ipVersion === ipVersion)?.name,
    [allPools]
  )

  const { mutateAsync: updatePoolLink } = useApiMutation(api.systemSubnetPoolSiloUpdate, {
    onSuccess() {
      queryClient.invalidateEndpoint('siloSubnetPoolList')
      queryClient.invalidateEndpoint('systemSubnetPoolSiloList')
    },
  })
  const { mutateAsync: unlinkPool } = useApiMutation(api.systemSubnetPoolSiloUnlink, {
    onSuccess() {
      queryClient.invalidateEndpoint('siloSubnetPoolList')
      queryClient.invalidateEndpoint('systemSubnetPoolSiloList')
      addToast({ content: 'Subnet pool unlinked' })
    },
  })

  const makeActions = useCallback(
    (pool: SiloSubnetPool): MenuAction[] => [
      {
        label: pool.isDefault ? 'Clear default' : 'Make default',
        className: pool.isDefault ? 'destructive' : undefined,
        onActivate() {
          const versionLabel = `IP${pool.ipVersion}`

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
                  Are you sure you want <HL>{pool.name}</HL> to stop being the default{' '}
                  {versionLabel} subnet pool for this silo? If there is no default, users in
                  this silo will have to specify a pool when allocating external subnets.
                </p>
              ),
              errorTitle: 'Could not clear default',
              actionType: 'danger',
            })
          } else {
            const existingDefault = findDefaultForVersion(pool.ipVersion)

            const modalContent = existingDefault ? (
              <p>
                Are you sure you want to change the default {versionLabel} subnet pool from{' '}
                <HL>{existingDefault}</HL> to <HL>{pool.name}</HL>?
              </p>
            ) : (
              <p>
                Are you sure you want to make <HL>{pool.name}</HL> the default{' '}
                {versionLabel} subnet pool for this silo?
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
            modalTitle: 'Confirm unlink pool',
            modalContent: (
              <p>
                Are you sure you want to unlink <HL>{pool.name}</HL>? Users in this silo
                will no longer be able to allocate external subnets from this pool. Unlink
                will fail if there are any subnets from <HL>{pool.name}</HL> in use in this
                silo.
              </p>
            ),
            errorTitle: 'Could not unlink pool',
            actionType: 'danger',
          })
        },
      },
    ],
    [findDefaultForVersion, silo, unlinkPool, updatePoolLink]
  )

  const columns = useColsWithActions(staticCols, makeActions)
  const { table } = useQueryTable({
    query: siloSubnetPoolsQuery(silo),
    columns,
    emptyState: <EmptyState onLinkPool={() => setShowLinkModal(true)} />,
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

export const handle = makeCrumb('Subnet Pools')

type LinkPoolFormValues = {
  pool: string | undefined
}

const defaultValues: LinkPoolFormValues = { pool: undefined }

function LinkPoolModal({ onDismiss }: { onDismiss: () => void }) {
  const { silo } = useSiloSelector()
  const { control, handleSubmit } = useForm({ defaultValues })

  const linkPool = useApiMutation(api.systemSubnetPoolSiloLink, {
    onSuccess() {
      queryClient.invalidateEndpoint('siloSubnetPoolList')
      queryClient.invalidateEndpoint('systemSubnetPoolSiloList')
      onDismiss()
    },
    onError(err) {
      addToast({ title: 'Could not link pool', content: err.message, variant: 'error' })
    },
  })

  function onSubmit({ pool }: LinkPoolFormValues) {
    if (!pool) return
    linkPool.mutate({ path: { pool }, body: { silo, isDefault: false } })
  }

  const allLinkedPools = useQuery(allSiloPoolsQuery(silo).optionsFn())
  const allPools = useQuery(allPoolsQuery.optionsFn())

  const linkedPoolIds = useMemo(
    () =>
      allLinkedPools.data ? new Set(allLinkedPools.data.items.map((p) => p.id)) : undefined,
    [allLinkedPools]
  )
  const unlinkedPoolItems = useMemo(
    () =>
      allPools.data && linkedPoolIds
        ? allPools.data.items
            .filter((p) => !linkedPoolIds.has(p.id))
            .map(toSubnetPoolComboboxItem)
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
              content="Users in this silo will be able to allocate external subnets from the selected pool."
            />

            <ComboboxField
              placeholder="Select a pool"
              name="pool"
              label="Subnet pool"
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
