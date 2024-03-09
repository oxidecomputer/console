/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useApiMutation, useApiQueryClient, type VpcSubnetCreate } from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { TextField } from '~/components/form/fields/TextField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { useForm, useVpcSelector } from '~/hooks'
import { FormDivider } from '~/ui/lib/Divider'

const defaultValues: VpcSubnetCreate = {
  name: '',
  description: '',
  ipv4Block: '',
}

type CreateSubnetFormProps = {
  onDismiss: () => void
}

export function CreateSubnetForm({ onDismiss }: CreateSubnetFormProps) {
  const vpcSelector = useVpcSelector()
  const queryClient = useApiQueryClient()

  const createSubnet = useApiMutation('vpcSubnetCreate', {
    onSuccess() {
      queryClient.invalidateQueries('vpcSubnetList')
      onDismiss()
    },
  })

  const form = useForm({ defaultValues })

  return (
    <SideModalForm
      resourceName="subnet"
      form={form}
      formType="create"
      onDismiss={onDismiss}
      onSubmit={(body) => createSubnet.mutate({ query: vpcSelector, body })}
      loading={createSubnet.isPending}
      submitError={createSubnet.error}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
      <FormDivider />
      <TextField name="ipv4Block" label="IPv4 block" required control={form.control} />
      <TextField name="ipv6Block" label="IPv6 block" control={form.control} />
    </SideModalForm>
  )
}
