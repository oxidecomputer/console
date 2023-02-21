import {
  toPathQuery,
  updateRole,
  useActorsNotInPolicy,
  useApiMutation,
  useApiQueryClient,
} from '@oxide/api'

import { ListboxField, SideModalForm } from 'app/components/form'
import { useProjectSelector } from 'app/hooks'

import type { AddRoleModalProps, EditRoleModalProps } from './access-util'
import { actorToItem, defaultValues, roleItems } from './access-util'

export function ProjectAccessAddUserSideModal({ onDismiss, policy }: AddRoleModalProps) {
  const projectPathQuery = toPathQuery('project', useProjectSelector())

  const actors = useActorsNotInPolicy(policy)

  const queryClient = useApiQueryClient()
  const updatePolicy = useApiMutation('projectPolicyUpdateV1', {
    onSuccess: () => {
      queryClient.invalidateQueries('projectPolicyViewV1', projectPathQuery)
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
          ...projectPathQuery,
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
            items={actors.map(actorToItem)}
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
  const projectPathQuery = toPathQuery('project', useProjectSelector())

  const queryClient = useApiQueryClient()
  const updatePolicy = useApiMutation('projectPolicyUpdateV1', {
    onSuccess: () => {
      queryClient.invalidateQueries('projectPolicyViewV1', projectPathQuery)
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
          ...projectPathQuery,
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
