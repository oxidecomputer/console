/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { VpcRouterCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'

import { DescriptionField, NameField, SideModalForm } from 'app/components/form'
import { useForm, useToast, useVpcSelector } from 'app/hooks'

const defaultValues: VpcRouterCreate = {
  name: '',
  description: '',
}

type CreateVpcRouterFormProps = {
  onDismiss: () => void
}

export function CreateVpcRouterForm({ onDismiss }: CreateVpcRouterFormProps) {
  const vpcSelector = useVpcSelector()
  const queryClient = useApiQueryClient()
  const addToast = useToast()

  const createRouter = useApiMutation('vpcRouterCreate', {
    onSuccess(router) {
      queryClient.invalidateQueries('vpcRouterList')
      // avoid the vpc fetch when the vpc page loads since we have the data
      queryClient.setQueryData(
        'vpcRouterView',
        { path: { router: router.name }, query: vpcSelector },
        router
      )
      addToast({ content: 'Your VPC router has been created' })
      onDismiss()
    },
  })

  const form = useForm({ defaultValues })

  return (
    <SideModalForm
      id="create-vpc-router-form"
      title="Create VPC Router"
      form={form}
      onDismiss={onDismiss}
      onSubmit={({ name, description }) =>
        createRouter.mutate({ query: vpcSelector, body: { name, description } })
      }
      loading={createRouter.isPending}
      submitError={createRouter.error}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
    </SideModalForm>
  )
}
