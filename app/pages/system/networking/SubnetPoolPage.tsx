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
  type Silo,
  type SubnetPoolMember,
  type SubnetPoolSiloLink,
} from '@oxide/api'
import { Subnet16Icon, Subnet24Icon } from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { DocsPopover } from '~/components/DocsPopover'
import { ComboboxField } from '~/components/form/fields/ComboboxField'
import { HL } from '~/components/HL'
import { IpVersionBadge } from '~/components/IpVersionBadge'
import { MoreActionsMenu } from '~/components/MoreActionsMenu'
import { QueryParamTabs } from '~/components/QueryParamTabs'
import { makeCrumb } from '~/hooks/use-crumbs'
import { getSubnetPoolSelector, useSubnetPoolSelector } from '~/hooks/use-params'
import { useQuickActions } from '~/hooks/use-quick-actions'
import { confirmAction } from '~/stores/confirm-action'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { SkeletonCell } from '~/table/cells/EmptyCell'
import { LinkCell } from '~/table/cells/LinkCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { UtilizationFraction } from '~/ui/lib/BigNum'
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

const subnetPoolView = ({ subnetPool }: PP.SubnetPool) =>
  q(api.systemSubnetPoolView, { path: { pool: subnetPool } })
const subnetPoolSiloList = ({ subnetPool }: PP.SubnetPool) =>
  getListQFn(api.systemSubnetPoolSiloList, { path: { pool: subnetPool } })
const subnetPoolMemberList = ({ subnetPool }: PP.SubnetPool) =>
  getListQFn(api.systemSubnetPoolMemberList, { path: { pool: subnetPool } })
const siloList = q(api.siloList, { query: { limit: ALL_ISH } })
const siloView = ({ silo }: PP.Silo) => q(api.siloView, { path: { silo } })
const subnetPoolUtilizationView = ({ subnetPool }: PP.SubnetPool) =>
  q(api.systemSubnetPoolUtilizationView, { path: { pool: subnetPool } })
const siloSubnetPoolList = (silo: string) =>
  q(api.siloSubnetPoolList, { path: { silo }, query: { limit: ALL_ISH } })

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const selector = getSubnetPoolSelector(params)
  await Promise.all([
    queryClient.prefetchQuery(subnetPoolView(selector)),
    queryClient.fetchQuery(subnetPoolSiloList(selector).optionsFn()).then((links) => {
      for (const link of links.items.slice(0, 50)) {
        queryClient.prefetchQuery(siloSubnetPoolList(link.siloId))
      }
    }),
    queryClient.prefetchQuery(subnetPoolMemberList(selector).optionsFn()),
    queryClient.prefetchQuery(subnetPoolUtilizationView(selector)),
    queryClient.fetchQuery(siloList).then((silos) => {
      for (const silo of silos.items) {
        queryClient.setQueryData(siloView({ silo: silo.id }).queryKey, silo)
      }
    }),
  ])
  return null
}

export const handle = makeCrumb((p) => p.subnetPool!)

export default function SubnetPoolPage() {
  const poolSelector = useSubnetPoolSelector()
  const { data: pool } = usePrefetchedQuery(subnetPoolView(poolSelector))
  const { data: members } = usePrefetchedQuery(
    subnetPoolMemberList(poolSelector).optionsFn()
  )
  const navigate = useNavigate()
  const { mutateAsync: deletePool } = useApiMutation(api.systemSubnetPoolDelete, {
    onSuccess(_data, variables) {
      queryClient.invalidateEndpoint('systemSubnetPoolList')
      navigate(pb.subnetPools())
      // prettier-ignore
      addToast(<>Subnet pool <HL>{variables.path.pool}</HL> deleted</>)
    },
  })

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Subnet24Icon />}>{pool.name}</PageTitle>
        <div className="inline-flex gap-2">
          <DocsPopover
            heading="Subnet pools"
            icon={<Subnet16Icon />}
            summary="Subnet pools are collections of IP subnets you can assign to silos. When a pool is linked to a silo, users in that silo can allocate external subnets from the pool."
            links={[docLinks.subnetPools]}
          />
          <MoreActionsMenu label="Subnet pool actions">
            <Dropdown.LinkItem to={pb.subnetPoolEdit(poolSelector)}>Edit</Dropdown.LinkItem>
            <Dropdown.Item
              label="Delete"
              onSelect={confirmDelete({
                doDelete: () => deletePool({ path: { pool: pool.name } }),
                label: pool.name,
              })}
              disabled={
                !!members.items.length &&
                'Subnet pool cannot be deleted while it contains members'
              }
              className={members.items.length ? '' : 'destructive'}
            />
          </MoreActionsMenu>
        </div>
      </PageHeader>
      <PoolProperties />
      <QueryParamTabs className="full-width" defaultValue="members">
        <Tabs.List>
          <Tabs.Trigger value="members">Members</Tabs.Trigger>
          <Tabs.Trigger value="silos">Linked silos</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="members">
          <MembersTable />
        </Tabs.Content>
        <Tabs.Content value="silos">
          <LinkedSilosTable />
        </Tabs.Content>
      </QueryParamTabs>
      <Outlet />
    </>
  )
}

function PoolProperties() {
  const poolSelector = useSubnetPoolSelector()
  const { data: pool } = usePrefetchedQuery(subnetPoolView(poolSelector))
  const { data: utilization } = usePrefetchedQuery(subnetPoolUtilizationView(poolSelector))

  return (
    <PropertiesTable columns={2} className="-mt-8 mb-8">
      <PropertiesTable.IdRow id={pool.id} />
      <PropertiesTable.DescriptionRow description={pool.description} />
      <PropertiesTable.Row label="IP version">
        <IpVersionBadge ipVersion={pool.ipVersion} />
      </PropertiesTable.Row>
      <PropertiesTable.Row label="Addresses remaining">
        <span>
          <UtilizationFraction {...utilization} />
        </span>
      </PropertiesTable.Row>
      <PropertiesTable.DateRow date={pool.timeCreated} label="Created" />
      <PropertiesTable.DateRow date={pool.timeModified} label="Last Modified" />
    </PropertiesTable>
  )
}

const membersColHelper = createColumnHelper<SubnetPoolMember>()
const membersStaticCols = [
  membersColHelper.accessor('subnet', { header: 'Subnet' }),
  membersColHelper.accessor('minPrefixLength', { header: 'Min prefix length' }),
  membersColHelper.accessor('maxPrefixLength', { header: 'Max prefix length' }),
  membersColHelper.accessor('timeCreated', Columns.timeCreated),
]

function MembersTable() {
  const { subnetPool } = useSubnetPoolSelector()

  const { mutateAsync: removeMember } = useApiMutation(api.systemSubnetPoolMemberRemove, {
    onSuccess() {
      queryClient.invalidateEndpoint('systemSubnetPoolMemberList')
      queryClient.invalidateEndpoint('systemSubnetPoolUtilizationView')
    },
  })
  const emptyState = (
    <EmptyMessage
      icon={<Subnet24Icon />}
      title="No members"
      body="Add a member to see it here"
      buttonText="Add member"
      buttonTo={pb.subnetPoolMemberAdd({ subnetPool })}
    />
  )

  const makeMemberActions = useCallback(
    (member: SubnetPoolMember): MenuAction[] => [
      {
        label: 'Remove',
        className: 'destructive',
        onActivate: () =>
          confirmAction({
            doAction: () =>
              removeMember({
                path: { pool: subnetPool },
                body: { subnet: member.subnet },
              }),
            errorTitle: 'Could not remove member',
            modalTitle: 'Confirm remove member',
            modalContent: (
              <p>
                Are you sure you want to remove subnet <HL>{member.subnet}</HL> from the
                pool? This will fail if the subnet has any addresses in use.
              </p>
            ),
            actionType: 'danger',
          }),
      },
    ],
    [subnetPool, removeMember]
  )
  useQuickActions(
    () => [
      {
        value: 'Add member',
        navGroup: 'Actions',
        action: pb.subnetPoolMemberAdd({ subnetPool }),
      },
    ],
    [subnetPool]
  )

  const columns = useColsWithActions(membersStaticCols, makeMemberActions)
  const { table } = useQueryTable({
    query: subnetPoolMemberList({ subnetPool }),
    columns,
    emptyState,
  })

  return (
    <>
      <div className="mb-3 flex justify-end">
        <CreateLink to={pb.subnetPoolMemberAdd({ subnetPool })}>Add member</CreateLink>
      </div>
      {table}
    </>
  )
}

function SiloNameFromId({ value: siloId }: { value: string }) {
  const { data: silo } = useQuery(q(api.siloView, { path: { silo: siloId } }))

  if (!silo) return <SkeletonCell />

  return <LinkCell to={pb.siloSubnetPools({ silo: silo.name })}>{silo.name}</LinkCell>
}

const silosColHelper = createColumnHelper<SubnetPoolSiloLink>()
const silosCols = [
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
            When no pool is specified, subnets are allocated from the silo's default subnet
            pool for the relevant version.
          </TipIcon>
        </span>
      )
    },
    cell: (info) => (info.getValue() ? <Badge>default</Badge> : null),
  }),
]

function getSiloLabel(siloId: string) {
  const siloName = queryClient.getQueryData<Silo>(siloView({ silo: siloId }).queryKey)?.name
  // prettier-ignore
  return siloName
    ? <>silo <HL>{siloName}</HL></>
    : 'that silo'
}

function LinkedSilosTable() {
  const poolSelector = useSubnetPoolSelector()
  const { data: pool } = usePrefetchedQuery(subnetPoolView(poolSelector))

  const { mutateAsync: unlinkSilo } = useApiMutation(api.systemSubnetPoolSiloUnlink, {
    onSuccess() {
      queryClient.invalidateEndpoint('systemSubnetPoolSiloList')
    },
  })
  const { mutateAsync: updateSiloLink } = useApiMutation(api.systemSubnetPoolSiloUpdate, {
    onSuccess() {
      queryClient.invalidateEndpoint('systemSubnetPoolSiloList')
      queryClient.invalidateEndpoint('siloSubnetPoolList')
    },
  })

  const makeActions = useCallback(
    (link: SubnetPoolSiloLink): MenuAction[] => [
      {
        label: link.isDefault ? 'Clear default' : 'Make default',
        className: link.isDefault ? 'destructive' : undefined,
        onActivate() {
          const siloLabel = getSiloLabel(link.siloId)
          const versionLabel = `IP${pool.ipVersion}`

          if (link.isDefault) {
            confirmAction({
              doAction: () =>
                updateSiloLink({
                  path: { silo: link.siloId, pool: link.subnetPoolId },
                  body: { isDefault: false },
                }),
              modalTitle: 'Confirm clear default',
              modalContent: (
                <p>
                  Are you sure you want <HL>{pool.name}</HL> to stop being the default{' '}
                  {versionLabel} subnet pool for {siloLabel}? If there is no default, users
                  in this silo will have to specify a pool when allocating external subnets.
                </p>
              ),
              errorTitle: 'Could not clear default',
              actionType: 'danger',
            })
          } else {
            void queryClient
              .ensureQueryData(siloSubnetPoolList(link.siloId))
              .catch(() => null)
              .then((siloPools) => {
                const existingDefaultName = siloPools?.items.find(
                  (p) => p.isDefault && p.ipVersion === pool.ipVersion
                )?.name

                const modalContent = existingDefaultName ? (
                  <p>
                    Are you sure you want to change the default {versionLabel} subnet pool
                    for {siloLabel} from <HL>{existingDefaultName}</HL> to{' '}
                    <HL>{pool.name}</HL>?
                  </p>
                ) : (
                  <p>
                    Are you sure you want to make <HL>{pool.name}</HL> the default{' '}
                    {versionLabel} subnet pool for {siloLabel}?
                  </p>
                )

                const verb = existingDefaultName ? 'change' : 'make'
                confirmAction({
                  doAction: () =>
                    updateSiloLink({
                      path: { silo: link.siloId, pool: link.subnetPoolId },
                      body: { isDefault: true },
                    }),
                  modalTitle: `Confirm ${verb} default`,
                  modalContent,
                  errorTitle: `Could not ${verb} default`,
                  actionType: 'primary',
                })
              })
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
              unlinkSilo({ path: { silo: link.siloId, pool: link.subnetPoolId } }),
            modalTitle: 'Confirm unlink silo',
            modalContent: (
              <p>
                Are you sure you want to unlink {siloLabel} from <HL>{pool.name}</HL>? Users
                in the silo will no longer be able to allocate external subnets from this
                pool. Unlink will fail if there are any subnets from the pool in use in the
                silo.
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

  useQuickActions(
    () => [
      { value: 'Link silo', navGroup: 'Actions', action: () => setShowLinkModal(true) },
    ],
    []
  )

  const emptyState = (
    <EmptyMessage
      icon={<Subnet24Icon />}
      title="No linked silos"
      body="You can link this pool to a silo to see it here"
      buttonText="Link silo"
      onClick={() => setShowLinkModal(true)}
    />
  )

  const columns = useColsWithActions(silosCols, makeActions)
  const { table } = useQueryTable({
    query: subnetPoolSiloList(poolSelector),
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
  const { subnetPool } = useSubnetPoolSelector()
  const { control, handleSubmit } = useForm({ defaultValues })

  const linkSilo = useApiMutation(api.systemSubnetPoolSiloLink, {
    onSuccess() {
      queryClient.invalidateEndpoint('systemSubnetPoolSiloList')
      onDismiss()
    },
    onError(err) {
      addToast({ title: 'Could not link silo', content: err.message, variant: 'error' })
    },
  })

  function onSubmit({ silo }: LinkSiloFormValues) {
    if (!silo) return
    linkSilo.mutate({ path: { pool: subnetPool }, body: { silo, isDefault: false } })
  }

  const linkedSilos = useQuery(
    q(api.systemSubnetPoolSiloList, {
      path: { pool: subnetPool },
      query: { limit: ALL_ISH },
    })
  )
  const allSilos = useQuery(q(api.siloList, { query: { limit: ALL_ISH } }))

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
              content="Users in the selected silo will be able to allocate external subnets from this pool."
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
