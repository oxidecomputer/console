/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useQuery } from '@tanstack/react-query'
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useCallback, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Outlet, useNavigate, type LoaderFunctionArgs } from 'react-router'
import { match } from 'ts-pattern'

import {
  api,
  getListQFn,
  q,
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
  type AlertDelivery,
  type AlertDeliveryState,
  type WebhookDeliveryAttempt,
  type WebhookSecret,
} from '@oxide/api'
import { Webhooks16Icon, Webhooks24Icon } from '@oxide/design-system/icons/react'
import { Badge, Button, type BadgeColor } from '@oxide/design-system/ui'

import { CheckboxField } from '~/components/form/fields/CheckboxField'
import { ComboboxField } from '~/components/form/fields/ComboboxField'
import { TextField } from '~/components/form/fields/TextField'
import { HL } from '~/components/HL'
import { MoreActionsMenu } from '~/components/MoreActionsMenu'
import { QueryParamTabs } from '~/components/QueryParamTabs'
import { SubscriptionMatchPreview } from '~/components/SubscriptionMatchPreview'
import { validateSubscription } from '~/forms/webhook-create'
import { makeCrumb } from '~/hooks/use-crumbs'
import { getAlertReceiverSelector, useAlertReceiverSelector } from '~/hooks/use-params'
import { confirmAction } from '~/stores/confirm-action'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { Table } from '~/table/Table'
import { CardBlock } from '~/ui/lib/CardBlock'
import { type ComboboxItem } from '~/ui/lib/Combobox'
import { DateTime } from '~/ui/lib/DateTime'
import * as Dropdown from '~/ui/lib/DropdownMenu'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { InlineCode } from '~/ui/lib/InlineCode'
import { ItemLabel } from '~/ui/lib/ItemLabel'
import { Listbox } from '~/ui/lib/Listbox'
import { Message } from '~/ui/lib/Message'
import { Modal } from '~/ui/lib/Modal'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { ResourceLabel, SideModal } from '~/ui/lib/SideModal'
import { Table as UITable, TableEmptyBox } from '~/ui/lib/Table'
import { Tabs } from '~/ui/lib/Tabs'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

const receiverView = ({ receiver }: PP.AlertReceiver) =>
  q(api.alertReceiverView, { path: { receiver } })

type StateFilter = 'all' | AlertDeliveryState

const stateFilterParams = (filter: StateFilter) =>
  match(filter)
    .with('all', () => ({}))
    .with('delivered', () => ({ delivered: true }))
    .with('pending', () => ({ pending: true }))
    .with('failed', () => ({ failed: true }))
    .exhaustive()

const deliveryList = (receiver: string, filter: StateFilter = 'all') =>
  getListQFn(api.alertDeliveryList, {
    path: { receiver },
    query: stateFilterParams(filter),
  })

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { receiver } = getAlertReceiverSelector(params)
  await Promise.all([
    queryClient.prefetchQuery(receiverView({ receiver })),
    queryClient.prefetchQuery(deliveryList(receiver).optionsFn()),
  ])
  return null
}

export const handle = makeCrumb((p) => p.receiver!)

export default function AlertReceiverPage() {
  const receiverSelector = useAlertReceiverSelector()
  const { data: receiver } = usePrefetchedQuery(receiverView(receiverSelector))
  const navigate = useNavigate()

  const { mutateAsync: deleteReceiver } = useApiMutation(api.alertReceiverDelete, {
    onSuccess(_data, variables) {
      navigate(pb.alertReceivers())
      queryClient.invalidateEndpoint('alertReceiverList')
      // prettier-ignore
      addToast(<>Webhook <HL>{variables.path.receiver}</HL> deleted</>)
    },
  })

  const [showProbeModal, setShowProbeModal] = useState(false)

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Webhooks24Icon />}>{receiver.name}</PageTitle>
        <MoreActionsMenu label="Webhook actions">
          <Dropdown.LinkItem to={pb.alertReceiverEdit(receiverSelector)}>
            Edit
          </Dropdown.LinkItem>
          <Dropdown.Item
            label="Send liveness probe"
            onSelect={() => setShowProbeModal(true)}
          />
          <Dropdown.Item
            label="Delete"
            onSelect={confirmDelete({
              doDelete: () => deleteReceiver({ path: { receiver: receiver.name } }),
              label: receiver.name,
              resourceKind: 'webhook',
              extraContent: 'Its delivery history will also be deleted.',
            })}
            className="destructive"
          />
        </MoreActionsMenu>
      </PageHeader>
      {showProbeModal && <ProbeModal onDismiss={() => setShowProbeModal(false)} />}
      <PropertiesTable columns={2} className="-mt-8 mb-8">
        <PropertiesTable.Row label="Endpoint">
          <span className="text-default">{receiver.kind.endpoint}</span>
        </PropertiesTable.Row>
        <PropertiesTable.DescriptionRow description={receiver.description} />
        <PropertiesTable.IdRow id={receiver.id} />
        <PropertiesTable.DateRow date={receiver.timeCreated} label="Created" />
      </PropertiesTable>
      <QueryParamTabs className="full-width" defaultValue="details">
        <Tabs.List>
          <Tabs.Trigger value="details">Details</Tabs.Trigger>
          <Tabs.Trigger value="deliveries">Deliveries</Tabs.Trigger>
          <Tabs.Trigger value="developer">Developer</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="details" className="space-y-6">
          <EventClassesCard />
          <SecretsCard />
        </Tabs.Content>
        <Tabs.Content value="deliveries">
          <DeliveriesTab />
        </Tabs.Content>
        <Tabs.Content value="developer" className="space-y-6">
          <DeveloperTab />
        </Tabs.Content>
      </QueryParamTabs>
      <Outlet /> {/* for edit form */}
    </>
  )
}

function ProbeModal({ onDismiss }: { onDismiss: () => void }) {
  const receiverSelector = useAlertReceiverSelector()
  const { control, handleSubmit } = useForm({ defaultValues: { resend: false } })

  const sendProbe = useApiMutation(api.alertReceiverProbe, {
    onSuccess(result) {
      queryClient.invalidateEndpoint('alertDeliveryList')
      if (result.probe.state === 'delivered') {
        const resends = result.resendsStarted
        addToast({
          title: 'Liveness probe delivered',
          content:
            resends != null
              ? `Resending ${resends} failed ${resends === 1 ? 'delivery' : 'deliveries'}`
              : undefined,
        })
      } else {
        addToast({ content: 'Liveness probe failed', variant: 'error' })
      }
      onDismiss()
    },
    onError(err) {
      addToast({ title: 'Could not send probe', content: err.message, variant: 'error' })
    },
  })

  const onSubmit = handleSubmit(({ resend }) => {
    sendProbe.mutate({ path: receiverSelector, query: { resend } })
  })

  return (
    <Modal isOpen onDismiss={onDismiss} title="Send liveness probe">
      <Modal.Body>
        <Modal.Section>
          <p>
            Sends a synthetic <InlineCode>probe</InlineCode> event to the endpoint to check
            that it is reachable. Probes do not count as real events and are not retried.
          </p>
          <CheckboxField name="resend" control={control}>
            Resend failed deliveries if the probe succeeds
          </CheckboxField>
        </Modal.Section>
      </Modal.Body>
      <Modal.Footer
        onDismiss={onDismiss}
        onAction={onSubmit}
        actionLoading={sendProbe.isPending}
        actionText="Send probe"
      />
    </Modal>
  )
}

// Developer: static documentation of the delivery request format. Headers and
// signature scheme are defined by RFD 538 and implemented in
// https://github.com/oxidecomputer/omicron/blob/32615a35/nexus/src/app/webhook.rs

const REQUEST_HEADERS: [string, string][] = [
  ['x-oxide-alert-id', 'UUID of the alert'],
  ['x-oxide-alert-class', 'Class of the alert'],
  ['x-oxide-delivery-id', 'UUID of this delivery, stable across retries'],
  ['x-oxide-receiver-id', 'UUID of this receiver'],
  ['x-oxide-signature', 'HMAC signature of the request body, one header per secret'],
]

function DeveloperTab() {
  return (
    <>
      <CardBlock>
        <CardBlock.Header
          title="Request format"
          description="Each delivery is an HTTP POST to the endpoint with a JSON body describing the alert"
        />
        <CardBlock.Body>
          <UITable aria-label="Request headers">
            <UITable.Header>
              <UITable.HeaderRow>
                <UITable.HeadCell>Header</UITable.HeadCell>
                <UITable.HeadCell>Description</UITable.HeadCell>
              </UITable.HeaderRow>
            </UITable.Header>
            <UITable.Body>
              {REQUEST_HEADERS.map(([name, description]) => (
                <UITable.Row key={name}>
                  <UITable.Cell>
                    <InlineCode>{name}</InlineCode>
                  </UITable.Cell>
                  <UITable.Cell>{description}</UITable.Cell>
                </UITable.Row>
              ))}
            </UITable.Body>
          </UITable>
        </CardBlock.Body>
      </CardBlock>
      <CardBlock>
        <CardBlock.Header
          title="Verifying payloads"
          description="Use the shared secrets to check that a request really came from the rack"
        />
        <CardBlock.Body>
          <p className="text-sans-md text-default">
            Requests are signed with HMAC-SHA256 using every secret on the receiver. Each
            request carries one <InlineCode>x-oxide-signature</InlineCode> header per secret
            in the form{' '}
            <InlineCode>a=sha256&id=&lt;secret ID&gt;&s=&lt;signature&gt;</InlineCode>. To
            verify a request, find the header whose <InlineCode>id</InlineCode> matches a
            secret you hold, compute the HMAC-SHA256 of the raw request body with that
            secret, and compare the hex digest to <InlineCode>s</InlineCode>.
          </p>
        </CardBlock.Body>
      </CardBlock>
    </>
  )
}

// Event classes

const subscriptionColHelper = createColumnHelper<{ subscription: string }>()
const subscriptionCols = [
  subscriptionColHelper.accessor('subscription', {
    header: 'Event class',
    cell: (info) => <Badge color="neutral">{info.getValue()}</Badge>,
  }),
]

function EventClassesCard() {
  const receiverSelector = useAlertReceiverSelector()
  const { data: receiver } = usePrefetchedQuery(receiverView(receiverSelector))
  const [showAddModal, setShowAddModal] = useState(false)

  const { mutateAsync: removeSubscription } = useApiMutation(
    api.alertReceiverSubscriptionRemove,
    {
      onSuccess(_data, variables) {
        queryClient.invalidateEndpoint('alertReceiverView')
        queryClient.invalidateEndpoint('alertReceiverList')
        // prettier-ignore
        addToast(<>Subscription <HL>{variables.path.subscription}</HL> removed</>)
      },
    }
  )

  const makeActions = useCallback(
    ({ subscription }: { subscription: string }): MenuAction[] => [
      {
        label: 'Remove',
        className: 'destructive',
        onActivate: () =>
          confirmAction({
            doAction: () =>
              removeSubscription({ path: { ...receiverSelector, subscription } }),
            errorTitle: 'Could not remove subscription',
            modalTitle: 'Remove subscription',
            modalContent: (
              <p>
                Are you sure you want to unsubscribe from <HL>{subscription}</HL>? The
                webhook will no longer receive these events.
              </p>
            ),
            actionType: 'danger',
          }),
      },
    ],
    [removeSubscription, receiverSelector]
  )

  const columns = useColsWithActions(subscriptionCols, makeActions)
  const rows = useMemo(
    () => receiver.subscriptions.map((subscription) => ({ subscription })),
    [receiver.subscriptions]
  )
  const table = useReactTable({ columns, data: rows, getCoreRowModel: getCoreRowModel() })

  return (
    <CardBlock>
      <CardBlock.Header
        title="Event classes"
        description="The event classes the webhook is subscribed to"
      >
        <Button size="sm" onClick={() => setShowAddModal(true)}>
          Add event class
        </Button>
      </CardBlock.Header>
      <CardBlock.Body>
        {rows.length ? (
          <Table table={table} aria-label="Event classes" />
        ) : (
          <TableEmptyBox>
            <EmptyMessage
              icon={<Webhooks24Icon />}
              title="No subscriptions"
              body="Subscribe to an event class to receive events"
            />
          </TableEmptyBox>
        )}
      </CardBlock.Body>
      {showAddModal && <AddSubscriptionModal onDismiss={() => setShowAddModal(false)} />}
    </CardBlock>
  )
}

// Combobox item showing the alert class name with its description underneath.
const toClassComboboxItem = ({
  name,
  description,
}: {
  name: string
  description: string
}): ComboboxItem => ({
  value: name,
  selectedLabel: name,
  label: <ItemLabel name={name}>{description}</ItemLabel>,
})

function AddSubscriptionModal({ onDismiss }: { onDismiss: () => void }) {
  const receiverSelector = useAlertReceiverSelector()
  const { data: receiver } = usePrefetchedQuery(receiverView(receiverSelector))
  const { control, handleSubmit } = useForm({ defaultValues: { subscription: '' } })
  const subscription = useWatch({ control, name: 'subscription' })

  const classes = useQuery(q(api.alertClassList, {}))
  const classItems = (classes.data?.items || [])
    .filter((c) => !receiver.subscriptions.includes(c.name))
    .map(toClassComboboxItem)

  const addSubscription = useApiMutation(api.alertReceiverSubscriptionAdd, {
    onSuccess(result) {
      queryClient.invalidateEndpoint('alertReceiverView')
      queryClient.invalidateEndpoint('alertReceiverList')
      // prettier-ignore
      addToast(<>Subscribed to <HL>{result.subscription}</HL></>)
      onDismiss()
    },
    onError(err) {
      addToast({
        title: 'Could not add subscription',
        content: err.message,
        variant: 'error',
      })
    },
  })

  const onSubmit = handleSubmit(({ subscription }) => {
    if (!subscription) return // can't happen, subscription is required
    addSubscription.mutate({ path: receiverSelector, body: { subscription } })
  })

  return (
    <Modal isOpen onDismiss={onDismiss} title="Add event class">
      <Modal.Body>
        <Modal.Section>
          <form
            autoComplete="off"
            onSubmit={(e) => {
              e.stopPropagation()
              onSubmit(e)
            }}
            className="space-y-4"
          >
            <Message
              variant="info"
              content={
                <>
                  Event subscriptions may include simple globs to subscribe to multiple
                  categories of events, like <InlineCode>hardware.**</InlineCode> or{' '}
                  <InlineCode>**.remove</InlineCode>.
                </>
              }
            />
            <ComboboxField
              control={control}
              name="subscription"
              label="Subscription"
              placeholder="Enter event pattern"
              items={classItems}
              isLoading={classes.isPending}
              allowArbitraryValues
              required
              validate={validateSubscription}
            />
            <SubscriptionMatchPreview pattern={subscription} />
          </form>
        </Modal.Section>
      </Modal.Body>
      <Modal.Footer
        onDismiss={onDismiss}
        onAction={onSubmit}
        actionLoading={addSubscription.isPending}
        actionText="Add"
      />
    </Modal>
  )
}

// Secrets

const secretColHelper = createColumnHelper<WebhookSecret>()
const secretCols = [
  secretColHelper.accessor('id', Columns.id),
  secretColHelper.accessor('timeCreated', Columns.timeCreated),
]

function SecretsCard() {
  const receiverSelector = useAlertReceiverSelector()
  const { data: receiver } = usePrefetchedQuery(receiverView(receiverSelector))
  const [showAddModal, setShowAddModal] = useState(false)

  const { mutateAsync: deleteSecret } = useApiMutation(api.webhookSecretsDelete, {
    onSuccess() {
      queryClient.invalidateEndpoint('alertReceiverView')
      addToast('Secret removed')
    },
  })

  const isOnlySecret = receiver.kind.secrets.length === 1
  const makeActions = useCallback(
    (secret: WebhookSecret): MenuAction[] => [
      {
        label: 'Delete',
        className: 'destructive',
        onActivate: confirmDelete({
          doDelete: () => deleteSecret({ path: { secretId: secret.id } }),
          label: secret.id,
          resourceKind: 'secret',
          extraContent: isOnlySecret
            ? 'This is the only secret on this receiver. Payloads sent without a secret are unsigned and cannot be verified.'
            : undefined,
        }),
      },
    ],
    [deleteSecret, isOnlySecret]
  )

  const columns = useColsWithActions(secretCols, makeActions)
  const table = useReactTable({
    columns,
    data: receiver.kind.secrets,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <CardBlock>
      <CardBlock.Header
        title="Secrets"
        description="Payloads are signed with every secret. Rotate by adding a new secret before deleting the old one."
      >
        <Button size="sm" onClick={() => setShowAddModal(true)}>
          Add secret
        </Button>
      </CardBlock.Header>
      <CardBlock.Body>
        {receiver.kind.secrets.length ? (
          <Table table={table} aria-label="Secrets" />
        ) : (
          <TableEmptyBox>
            <EmptyMessage
              icon={<Webhooks24Icon />}
              title="No secrets"
              body="Add a secret to sign webhook payloads"
            />
          </TableEmptyBox>
        )}
      </CardBlock.Body>
      {showAddModal && <AddSecretModal onDismiss={() => setShowAddModal(false)} />}
    </CardBlock>
  )
}

function AddSecretModal({ onDismiss }: { onDismiss: () => void }) {
  const { receiver } = useAlertReceiverSelector()
  const { control, handleSubmit } = useForm({ defaultValues: { secret: '' } })

  const addSecret = useApiMutation(api.webhookSecretsAdd, {
    onSuccess() {
      queryClient.invalidateEndpoint('alertReceiverView')
      addToast('Secret added')
      onDismiss()
    },
    onError(err) {
      addToast({ title: 'Could not add secret', content: err.message, variant: 'error' })
    },
  })

  const onSubmit = handleSubmit(({ secret }) => {
    if (!secret) return // can't happen, secret is required
    addSecret.mutate({ query: { receiver }, body: { secret } })
  })

  return (
    <Modal isOpen onDismiss={onDismiss} title="Add secret">
      <Modal.Body>
        <Modal.Section>
          <form
            autoComplete="off"
            onSubmit={(e) => {
              e.stopPropagation()
              onSubmit(e)
            }}
            className="space-y-4"
          >
            <TextField
              name="secret"
              label="Secret"
              description="Shared secret used to sign payloads. The value is not visible after adding."
              placeholder="Enter secret"
              control={control}
              required
            />
          </form>
        </Modal.Section>
      </Modal.Body>
      <Modal.Footer
        onDismiss={onDismiss}
        onAction={onSubmit}
        actionLoading={addSecret.isPending}
        actionText="Add"
      />
    </Modal>
  )
}

// Deliveries

const stateBadgeColor: Record<AlertDeliveryState, BadgeColor> = {
  delivered: 'default',
  pending: 'purple',
  failed: 'destructive',
}

const DeliveryStateBadge = ({ state }: { state: AlertDeliveryState }) => (
  <Badge color={stateBadgeColor[state]}>{state}</Badge>
)

const stateFilterItems: { value: StateFilter; label: string }[] = [
  { value: 'all', label: 'All states' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
]

const deliveryColHelper = createColumnHelper<AlertDelivery>()
const staticDeliveryCols = [
  deliveryColHelper.accessor('id', Columns.id),
  deliveryColHelper.accessor('alertClass', {
    header: 'Event class',
    cell: (info) => <Badge color="neutral">{info.getValue()}</Badge>,
  }),
  deliveryColHelper.accessor('state', {
    cell: (info) => <DeliveryStateBadge state={info.getValue()} />,
  }),
  deliveryColHelper.accessor('timeStarted', { ...Columns.timeCreated, header: 'started' }),
  deliveryColHelper.accessor('trigger', {
    cell: (info) => <Badge color="neutral">{info.getValue()}</Badge>,
  }),
]

function DeliveriesTab() {
  const { receiver } = useAlertReceiverSelector()
  const [filter, setFilter] = useState<StateFilter>('all')
  const [selectedDelivery, setSelectedDelivery] = useState<AlertDelivery | null>(null)

  const { mutateAsync: resendDelivery } = useApiMutation(api.alertDeliveryResend, {
    onSuccess() {
      queryClient.invalidateEndpoint('alertDeliveryList')
      addToast('Delivery resend started')
    },
  })

  const makeActions = useCallback(
    (delivery: AlertDelivery): MenuAction[] => [
      {
        label: 'View details',
        onActivate: () => setSelectedDelivery(delivery),
      },
      {
        label: 'Resend',
        disabled: delivery.trigger === 'probe' && 'Probes cannot be resent',
        onActivate: () =>
          confirmAction({
            doAction: () =>
              resendDelivery({
                path: { alertId: delivery.alertId },
                query: { receiver },
              }),
            errorTitle: 'Could not resend event',
            modalTitle: 'Confirm resend',
            modalContent: (
              <div className="space-y-4">
                <p>
                  Are you sure you want to resend this event? The dispatcher will attempt to
                  deliver it again.
                </p>
                <PropertiesTable>
                  <PropertiesTable.Row label="Event class">
                    <Badge color="neutral">{delivery.alertClass}</Badge>
                  </PropertiesTable.Row>
                  <PropertiesTable.IdRow id={delivery.alertId} label="Event ID" />
                  <PropertiesTable.Row label="Started">
                    <DateTime date={delivery.timeStarted} />
                  </PropertiesTable.Row>
                </PropertiesTable>
              </div>
            ),
            actionType: 'primary',
          }),
      },
    ],
    [resendDelivery, receiver]
  )

  const emptyState = (
    <EmptyMessage
      icon={<Webhooks24Icon />}
      title="No deliveries"
      body={
        filter === 'all'
          ? 'Events delivered to this webhook will show up here'
          : `No ${filter} deliveries found`
      }
    />
  )

  const columns = useColsWithActions(staticDeliveryCols, makeActions)
  const { table } = useQueryTable({
    query: deliveryList(receiver, filter),
    columns,
    emptyState,
  })

  return (
    <>
      <div className="mb-3 flex justify-end">
        <Listbox
          selected={filter}
          onChange={setFilter}
          items={stateFilterItems}
          label="Filter by state"
          hideLabel
          className="w-48"
        />
      </div>
      {table}
      {selectedDelivery && (
        <DeliverySideModal
          delivery={selectedDelivery}
          onDismiss={() => setSelectedDelivery(null)}
        />
      )}
    </>
  )
}

const attemptResultBadge = (result: WebhookDeliveryAttempt['result']) =>
  match(result)
    .with('succeeded', () => <Badge>Succeeded</Badge>)
    .with('failed_http_error', () => <Badge color="destructive">HTTP error</Badge>)
    .with('failed_unreachable', () => <Badge color="destructive">Unreachable</Badge>)
    .with('failed_timeout', () => <Badge color="destructive">Timeout</Badge>)
    .exhaustive()

const attemptColHelper = createColumnHelper<WebhookDeliveryAttempt>()
const attemptCols = [
  attemptColHelper.accessor('result', {
    header: 'Status',
    cell: (info) => attemptResultBadge(info.getValue()),
  }),
  attemptColHelper.accessor('timeSent', { ...Columns.timeCreated, header: 'Attempt' }),
  attemptColHelper.accessor((a) => a.response?.durationMs, {
    header: 'Duration',
    cell: (info) => {
      const ms = info.getValue()
      return ms != null ? `${ms}ms` : <span className="text-tertiary">&mdash;</span>
    },
  }),
]

function DeliverySideModal({
  delivery,
  onDismiss,
}: {
  delivery: AlertDelivery
  onDismiss: () => void
}) {
  const { receiver } = useAlertReceiverSelector()
  const attemptsTable = useReactTable({
    columns: attemptCols,
    data: delivery.attempts.webhook,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <SideModal
      isOpen
      onDismiss={onDismiss}
      title="Webhook delivery"
      subtitle={
        <ResourceLabel>
          <Webhooks16Icon /> {receiver}
        </ResourceLabel>
      }
    >
      <SideModal.Body>
        <SideModal.Section>
          <PropertiesTable>
            <PropertiesTable.Row label="Event class">
              <Badge color="neutral">{delivery.alertClass}</Badge>
            </PropertiesTable.Row>
            <PropertiesTable.IdRow id={delivery.id} />
            <PropertiesTable.Row label="Started">
              <DateTime date={delivery.timeStarted} />
            </PropertiesTable.Row>
            <PropertiesTable.Row label="State">
              <DeliveryStateBadge state={delivery.state} />
            </PropertiesTable.Row>
            <PropertiesTable.Row label="Trigger">
              <Badge color="neutral">{delivery.trigger}</Badge>
            </PropertiesTable.Row>
            <PropertiesTable.IdRow id={delivery.receiverId} label="Webhook ID" />
          </PropertiesTable>
          <div className="space-y-3">
            <SideModal.Heading>Attempts</SideModal.Heading>
            {delivery.attempts.webhook.length ? (
              <Table table={attemptsTable} aria-label="Attempts" />
            ) : (
              <TableEmptyBox>
                <EmptyMessage
                  title="No attempts yet"
                  body="Delivery has not been attempted"
                />
              </TableEmptyBox>
            )}
          </div>
        </SideModal.Section>
      </SideModal.Body>
      <SideModal.Footer>
        <Button variant="ghost" size="sm" onClick={onDismiss}>
          Close
        </Button>
      </SideModal.Footer>
    </SideModal>
  )
}
