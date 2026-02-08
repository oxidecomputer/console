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
import { Outlet, useNavigate, type LoaderFunctionArgs } from 'react-router'

import {
  api,
  getListQFn,
  q,
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
  type IpPoolRange,
  type IpPoolSiloLink,
  type Silo,
} from '@oxide/api'
import { IpGlobal16Icon, IpGlobal24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { DocsPopover } from '~/components/DocsPopover'
import { ComboboxField } from '~/components/form/fields/ComboboxField'
import { HL } from '~/components/HL'
import { IpVersionBadge } from '~/components/IpVersionBadge'
import { MoreActionsMenu } from '~/components/MoreActionsMenu'
import { QueryParamTabs } from '~/components/QueryParamTabs'
import { makeCrumb } from '~/hooks/use-crumbs'
import { getIpPoolSelector, useIpPoolSelector } from '~/hooks/use-params'
import { confirmAction } from '~/stores/confirm-action'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { SkeletonCell } from '~/table/cells/EmptyCell'
import { LinkCell } from '~/table/cells/LinkCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { BigNum } from '~/ui/lib/BigNum'
import { toComboboxItems } from '~/ui/lib/Combobox'
import { CreateButton, CreateLink } from '~/ui/lib/CreateButton'
import * as Dropdown from '~/ui/lib/DropdownMenu'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { Message } from '~/ui/lib/Message'
import { Modal } from '~/ui/lib/Modal'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { Tabs } from '~/ui/lib/Tabs'
import { TipIcon } from '~/ui/lib/TipIcon'
import { ALL_ISH } from '~/util/consts'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

const ipPoolView = ({ pool }: PP.IpPool) => q(api.ipPoolView, { path: { pool } })
const ipPoolUtilizationView = ({ pool }: PP.IpPool) =>
  q(api.ipPoolUtilizationView, { path: { pool } })
const ipPoolSiloList = ({ pool }: PP.IpPool) =>
  getListQFn(api.ipPoolSiloList, { path: { pool } })
const ipPoolRangeList = ({ pool }: PP.IpPool) =>
  getListQFn(api.ipPoolRangeList, { path: { pool } })
const siloList = q(api.siloList, { query: { limit: ALL_ISH } })
const siloView = ({ silo }: PP.Silo) => q(api.siloView, { path: { silo } })
const siloIpPoolList = (silo: string) =>
  q(api.siloIpPoolList, { path: { silo }, query: { limit: ALL_ISH } })

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const selector = getIpPoolSelector(params)
  await Promise.all([
    queryClient.prefetchQuery(ipPoolView(selector)),
    // prefetch silo pool lists so "Make default" can show existing default name.
    // fire-and-forget: don't block page load, the action handler fetches on
    // demand if these haven't completed yet
    queryClient.fetchQuery(ipPoolSiloList(selector).optionsFn()).then((links) => {
      // only do first 50 to avoid kicking of a ridiculous number of requests if
      // the user has 500 silos for some reason
      for (const link of links.items.slice(0, 50)) {
        queryClient.prefetchQuery(siloIpPoolList(link.siloId))
      }
    }),
    queryClient.prefetchQuery(ipPoolRangeList(selector).optionsFn()),
    queryClient.prefetchQuery(ipPoolUtilizationView(selector)),

    // fetch silos and preload into RQ cache so fetches by ID in SiloNameFromId
    // can be mostly instant yet gracefully fall back to fetching individually
    // if we don't fetch them all here
    queryClient.fetchQuery(siloList).then((silos) => {
      for (const silo of silos.items) {
        queryClient.setQueryData(siloView({ silo: silo.id }).queryKey, silo)
      }
    }),
  ])
  return null
}

export const handle = makeCrumb((p) => p.pool!)

export default function IpPoolpage() {
  const poolSelector = useIpPoolSelector()
  const { data: pool } = usePrefetchedQuery(ipPoolView(poolSelector))
  const { data: ranges } = usePrefetchedQuery(ipPoolRangeList(poolSelector).optionsFn())
  const navigate = useNavigate()
  const { mutateAsync: deletePool } = useApiMutation(api.ipPoolDelete, {
    onSuccess(_data, variables) {
      queryClient.invalidateEndpoint('ipPoolList')
      navigate(pb.ipPools())
      // prettier-ignore
      addToast(<>Pool <HL>{variables.path.pool}</HL> deleted</>)
    },
  })

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
          <MoreActionsMenu label="IP pool actions">
            <Dropdown.LinkItem to={pb.ipPoolEdit(poolSelector)}>Edit</Dropdown.LinkItem>
            <Dropdown.Item
              label="Delete"
              onSelect={confirmDelete({
                doDelete: () => deletePool({ path: { pool: pool.name } }),
                label: pool.name,
              })}
              disabled={
                !!ranges.items.length &&
                'IP pool cannot be deleted while it contains IP ranges'
              }
              className={ranges.items.length ? '' : 'destructive'}
            />
          </MoreActionsMenu>
        </div>
      </PageHeader>
      <PoolProperties />
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

function PoolProperties() {
  const poolSelector = useIpPoolSelector()
  const { data: pool } = usePrefetchedQuery(ipPoolView(poolSelector))
  const { data: utilization } = usePrefetchedQuery(ipPoolUtilizationView(poolSelector))

  return (
    <PropertiesTable columns={2} className="-mt-8 mb-8">
      <PropertiesTable.IdRow id={pool.id} />
      <PropertiesTable.DescriptionRow description={pool.description} />
      <PropertiesTable.Row label="IP version">
        <IpVersionBadge ipVersion={pool.ipVersion} />
      </PropertiesTable.Row>
      <PropertiesTable.Row label="Type">
        <Badge color="neutral">{pool.poolType}</Badge>
      </PropertiesTable.Row>
      <PropertiesTable.Row label="IPs remaining">
        <span>
          <BigNum className="text-raise" num={utilization.remaining} />
          {' / '}
          <BigNum className="text-secondary" num={utilization.capacity} />
        </span>
      </PropertiesTable.Row>
      <PropertiesTable.DateRow date={pool.timeCreated} label="Created" />
    </PropertiesTable>
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

  const { mutateAsync: removeRange } = useApiMutation(api.ipPoolRangeRemove, {
    onSuccess() {
      queryClient.invalidateEndpoint('ipPoolRangeList')
      queryClient.invalidateEndpoint('ipPoolUtilizationView')
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
  const { table } = useQueryTable({ query: ipPoolRangeList({ pool }), columns, emptyState })

  return (
    <>
      <div className="mb-3 flex justify-end">
        <CreateLink to={pb.ipPoolRangeAdd({ pool })}>Add range</CreateLink>
      </div>
      {table}
    </>
  )
}

function SiloNameFromId({ value: siloId }: { value: string }) {
  const { data: silo } = useQuery(q(api.siloView, { path: { silo: siloId } }))

  if (!silo) return <SkeletonCell />

  return <LinkCell to={pb.siloIpPools({ silo: silo.name })}>{silo.name}</LinkCell>
}

const silosColHelper = createColumnHelper<IpPoolSiloLink>()

/** Look up silo name from query cache and return a label for use in modals. */
function getSiloLabel(siloId: string) {
  const siloName = queryClient.getQueryData<Silo>(siloView({ silo: siloId }).queryKey)?.name
  // prettier-ignore
  return siloName
    ? <>silo <HL>{siloName}</HL></>
    : 'that silo'
}

function LinkedSilosTable() {
  const poolSelector = useIpPoolSelector()
  const { data: pool } = usePrefetchedQuery(ipPoolView(poolSelector))

  const { mutateAsync: unlinkSilo } = useApiMutation(api.ipPoolSiloUnlink, {
    onSuccess() {
      queryClient.invalidateEndpoint('ipPoolSiloList')
    },
  })
  const { mutateAsync: updateSiloLink } = useApiMutation(api.ipPoolSiloUpdate, {
    onSuccess() {
      queryClient.invalidateEndpoint('ipPoolSiloList')
      queryClient.invalidateEndpoint('siloIpPoolList')
    },
  })

  const makeActions = useCallback(
    (link: IpPoolSiloLink): MenuAction[] => [
      {
        label: link.isDefault ? 'Clear default' : 'Make default',
        className: link.isDefault ? 'destructive' : undefined,
        onActivate() {
          const siloLabel = getSiloLabel(link.siloId)
          const poolKind = `IP${pool.ipVersion} ${pool.poolType}`

          if (link.isDefault) {
            confirmAction({
              doAction: () =>
                updateSiloLink({
                  path: { silo: link.siloId, pool: link.ipPoolId },
                  body: { isDefault: false },
                }),
              modalTitle: 'Confirm clear default',
              modalContent: (
                <p>
                  Are you sure you want <HL>{pool.name}</HL> to stop being the default{' '}
                  {poolKind} pool for {siloLabel}? If there is no default, users in this
                  silo will have to specify a pool when allocating IPs.
                </p>
              ),
              errorTitle: 'Could not clear default',
              actionType: 'danger',
            })
          } else {
            // fetch on demand (usually already cached by loader prefetch). on
            // failure, fall back to simpler modal copy. don't await, handle
            // errors internally to minimize blast radius of failure.
            void queryClient
              // ensureQueryData makes sure we use cached data, at the expense
              // of it possibly being stale. but you can't even change a silo
              // name, so it should be fine
              .ensureQueryData(siloIpPoolList(link.siloId))
              .catch(() => null)
              .then((siloPools) => {
                const existingDefaultName = siloPools?.items.find(
                  (p) =>
                    p.isDefault &&
                    p.ipVersion === pool.ipVersion &&
                    p.poolType === pool.poolType
                )?.name

                // all this conditional stuff is just to handle the remote but
                // real possibility of the fetch failing
                const modalContent = existingDefaultName ? (
                  <p>
                    Are you sure you want to change the default {poolKind} pool for{' '}
                    {siloLabel} from <HL>{existingDefaultName}</HL> to <HL>{pool.name}</HL>?
                  </p>
                ) : (
                  <p>
                    Are you sure you want to make <HL>{pool.name}</HL> the default{' '}
                    {poolKind} pool for {siloLabel}?
                  </p>
                )

                const verb = existingDefaultName ? 'change' : 'make'
                confirmAction({
                  doAction: () =>
                    updateSiloLink({
                      path: { silo: link.siloId, pool: link.ipPoolId },
                      body: { isDefault: true },
                    }),
                  modalTitle: `Confirm ${verb} default`,
                  modalContent,
                  errorTitle: `Could not ${verb} default`,
                  actionType: 'primary',
                })
              })
              // be extra sure we don't have any unhandled promise rejections
              .catch(() => null)
          }
        },
      },
      {
        label: 'Unlink',
        className: 'destructive',
        onActivate() {
          const siloLabel = getSiloLabel(link.siloId)
          confirmAction({
            doAction: () =>
              unlinkSilo({ path: { silo: link.siloId, pool: link.ipPoolId } }),
            modalTitle: 'Confirm unlink silo',
            modalContent: (
              <p>
                Are you sure you want to unlink {siloLabel} from <HL>{pool.name}</HL>? Users
                in the silo will no longer be able to allocate IPs from this pool. Unlink
                will fail if there are any IPs from the pool in use in the silo.
              </p>
            ),
            errorTitle: 'Could not unlink silo',
            actionType: 'danger',
          })
        },
      },
    ],
    [pool, unlinkSilo, updateSiloLink]
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

  const silosCols = useMemo(
    () => [
      silosColHelper.accessor('siloId', {
        header: 'Silo',
        cell: (info) => <SiloNameFromId value={info.getValue()} />,
      }),
      silosColHelper.accessor('isDefault', {
        header: () => {
          return (
            <span className="inline-flex items-center gap-2">
              Silo default
              <TipIcon>
                When no pool is specified, IPs are allocated from the silo's default pool
                for the relevant version and type.
              </TipIcon>
            </span>
          )
        },
        cell: (info) => (info.getValue() ? <Badge>default</Badge> : null),
      }),
    ],
    []
  )

  const columns = useColsWithActions(silosCols, makeActions)
  const { table } = useQueryTable({
    query: ipPoolSiloList(poolSelector),
    columns,
    emptyState,
    getId: (link) => link.siloId,
  })

  return (
    <>
      <div className="mb-3 flex justify-end">
        <CreateButton onClick={() => setShowLinkModal(true)}>Link silo</CreateButton>
      </div>
      {table}
      {showLinkModal && <LinkSiloModal onDismiss={() => setShowLinkModal(false)} />}
    </>
  )
}

type LinkSiloFormValues = {
  silo: string | undefined
}

const defaultValues: LinkSiloFormValues = { silo: undefined }

function LinkSiloModal({ onDismiss }: { onDismiss: () => void }) {
  const { pool } = useIpPoolSelector()
  const { control, handleSubmit } = useForm({ defaultValues })

  const linkSilo = useApiMutation(api.ipPoolSiloLink, {
    onSuccess() {
      queryClient.invalidateEndpoint('ipPoolSiloList')
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

  const linkedSilos = useQuery(
    q(api.ipPoolSiloList, { path: { pool }, query: { limit: ALL_ISH } })
  )
  const allSilos = useQuery(q(api.siloList, { query: { limit: ALL_ISH } }))

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
        ? toComboboxItems(allSilos.data.items.filter((s) => !linkedSiloIds.has(s.id)))
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
