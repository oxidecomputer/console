/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate, type LoaderFunctionArgs, type NavigateFunction } from 'react-router'

import {
  apiq,
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
  type VpcRouterUpdate,
} from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import { getVpcRouterSelector, useVpcRouterSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

const routerView = ({ project, vpc, router }: PP.VpcRouter) =>
  apiq('vpcRouterView', { path: { router }, query: { project, vpc } })

EditRouterSideModalForm.loader = async ({ params }: LoaderFunctionArgs) => {
  const selector = getVpcRouterSelector(params)
  await queryClient.prefetchQuery(routerView(selector))
  return null
}

export function EditRouterSideModalForm() {
  const routerSelector = useVpcRouterSelector()
  const { project, vpc, router } = routerSelector
  const { data: routerData } = usePrefetchedQuery(routerView(routerSelector))
  const navigate = useNavigate()

  const onDismiss = (navigate: NavigateFunction) => {
    navigate(pb.vpcRouters({ project, vpc }))
  }

  const editRouter = useApiMutation('vpcRouterUpdate', {
    onSuccess(updatedRouter) {
      queryClient.invalidateEndpoint('vpcRouterList')
      addToast(<>Router <HL>{updatedRouter.name}</HL> updated</>) // prettier-ignore
      navigate(pb.vpcRouters({ project, vpc }))
    },
  })

  const defaultValues: VpcRouterUpdate = {
    name: router,
    description: routerData.description,
  }

  const form = useForm({ defaultValues })

  return (
    <SideModalForm
      form={form}
      formType="edit"
      resourceName="router"
      onDismiss={() => onDismiss(navigate)}
      onSubmit={(body) =>
        editRouter.mutate({
          path: { router },
          query: { project, vpc },
          body,
        })
      }
      loading={editRouter.isPending}
      submitError={editRouter.error}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
    </SideModalForm>
  )
}
