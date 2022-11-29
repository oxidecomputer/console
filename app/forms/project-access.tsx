import {
  updateRole,
  useActorsNotInPolicy,
  useApiMutation,
  useApiQueryClient,
} from '@oxide/api'

import { ListboxField, SideModalForm } from 'app/components/form'
import { useRequiredParams } from 'app/hooks'

import type { AddRoleModalProps, EditRoleModalProps } from './access-util'
import { roleItems } from './access-util'
import { defaultValues } from './access-util'

export function ProjectAccessAddUserSideModal({ onDismiss, policy }: AddRoleModalProps) {
  const projectParams = useRequiredParams('orgName', 'projectName')

  const actors = useActorsNotInPolicy(policy)
  const actorItems = actors.map((u) => ({
    value: u.id,
    label: u.displayName + (u.identityType === 'silo_group' ? ' [group]' : ''),
  }))

  const queryClient = useApiQueryClient()
  const updatePolicy = useApiMutation('projectPolicyUpdate', {
    onSuccess: () => {
      queryClient.invalidateQueries('projectPolicyView', { path: projectParams })
      onDismiss()
    },
  })

  return (
    <SideModalForm
      title="Add user or group"
      id="project-access-add-user"
      formOptions={{ defaultValues }}
      onSubmit={({ identityId, roleName }) => {
        // can't happen because roleName is validated not to be '', but TS
        // wants to be sure
        if (roleName === '') return

        // actor is guaranteed to be in the list because it came from there
        const identityType = actors.find((a) => a.id === identityId)!.identityType

        updatePolicy.mutate({
          path: projectParams,
          body: updateRole({ identityId, identityType, roleName }, policy),
        })
      }}
      loading={updatePolicy.isLoading}
      submitError={updatePolicy.error}
      submitLabel="Assign role"
      onDismiss={onDismiss}
    >
      {({ control }) => (
        <>
          <ListboxField
            name="identityId"
            items={actorItems}
            label="User or group"
            required
            control={control}
          />
          <ListboxField
            name="roleName"
            label="Role"
            items={roleItems}
            required
            control={control}
          />
        </>
      )}
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
  const projectParams = useRequiredParams('orgName', 'projectName')

  const queryClient = useApiQueryClient()
  const updatePolicy = useApiMutation('projectPolicyUpdate', {
    onSuccess: () => {
      queryClient.invalidateQueries('projectPolicyView', { path: projectParams })
      onDismiss()
    },
  })

  return (
    <SideModalForm
      // TODO: show user name in header or SOMEWHERE
      title="Change user role"
      id="project-access-edit-user"
      formOptions={{ defaultValues }}
      onSubmit={({ roleName }) => {
        updatePolicy.mutate({
          path: projectParams,
          body: updateRole({ identityId, identityType, roleName }, policy),
        })
      }}
      loading={updatePolicy.isLoading}
      submitError={updatePolicy.error}
      submitLabel="Update role"
      onDismiss={onDismiss}
    >
      {({ control }) => (
        <ListboxField
          name="roleName"
          label="Role"
          items={roleItems}
          required
          control={control}
        />
      )}
    </SideModalForm>
  )
}
