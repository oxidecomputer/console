/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useNavigate } from 'react-router-dom'

import { useApiMutation, useApiQueryClient, type IpPoolCreate } from '@oxide/api'

import { DescriptionField, NameField, SideModalForm } from 'app/components/form'
import { useForm } from 'app/hooks'
import { addToast } from 'app/stores/toast'
import { pb } from 'app/util/path-builder'

const defaultValues: IpPoolCreate = {
  name: '',
  description: '',
}

export function CreateIpPoolSideModalForm() {
  const navigate = useNavigate()
  const queryClient = useApiQueryClient()

  const onDismiss = () => navigate(pb.ipPools())

  const createPool = useApiMutation('ipPoolCreate', {
    onSuccess(_pool) {
      queryClient.invalidateQueries('ipPoolList')
      addToast({ content: 'Your IP pool has been created' })
      navigate(pb.ipPools())
    },
  })

  const form = useForm({ defaultValues })

  return (
    <SideModalForm
      id="create-pool-form"
      form={form}
      title="Create IP pool"
      onDismiss={onDismiss}
      onSubmit={({ name, description }) => {
        createPool.mutate({ body: { name, description } })
      }}
      loading={createPool.isPending}
      submitError={createPool.error}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
    </SideModalForm>
  )
}