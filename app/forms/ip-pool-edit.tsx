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

import { DescriptionField, NameField, SideModalForm } from 'app/components/form'
import { getIpPoolSelector, useForm, useIpPoolSelector, useToast } from 'app/hooks'
import { pb } from 'app/util/path-builder'

EditIpPoolSideModalForm.loader = async ({ params }: LoaderFunctionArgs) => {
  const { pool } = getIpPoolSelector(params)
  await apiQueryClient.prefetchQuery('ipPoolView', { path: { pool } })
  return null
}

export function EditIpPoolSideModalForm() {
  const queryClient = useApiQueryClient()
  const addToast = useToast()
  const navigate = useNavigate()

  const poolSelector = useIpPoolSelector()

  const onDismiss = () => navigate(pb.ipPools())

  const { data: pool } = usePrefetchedApiQuery('ipPoolView', { path: poolSelector })

  const editPool = useApiMutation('ipPoolUpdate', {
    onSuccess(_pool) {
      queryClient.invalidateQueries('ipPoolList')
      addToast({ content: 'Your IP pool has been updated' })
      onDismiss()
    },
  })

  const form = useForm({ defaultValues: pool })

  return (
    <SideModalForm
      id="edit-pool-form"
      form={form}
      title="Edit IP pool"
      onDismiss={onDismiss}
      onSubmit={({ name, description }) => {
        editPool.mutate({ path: poolSelector, body: { name, description } })
      }}
      loading={editPool.isPending}
      submitError={editPool.error}
      submitLabel="Save changes"
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
    </SideModalForm>
  )
}
