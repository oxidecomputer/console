/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useEffect } from 'react'
import { useNavigate, type NavigateFunction } from 'react-router-dom'

import { useApiMutation, useApiQueryClient, type RouterRouteCreate } from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { ListboxField } from '~/components/form/fields/ListboxField'
import { NameField } from '~/components/form/fields/NameField'
import { TextField } from '~/components/form/fields/TextField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { fields } from '~/forms/vpc-router-route/shared'
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

  const onDismiss = (navigate: NavigateFunction) => {
    navigate(pb.vpcRouter(routerSelector))
  }

  const createRouterRoute = useApiMutation('vpcRouterRouteCreate', {
    onSuccess() {
      queryClient.invalidateQueries('vpcRouterRouteList')
      addToast({ content: 'Your route has been created' })
      onDismiss(navigate)
    },
  })

  const form = useForm({ defaultValues })
  const targetType = form.watch('target.type')

  // Clear target value when targetType changes to 'drop'
  useEffect(() => {
    targetType === 'drop' && form.setValue('target.value', '')
  }, [targetType, form])

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="route"
      onDismiss={() => navigate(pb.vpcRouter(routerSelector))}
      onSubmit={(body) => createRouterRoute.mutate({ query: routerSelector, body })}
      loading={createRouterRoute.isPending}
      submitError={createRouterRoute.error}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
      <ListboxField {...fields.destType} control={form.control} />
      <TextField {...fields.destValue} control={form.control} />
      <ListboxField {...fields.targetType} control={form.control} />
      {targetType !== 'drop' && (
        <TextField {...fields.targetValue} control={form.control} />
      )}
    </SideModalForm>
  )
}
