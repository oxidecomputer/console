/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
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
import { getIpPoolSelector, useIpPoolSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { Message } from '~/ui/lib/Message'
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
    onSuccess(updatedPool) {
      queryClient.invalidateQueries('ipPoolList')
      navigate(pb.ipPool({ pool: updatedPool.name }))
      addToast({ content: 'Your IP pool has been updated' })

      // Only invalidate if we're staying on the same page. If the name
      // _has_ changed, invalidating ipPoolView causes an error page to flash
      // while the loader for the target page is running because the current
      // page's pool gets cleared out while we're still on the page. If we're
      // navigating to a different page, its query will fetch anew regardless.
      if (pool.name === updatedPool.name) {
        queryClient.invalidateQueries('ipPoolView')
      }
    },
  })

  return (
    <SideModalForm
      form={form}
      formType="edit"
      resourceName="IP pool"
      onDismiss={() => navigate(pb.ipPool({ pool: poolSelector.pool }))}
      onSubmit={({ name, description }) => {
        editPool.mutate({ path: poolSelector, body: { name, description } })
      }}
      loading={editPool.isPending}
      submitError={editPool.error}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
      <Message
        variant="info"
        content="IP pool names and descriptions are visible to end users in linked silos."
      />
    </SideModalForm>
  )
}
