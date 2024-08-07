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
import { getVpcRouterRouteSelector, useForm, useVpcRouterRouteSelector } from '~/hooks'
import { addToast } from '~/stores/toast'
import type { ListboxItem } from '~/ui/lib/Listbox'
import { pb } from '~/util/path-builder'

const destinationTypes: ListboxItem[] = [
  { value: 'ip', label: 'IP' },
  { value: 'ip_net', label: 'IP net' },
  { value: 'vpc', label: 'VPC' },
  { value: 'subnet', label: 'subnet' },
]

const targetTypes: ListboxItem[] = [
  { value: 'ip', label: 'IP' },
  { value: 'vpc', label: 'VPC' },
  { value: 'subnet', label: 'subnet' },
  { value: 'instance', label: 'instance' },
  { value: 'internet_gateway', label: 'Internet gateway' },
  { value: 'drop', label: 'Drop' },
]

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
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
      <ListboxField
        name="destination.type"
        items={destinationTypes}
        label="Destination type"
        control={form.control}
        placeholder="Select a destination type"
        required
      />
      <TextField
        name="destination.value"
        label="Destination value"
        control={form.control}
        placeholder="Enter a destination value"
        required
      />
      <ListboxField
        name="target.type"
        items={targetTypes}
        label="Target type"
        control={form.control}
        placeholder="Select a target type"
        required
      />
      {targetType !== 'drop' && (
        <TextField
          name="target.value"
          label="Target value"
          control={form.control}
          placeholder="Enter a target value"
          required
        />
      )}
    </SideModalForm>
  )
}
