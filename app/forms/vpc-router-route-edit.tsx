/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate, type LoaderFunctionArgs } from 'react-router-dom'
import * as R from 'remeda'

import {
  apiQueryClient,
  useApiMutation,
  useApiQueryClient,
  usePrefetchedApiQuery,
} from '@oxide/api'

import { ListboxField } from '~/components/form/fields/ListboxField'
import { TextField } from '~/components/form/fields/TextField'
import { SideModalForm } from '~/components/form/SideModalForm'
import {
  fields,
  routeFormMessage,
  targetValueDescription,
  type EditFormValues,
} from '~/forms/vpc-router-route/shared'
import { getVpcRouterRouteSelector, useVpcRouterRouteSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { Message } from '~/ui/lib/Message'
import { pb } from '~/util/path-builder'

import { VpcRouterRouteCommonFields } from './vpc-router-route-create'

EditRouterRouteSideModalForm.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project, vpc, router, route } = getVpcRouterRouteSelector(params)
  await Promise.all([
    apiQueryClient.prefetchQuery('vpcRouterRouteView', {
      path: { route },
      query: { project, vpc, router },
    }),
    apiQueryClient.prefetchQuery('vpcSubnetList', {
      query: { project, vpc, limit: 1000 },
    }),
    apiQueryClient.prefetchQuery('instanceList', {
      query: { project, limit: 1000 },
    }),
  ])

  return null
}

export function EditRouterRouteSideModalForm() {
  const queryClient = useApiQueryClient()
  const routeSelector = useVpcRouterRouteSelector()
  const { project, vpc, router: routerName, route: routeName } = routeSelector
  const navigate = useNavigate()
  const { data: route } = usePrefetchedApiQuery('vpcRouterRouteView', {
    path: { route: routeName },
    query: { project, vpc, router: routerName },
  })

  const defaultValues: EditFormValues = R.pick(route, [
    'name',
    'description',
    'target',
    'destination',
  ])

  const onDismiss = () => {
    navigate(pb.vpcRouter({ project, vpc, router: routerName }))
  }

  const updateRouterRoute = useApiMutation('vpcRouterRouteUpdate', {
    onSuccess() {
      queryClient.invalidateQueries('vpcRouterRouteList')
      addToast({ content: 'Your route has been updated' })
      onDismiss()
    },
  })

  const form = useForm({ defaultValues })
  const targetType = form.watch('target.type')

  let isDisabled = false
  let disabledReason = ''

  // Can simplify this if there aren't other disabling reasons
  if (route?.kind === 'vpc_subnet') {
    isDisabled = true
    disabledReason = routeFormMessage.vpcSubnetNotModifiable
  }

  return (
    <SideModalForm
      form={form}
      formType="edit"
      resourceName="route"
      onDismiss={onDismiss}
      onSubmit={({ name, description, destination, target }) =>
        updateRouterRoute.mutate({
          query: { project, vpc, router: routerName },
          path: { route: routeName },
          body: {
            name,
            description,
            destination,
            // drop has no value
            target: target.type === 'drop' ? { type: target.type } : target,
          },
        })
      }
      loading={updateRouterRoute.isPending}
      submitError={updateRouterRoute.error}
    >
      {isDisabled && <Message variant="info" content={disabledReason} />}
      <VpcRouterRouteCommonFields control={form.control} isDisabled={isDisabled} />
      <ListboxField {...fields.destType} control={form.control} disabled={isDisabled} />
      <TextField {...fields.destValue} control={form.control} disabled={isDisabled} />
      <ListboxField
        {...fields.targetType}
        control={form.control}
        disabled={isDisabled}
        onChange={(value) => {
          // 'outbound' is only valid option when targetType is 'internet_gateway'
          if (value === 'internet_gateway') {
            form.setValue('target.value', 'outbound')
          }
          if (value === 'drop') {
            form.setValue('target.value', '')
          }
        }}
      />
      {targetType !== 'drop' && (
        <TextField
          {...fields.targetValue}
          control={form.control}
          // when targetType is 'internet_gateway', we set it to `outbound` and make it non-editable
          disabled={isDisabled || targetType === 'internet_gateway'}
          description={targetValueDescription(targetType)}
        />
      )}
    </SideModalForm>
  )
}
