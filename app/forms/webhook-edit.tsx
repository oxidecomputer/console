/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate, type LoaderFunctionArgs } from 'react-router'

import { api, q, queryClient, useApiMutation, usePrefetchedQuery } from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { TextField } from '~/components/form/fields/TextField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import { titleCrumb } from '~/hooks/use-crumbs'
import { getAlertReceiverSelector, useAlertReceiverSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

import { validateEndpoint } from './webhook-create'

const receiverView = ({ receiver }: PP.AlertReceiver) =>
  q(api.alertReceiverView, { path: { receiver } })

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const selector = getAlertReceiverSelector(params)
  await queryClient.prefetchQuery(receiverView(selector))
  return null
}

export const handle = titleCrumb('Edit webhook')

export default function EditWebhookSideModalForm() {
  const navigate = useNavigate()
  const receiverSelector = useAlertReceiverSelector()

  const { data: receiver } = usePrefetchedQuery(receiverView(receiverSelector))

  const form = useForm({
    defaultValues: {
      name: receiver.name,
      description: receiver.description,
      endpoint: receiver.kind.endpoint,
    },
  })

  const editWebhook = useApiMutation(api.webhookReceiverUpdate, {
    onSuccess(_data, variables) {
      queryClient.invalidateEndpoint('alertReceiverList')
      // the update endpoint returns nothing, so we rely on the submitted name
      const newName = variables.body.name || receiver.name
      navigate(pb.alertReceiver({ receiver: newName }))
      // prettier-ignore
      addToast(<>Webhook <HL>{newName}</HL> updated</>)

      // Only invalidate if we're staying on the same page. If the name _has_
      // changed, invalidating alertReceiverView causes an error page to flash
      // while the loader for the target page is running because the current
      // page's receiver gets cleared out while we're still on the page. If
      // we're navigating to a different page, its query will fetch anew
      // regardless.
      if (receiver.name === newName) {
        queryClient.invalidateEndpoint('alertReceiverView')
      }
    },
  })

  return (
    <SideModalForm
      form={form}
      formType="edit"
      resourceName="webhook"
      onDismiss={() => navigate(pb.alertReceiver(receiverSelector))}
      onSubmit={({ name, description, endpoint }) => {
        editWebhook.mutate({
          path: { receiver: receiver.name },
          body: { name, description, endpoint },
        })
      }}
      loading={editWebhook.isPending}
      submitError={editWebhook.error}
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
    </SideModalForm>
  )
}
