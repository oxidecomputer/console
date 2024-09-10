/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
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
  type VpcRouterUpdate,
} from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { getVpcRouterSelector, useVpcRouterSelector } from '~/hooks'
import { addToast } from '~/stores/toast'
import { pb } from '~/util/path-builder'

EditRouterSideModalForm.loader = async ({ params }: LoaderFunctionArgs) => {
  const { router, project, vpc } = getVpcRouterSelector(params)
  await apiQueryClient.prefetchQuery('vpcRouterView', {
    path: { router },
    query: { project, vpc },
  })
  return null
}

export function EditRouterSideModalForm() {
  const queryClient = useApiQueryClient()
  const routerSelector = useVpcRouterSelector()
  const { project, vpc, router } = routerSelector
  const { data: routerData } = usePrefetchedApiQuery('vpcRouterView', {
    path: { router },
    query: { project, vpc },
  })
  const navigate = useNavigate()

  const onDismiss = (navigate: NavigateFunction) => {
    navigate(pb.vpcRouters({ project, vpc }))
  }

  const editRouter = useApiMutation('vpcRouterUpdate', {
    onSuccess() {
      queryClient.invalidateQueries('vpcRouterList')
      addToast({ content: 'Your router has been updated' })
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
