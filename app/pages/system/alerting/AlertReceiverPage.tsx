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
import * as R from 'remeda'

import {
  api,
  q,
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
  type WebhookSecret,
} from '@oxide/api'
import { Webhooks24Icon } from '@oxide/design-system/icons/react'
import { Button } from '@oxide/design-system/ui'

import { isGlobPattern, isSubscribableClass, subscriptionRegex } from '~/api/util'
import { AlertClassBadge } from '~/components/AlertClassBadge'
import { ComboboxField } from '~/components/form/fields/ComboboxField'
import { validateSubscription } from '~/components/form/fields/SubscriptionsField'
import { TextField } from '~/components/form/fields/TextField'
import { ModalForm } from '~/components/form/ModalForm'
import { HL } from '~/components/HL'
import { MoreActionsMenu } from '~/components/MoreActionsMenu'
import { QueryParamTabs } from '~/components/QueryParamTabs'
import { SubscriptionMatchPreview } from '~/components/SubscriptionMatchPreview'
import { makeCrumb } from '~/hooks/use-crumbs'
import { getAlertReceiverSelector, useAlertReceiverSelector } from '~/hooks/use-params'
import { confirmAction } from '~/stores/confirm-action'
import { confirmDelete } from '~/stores/confirm-delete'
import { addToast } from '~/stores/toast'
import { useColsWithActions, type MenuAction } from '~/table/columns/action-col'
import { Columns } from '~/table/columns/common'
import { Table } from '~/table/Table'
import { CardBlock, LearnMore } from '~/ui/lib/CardBlock'
import { type ComboboxItem } from '~/ui/lib/Combobox'
import * as Dropdown from '~/ui/lib/DropdownMenu'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { InlineCode } from '~/ui/lib/InlineCode'
import { ItemLabel } from '~/ui/lib/ItemLabel'
import { Message } from '~/ui/lib/Message'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { TableEmptyBox } from '~/ui/lib/Table'
import { Tabs } from '~/ui/lib/Tabs'
import { HintLink } from '~/ui/lib/TextInput'
import { ALL_ISH } from '~/util/consts'
import { docLinks, links } from '~/util/links'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

import { DeliveriesTab, deliveryList } from './AlertReceiverDeliveries'
import { TestingTab } from './AlertReceiverTesting'

const receiverView = ({ receiver }: PP.AlertReceiver) =>
  q(api.alertReceiverView, { path: { receiver } })

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
      addToast(<>Webhook receiver <HL>{variables.path.receiver}</HL> deleted</>)
    },
  })

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Webhooks24Icon />}>{receiver.name}</PageTitle>
        <MoreActionsMenu label="Webhook receiver actions">
          <Dropdown.LinkItem to={pb.alertReceiverEdit(receiverSelector)}>
            Edit
          </Dropdown.LinkItem>
          <Dropdown.Item
            label="Delete"
            onSelect={confirmDelete({
              doDelete: () => deleteReceiver({ path: { receiver: receiver.name } }),
              label: receiver.name,
              resourceKind: 'webhook receiver',
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
          <SubscriptionsCard />
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

// Alert subscriptions

const subscriptionColHelper = createColumnHelper<{ subscription: string }>()
const subscriptionCols = [
  subscriptionColHelper.accessor('subscription', {
    header: 'Alert class',
    cell: (info) => <AlertClassBadge>{info.getValue()}</AlertClassBadge>,
  }),
]

function SubscriptionsCard() {
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
                receiver will no longer receive these alerts.
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
        title="Alert subscriptions"
        description="The alert classes the webhook receiver is subscribed to"
      >
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

  const classes = useQuery(q(api.alertClassList, { query: { limit: ALL_ISH } }))
  const subscribable = (classes.data?.items || []).filter(isSubscribableClass)
  // undefined while loading so an exact class isn't rejected as unknown before
  // the list arrives
  const classNames = classes.data ? new Set(subscribable.map((c) => c.name)) : undefined

  // leave out classes the receiver already gets, whether subscribed exactly or
  // covered by one of its globs, same as the create form's picker
  const globs = receiver.subscriptions.filter(isGlobPattern).map(subscriptionRegex)
  const classItems = subscribable
    .filter((c) => !receiver.subscriptions.includes(c.name))
    .filter((c) => !globs.some((re) => re.test(c.name)))
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
      title="Add subscription"
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
            Alert subscriptions may include simple globs to subscribe to multiple classes of
            alerts, like <InlineCode>hardware.**</InlineCode> or{' '}
            <InlineCode>**.remove</InlineCode>.
          </>
        }
      />
      <ComboboxField
        control={control}
        name="subscription"
        label="Subscription"
        placeholder="Enter alert pattern"
        items={classItems}
        isLoading={classes.isPending}
        allowArbitraryValues
        required
        validate={(value) => validateSubscription(value, classNames)}
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
            ? 'Deleting the only secret stops deliveries until a new one is added.'
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
      <CardBlock.Footer>
        <LearnMore doc={docLinks.webhookSecretRotation} />
      </CardBlock.Footer>
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
        description={
          <>
            Shared secret used to sign payloads. The value is not visible after adding.{' '}
            <HintLink href={links.webhookSecretsDocs}>Learn more about secrets</HintLink>
          </>
        }
        placeholder="Enter secret"
        control={form.control}
        required
      />
    </ModalForm>
  )
}
