/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm, type Control } from 'react-hook-form'
import { useNavigate, type LoaderFunctionArgs } from 'react-router-dom'

import {
  apiQueryClient,
  useApiMutation,
  useApiQueryClient,
  usePrefetchedApiQuery,
} from '@oxide/api'

import { ComboboxField } from '~/components/form/fields/ComboboxField'
import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { ListboxField } from '~/components/form/fields/ListboxField'
import { NameField } from '~/components/form/fields/NameField'
import { TextField } from '~/components/form/fields/TextField'
import { SideModalForm } from '~/components/form/SideModalForm'
import {
  fields,
  targetValueDescription,
  type CreateFormValues,
  type EditFormValues,
} from '~/forms/vpc-router-route/shared'
import { getVpcRouterSelector, useVpcRouterSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { pb } from '~/util/path-builder'

const defaultValues: CreateFormValues = {
  name: '',
  description: '',
  destination: { type: 'ip', value: '' },
  target: { type: 'ip', value: '' },
}

CreateRouterRouteSideModalForm.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project, vpc } = getVpcRouterSelector(params)
  await Promise.all([
    apiQueryClient.prefetchQuery('vpcSubnetList', {
      query: { project, vpc, limit: 1000 },
    }),
    apiQueryClient.prefetchQuery('instanceList', {
      query: { project, limit: 1000 },
    }),
  ])
  return null
}

export function CreateRouterRouteSideModalForm() {
  const queryClient = useApiQueryClient()
  const routerSelector = useVpcRouterSelector()
  const { project } = routerSelector
  const navigate = useNavigate()

  const {
    data: { items: instances },
  } = usePrefetchedApiQuery('instanceList', { query: { project, limit: 1000 } })
  console.log(instances)
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
  const destinationType = form.watch('destination.type')
  const targetType = form.watch('target.type')
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
      <VpcRouterRouteCommonFields
        control={form.control}
        destinationType={destinationType}
      />
      <ListboxField
        {...fields.targetType}
        control={form.control}
        onChange={(value) => {
          // 'outbound' is only valid option when targetType is 'internet_gateway'
          form.setValue('target.value', value === 'internet_gateway' ? 'outbound' : '')
        }}
      />
      {targetType === 'drop' ? null : targetType === 'instance' ? (
        <ComboboxField
          {...fields.targetValue}
          placeholder="Select a target value"
          control={form.control}
          items={instances.map(({ name }) => ({ value: name, label: name }))}
        />
      ) : (
        <TextField
          {...fields.targetValue}
          control={form.control}
          disabled={targetType === 'internet_gateway'}
          description={targetValueDescription(targetType)}
        />
      )}
    </SideModalForm>
  )
}

export const VpcRouterRouteCommonFields = ({
  control,
  isDisabled,
  destinationType,
}: {
  control: Control<CreateFormValues | EditFormValues>
  isDisabled?: boolean
  destinationType?: 'ip' | 'ip_net' | 'vpc' | 'subnet'
}) => {
  const routerSelector = useVpcRouterSelector()
  const { project, vpc } = routerSelector
  const {
    data: { items: vpcSubnets },
  } = usePrefetchedApiQuery('vpcSubnetList', { query: { project, vpc, limit: 1000 } })

  return (
    <>
      <NameField name="name" control={control} disabled={isDisabled} />
      <DescriptionField name="description" control={control} />
      <ListboxField {...fields.destType} control={control} />
      {destinationType === 'subnet' ? (
        <ComboboxField
          {...fields.destValue}
          placeholder="Select a destination value"
          control={control}
          items={vpcSubnets.map(({ name }) => ({ value: name, label: name }))}
        />
      ) : (
        <TextField {...fields.destValue} control={control} />
      )}
    </>
  )
}
