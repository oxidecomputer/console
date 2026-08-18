/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useController, useForm, useWatch, type Control } from 'react-hook-form'
import { useNavigate } from 'react-router'

import { api, queryClient, useApiMutation } from '@oxide/api'
import { Webhooks24Icon } from '@oxide/design-system/icons/react'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { ErrorMessage } from '~/components/form/fields/ErrorMessage'
import { NameField } from '~/components/form/fields/NameField'
import { SubscriptionsField } from '~/components/form/fields/SubscriptionsField'
import { TextField } from '~/components/form/fields/TextField'
import { Form } from '~/components/form/Form'
import { FullPageForm } from '~/components/form/FullPageForm'
import { HL } from '~/components/HL'
import { addToast } from '~/stores/toast'
import { FormDivider } from '~/ui/lib/Divider'
import { Message } from '~/ui/lib/Message'
import { ClearAndAddButtons, MiniTable } from '~/ui/lib/MiniTable'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { KEYS } from '~/ui/util/keys'
import { links } from '~/util/links'
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

export type WebhookCreateFormValues = {
  name: string
  description: string
  endpoint: string
  secrets: string[]
  subscriptions: string[]
}

const defaultValues: WebhookCreateFormValues = {
  name: '',
  description: '',
  endpoint: '',
  secrets: [],
  subscriptions: [],
}

const secretColumns = [
  {
    header: 'Secrets',
    cell: (secret: string) => secret,
  },
]

function SecretsField({ control }: { control: Control<WebhookCreateFormValues> }) {
  const { field, fieldState } = useController({
    control,
    name: 'secrets',
    rules: {
      validate: (secrets) => secrets.length > 0 || 'At least one secret is required',
    },
  })
  const subform = useForm({ defaultValues: { secret: '' } })
  const secret = useWatch({ control: subform.control, name: 'secret' })

  const submitSubform = subform.handleSubmit(({ secret }) => {
    if (!field.value.includes(secret)) {
      field.onChange([...field.value, secret])
    }
    subform.reset()
  })

  return (
    <>
      <div className="flex max-w-lg flex-col gap-3">
        <TextField
          control={subform.control}
          name="secret"
          label="Secret"
          description="Shared secret used to sign payloads"
          required
          onKeyDown={(e) => {
            if (e.key === KEYS.enter) {
              e.preventDefault() // prevent full form submission
              submitSubform(e)
            }
          }}
        />
        <ClearAndAddButtons
          addButtonCopy="Add secret"
          disabled={!secret}
          onClear={() => subform.reset()}
          onSubmit={submitSubform}
        />
      </div>
      <MiniTable
        className="max-w-lg"
        ariaLabel="Secrets"
        items={field.value}
        columns={secretColumns}
        rowKey={(secret) => secret}
        onRemoveItem={(secret) => field.onChange(field.value.filter((s) => s !== secret))}
        removeLabel={(secret) => `remove secret ${secret}`}
      />
      <ErrorMessage error={fieldState.error} label="Secrets" />
    </>
  )
}

const globCode = 'text-mono-sm bg-info-secondary text-info rounded-sm px-1'

const SubscriptionsMessage = (
  <>
    Alert subscriptions may include simple globs to subscribe to multiple  classes of
    alerts. E.g. <code className={globCode}>hardware.**</code> or{' '}
    <code className={globCode}>**.fault</code>.{' '}
    <a
      href={links.webhooksGuide}
      target="_blank"
      rel="noreferrer"
      className="mt-1 inline-block"
    >
      Read the Webhooks guide
    </a>{' '}
    and the{' '}
    <a href={links.webhooksApiDocs} target="_blank" rel="noreferrer">
      API docs
    </a>{' '}
    to learn more.
  </>
)

export const handle = { crumb: 'New webhook receiver' }

export default function CreateWebhookForm() {
  const navigate = useNavigate()

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
    <>
      <PageHeader>
        <PageTitle icon={<Webhooks24Icon />}>Create webhook receiver</PageTitle>
      </PageHeader>
      <FullPageForm
        id="create-webhook-form"
        form={form}
        onSubmit={async ({ name, description, endpoint, secrets, subscriptions }) => {
          await createWebhook.mutateAsync({
            body: { name, description, endpoint, secrets, subscriptions },
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
          description="The URL that webhook notification requests should be sent to"
          control={form.control}
          required
          validate={validateEndpoint}
        />
        <FormDivider />
        <Form.Heading id="subscriptions">Subscriptions</Form.Heading>
        <div className="flex flex-col gap-4">
          <SubscriptionsField control={form.control} />
          <Message variant="info" className="max-w-lg" content={SubscriptionsMessage} />
        </div>
        <FormDivider />
        <Form.Heading id="secrets">Secrets</Form.Heading>
        <SecretsField control={form.control} />
        <Form.Actions>
          <Form.Submit loading={createWebhook.isPending}>
            Create webhook receiver
          </Form.Submit>
          <Form.Cancel onClick={() => navigate(pb.alertReceivers())} />
        </Form.Actions>
      </FullPageForm>
    </>
  )
}
