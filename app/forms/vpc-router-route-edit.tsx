/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import {
  useNavigate,
  type LoaderFunctionArgs,
  type NavigateFunction,
} from 'react-router-dom'

import {
  apiQueryClient,
  useApiMutation,
  useApiQueryClient,
  usePrefetchedApiQuery,
  type RouterRouteUpdate,
} from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { ListboxField } from '~/components/form/fields/ListboxField'
import { NameField } from '~/components/form/fields/NameField'
import { TextField } from '~/components/form/fields/TextField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { fields, routeError } from '~/forms/vpc-router-route/shared'
import { getVpcRouterRouteSelector, useForm, useVpcRouterRouteSelector } from '~/hooks'
import { addToast } from '~/stores/toast'
import { Message } from '~/ui/lib/Message'
import { pb } from '~/util/path-builder'

EditRouterRouteSideModalForm.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project, vpc, router, route } = getVpcRouterRouteSelector(params)
  await apiQueryClient.prefetchQuery('vpcRouterRouteView', {
    path: { route },
    query: { project, vpc, router },
  })
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

  const defaultValues: RouterRouteUpdate = { ...route }

  const onDismiss = (navigate: NavigateFunction) => {
    navigate(pb.vpcRouter({ project, vpc, router: routerName }))
  }

  const updateRouterRoute = useApiMutation('vpcRouterRouteUpdate', {
    onSuccess() {
      queryClient.invalidateQueries('vpcRouterRouteList')
      addToast({ content: 'Your route has been updated' })
      onDismiss(navigate)
    },
  })

  const form = useForm({ defaultValues })
  const targetType = form.watch('target.type')

  let isDisabled = false
  let disabledReason = ''

  // Can simplify this if there aren't other disabling reasons
  if (route?.kind === 'vpc_subnet') {
    isDisabled = true
    disabledReason = routeError.vpcSubnetNotModifiable
  }

  return (
    <SideModalForm
      form={form}
      formType="edit"
      resourceName="route"
      onDismiss={() => onDismiss(navigate)}
      onSubmit={(body) =>
        updateRouterRoute.mutate({
          query: { project, vpc, router: routerName },
          path: { route: routeName },
          body,
        })
      }
      loading={updateRouterRoute.isPending}
      submitError={updateRouterRoute.error}
    >
      {isDisabled && <Message variant="info" content={disabledReason} />}
      <NameField name="name" control={form.control} disabled={isDisabled} />
      <DescriptionField name="description" control={form.control} disabled={isDisabled} />
      <ListboxField {...fields.destType} control={form.control} disabled={isDisabled} />
      <TextField {...fields.destValue} control={form.control} disabled={isDisabled} />
      <ListboxField {...fields.targetType} control={form.control} disabled={isDisabled} />
      {targetType !== 'drop' && (
        <TextField {...fields.targetValue} control={form.control} disabled={isDisabled} />
      )}
    </SideModalForm>
  )
}
