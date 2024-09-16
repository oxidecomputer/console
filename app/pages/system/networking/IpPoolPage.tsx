/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { createColumnHelper } from '@tanstack/react-table'
import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Outlet, useNavigate, type LoaderFunctionArgs } from 'react-router-dom'

import {
  apiQueryClient,
  parseIpUtilization,
  useApiMutation,
  useApiQuery,
  useApiQueryClient,
  usePrefetchedApiQuery,
  type IpPoolRange,
  type IpPoolSiloLink,
} from '@oxide/api'
import { IpGlobal16Icon, IpGlobal24Icon } from '@oxide/design-system/icons/react'

import { CapacityBar } from '~/components/CapacityBar'
import { DocsPopover } from '~/components/DocsPopover'
import { ComboboxField } from '~/components/form/fields/ComboboxField'
import { HL } from '~/components/HL'
import { MoreActionsMenu } from '~/components/MoreActionsMenu'
import { QueryParamTabs } from '~/components/QueryParamTabs'
import { getIpPoolSelector, useIpPoolSelector } from '~/hooks/use-params'
import { confirmAction } from '~/stores/confirm-action'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { DefaultPoolCell } from '~/table/cells/DefaultPoolCell'
import { SkeletonCell } from '~/table/cells/EmptyCell'
import { LinkCell } from '~/table/cells/LinkCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { PAGE_SIZE, useQueryTable } from '~/table/QueryTable'
import { CreateButton, CreateLink } from '~/ui/lib/CreateButton'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { Message } from '~/ui/lib/Message'
import { Modal } from '~/ui/lib/Modal'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { Tabs } from '~/ui/lib/Tabs'
import { TipIcon } from '~/ui/lib/TipIcon'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'

const query = { limit: PAGE_SIZE }

IpPoolPage.loader = async function ({ params }: LoaderFunctionArgs) {
  const { pool } = getIpPoolSelector(params)
  await Promise.all([
    apiQueryClient.prefetchQuery('ipPoolView', { path: { pool } }),
    apiQueryClient.prefetchQuery('ipPoolSiloList', { path: { pool }, query }),
    apiQueryClient.prefetchQuery('ipPoolRangeList', { path: { pool }, query }),
    apiQueryClient.prefetchQuery('ipPoolUtilizationView', { path: { pool } }),

    // fetch silos and preload into RQ cache so fetches by ID in SiloNameFromId
    // can be mostly instant yet gracefully fall back to fetching individually
    // if we don't fetch them all here
    apiQueryClient.fetchQuery('siloList', { query: { limit: 200 } }).then((silos) => {
      for (const silo of silos.items) {
        apiQueryClient.setQueryData('siloView', { path: { silo: silo.id } }, silo)
      }
    }),
  ])
  return null
}

export function IpPoolPage() {
  const poolSelector = useIpPoolSelector()
  const { data: pool } = usePrefetchedApiQuery('ipPoolView', { path: poolSelector })
  const { data: ranges } = usePrefetchedApiQuery('ipPoolRangeList', {
    path: poolSelector,
    query,
  })
  const navigate = useNavigate()
  const { mutateAsync: deletePool } = useApiMutation('ipPoolDelete', {
    onSuccess() {
      apiQueryClient.invalidateQueries('ipPoolList')
      navigate(pb.ipPools())
      addToast({ content: 'IP pool deleted' })
    },
  })

  const actions = useMemo(
    () => [
      {
        label: 'Edit',
        onActivate() {
          navigate(pb.ipPoolEdit(poolSelector))
        },
      },
      {
        label: 'Delete',
        onActivate: confirmDelete({
          doDelete: () => deletePool({ path: { pool: pool.name } }),
          label: pool.name,
        }),
        disabled:
          !!ranges.items.length && 'IP pool cannot be deleted while it contains IP ranges',
        className: ranges.items.length ? '' : 'destructive',
      },
    ],
    [deletePool, navigate, poolSelector, pool.name, ranges.items]
  )

  return (
    <>
      <PageHeader>
        <PageTitle icon={<IpGlobal24Icon />}>{pool.name}</PageTitle>
        <div className="inline-flex gap-2">
          <DocsPopover
            heading="IP pools"
            icon={<IpGlobal16Icon />}
            summary="IP pools are collections of external IPs you can assign to silos. When a pool is linked to a silo, users in that silo can allocate IPs from the pool for their instances."
            links={[docLinks.systemIpPools]}
          />
          <MoreActionsMenu label="IP pool actions" actions={actions} />
        </div>
      </PageHeader>
      <UtilizationBars />
      <QueryParamTabs className="full-width" defaultValue="ranges">
        <Tabs.List>
          <Tabs.Trigger value="ranges">IP ranges</Tabs.Trigger>
          <Tabs.Trigger value="silos">Linked silos</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="ranges">
          <IpRangesTable />
        </Tabs.Content>
        <Tabs.Content value="silos">
          <LinkedSilosTable />
        </Tabs.Content>
      </QueryParamTabs>
      <Outlet /> {/* for add range form */}
    </>
  )
}

function UtilizationBars() {
  const { pool } = useIpPoolSelector()
  const { data } = usePrefetchedApiQuery('ipPoolUtilizationView', { path: { pool } })
  const { ipv4, ipv6 } = parseIpUtilization(data)

  if (ipv4.capacity === 0 && ipv6.capacity === 0n) return null

  return (
    <div className="-mt-8 mb-8 flex min-w-min flex-col gap-3 lg+:flex-row">
      {ipv4.capacity > 0 && (
        <CapacityBar
          icon={<IpGlobal16Icon />}
          title="IPv4"
          provisioned={ipv4.allocated}
          capacity={ipv4.capacity}
          provisionedLabel="Allocated"
          capacityLabel="Capacity"
          unit="IPs"
          includeUnit={false}
        />
      )}
      {ipv6.capacity > 0 && (
        <CapacityBar
          icon={<IpGlobal16Icon />}
          title="IPv6"
          provisioned={ipv6.allocated}
          capacity={ipv6.capacity}
          provisionedLabel="Allocated"
          capacityLabel="Capacity"
          unit="IPs"
          includeUnit={false}
        />
      )}
    </div>
  )
}

const ipRangesColHelper = createColumnHelper<IpPoolRange>()
const ipRangesStaticCols = [
  ipRangesColHelper.accessor('range.first', { header: 'First' }),
  ipRangesColHelper.accessor('range.last', { header: 'Last' }),
  ipRangesColHelper.accessor('timeCreated', Columns.timeCreated),
]

function IpRangesTable() {
  const { pool } = useIpPoolSelector()
  const { Table } = useQueryTable('ipPoolRangeList', { path: { pool } })
  const queryClient = useApiQueryClient()

  const { mutateAsync: removeRange } = useApiMutation('ipPoolRangeRemove', {
    onSuccess() {
      queryClient.invalidateQueries('ipPoolRangeList')
      queryClient.invalidateQueries('ipPoolUtilizationView')
    },
  })
  const emptyState = (
    <EmptyMessage
      icon={<IpGlobal24Icon />}
      title="No IP ranges"
      body="Add a range to see it here"
      buttonText="Add range"
      buttonTo={pb.ipPoolRangeAdd({ pool })}
    />
  )

  const makeRangeActions = useCallback(
    ({ range }: IpPoolRange): MenuAction[] => [
      {
        label: 'Remove',
        className: 'destructive',
        onActivate: () =>
          confirmAction({
            doAction: () =>
              removeRange({
                path: { pool },
                body: range,
              }),
            errorTitle: 'Could not remove range',
            modalTitle: 'Confirm remove range',
            modalContent: (
              <p>
                Are you sure you want to remove range{' '}
                <HL>
                  {range.first}&ndash;{range.last}
                </HL>{' '}
                from the pool? This will fail if the range has any addresses in use.
              </p>
            ),
            actionType: 'danger',
          }),
      },
    ],
    [pool, removeRange]
  )
  const columns = useColsWithActions(ipRangesStaticCols, makeRangeActions)

  return (
    <>
      <div className="mb-3 flex justify-end">
        <CreateLink to={pb.ipPoolRangeAdd({ pool })}>Add range</CreateLink>
      </div>
      <Table columns={columns} emptyState={emptyState} />
    </>
  )
}

function SiloNameFromId({ value: siloId }: { value: string }) {
  const { data: silo } = useApiQuery('siloView', { path: { silo: siloId } })

  if (!silo) return <SkeletonCell />

  return <LinkCell to={pb.siloIpPools({ silo: silo.name })}>{silo.name}</LinkCell>
}

const silosColHelper = createColumnHelper<IpPoolSiloLink>()
const silosStaticCols = [
  silosColHelper.accessor('siloId', {
    header: 'Silo',
    cell: (info) => <SiloNameFromId value={info.getValue()} />,
  }),
  silosColHelper.accessor('isDefault', {
    header: () => {
      return (
        <span className="inline-flex items-center gap-2">
          Pool is silo default
          <TipIcon>
            IPs are allocated from the default pool when users ask for an IP without
            specifying a pool.
          </TipIcon>
        </span>
      )
    },
    cell: (info) => <DefaultPoolCell isDefault={info.getValue()} />,
  }),
]

function LinkedSilosTable() {
  const poolSelector = useIpPoolSelector()
  const queryClient = useApiQueryClient()
  const { Table } = useQueryTable('ipPoolSiloList', { path: poolSelector })

  const { mutateAsync: unlinkSilo } = useApiMutation('ipPoolSiloUnlink', {
    onSuccess() {
      queryClient.invalidateQueries('ipPoolSiloList')
    },
  })

  const makeActions = useCallback(
    (link: IpPoolSiloLink): MenuAction[] => [
      {
        label: 'Unlink',
        className: 'destructive',
        onActivate() {
          confirmAction({
            doAction: () =>
              unlinkSilo({ path: { silo: link.siloId, pool: link.ipPoolId } }),
            modalTitle: 'Confirm unlink silo',
            // Would be nice to reference the silo by name like we reference the
            // pool by name on unlink in the silo pools list, but it's a pain to
            // get the name here. Could use useQueries to get all the names, and
            // RQ would dedupe the requests since they're already being fetched
            // for the table. Not worth it right now.
            modalContent: (
              <p>
                Are you sure you want to unlink the silo? Users in this silo will no longer
                be able to allocate IPs from this pool. Unlink will fail if there are any
                IPs from the pool in use in this silo.
              </p>
            ),
            errorTitle: 'Could not unlink silo',
            actionType: 'danger',
          })
        },
      },
    ],
    [unlinkSilo]
  )

  const [showLinkModal, setShowLinkModal] = useState(false)

  const emptyState = (
    <EmptyMessage
      icon={<IpGlobal24Icon />}
      title="No linked silos"
      body="You can link this pool to a silo to see it here"
      buttonText="Link silo"
      onClick={() => setShowLinkModal(true)}
    />
  )

  const columns = useColsWithActions(silosStaticCols, makeActions)
  return (
    <>
      <div className="mb-3 flex justify-end">
        <CreateButton onClick={() => setShowLinkModal(true)}>Link silo</CreateButton>
      </div>
      <Table columns={columns} emptyState={emptyState} />
      {showLinkModal && <LinkSiloModal onDismiss={() => setShowLinkModal(false)} />}
    </>
  )
}

type LinkSiloFormValues = {
  silo: string | undefined
}

const defaultValues: LinkSiloFormValues = { silo: undefined }

function LinkSiloModal({ onDismiss }: { onDismiss: () => void }) {
  const queryClient = useApiQueryClient()
  const { pool } = useIpPoolSelector()
  const { control, handleSubmit } = useForm({ defaultValues })

  const linkSilo = useApiMutation('ipPoolSiloLink', {
    onSuccess() {
      queryClient.invalidateQueries('ipPoolSiloList')
    },
    onError(err) {
      addToast({ title: 'Could not link silo', content: err.message, variant: 'error' })
    },
    onSettled: onDismiss,
  })

  function onSubmit({ silo }: LinkSiloFormValues) {
    if (!silo) return // can't happen, silo is required
    linkSilo.mutate({ path: { pool }, body: { silo, isDefault: false } })
  }

  const linkedSilos = useApiQuery('ipPoolSiloList', {
    path: { pool },
    query: { limit: 1000 },
  })
  const allSilos = useApiQuery('siloList', { query: { limit: 1000 } })

  // in order to get the list of remaining unlinked silos, we have to get the
  // list of all silos and remove the already linked ones

  const linkedSiloIds = useMemo(
    () =>
      linkedSilos.data ? new Set(linkedSilos.data.items.map((s) => s.siloId)) : undefined,
    [linkedSilos]
  )
  const unlinkedSiloItems = useMemo(
    () =>
      allSilos.data && linkedSiloIds
        ? allSilos.data.items
            .filter((s) => !linkedSiloIds.has(s.id))
            .map((s) => ({ value: s.name, label: s.name }))
        : [],
    [allSilos, linkedSiloIds]
  )

  return (
    <Modal isOpen onDismiss={onDismiss} title="Link silo">
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
              content="Users in the selected silo will be able to allocate IPs from this pool."
            />

            <ComboboxField
              placeholder="Select a silo"
              name="silo"
              label="Silo"
              items={unlinkedSiloItems}
              isLoading={linkedSilos.isPending || allSilos.isPending}
              required
              control={control}
            />
          </form>
        </Modal.Section>
      </Modal.Body>
      <Modal.Footer
        onDismiss={onDismiss}
        onAction={handleSubmit(onSubmit)}
        actionLoading={linkSilo.isPending}
        actionText="Link"
      />
    </Modal>
  )
}
