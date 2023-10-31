/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useApiMutation, useApiQueryClient, type VpcRouter } from '@oxide/api'
import { pick } from '@oxide/util'

import { DescriptionField, NameField, SideModalForm } from 'app/components/form'
import { useForm, useVpcSelector } from 'app/hooks'

type EditVpcRouterFormProps = {
  onDismiss: () => void
  editing: VpcRouter
}

export function EditVpcRouterForm({ onDismiss, editing }: EditVpcRouterFormProps) {
  const vpcSelector = useVpcSelector()
  const queryClient = useApiQueryClient()

  const updateRouter = useApiMutation('vpcRouterUpdate', {
    onSuccess() {
      queryClient.invalidateQueries('vpcRouterList')
      onDismiss()
    },
  })

  const defaultValues = pick(editing, 'name', 'description') /* satisfies VpcRouterUpdate */
  const form = useForm({ defaultValues })

  return (
    <SideModalForm
      id="edit-vpc-router-form"
      title="Edit VPC router"
      form={form}
      onDismiss={onDismiss}
      onSubmit={({ name, description }) => {
        updateRouter.mutate({
          path: { router: editing.name },
          query: vpcSelector,
          body: { name, description },
        })
      }}
      loading={updateRouter.isPending}
      submitError={updateRouter.error}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
    </SideModalForm>
  )
}
