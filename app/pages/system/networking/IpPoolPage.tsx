/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { QueryObserver } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link, Outlet, type LoaderFunctionArgs } from 'react-router-dom'

import {
  apiQueryClient,
  parseIpUtilization,
  queryClient,
  useApiMutation,
  useApiQuery,
  useApiQueryClient,
  usePrefetchedApiQuery,
  type IpPoolRange,
  type IpPoolSiloLink,
} from '@oxide/api'
import {
  IpGlobal16Icon,
  Networking24Icon,
  Success12Icon,
} from '@oxide/design-system/icons/react'

import { CapacityBar } from '~/components/CapacityBar'
import { ExternalLink } from '~/components/ExternalLink'
import { ListboxField } from '~/components/form/fields/ListboxField'
import { HL } from '~/components/HL'
import { QueryParamTabs } from '~/components/QueryParamTabs'
import { getIpPoolSelector, useForm, useIpPoolSelector } from '~/hooks'
import { confirmAction } from '~/stores/confirm-action'
import { addToast } from '~/stores/toast'
import { DateCell } from '~/table/cells/DateCell'
import { SkeletonCell } from '~/table/cells/EmptyCell'
import { LinkCell } from '~/table/cells/LinkCell'
import type { MenuAction } from '~/table/columns/action-col'
import { useQueryTable } from '~/table/QueryTable'
import { Badge } from '~/ui/lib/Badge'
import { buttonStyle } from '~/ui/lib/Button'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { Message } from '~/ui/lib/Message'
import { Modal } from '~/ui/lib/Modal'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { TableControls, TableControlsButton, TableControlsText } from '~/ui/lib/Table'
import { Tabs } from '~/ui/lib/Tabs'
import { links } from '~/util/links'
import { pb } from '~/util/path-builder'

const getState = (pool: string) =>
  apiQueryClient.getQueryState('ipPoolUtilizationView', { path: { pool } })

IpPoolPage.loader = async function ({ params }: LoaderFunctionArgs) {
  const { pool } = getIpPoolSelector(params)
  const state = getState(pool)
  console.log('query state at start of IpPoolPage.loader', state)
  // Warning: evil.
  // This cancel covers the rare but very possible situation where we are
  // navigating from IP pools while the utilization fetch is still running.
  // TODO: make a typed QueryObserver wrapper
  const observer = new QueryObserver(queryClient, {
    queryKey: ['ipPoolUtilizationView', { path: { pool } }],
  })
  const unsub = state ? observer.subscribe(() => {}) : undefined
  await Promise.all([
    apiQueryClient.prefetchQuery('ipPoolView', { path: { pool } }),
    apiQueryClient.prefetchQuery('ipPoolSiloList', {
      path: { pool },
      query: { limit: 25 }, // match QueryTable
    }),
    apiQueryClient.prefetchQuery('ipPoolRangeList', {
      path: { pool },
      query: { limit: 25 }, // match QueryTable
    }),
    // when wrapping up: change this back to prefetch and stick the cancel before it
    apiQueryClient
      .fetchQuery('ipPoolUtilizationView', { path: { pool } })
      .then((result) => {
        console.log('after prefetchQuery', result, getState(pool))
      })
      .catch((error) => {
        console.log('after prefetchQuery (error)', error, getState(pool))
      }),

    // fetch silos and preload into RQ cache so fetches by ID in SiloNameFromId
    // can be mostly instant yet gracefully fall back to fetching individually
    // if we don't fetch them all here
    apiQueryClient.fetchQuery('siloList', { query: { limit: 200 } }).then((silos) => {
      for (const silo of silos.items) {
        apiQueryClient.setQueryData('siloView', { path: { silo: silo.id } }, silo)
      }
    }),
  ])
  unsub?.()
  console.log('after Promise.all', getState(pool))
  return null
}

export function IpPoolPage() {
  const poolSelector = useIpPoolSelector()
  const { data: pool } = usePrefetchedApiQuery('ipPoolView', { path: poolSelector })
  return (
    <>
      <PageHeader>
        <PageTitle icon={<Networking24Icon />}>{pool.name}</PageTitle>
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
  console.log('UtilizationBars render', getState(pool))
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

function IpRangesTable() {
  const { pool } = useIpPoolSelector()
  const { Table, Column } = useQueryTable('ipPoolRangeList', { path: { pool } })
  const queryClient = useApiQueryClient()

  const removeRange = useApiMutation('ipPoolRangeRemove', {
    onSuccess() {
      queryClient.invalidateQueries('ipPoolRangeList')
      queryClient.invalidateQueries('ipPoolUtilizationView')
    },
  })
  const emptyState = (
    <EmptyMessage
      icon={<Networking24Icon />}
      title="No IP ranges"
      body="Add a range to see it here"
      buttonText="Add range"
      buttonTo={pb.ipPoolRangeAdd({ pool })}
    />
  )

  const makeRangeActions = ({ range }: IpPoolRange): MenuAction[] => [
    {
      label: 'Remove',
      className: 'destructive',
      onActivate: () =>
        confirmAction({
          doAction: () =>
            removeRange.mutateAsync({
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
  ]

  return (
    <>
      <div className="mb-3 flex justify-end space-x-2">
        <Link to={pb.ipPoolRangeAdd({ pool })} className={buttonStyle({ size: 'sm' })}>
          Add range
        </Link>
      </div>
      <Table emptyState={emptyState} makeActions={makeRangeActions}>
        <Column accessor="range.first" header="First" />
        <Column accessor="range.last" header="Last" />
        <Column accessor="timeCreated" header="Created" cell={DateCell} />
      </Table>
    </>
  )
}

function SiloNameFromId({ value: siloId }: { value: string }) {
  const { data: silo } = useApiQuery('siloView', { path: { silo: siloId } })

  if (!silo) return <SkeletonCell />

  return <LinkCell to={pb.siloIpPools({ silo: silo.name })}>{silo.name}</LinkCell>
}

function LinkedSilosTable() {
  const poolSelector = useIpPoolSelector()
  const queryClient = useApiQueryClient()
  const { Table, Column } = useQueryTable('ipPoolSiloList', { path: poolSelector })

  const unlinkSilo = useApiMutation('ipPoolSiloUnlink', {
    onSuccess() {
      queryClient.invalidateQueries('ipPoolSiloList')
    },
  })

  const makeActions = (link: IpPoolSiloLink): MenuAction[] => [
    {
      label: 'Unlink',
      className: 'destructive',
      onActivate() {
        confirmAction({
          doAction: () =>
            unlinkSilo.mutateAsync({ path: { silo: link.siloId, pool: link.ipPoolId } }),
          modalTitle: 'Confirm unlink silo',
          // Would be nice to reference the silo by name like we reference the
          // pool by name on unlink in the silo pools list, but it's a pain to
          // get the name here. Could use useQueries to get all the names, and
          // RQ would dedupe the requests since they're already being fetched
          // for the table. Not worth it right now.
          modalContent: (
            <p>
              Are you sure you want to unlink the silo? Users in this silo will no longer be
              able to allocate IPs from this pool. Unlink will fail if there are any IPs
              from the pool in use in this silo.
            </p>
          ),
          errorTitle: 'Could not unlink silo',
          actionType: 'danger',
        })
      },
    },
  ]

  const [showLinkModal, setShowLinkModal] = useState(false)

  const emptyState = (
    <EmptyMessage
      icon={<Networking24Icon />}
      title="No linked silos"
      body="You can link this pool to a silo to see it here"
      buttonText="Link silo"
      onClick={() => setShowLinkModal(true)}
    />
  )

  return (
    <>
      <TableControls>
        <TableControlsText>
          Users in linked silos can allocate external IPs from this pool for their
          instances. A silo can have at most one default pool. IPs are allocated from the
          default pool when users ask for one without specifying a pool. Read the docs to
          learn more about{' '}
          <ExternalLink href={links.ipPoolsDocs}>managing IP pools</ExternalLink>.
        </TableControlsText>
        <TableControlsButton onClick={() => setShowLinkModal(true)}>
          Link silo
        </TableControlsButton>
      </TableControls>
      <Table emptyState={emptyState} makeActions={makeActions}>
        <Column accessor="siloId" id="Silo" cell={SiloNameFromId} />
        <Column
          accessor="isDefault"
          id="Default"
          header="Pool is silo default?"
          cell={({ value }) =>
            value && (
              <>
                <Success12Icon className="mr-1 text-accent" />
                <Badge>default</Badge>
              </>
            )
          }
        />
      </Table>
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

            <ListboxField
              placeholder="Select silo"
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
