/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'

import { api, queryClient, updateRole, useApiMutation } from '@oxide/api'
import { Access16Icon } from '@oxide/design-system/icons/react'

import { SideModalForm } from '~/components/form/SideModalForm'
import { SideModalFormDocs } from '~/ui/lib/ModalLinks'
import { ResourceLabel } from '~/ui/lib/SideModal'
import { docLinks } from '~/util/links'

import { RoleRadioField, type EditRoleModalProps } from './access-util'

export function SiloAccessEditUserSideModal({
  onDismiss,
  name,
  identityId,
  identityType,
  policy,
  defaultValues,
}: EditRoleModalProps) {
  const isAssigning = !defaultValues.roleName
  const updatePolicy = useApiMutation(api.policyUpdate, {
    onSuccess: () => {
      queryClient.invalidateEndpoint('policyView')
      onDismiss()
    },
  })
  const form = useForm({ defaultValues })

  return (
    <SideModalForm
      form={form}
      formType={isAssigning ? 'create' : 'edit'}
      resourceName="role"
      title={isAssigning ? 'Assign role' : 'Edit role'}
      subtitle={
        <ResourceLabel>
          <Access16Icon /> {name}
        </ResourceLabel>
      }
      onSubmit={({ roleName }) => {
        if (!roleName) return
        updatePolicy.mutate({
          body: updateRole({ identityId, identityType, roleName }, policy),
        })
      }}
      loading={updatePolicy.isPending}
      submitError={updatePolicy.error}
      onDismiss={() => {
        updatePolicy.reset() // clear API error state so it doesn't persist on next open
        onDismiss()
      }}
    >
      <RoleRadioField name="roleName" control={form.control} scope="Silo" />
      <SideModalFormDocs docs={[docLinks.access]} />
    </SideModalForm>
  )
}
