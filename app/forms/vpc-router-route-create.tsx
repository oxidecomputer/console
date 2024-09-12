/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { useApiMutation, useApiQueryClient } from '@oxide/api'

import { SideModalForm } from '~/components/form/SideModalForm'
import { RouteFormFields, type RouteFormValues } from '~/forms/vpc-router-route-common'
import { useVpcRouterSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { pb } from '~/util/path-builder'

export function CreateRouterRouteSideModalForm() {
  const queryClient = useApiQueryClient()
  const routerSelector = useVpcRouterSelector()
  const navigate = useNavigate()

  const defaultValues: RouteFormValues = {
    name: '',
    description: '',
    destination: { type: 'ip', value: '' },
    target: { type: 'ip', value: '' },
  }
  const form = useForm({ defaultValues })

  const createRouterRoute = useApiMutation('vpcRouterRouteCreate', {
    onSuccess() {
      queryClient.invalidateQueries('vpcRouterRouteList')
      addToast({ content: 'Your route has been created' })
      navigate(pb.vpcRouter(routerSelector))
    },
  })

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="route"
      onDismiss={() => navigate(pb.vpcRouter(routerSelector))}
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
      <RouteFormFields form={form} />
    </SideModalForm>
  )
}
