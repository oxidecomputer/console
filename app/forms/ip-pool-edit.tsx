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
import { getIpPoolSelector, useForm, useIpPoolSelector } from '~/hooks'
import { addToast } from '~/stores/toast'
import { pb } from '~/util/path-builder'

EditIpPoolSideModalForm.loader = async ({ params }: LoaderFunctionArgs) => {
  const { pool } = getIpPoolSelector(params)
  await apiQueryClient.prefetchQuery('ipPoolView', { path: { pool } })
  return null
}

export function EditIpPoolSideModalForm() {
  const queryClient = useApiQueryClient()
  const navigate = useNavigate()
  const poolSelector = useIpPoolSelector()

  const { data: pool } = usePrefetchedApiQuery('ipPoolView', { path: poolSelector })

  const form = useForm({ defaultValues: pool })

  const editPool = useApiMutation('ipPoolUpdate', {
    onSuccess(_pool) {
      if (pool.name !== _pool.name) {
        navigate(pb.ipPool({ pool: _pool.name }))
      } else {
        queryClient.invalidateQueries('ipPoolView')
        navigate(pb.ipPool({ pool: pool.name }))
      }
      addToast({ content: 'Your IP pool has been updated' })
    },
  })
  const onDismiss = () => navigate(pb.ipPool({ pool: poolSelector.pool }))

  return (
    <SideModalForm
      form={form}
      formType="edit"
      resourceName="IP pool"
      onDismiss={onDismiss}
      onSubmit={({ name, description }) => {
        editPool.mutate({ path: poolSelector, body: { name, description } })
      }}
      loading={editPool.isPending}
      submitError={editPool.error}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
    </SideModalForm>
  )
}
