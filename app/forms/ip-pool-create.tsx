/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { useApiMutation, useApiQueryClient, type IpPoolCreate } from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { addToast } from '~/stores/toast'
import { Message } from '~/ui/lib/Message'
import { pb } from '~/util/path-builder'

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
      form={form}
      formType="create"
      resourceName="IP pool"
      onDismiss={onDismiss}
      onSubmit={({ name, description }) => {
        createPool.mutate({ body: { name, description } })
      }}
      loading={createPool.isPending}
      submitError={createPool.error}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
      <IpPoolVisibilityMessage />
    </SideModalForm>
  )
}

export const IpPoolVisibilityMessage = () => (
  <Message
    variant="info"
    content="Users in linked silos will use IP pool names and descriptions to help them choose a pool when allocating IPs."
  />
)
