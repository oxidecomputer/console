/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useQuery } from '@tanstack/react-query'
import { useController, useForm, useWatch, type Control } from 'react-hook-form'
import { useNavigate } from 'react-router'

import { api, q, queryClient, useApiMutation } from '@oxide/api'
import { Badge } from '@oxide/design-system/ui'

import { ALERT_SUBSCRIPTION_REGEX } from '~/api/util'
import { ComboboxField } from '~/components/form/fields/ComboboxField'
import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { TextField } from '~/components/form/fields/TextField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import { SubscriptionMatchPreview } from '~/components/SubscriptionMatchPreview'
import { titleCrumb } from '~/hooks/use-crumbs'
import { addToast } from '~/stores/toast'
import { ItemLabel } from '~/ui/lib/ItemLabel'
import { ClearAndAddButtons, MiniTable } from '~/ui/lib/MiniTable'
import { pb } from '~/util/path-builder'

export const validateEndpoint = (value: string) => {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return 'Must be a valid URL, including the scheme (e.g., https://)'
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return 'Must be an HTTP or HTTPS URL'
  }
}

// segments may only contain [a-zA-Z0-9_], unlike resource names
export const validateSubscription = (value: string) =>
  ALERT_SUBSCRIPTION_REGEX.test(value)
    ? undefined
    : 'Must be an event class or a glob pattern like hardware.** (letters, numbers, and underscores only)'

type WebhookCreateFormValues = {
  name: string
  description: string
  endpoint: string
  secret: string
  subscriptions: string[]
}

const defaultValues: WebhookCreateFormValues = {
  name: '',
  description: '',
  endpoint: '',
  secret: '',
  subscriptions: [],
}

const subscriptionColumns = [
  {
    header: 'Event class',
    cell: (subscription: string) => <Badge color="neutral">{subscription}</Badge>,
  },
]

function SubscriptionsField({ control }: { control: Control<WebhookCreateFormValues> }) {
  const { field } = useController({ control, name: 'subscriptions' })
  const subform = useForm({ defaultValues: { subscription: '' } })
  const subscription = useWatch({ control: subform.control, name: 'subscription' })

  const { data: classes } = useQuery(q(api.alertClassList, {}))
  const classItems = (classes?.items || [])
    .filter((c) => !field.value.includes(c.name))
    .map((c) => ({
      value: c.name,
      selectedLabel: c.name,
      label: <ItemLabel name={c.name}>{c.description}</ItemLabel>,
    }))

  const submitSubform = subform.handleSubmit(({ subscription }) => {
    if (!field.value.includes(subscription)) {
      field.onChange([...field.value, subscription])
    }
    subform.reset()
  })

  return (
    <>
      <ComboboxField
        control={subform.control}
        name="subscription"
        label="Event classes"
        description="Events to subscribe the webhook to. Globs like hardware.** match multiple classes."
        items={classItems}
        allowArbitraryValues
        onEnter={submitSubform}
        validate={validateSubscription}
        hideOptionalTag
      />
      <SubscriptionMatchPreview pattern={subscription} />
      <ClearAndAddButtons
        addButtonCopy="Add event class"
        disabled={!subscription}
        onClear={() => subform.reset()}
        onSubmit={submitSubform}
      />
      <MiniTable
        ariaLabel="Event classes"
        items={field.value}
        columns={subscriptionColumns}
        rowKey={(subscription) => subscription}
        onRemoveItem={(subscription) =>
          field.onChange(field.value.filter((s) => s !== subscription))
        }
        removeLabel={(subscription) => `remove subscription ${subscription}`}
      />
    </>
  )
}

export const handle = titleCrumb('New webhook')

export default function CreateWebhookSideModalForm() {
  const navigate = useNavigate()

  const onDismiss = () => navigate(pb.alertReceivers())

  const createWebhook = useApiMutation(api.webhookReceiverCreate, {
    onSuccess(receiver) {
      queryClient.invalidateEndpoint('alertReceiverList')
      // prettier-ignore
      addToast(<>Webhook <HL>{receiver.name}</HL> created</>)
      navigate(pb.alertReceivers())
    },
  })

  const form = useForm({ defaultValues })

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="webhook"
      onDismiss={onDismiss}
      onSubmit={({ name, description, endpoint, secret, subscriptions }) => {
        createWebhook.mutate({
          body: { name, description, endpoint, secrets: [secret], subscriptions },
        })
      }}
      loading={createWebhook.isPending}
      submitError={createWebhook.error}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
      <TextField
        name="endpoint"
        label="Endpoint URL"
        description="The URL that payloads should be sent to"
        control={form.control}
        required
        validate={validateEndpoint}
      />
      <TextField
        name="secret"
        label="Secret"
        description="Shared secret used to sign webhook payloads. More secrets can be added later."
        control={form.control}
        required
      />
      <SubscriptionsField control={form.control} />
    </SideModalForm>
  )
}
