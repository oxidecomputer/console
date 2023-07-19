/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'

import type { VpcSubnet } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { pick } from '@oxide/util'

import { DescriptionField, NameField, SideModalForm } from 'app/components/form'
import { useVpcSelector } from 'app/hooks'

type EditSubnetFormProps = {
  onDismiss: () => void
  editing: VpcSubnet
}

export function EditSubnetForm({ onDismiss, editing }: EditSubnetFormProps) {
  const vpcSelector = useVpcSelector()
  const queryClient = useApiQueryClient()

  const updateSubnet = useApiMutation('vpcSubnetUpdate', {
    onSuccess() {
      queryClient.invalidateQueries('vpcSubnetList', { query: vpcSelector })
      onDismiss()
    },
  })

  const defaultValues = pick(editing, 'name', 'description') /* satisfies VpcSubnetUpdate */

  const form = useForm({ mode: 'all', defaultValues })

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
      loading={updateSubnet.isLoading}
      submitError={updateSubnet.error}
      submitLabel="Update subnet"
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
    </SideModalForm>
  )
}
