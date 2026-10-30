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

import {
  OwnAdminDemotionConfirm,
  RoleModalIdentity,
  RoleRadioField,
  useOwnAdminDemotion,
  type EditRoleModalProps,
} from './access-util'

/**
 * Silo policy changes can change the current user's `siloAdmin` on /v1/me,
 * which gates role actions, so refresh both.
 */
export function invalidateSiloPolicy() {
  queryClient.invalidateEndpoint('policyView')
  queryClient.invalidateEndpoint('currentUserView')
}

export function SiloAccessEditRoleModal({
  onDismiss,
  name,
  identityId,
  identityType,
  policy,
  defaultValues,
  keepsEditAccess,
}: EditRoleModalProps) {
  const isAssigning = !defaultValues.roleName
  const updatePolicy = useApiMutation(api.policyUpdate, {
    onSuccess: () => {
      invalidateSiloPolicy()
      onDismiss()
    },
  })
  const form = useForm({ defaultValues })
  const roleName = useWatch({ control: form.control, name: 'roleName' })
  const demotion = useOwnAdminDemotion({
    policy,
    identityId,
    name,
    roleName,
    keepsEditAccess,
  })

  return (
    <ModalForm
      form={form}
      title={isAssigning ? 'Add silo role' : 'Edit silo role'}
      submitLabel={isAssigning ? 'Add silo role' : 'Update role'}
      submitDisabled={demotion.submitDisabled}
      onSubmit={({ roleName }) => {
        if (!roleName) return
        updatePolicy.mutate({
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
      <RoleRadioField name="roleName" control={form.control} scope="Silo" />
      <OwnAdminDemotionConfirm scope="silo" demotion={demotion} />
    </ModalForm>
  )
}
