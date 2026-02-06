/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate, type LoaderFunctionArgs } from 'react-router'

import { api, q, queryClient, useApiMutation } from '@oxide/api'

import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import {
  RouteFormDocs,
  RouteFormFields,
  type RouteFormValues,
} from '~/forms/vpc-router-route-common'
import { titleCrumb } from '~/hooks/use-crumbs'
import { getVpcRouterSelector, useVpcRouterSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { FormDivider } from '~/ui/lib/Divider'
import { ALL_ISH } from '~/util/consts'
import { pb } from '~/util/path-builder'

const defaultValues: RouteFormValues = {
  name: '',
  description: '',
  destination: { type: 'ip', value: '' },
  target: { type: 'ip', value: '' },
}

export const handle = titleCrumb('New Route')

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { project, vpc } = getVpcRouterSelector(params)
  await Promise.all([
    queryClient.prefetchQuery(
      q(api.vpcSubnetList, { query: { project, vpc, limit: ALL_ISH } })
    ),
    queryClient.prefetchQuery(q(api.instanceList, { query: { project, limit: ALL_ISH } })),
    queryClient.prefetchQuery(
      q(api.internetGatewayList, { query: { project, vpc, limit: ALL_ISH } })
    ),
  ])
  return null
}

export default function CreateRouterRouteSideModalForm() {
  const routerSelector = useVpcRouterSelector()
  const navigate = useNavigate()

  const form = useForm({ defaultValues })

  const createRouterRoute = useApiMutation(api.vpcRouterRouteCreate, {
    onSuccess(route) {
      queryClient.invalidateEndpoint('vpcRouterRouteList')
      // prettier-ignore
      addToast(<>Route <HL>{route.name}</HL> created</>)
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
      <FormDivider />
      <RouteFormDocs />
    </SideModalForm>
  )
}
