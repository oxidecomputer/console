/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useNavigate } from 'react-router-dom'

import { useApiMutation, useApiQueryClient, type VpcRouterCreate } from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { useForm, useVpcSelector } from '~/hooks'
import { addToast } from '~/stores/toast'
import { pb } from '~/util/path-builder'

const defaultValues: VpcRouterCreate = {
  name: '',
  description: '',
}

export function CreateRouterSideModalForm() {
  const queryClient = useApiQueryClient()
  const vpcSelector = useVpcSelector()
  const navigate = useNavigate()

  const createRouter = useApiMutation('vpcRouterCreate', {
    onSuccess() {
      queryClient.invalidateQueries('vpcRouterList')
      addToast({ content: 'Your router has been created' })
    },
  })

  const form = useForm({ defaultValues })

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="route"
      onDismiss={() => navigate(pb.vpcRouters(vpcSelector))}
      onSubmit={(body) => createRouter.mutate({ query: vpcSelector, body })}
      loading={createRouter.isPending}
      submitError={createRouter.error}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
    </SideModalForm>
  )
}
