/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useApiMutation, useApiQueryClient, type VpcSubnet } from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { pick } from '~/util/object'
import { useForm, useVpcSelector } from 'app/hooks'

type EditSubnetFormProps = {
  onDismiss: () => void
  editing: VpcSubnet
}

export function EditSubnetForm({ onDismiss, editing }: EditSubnetFormProps) {
  const vpcSelector = useVpcSelector()
  const queryClient = useApiQueryClient()

  const updateSubnet = useApiMutation('vpcSubnetUpdate', {
    onSuccess() {
      queryClient.invalidateQueries('vpcSubnetList')
      onDismiss()
    },
  })

  const defaultValues = pick(editing, 'name', 'description') /* satisfies VpcSubnetUpdate */

  const form = useForm({ defaultValues })

  return (
    <SideModalForm
      id="edit-subnet-form"
      title="Edit subnet"
      onDismiss={onDismiss}
      form={form}
      onSubmit={(body) => {
        updateSubnet.mutate({
          path: { subnet: editing.name },
          query: vpcSelector,
          body,
        })
      }}
      loading={updateSubnet.isPending}
      submitError={updateSubnet.error}
      submitLabel="Update subnet"
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
    </SideModalForm>
  )
}
