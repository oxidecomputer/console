/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useNavigate, type LoaderFunctionArgs } from 'react-router-dom'

import {
  apiQueryClient,
  useApiMutation,
  useApiQueryClient,
  usePrefetchedApiQuery,
} from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { getFloatingIpSelector, useFloatingIpSelector, useForm, useToast } from 'app/hooks'
import { pb } from 'app/util/path-builder'

EditFloatingIpSideModalForm.loader = async ({ params }: LoaderFunctionArgs) => {
  const { floatingIp, project } = getFloatingIpSelector(params)
  await apiQueryClient.prefetchQuery('floatingIpView', {
    path: { floatingIp },
    query: { project },
  })
  return null
}

export function EditFloatingIpSideModalForm() {
  const queryClient = useApiQueryClient()
  const addToast = useToast()
  const navigate = useNavigate()

  const floatingIpSelector = useFloatingIpSelector()

  const onDismiss = () => navigate(pb.floatingIps({ project: floatingIpSelector.project }))

  const { data: floatingIp } = usePrefetchedApiQuery('floatingIpView', {
    path: { floatingIp: floatingIpSelector.floatingIp },
    query: { project: floatingIpSelector.project },
  })

  const editFloatingIp = useApiMutation('floatingIpUpdate', {
    onSuccess(_floatingIp) {
      queryClient.invalidateQueries('floatingIpList')
      addToast({ content: 'Your floating IP has been updated' })
      onDismiss()
    },
  })

  const form = useForm({ defaultValues: floatingIp })

  return (
    <SideModalForm
      form={form}
      resourceName="floating IP"
      formType="edit"
      title="Edit floating IP"
      onDismiss={onDismiss}
      onSubmit={({ name, description }) => {
        editFloatingIp.mutate({
          path: { floatingIp: floatingIpSelector.floatingIp },
          query: { project: floatingIpSelector.project },
          body: { name, description },
        })
      }}
      loading={editFloatingIp.isPending}
      submitError={editFloatingIp.error}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
    </SideModalForm>
  )
}
