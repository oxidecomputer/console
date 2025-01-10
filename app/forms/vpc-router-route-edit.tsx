/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate, type LoaderFunctionArgs } from 'react-router'
import * as R from 'remeda'

import {
  apiQueryClient,
  useApiMutation,
  useApiQueryClient,
  usePrefetchedApiQuery,
} from '@oxide/api'

import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import {
  RouteFormFields,
  routeFormMessage,
  type RouteFormValues,
} from '~/forms/vpc-router-route-common'
import { getVpcRouterRouteSelector, useVpcRouterRouteSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { ALL_ISH } from '~/util/consts'
import { pb } from '~/util/path-builder'

EditRouterRouteSideModalForm.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project, vpc, router, route } = getVpcRouterRouteSelector(params)
  await Promise.all([
    apiQueryClient.fetchQuery('vpcRouterRouteView', {
      path: { route },
      query: { project, vpc, router },
    }),
    apiQueryClient.fetchQuery('vpcSubnetList', {
      query: { project, vpc, limit: ALL_ISH },
    }),
    apiQueryClient.fetchQuery('instanceList', {
      query: { project, limit: ALL_ISH },
    }),
    apiQueryClient.fetchQuery('internetGatewayList', {
      query: { project, vpc, limit: ALL_ISH },
    }),
  ])
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
  const disabled = route?.kind === 'vpc_subnet'

  const updateRouterRoute = useApiMutation('vpcRouterRouteUpdate', {
    onSuccess(updatedRoute) {
      queryClient.invalidateQueries('vpcRouterRouteList')
      queryClient.invalidateQueries('vpcRouterRouteView')
      addToast(<>Route <HL>{updatedRoute.name}</HL> updated</>) // prettier-ignore
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
      submitDisabled={disabled ? routeFormMessage.vpcSubnetNotModifiable : undefined}
    >
      <RouteFormFields form={form} disabled={disabled} />
    </SideModalForm>
  )
}
