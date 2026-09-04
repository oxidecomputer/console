/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useQuery } from '@tanstack/react-query'
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useCallback, useState, type ReactNode } from 'react'
import { match } from 'ts-pattern'

import {
  api,
  getListQFn,
  q,
  queryClient,
  snakeify,
  useApiMutation,
  type Alert,
  type AlertDelivery,
  type AlertDeliveryState,
  type WebhookDeliveryAttempt,
} from '@oxide/api'
import { Webhooks16Icon, Webhooks24Icon } from '@oxide/design-system/icons/react'
import { Badge, Button, type BadgeColor } from '@oxide/design-system/ui'

import { AlertClassBadge } from '~/components/AlertClassBadge'
import { useIntervalPicker } from '~/components/RefetchIntervalPicker'
import { useAlertReceiverSelector } from '~/hooks/use-params'
import { confirmAction } from '~/stores/confirm-action'
import { addToast } from '~/stores/toast'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { Table } from '~/table/Table'
import { CopyToClipboard } from '~/ui/lib/CopyToClipboard'
import { DateTime } from '~/ui/lib/DateTime'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { Listbox } from '~/ui/lib/Listbox'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { ResourceLabel, SideModal } from '~/ui/lib/SideModal'
import { TableEmptyBox } from '~/ui/lib/Table'
import { Tabs } from '~/ui/lib/Tabs'

type StateFilter = 'all' | AlertDeliveryState

const stateFilterParams = (filter: StateFilter) =>
  match(filter)
    .with('all', () => ({}))
    .with('delivered', () => ({ delivered: true }))
    .with('pending', () => ({ pending: true }))
    .with('failed', () => ({ failed: true }))
    .exhaustive()

export const deliveryList = (receiver: string, filter: StateFilter = 'all') =>
  getListQFn(api.alertDeliveryList, {
    path: { receiver },
    // sort newest first: the API's default is time_and_id_ascending
    query: { ...stateFilterParams(filter), sortBy: 'time_and_id_descending' },
  })

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
  deliveryColHelper.accessor('alertId', { ...Columns.shortId, header: 'Alert ID' }),
  deliveryColHelper.accessor('alertClass', {
    header: 'Alert class',
    cell: (info) => <AlertClassBadge>{info.getValue()}</AlertClassBadge>,
  }),
  deliveryColHelper.accessor('state', {
    cell: (info) => <DeliveryStateBadge state={info.getValue()} />,
  }),
  deliveryColHelper.accessor('timeStarted', { ...Columns.timeCreated, header: 'Started' }),
  deliveryColHelper.accessor('trigger', {
    cell: (info) => <Badge color="neutral">{info.getValue()}</Badge>,
  }),
]

export function DeliveriesTab() {
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
        // a pending delivery is already being retried, so a resend would only
        // queue a second copy of the same alert
        disabled:
          delivery.state === 'pending'
            ? 'This alert is already being delivered'
            : undefined,
        onActivate: () =>
          confirmAction({
            doAction: () =>
              resendDelivery({
                path: { alertId: delivery.alertId },
                query: { receiver },
              }),
            errorTitle: 'Could not resend alert',
            modalTitle: 'Confirm resend',
            modalContent: (
              <div className="space-y-4">
                <p>
                  Are you sure you want to resend this alert? The dispatcher will attempt to
                  deliver it again.
                </p>
                <PropertiesTable>
                  <PropertiesTable.Row label="Alert class">
                    <AlertClassBadge>{delivery.alertClass}</AlertClassBadge>
                  </PropertiesTable.Row>
                  <PropertiesTable.IdRow id={delivery.alertId} label="Alert ID" />
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
          ? 'Alerts delivered to this webhook receiver will show up here'
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

  // polling refreshes the list under the open side modal, so show the latest
  // version of the selected delivery. Fall back to the snapshot from click
  // time if it's no longer on the current page (paged or filtered out)
  const liveDelivery =
    selectedDelivery &&
    (query.data?.items.find((d) => d.id === selectedDelivery.id) ?? selectedDelivery)

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
      {liveDelivery && (
        <DeliverySideModal
          delivery={liveDelivery}
          onDismiss={() => setSelectedDelivery(null)}
        />
      )}
    </>
  )
}

export const attemptResultBadge = (result: WebhookDeliveryAttempt['result']) =>
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

  // fetched here rather than in RequestTab so it's usually ready by the time
  // that tab is opened. throwOnError off so a missing alert falls back to the
  // request tab's placeholders instead of hitting the error boundary
  const { data: alert } = useQuery(
    q(api.alertView, { path: { alertId: delivery.alertId } }, { throwOnError: false })
  )

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
        <PropertiesTable>
          <PropertiesTable.Row label="Alert class">
            <AlertClassBadge>{delivery.alertClass}</AlertClassBadge>
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
          <PropertiesTable.IdRow id={delivery.receiverId} label="Receiver ID" />
        </PropertiesTable>
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
            <RequestTab delivery={delivery} alert={alert} />
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
// the delivery record and the alert fetched by ID. The signature can't be
// known from here (it's an HMAC made with the receiver's secrets), so it shows
// up as an angle-bracket placeholder, as do alert data and version while the
// alert hasn't loaded.

const dataJson = (alert: Alert) =>
  JSON.stringify(snakeify(alert.alert), null, 2).replaceAll('\n', '\n  ')

const payloadJson = (delivery: AlertDelivery, sentAt: string, alert?: Alert) => `{
  "alert_class": ${JSON.stringify(delivery.alertClass)},
  "alert_version": ${alert ? alert.version : '<version>'},
  "alert_id": ${JSON.stringify(delivery.alertId)},
  "data": ${alert ? dataJson(alert) : '<alert data>'},
  "delivery": {
    "id": ${JSON.stringify(delivery.id)},
    "receiver_id": ${JSON.stringify(delivery.receiverId)},
    "sent_at": ${JSON.stringify(sentAt)},
    "trigger": ${JSON.stringify(delivery.trigger)}
  }
}`

const requestHeaders = (
  delivery: AlertDelivery,
  sentAt: string,
  alert?: Alert
): [string, string][] => [
  ['x-oxide-receiver-id', delivery.receiverId],
  ['x-oxide-delivery-id', delivery.id],
  ['x-oxide-alert-id', delivery.alertId],
  ['x-oxide-alert-class', delivery.alertClass],
  ['x-oxide-alert-version', alert ? alert.version.toString() : '<version>'],
  ['x-oxide-timestamp', sentAt],
  ['content-type', 'application/json'],
  // one signature header per secret on the receiver
  ['x-oxide-signature', 'a=sha256&id=<secret ID>&s=<signature>'],
]

function RequestTab({ delivery, alert }: { delivery: AlertDelivery; alert?: Alert }) {
  // every attempt is signed and timestamped when it is sent, so the timestamp
  // shown is the one from the most recent attempt
  const lastSent = delivery.attempts.webhook.at(-1)?.timeSent
  const sentAt = lastSent ? lastSent.toISOString() : '<timestamp>'
  const payload = payloadJson(delivery, sentAt, alert)
  const headers = requestHeaders(delivery, sentAt, alert)
  const headersText = headers.map(([name, value]) => `${name}: ${value}`).join('\n')

  return (
    <div className="space-y-6">
      <p className="text-sans-md text-secondary">
        The API does not return the request that was sent, so this is reconstructed from the
        delivery and alert records. Values in angle brackets are not available through the
        API.
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
