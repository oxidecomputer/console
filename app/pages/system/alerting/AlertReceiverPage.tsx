/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useQuery } from '@tanstack/react-query'
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Outlet, useNavigate, type LoaderFunctionArgs } from 'react-router'
import * as R from 'remeda'
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
  type AlertProbeResult,
  type WebhookDeliveryAttempt,
  type WebhookSecret,
} from '@oxide/api'
import {
  Error12Icon,
  Success12Icon,
  Webhooks16Icon,
  Webhooks24Icon,
} from '@oxide/design-system/icons/react'
import { Badge, Button, type BadgeColor } from '@oxide/design-system/ui'

import { isSubscribableClass } from '~/api/util'
import { ComboboxField } from '~/components/form/fields/ComboboxField'
import { validateSubscription } from '~/components/form/fields/SubscriptionsField'
import { TextField } from '~/components/form/fields/TextField'
import { ModalForm } from '~/components/form/ModalForm'
import { HL } from '~/components/HL'
import { MoreActionsMenu } from '~/components/MoreActionsMenu'
import { QueryParamTabs } from '~/components/QueryParamTabs'
import { useIntervalPicker } from '~/components/RefetchIntervalPicker'
import { SubscriptionMatchPreview } from '~/components/SubscriptionMatchPreview'
import { makeCrumb } from '~/hooks/use-crumbs'
import { getAlertReceiverSelector, useAlertReceiverSelector } from '~/hooks/use-params'
import { confirmAction } from '~/stores/confirm-action'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { EmptyCell } from '~/table/cells/EmptyCell'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { Table } from '~/table/Table'
import { CardBlock } from '~/ui/lib/CardBlock'
import { type ComboboxItem } from '~/ui/lib/Combobox'
import { CopyToClipboard } from '~/ui/lib/CopyToClipboard'
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
import { TableEmptyBox } from '~/ui/lib/Table'
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

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Webhooks24Icon />}>{receiver.name}</PageTitle>
        <MoreActionsMenu label="Webhook actions">
          <Dropdown.LinkItem to={pb.alertReceiverEdit(receiverSelector)}>
            Edit
          </Dropdown.LinkItem>
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
          <Tabs.Trigger value="testing">Testing</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="details" className="space-y-6">
          <EventClassesCard />
          <SecretsCard />
        </Tabs.Content>
        <Tabs.Content value="deliveries">
          <DeliveriesTab />
        </Tabs.Content>
        <Tabs.Content value="testing" className="space-y-6">
          <TestingTab />
        </Tabs.Content>
      </QueryParamTabs>
      <Outlet /> {/* for edit form */}
    </>
  )
}

// Testing: send a liveness probe and show the result, plus static documentation
// of the signature scheme, which is defined by RFD 538 and implemented in
// https://github.com/oxidecomputer/omicron/blob/32615a35/nexus/src/app/webhook.rs

function TestingTab() {
  return (
    <>
      <WebhookTesterCard />
      <SignatureFormatCard />
    </>
  )
}

function WebhookTesterCard() {
  const [showProbeModal, setShowProbeModal] = useState(false)
  const [result, setResult] = useState<AlertProbeResult | null>(null)

  return (
    <CardBlock>
      <CardBlock.Header
        title="Webhook tester"
        description="Send test events to your endpoint"
      >
        <Button size="sm" onClick={() => setShowProbeModal(true)}>
          Send liveness probe
        </Button>
      </CardBlock.Header>
      <CardBlock.Body>
        <p className="text-sans-md text-default">
          To test your integration, send a liveness probe to the endpoint.
        </p>
        {result ? (
          <ProbeResult result={result} />
        ) : (
          <TableEmptyBox>
            <EmptyMessage
              title="Probe result"
              body="Send a liveness probe to see the result here"
            />
          </TableEmptyBox>
        )}
      </CardBlock.Body>
      {showProbeModal && (
        <ProbeModal onDismiss={() => setShowProbeModal(false)} onSuccess={setResult} />
      )}
    </CardBlock>
  )
}

function ProbeResult({ result }: { result: AlertProbeResult }) {
  // a probe is delivered once and never retried, so there is at most one attempt
  const attempt = result.probe.attempts.webhook.at(0)
  if (!attempt) return null // can't happen: the API always returns the attempt it made

  const status = attempt.response?.status
  const durationMs = attempt.response?.durationMs

  return (
    <PropertiesTable>
      <PropertiesTable.Row label="Result">
        {attemptResultBadge(attempt.result)}
      </PropertiesTable.Row>
      <PropertiesTable.Row label="Status">
        {status ? (
          <span className="flex items-center gap-1.5">
            {attempt.result === 'succeeded' ? (
              <Success12Icon className="text-accent" />
            ) : (
              <Error12Icon className="text-error" />
            )}
            {status}
          </span>
        ) : (
          <EmptyCell />
        )}
      </PropertiesTable.Row>
      <PropertiesTable.Row label="Duration">
        {durationMs != null ? `${durationMs}ms` : <EmptyCell />}
      </PropertiesTable.Row>
      <PropertiesTable.Row label="Sent">
        <DateTime date={attempt.timeSent} />
      </PropertiesTable.Row>
    </PropertiesTable>
  )
}

function ProbeModal({
  onDismiss,
  onSuccess,
}: {
  onDismiss: () => void
  onSuccess: (result: AlertProbeResult) => void
}) {
  const receiverSelector = useAlertReceiverSelector()

  const sendProbe = useApiMutation(api.alertReceiverProbe, {
    onSuccess(result) {
      queryClient.invalidateEndpoint('alertDeliveryList')
      onSuccess(result)
      onDismiss()
    },
    onError(err) {
      addToast({ title: 'Could not send probe', content: err.message, variant: 'error' })
    },
  })

  return (
    <Modal isOpen onDismiss={onDismiss} title="Send liveness probe">
      <Modal.Body>
        <Modal.Section>
          <p>
            Sends a synthetic <InlineCode>probe</InlineCode> event to the endpoint to check
            that it is reachable.
          </p>
        </Modal.Section>
      </Modal.Body>
      <Modal.Footer
        onDismiss={onDismiss}
        onAction={() => sendProbe.mutate({ path: receiverSelector })}
        actionLoading={sendProbe.isPending}
        actionText="Send probe"
      />
    </Modal>
  )
}

const SIGNATURE_PARTS: [string, string][] = [
  ['algorithm', 'Currently only the SHA256 algorithm is supported'],
  ['secret-id', 'The ID of the secret used to create the signature'],
  ['signature', 'The HMAC signature of the request body'],
]

function SignatureFormatCard() {
  return (
    <CardBlock>
      <CardBlock.Header title="Signature format" />
      <CardBlock.Body>
        <p className="text-sans-md text-default">
          For each secret key assigned to a webhook receiver, an{' '}
          <InlineCode>x-oxide-signature</InlineCode> header is added with the HMAC digest of
          the payload signed with that secret key. This data is encoded in the following
          format:
        </p>
        <pre className="text-mono-md bg-raise border-secondary w-full rounded-md border px-4 py-3 tracking-normal! normal-case!">
          a=&#123;algorithm&#125;&id=&#123;secret-id&#125;&s=&#123;signature&#125;
        </pre>
        <dl className="text-sans-md space-y-1">
          {SIGNATURE_PARTS.map(([name, description]) => (
            <div key={name} className="flex gap-2">
              <dt className="text-sans-semi-md text-raise">{name}:</dt>
              <dd className="text-default">{description}</dd>
            </div>
          ))}
        </dl>
      </CardBlock.Body>
    </CardBlock>
  )
}

// Alert classes

const subscriptionColHelper = createColumnHelper<{ subscription: string }>()
const subscriptionCols = [
  subscriptionColHelper.accessor('subscription', {
    header: 'Alert class',
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
        title="Alert subscriptions"
        description="The alert classes the webhook receiver is subscribed to"
        <Button size="sm" onClick={() => setShowAddModal(true)}>
          Add subscription
        </Button>
      </CardBlock.Header>
      <CardBlock.Body>
        {rows.length ? (
          <Table table={table} aria-label="Alert classes" />
        ) : (
          <TableEmptyBox>
            <EmptyMessage
              icon={<Webhooks24Icon />}
              title="No subscriptions"
              body="Subscribe to an alert class to receive alerts"
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
  const form = useForm({ defaultValues: { subscription: '' } })
  const { control } = form
  const subscription = useWatch({ control, name: 'subscription' })

  const classes = useQuery(q(api.alertClassList, {}))
  const classItems = (classes.data?.items || [])
    .filter(isSubscribableClass)
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
  })

  return (
    <ModalForm
      form={form}
      onDismiss={onDismiss}
      title="Add event class"
      submitLabel="Add"
      onSubmit={({ subscription }) =>
        addSubscription.mutate({ path: receiverSelector, body: { subscription } })
      }
      loading={addSubscription.isPending}
      submitError={addSubscription.error}
    >
      <Message
        variant="info"
        content={
          <>
            Event subscriptions may include simple globs to subscribe to multiple categories
            of events, like <InlineCode>hardware.**</InlineCode> or{' '}
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
    </ModalForm>
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
  // API returns secrets oldest first, but newest is more interesting
  const secrets = useMemo(
    () => R.sortBy(receiver.kind.secrets, [(s) => s.timeCreated, 'desc']),
    [receiver.kind.secrets]
  )
  const table = useReactTable({
    columns,
    data: secrets,
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
  const form = useForm({ defaultValues: { secret: '' } })

  const addSecret = useApiMutation(api.webhookSecretsAdd, {
    onSuccess() {
      queryClient.invalidateEndpoint('alertReceiverView')
      addToast('Secret added')
      onDismiss()
    },
  })

  return (
    <ModalForm
      form={form}
      onDismiss={onDismiss}
      title="Add secret"
      submitLabel="Add"
      onSubmit={({ secret }) => addSecret.mutate({ query: { receiver }, body: { secret } })}
      loading={addSecret.isPending}
      submitError={addSecret.error}
    >
      <TextField
        name="secret"
        label="Secret"
        description="Shared secret used to sign payloads. The value is not visible after adding."
        placeholder="Enter secret"
        control={form.control}
        required
      />
    </ModalForm>
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
  // shortId for these two to force truncation
  deliveryColHelper.accessor('id', { ...Columns.shortId, header: 'Delivery ID' }),
  deliveryColHelper.accessor('alertId', { ...Columns.shortId, header: 'Event ID' }),
  deliveryColHelper.accessor('alertClass', {
    header: 'Event class',
    cell: (info) => <Badge color="neutral">{info.getValue()}</Badge>,
  }),
  deliveryColHelper.accessor('state', {
    cell: (info) => <DeliveryStateBadge state={info.getValue()} />,
  }),
  deliveryColHelper.accessor('timeStarted', { ...Columns.timeCreated, header: 'Started' }),
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
  const { table, query } = useQueryTable({
    query: deliveryList(receiver, filter),
    columns,
    emptyState,
  })

  // deliveries are dispatched asynchronously, so pending ones resolve on their
  // own while the page is open
  const { intervalPicker } = useIntervalPicker({
    enabled: true,
    isLoading: query.isFetching,
    fn: () => queryClient.invalidateEndpoint('alertDeliveryList'),
  })

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        {intervalPicker}
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
            <PropertiesTable.Row label="Alert class">
              <Badge color="neutral">{delivery.alertClass}</Badge>
            </PropertiesTable.Row>
            <PropertiesTable.IdRow id={delivery.id} label="Delivery ID" />
            <PropertiesTable.IdRow id={delivery.alertId} label="Alert ID" />
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
        </SideModal.Section>
        <Tabs.Root className="full-width" defaultValue="attempts">
          <Tabs.List aria-label="Delivery details">
            <Tabs.Trigger value="attempts">Attempts</Tabs.Trigger>
            <Tabs.Trigger value="request">Request</Tabs.Trigger>
          </Tabs.List>
          {/* full-width tabs put the panel at the modal gutter; the extra
              padding lines the content up with the properties table above */}
          <Tabs.Content value="attempts" className="px-8">
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
          </Tabs.Content>
          <Tabs.Content value="request" className="px-8">
            <RequestTab delivery={delivery} />
          </Tabs.Content>
        </Tabs.Root>
      </SideModal.Body>
      <SideModal.Footer>
        <Button variant="ghost" size="sm" onClick={onDismiss}>
          Close
        </Button>
      </SideModal.Footer>
    </SideModal>
  )
}

// The delivery request format is defined by RFD 538 and built in
// https://github.com/oxidecomputer/omicron/blob/32615a35/nexus/src/app/webhook.rs#L395-L555
// The API does not return the request that was sent, so we reconstruct it from
// the delivery record. Alert data, the alert version, and the signature can't
// be known from here, so they show up as angle-bracket placeholders.
const payloadJson = (delivery: AlertDelivery, sentAt: string) => `{
  "alert_class": ${JSON.stringify(delivery.alertClass)},
  "alert_version": <version>,
  "alert_id": ${JSON.stringify(delivery.alertId)},
  "data": <alert data>,
  "delivery": {
    "id": ${JSON.stringify(delivery.id)},
    "receiver_id": ${JSON.stringify(delivery.receiverId)},
    "sent_at": ${JSON.stringify(sentAt)},
    "trigger": ${JSON.stringify(delivery.trigger)}
  }
}`

const requestHeaders = (delivery: AlertDelivery, sentAt: string): [string, string][] => [
  ['x-oxide-receiver-id', delivery.receiverId],
  ['x-oxide-delivery-id', delivery.id],
  ['x-oxide-alert-id', delivery.alertId],
  ['x-oxide-alert-class', delivery.alertClass],
  ['x-oxide-alert-version', '<version>'],
  ['x-oxide-timestamp', sentAt],
  ['content-type', 'application/json'],
  // one signature header per secret on the receiver
  ['x-oxide-signature', 'a=sha256&id=<secret ID>&s=<signature>'],
]

function RequestTab({ delivery }: { delivery: AlertDelivery }) {
  // every attempt is signed and timestamped when it is sent, so the timestamp
  // shown is the one from the most recent attempt
  const lastSent = delivery.attempts.webhook.at(-1)?.timeSent
  const sentAt = lastSent ? lastSent.toISOString() : '<timestamp>'
  const payload = payloadJson(delivery, sentAt)
  const headers = requestHeaders(delivery, sentAt)
  const headersText = headers.map(([name, value]) => `${name}: ${value}`).join('\n')

  return (
    <div className="space-y-6">
      <p className="text-sans-md text-secondary">
        The API does not return the request that was sent, so this is reconstructed from the
        delivery record. Values in angle brackets are not available through the API.
      </p>
      <RequestSection title="Payload" copyText={payload}>
        <pre className="text-mono-md border-secondary bg-default w-full overflow-x-auto rounded-md border px-4 py-3 tracking-normal! normal-case!">
          {payload}
        </pre>
      </RequestSection>
      <RequestSection title="Headers" copyText={headersText}>
        <div className="border-secondary *:border-b-secondary rounded-md border *:border-b *:px-4 *:py-3 *:last:border-b-0">
          {headers.map(([name, value]) => (
            <div key={name}>
              <div className="text-mono-sm text-secondary">{name}</div>
              <div className="text-sans-md text-default break-all">{value}</div>
            </div>
          ))}
        </div>
      </RequestSection>
    </div>
  )
}

function RequestSection({
  title,
  copyText,
  children,
}: {
  title: string
  copyText: string
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <SideModal.Heading>{title}</SideModal.Heading>
        <CopyToClipboard text={copyText} ariaLabel={`Copy ${title.toLowerCase()}`} />
      </div>
      {children}
    </div>
  )
}
