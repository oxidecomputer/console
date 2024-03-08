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
import { getIpPoolSelector, useForm, useIpPoolSelector, useToast } from '~/hooks'
import { pb } from '~/util/path-builder'

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
      form={form}
      resourceName="IP pool"
      formType="edit"
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
