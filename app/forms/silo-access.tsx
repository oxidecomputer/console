/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'

import {
  updateRole,
  useActorsNotInPolicy,
  useApiMutation,
  useApiQueryClient,
} from '@oxide/api'

import { ListboxField } from '~/components/form/fields/ListboxField'
import { SideModalForm } from '~/components/form/SideModalForm'

import {
  actorToItem,
  defaultValues,
  RoleRadioField,
  type AddRoleModalProps,
  type EditRoleModalProps,
} from './access-util'

export function SiloAccessAddUserSideModal({ onDismiss, policy }: AddRoleModalProps) {
  const actors = useActorsNotInPolicy(policy)

  const queryClient = useApiQueryClient()
  const updatePolicy = useApiMutation('policyUpdate', {
    onSuccess: () => {
      queryClient.invalidateQueries('policyView')
      onDismiss()
    },
  })

  const form = useForm({ defaultValues })

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="role"
      title="Add user or group"
      submitLabel="Assign role"
      onDismiss={onDismiss}
      onSubmit={({ identityId, roleName }) => {
        // TODO: DRY logic
        // actor is guaranteed to be in the list because it came from there
        const identityType = actors.find((a) => a.id === identityId)!.identityType

        updatePolicy.mutate({
          body: updateRole({ identityId, identityType, roleName }, policy),
        })
      }}
      loading={updatePolicy.isPending}
      submitError={updatePolicy.error}
    >
      <ListboxField
        name="identityId"
        items={actors.map(actorToItem)}
        label="User or group"
        required
        control={form.control}
      />
      <RoleRadioField control={form.control} scope="Silo" />
    </SideModalForm>
  )
}

export function SiloAccessEditUserSideModal({
  onDismiss,
  name,
  identityId,
  identityType,
  policy,
  defaultValues,
}: EditRoleModalProps) {
  const queryClient = useApiQueryClient()
  const updatePolicy = useApiMutation('policyUpdate', {
    onSuccess: () => {
      queryClient.invalidateQueries('policyView')
      onDismiss()
    },
  })
  const form = useForm({ defaultValues })

  return (
    <SideModalForm
      form={form}
      formType="edit"
      resourceName="role"
      title={`Change silo role for ${name}`}
      onSubmit={({ roleName }) => {
        updatePolicy.mutate({
          body: updateRole({ identityId, identityType, roleName }, policy),
        })
      }}
      loading={updatePolicy.isPending}
      submitError={updatePolicy.error}
      onDismiss={onDismiss}
    >
      <RoleRadioField control={form.control} scope="Silo" />
    </SideModalForm>
  )
}
