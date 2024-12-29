/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate, type LoaderFunctionArgs } from 'react-router'

import { apiq, queryClient, useApiMutation, usePrefetchedApiQuery } from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import { getFloatingIpSelector, useFloatingIpSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import type * as PP from '~/util/path-params'
import { pb } from 'app/util/path-builder'

const floatingIpView = ({ project, floatingIp }: PP.FloatingIp) =>
  apiq('floatingIpView', { path: { floatingIp }, query: { project } })

EditFloatingIpSideModalForm.loader = async ({ params }: LoaderFunctionArgs) => {
  const selector = getFloatingIpSelector(params)
  await queryClient.prefetchQuery(floatingIpView(selector))
  return null
}

export function EditFloatingIpSideModalForm() {
  const navigate = useNavigate()

  const floatingIpSelector = useFloatingIpSelector()

  const onDismiss = () => navigate(pb.floatingIps({ project: floatingIpSelector.project }))

  const { data: floatingIp } = usePrefetchedApiQuery('floatingIpView', {
    path: { floatingIp: floatingIpSelector.floatingIp },
    query: { project: floatingIpSelector.project },
  })

  const editFloatingIp = useApiMutation('floatingIpUpdate', {
    onSuccess(_floatingIp) {
      queryClient.invalidateEndpoint('floatingIpList')
      addToast(<>Floating IP <HL>{_floatingIp.name}</HL> updated</>) // prettier-ignore
      onDismiss()
    },
  })

  const form = useForm({ defaultValues: floatingIp })

  return (
    <SideModalForm
      form={form}
      formType="edit"
      resourceName="floating IP"
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
