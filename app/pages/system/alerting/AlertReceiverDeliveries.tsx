/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useQuery } from '@tanstack/react-query'
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useCallback, useState } from 'react'
import { match } from 'ts-pattern'

import {
  api,
  getListQFn,
  q,
  queryClient,
  useApiMutation,
  type Alert,
  type AlertDelivery,
  type AlertDeliveryState,
  type WebhookDeliveryAttempt,
} from '@oxide/api'
import { Webhooks16Icon, Webhooks24Icon } from '@oxide/design-system/icons/react'
import { Badge, Button, type BadgeColor } from '@oxide/design-system/ui'

import { AlertBodyViewer } from '~/components/AlertBodyViewer'
import { AlertClassBadge } from '~/components/AlertClassBadge'
import { useIntervalPicker } from '~/components/RefetchIntervalPicker'
import { useAlertReceiverSelector } from '~/hooks/use-params'
import { confirmAction } from '~/stores/confirm-action'
import { addToast } from '~/stores/toast'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { useQueryTable } from '~/table/QueryTable'
import { Table } from '~/table/Table'
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

  // fetched here rather than in AlertTab so it's usually ready by the time
  // that tab is opened. throwOnError off so a missing alert shows an empty
  // state in the tab instead of hitting the error boundary
  const alertQuery = useQuery(
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
          <PropertiesTable.Row label="State">
            <DeliveryStateBadge state={delivery.state} />
          </PropertiesTable.Row>
          <PropertiesTable.Row label="Trigger">
            <Badge color="neutral">{delivery.trigger}</Badge>
          </PropertiesTable.Row>
          <PropertiesTable.Row label="Started">
            <DateTime date={delivery.timeStarted} />
          </PropertiesTable.Row>
          <PropertiesTable.IdRow id={delivery.id} label="Delivery ID" />
          <PropertiesTable.IdRow id={delivery.receiverId} label="Receiver ID" />
        </PropertiesTable>
        <Tabs.Root className="full-width" defaultValue="attempts">
          <Tabs.List aria-label="Delivery details">
            <Tabs.Trigger value="attempts">Attempts</Tabs.Trigger>
            <Tabs.Trigger value="alert">Alert</Tabs.Trigger>
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
          <Tabs.Content value="alert" className="px-8">
            <AlertTab
              alertId={delivery.alertId}
              alert={alertQuery.data}
              isError={alertQuery.isError}
            />
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

// Mirrors the alerts page detail modal, minus the class badge already shown in
// the delivery header above
function AlertTab({
  alertId,
  alert,
  isError,
}: {
  alertId: string
  alert: Alert | undefined
  isError: boolean
}) {
  return (
    <div className="space-y-6">
      <PropertiesTable>
        {/* from the delivery so the ID is available even if the alert isn't */}
        <PropertiesTable.IdRow id={alertId} label="Alert ID" />
        {alert && (
          <PropertiesTable.Row label="Class version">{alert.version}</PropertiesTable.Row>
        )}
      </PropertiesTable>
      {isError ? (
        <TableEmptyBox>
          <EmptyMessage
            title="Alert not found"
            body="The alert this delivery was for is no longer available"
          />
        </TableEmptyBox>
      ) : (
        // the fetch usually finishes before this tab is opened, so a blank
        // body for the rest of the load is fine
        alert && <AlertBodyViewer body={alert.alert} />
      )}
    </div>
  )
}
