/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useMemo, useState } from 'react'
import { Link, Outlet, type LoaderFunctionArgs } from 'react-router-dom'

import {
  apiQueryClient,
  useApiMutation,
  useApiQuery,
  useApiQueryClient,
  usePrefetchedApiQuery,
  type IpPoolRange,
  type IpPoolSiloLink,
} from '@oxide/api'
import {
  DateCell,
  LinkCell,
  SkeletonCell,
  useQueryTable,
  type MenuAction,
} from '@oxide/table'
import {
  Badge,
  Button,
  buttonStyle,
  EmptyMessage,
  Message,
  Modal,
  Networking24Icon,
  PageHeader,
  PageTitle,
  Success12Icon,
  Tabs,
} from '@oxide/ui'

import { ExternalLink } from 'app/components/ExternalLink'
import { ListboxField } from 'app/components/form'
import { HL } from 'app/components/HL'
import { QueryParamTabs } from 'app/components/QueryParamTabs'
import { getIpPoolSelector, useForm, useIpPoolSelector } from 'app/hooks'
import { confirmAction } from 'app/stores/confirm-action'
import { addToast } from 'app/stores/toast'
import { links } from 'app/util/links'
import { pb } from 'app/util/path-builder'

IpPoolPage.loader = async function ({ params }: LoaderFunctionArgs) {
  const { pool } = getIpPoolSelector(params)
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
  ])
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

const RangesEmptyState = () => (
  <EmptyMessage
    icon={<Networking24Icon />}
    title="No IP ranges"
    body="Add a range to see it here"
    // TODO: link add range button
    // buttonText="Add range"
    // buttonTo={pb.ipPoolNew()}
  />
)

function IpRangesTable() {
  const { pool } = useIpPoolSelector()
  const { Table, Column } = useQueryTable('ipPoolRangeList', { path: { pool } })
  const queryClient = useApiQueryClient()

  const removeRange = useApiMutation('ipPoolRangeRemove', {
    onSuccess() {
      queryClient.invalidateQueries('ipPoolRangeList')
    },
  })

  const makeRangeActions = ({ range }: IpPoolRange): MenuAction[] => [
    {
      label: 'Remove',
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
              from the pool?
            </p>
          ),
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
      <Table emptyState={<RangesEmptyState />} makeActions={makeRangeActions}>
        {/* TODO: only showing the ID is ridiculous. we need names */}
        <Column accessor="range.first" header="First" />
        <Column accessor="range.last" header="Last" />
        <Column accessor="timeCreated" header="Created" cell={DateCell} />
      </Table>
    </>
  )
}

const SilosEmptyState = () => (
  <EmptyMessage
    icon={<Networking24Icon />}
    title="No IP pool associations"
    body="You need to link the IP pool to a silo to be able to see it here"
    // TODO: link silo button
    // buttonText="Link IP pool"
    // buttonTo={pb.ipPoolNew()}
  />
)

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

  // TODO: confirm action. make clear what linking means
  const makeActions = (link: IpPoolSiloLink): MenuAction[] => [
    {
      label: 'Unlink',
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
              able to allocate IPs from this pool.
            </p>
          ),
          errorTitle: 'Could not unlink silo',
        })
      },
    },
  ]

  const [showLinkModal, setShowLinkModal] = useState(false)

  return (
    <>
      <div className="mb-4 flex items-end justify-between space-x-2">
        <p className="mr-8 max-w-2xl text-sans-md text-secondary">
          Users in linked silos can allocate external IPs from this pool for their
          instances. A silo can have at most one default pool. IPs are allocated from the
          default pool when users ask for one without specifying a pool. Read the docs to
          learn more about{' '}
          <ExternalLink href={links.ipPoolsDocs}>managing IP pools</ExternalLink>.
        </p>
        <Button onClick={() => setShowLinkModal(true)} size="sm" className="shrink-0">
          Link silo
        </Button>
      </div>
      <Table emptyState={<SilosEmptyState />} makeActions={makeActions}>
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
