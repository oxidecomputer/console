/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate, type LoaderFunctionArgs } from 'react-router-dom'
import * as R from 'remeda'

import {
  apiQueryClient,
  useApiMutation,
  useApiQueryClient,
  usePrefetchedApiQuery,
} from '@oxide/api'

import { NumberField } from '~/components/form/fields/NumberField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { getInstanceSelector, useInstanceSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { pb } from '~/util/path-builder'

InstanceResizeForm.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project, instance } = getInstanceSelector(params)
  await apiQueryClient.prefetchQuery('instanceView', {
    path: { instance },
    query: { project },
  })
  return null
}

export function InstanceResizeForm() {
  const { instance: instanceName, project } = useInstanceSelector()
  const queryClient = useApiQueryClient()
  const navigate = useNavigate()

  const { data: instance } = usePrefetchedApiQuery('instanceView', {
    path: { instance: instanceName },
    query: { project },
  })

  const instanceUpdate = useApiMutation('instanceUpdate', {
    onSuccess(_updatedInstance) {
      queryClient.invalidateQueries('instanceView')
      navigate(pb.instance({ project, instance: instanceName }))
      addToast({ title: 'Instance updated' })
    },
  })

  const form = useForm({ defaultValues: R.pick(instance, ['ncpus', 'memory']) })

  return (
    <SideModalForm
      form={form}
      formType="edit"
      resourceName="Instance"
      onDismiss={() => navigate(pb.instance({ project, instance: instanceName }))}
      onSubmit={({ ncpus, memory }) => {
        instanceUpdate.mutate({
          path: { instance: instanceName },
          query: { project },
          // very important to include the boot disk or it will be unset
          body: { ncpus, memory, bootDisk: instance.bootDiskId },
        })
      }}
      loading={instanceUpdate.isPending}
      submitError={instanceUpdate.error}
    >
      <NumberField name="ncpus" control={form.control} />
      <NumberField name="memory" control={form.control} />
    </SideModalForm>
  )
}
