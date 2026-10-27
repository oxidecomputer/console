/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm, useWatch } from 'react-hook-form'

import { api, queryClient, updateRole, useApiMutation } from '@oxide/api'

import { ModalForm } from '~/components/form/ModalForm'
import { useProjectSelector } from '~/hooks/use-params'

import {
  OwnAdminDemotionConfirm,
  RoleModalIdentity,
  RoleRadioField,
  useOwnAdminDemotion,
  type EditRoleModalProps,
} from './access-util'

export function ProjectAccessEditRoleModal({
  onDismiss,
  name,
  identityId,
  identityType,
  policy,
  defaultValues,
}: EditRoleModalProps) {
  const { project } = useProjectSelector()
  const isAssigning = !defaultValues.roleName

  const updatePolicy = useApiMutation(api.projectPolicyUpdate, {
    onSuccess: () => {
      queryClient.invalidateEndpoint('projectPolicyView')
      onDismiss()
    },
  })

  const form = useForm({ defaultValues })
  const roleName = useWatch({ control: form.control, name: 'roleName' })
  const demotion = useOwnAdminDemotion({ policy, identityId, name, roleName })

  return (
    <ModalForm
      form={form}
      title={isAssigning ? 'Add project role' : 'Edit project role'}
      submitLabel={isAssigning ? 'Add project role' : 'Update role'}
      submitDisabled={demotion.submitDisabled}
      onSubmit={({ roleName }) => {
        if (!roleName) return
        updatePolicy.mutate({
          path: { project },
          body: updateRole({ identityId, identityType, roleName }, policy),
        })
      }}
      loading={updatePolicy.isPending || updatePolicy.isSuccess}
      submitError={updatePolicy.error}
      onDismiss={() => {
        updatePolicy.reset() // clear API error state so it doesn't persist on next open
        onDismiss()
      }}
    >
      <RoleModalIdentity name={name} />
      <RoleRadioField name="roleName" control={form.control} scope="Project" />
      <OwnAdminDemotionConfirm scope="project" demotion={demotion} />
    </ModalForm>
  )
}
