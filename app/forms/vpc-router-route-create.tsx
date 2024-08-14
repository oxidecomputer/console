/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { useApiMutation, useApiQueryClient, type RouterRouteCreate } from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { ListboxField } from '~/components/form/fields/ListboxField'
import { NameField } from '~/components/form/fields/NameField'
import { TextField } from '~/components/form/fields/TextField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { fields, targetValueDescription } from '~/forms/vpc-router-route/shared'
import { useForm, useVpcRouterSelector } from '~/hooks'
import { addToast } from '~/stores/toast'
import { pb } from '~/util/path-builder'

const defaultValues: RouterRouteCreate = {
  name: '',
  description: '',
  destination: { type: 'ip', value: '' },
  target: { type: 'ip', value: '' },
}

export function CreateRouterRouteSideModalForm() {
  const queryClient = useApiQueryClient()
  const routerSelector = useVpcRouterSelector()
  const navigate = useNavigate()

  const onDismiss = () => {
    navigate(pb.vpcRouter(routerSelector))
  }

  const createRouterRoute = useApiMutation('vpcRouterRouteCreate', {
    onSuccess() {
      queryClient.invalidateQueries('vpcRouterRouteList')
      addToast({ content: 'Your route has been created' })
      onDismiss()
    },
  })

  const form = useForm({ defaultValues })
  const targetType = form.watch('target.type')

  useEffect(() => {
    // 'outbound' is only valid option when targetType is 'internet_gateway'
    targetType === 'internet_gateway' && form.setValue('target.value', 'outbound')
  }, [targetType, form])

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="route"
      onDismiss={onDismiss}
      onSubmit={({ name, description, destination, target }) =>
        createRouterRoute.mutate({
          query: routerSelector,
          body: {
            name,
            description,
            destination,
            // drop has no value
            target: target.type === 'drop' ? { type: target.type } : target,
          },
        })
      }
      loading={createRouterRoute.isPending}
      submitError={createRouterRoute.error}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
      <ListboxField {...fields.destType} control={form.control} />
      <TextField {...fields.destValue} control={form.control} />
      <ListboxField {...fields.targetType} control={form.control} />
      {targetType !== 'drop' && (
        <TextField
          {...fields.targetValue}
          control={form.control}
          // when targetType is 'internet_gateway', we set it to `outbound` and make it non-editable
          disabled={targetType === 'internet_gateway'}
          description={targetValueDescription(targetType)}
        />
      )}
    </SideModalForm>
  )
}
