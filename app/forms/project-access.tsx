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
import { useProjectSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'

import {
  actorToItem,
  defaultValues,
  RoleRadioField,
  type AddRoleModalProps,
  type EditRoleModalProps,
} from './access-util'

export function ProjectAccessAddUserSideModal({ onDismiss, policy }: AddRoleModalProps) {
  const { project } = useProjectSelector()

  const actors = useActorsNotInPolicy(policy)

  const queryClient = useApiQueryClient()
  const updatePolicy = useApiMutation('projectPolicyUpdate', {
    onSuccess: () => {
      queryClient.invalidateQueries('projectPolicyView')
      // We don't have the name of the user or group, so we'll just have a generic message
      addToast({ content: 'Role assigned' })
      onDismiss()
    },
  })

  const form = useForm({ defaultValues })

  return (
    <SideModalForm
      title="Add user or group"
      resourceName="role"
      form={form}
      formType="create"
      onSubmit={({ identityId, roleName }) => {
        // actor is guaranteed to be in the list because it came from there
        const identityType = actors.find((a) => a.id === identityId)!.identityType

        updatePolicy.mutate({
          path: { project },
          body: updateRole({ identityId, identityType, roleName }, policy),
        })
      }}
      loading={updatePolicy.isPending}
      submitError={updatePolicy.error}
      submitLabel="Assign role"
      onDismiss={onDismiss}
    >
      <ListboxField
        name="identityId"
        items={actors.map(actorToItem)}
        label="User or group"
        required
        control={form.control}
      />
      <RoleRadioField control={form.control} scope="Project" />
    </SideModalForm>
  )
}

export function ProjectAccessEditUserSideModal({
  onDismiss,
  name,
  identityId,
  identityType,
  policy,
  defaultValues,
}: EditRoleModalProps) {
  const { project } = useProjectSelector()

  const queryClient = useApiQueryClient()
  const updatePolicy = useApiMutation('projectPolicyUpdate', {
    onSuccess: () => {
      queryClient.invalidateQueries('projectPolicyView')
      addToast({ content: 'Role updated' })
      onDismiss()
    },
  })

  const form = useForm({ defaultValues })

  return (
    <SideModalForm
      form={form}
      formType="edit"
      resourceName="role"
      title={`Change project role for ${name}`}
      onSubmit={({ roleName }) => {
        updatePolicy.mutate({
          path: { project },
          body: updateRole({ identityId, identityType, roleName }, policy),
        })
      }}
      loading={updatePolicy.isPending}
      submitError={updatePolicy.error}
      onDismiss={onDismiss}
    >
      <RoleRadioField control={form.control} scope="Project" />
    </SideModalForm>
  )
}
