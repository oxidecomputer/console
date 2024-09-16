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

import { SideModalForm } from '~/components/form/SideModalForm'
import {
  RouteFormFields,
  routeFormMessage,
  type RouteFormValues,
} from '~/forms/vpc-router-route-common'
import { getVpcRouterRouteSelector, useVpcRouterRouteSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { pb } from '~/util/path-builder'

EditRouterRouteSideModalForm.loader = async ({ params }: LoaderFunctionArgs) => {
  const { route, ...routerSelector } = getVpcRouterRouteSelector(params)
  await apiQueryClient.prefetchQuery('vpcRouterRouteView', {
    path: { route },
    query: routerSelector,
  })
  return null
}

export function EditRouterRouteSideModalForm() {
  const queryClient = useApiQueryClient()
  const { route: routeName, ...routerSelector } = useVpcRouterRouteSelector()
  const navigate = useNavigate()
  const { data: route } = usePrefetchedApiQuery('vpcRouterRouteView', {
    path: { route: routeName },
    query: routerSelector,
  })

  const defaultValues: RouteFormValues = R.pick(route, [
    'name',
    'description',
    'target',
    'destination',
  ])
  const form = useForm({ defaultValues })
  const isDisabled = route?.kind === 'vpc_subnet'

  const updateRouterRoute = useApiMutation('vpcRouterRouteUpdate', {
    onSuccess() {
      queryClient.invalidateQueries('vpcRouterRouteList')
      addToast({ content: 'Your route has been updated' })
      navigate(pb.vpcRouter(routerSelector))
    },
  })

  return (
    <SideModalForm
      form={form}
      formType="edit"
      resourceName="route"
      onDismiss={() => navigate(pb.vpcRouter(routerSelector))}
      onSubmit={({ name, description, destination, target }) =>
        updateRouterRoute.mutate({
          path: { route: routeName },
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
      loading={updateRouterRoute.isPending}
      submitError={updateRouterRoute.error}
      submitDisabled={isDisabled ? routeFormMessage.vpcSubnetNotModifiable : undefined}
    >
      <RouteFormFields form={form} isDisabled={isDisabled} />
    </SideModalForm>
  )
}
