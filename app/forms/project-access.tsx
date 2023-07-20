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
import { toPathQuery } from '@oxide/util'

import { ListboxField, SideModalForm } from 'app/components/form'
import { useProjectSelector } from 'app/hooks'

import type { AddRoleModalProps, EditRoleModalProps } from './access-util'
import { actorToItem, defaultValues, roleItems } from './access-util'

export function ProjectAccessAddUserSideModal({ onDismiss, policy }: AddRoleModalProps) {
  const projectPathQuery = toPathQuery('project', useProjectSelector())

  const actors = useActorsNotInPolicy(policy)

  const queryClient = useApiQueryClient()
  const updatePolicy = useApiMutation('projectPolicyUpdate', {
    onSuccess: () => {
      queryClient.invalidateQueries('projectPolicyView')
      onDismiss()
    },
  })

  const form = useForm({ mode: 'all', defaultValues })

  return (
    <SideModalForm
      title="Add user or group"
      id="project-access-add-user"
      form={form}
      onSubmit={({ identityId, roleName }) => {
        // can't happen because roleName is validated not to be '', but TS
        // wants to be sure
        if (roleName === '') return

        // actor is guaranteed to be in the list because it came from there
        const identityType = actors.find((a) => a.id === identityId)!.identityType

        updatePolicy.mutate({
          ...projectPathQuery,
          body: updateRole({ identityId, identityType, roleName }, policy),
        })
      }}
      loading={updatePolicy.isLoading}
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
      <ListboxField
        name="roleName"
        label="Role"
        items={roleItems}
        required
        control={form.control}
      />
    </SideModalForm>
  )
}

export function ProjectAccessEditUserSideModal({
  onDismiss,
  identityId,
  identityType,
  policy,
  defaultValues,
}: EditRoleModalProps) {
  const projectPathQuery = toPathQuery('project', useProjectSelector())

  const queryClient = useApiQueryClient()
  const updatePolicy = useApiMutation('projectPolicyUpdate', {
    onSuccess: () => {
      queryClient.invalidateQueries('projectPolicyView')
      onDismiss()
    },
  })

  const form = useForm({ mode: 'all', defaultValues })

  return (
    <SideModalForm
      // TODO: show user name in header or SOMEWHERE
      title="Change user role"
      id="project-access-edit-user"
      form={form}
      onSubmit={({ roleName }) => {
        updatePolicy.mutate({
          ...projectPathQuery,
          body: updateRole({ identityId, identityType, roleName }, policy),
        })
      }}
      loading={updatePolicy.isLoading}
      submitError={updatePolicy.error}
      submitLabel="Update role"
      onDismiss={onDismiss}
    >
      <ListboxField
        name="roleName"
        label="Role"
        items={roleItems}
        required
        control={form.control}
      />
    </SideModalForm>
  )
}
