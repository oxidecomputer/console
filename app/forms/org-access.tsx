import {
  updateRole,
  useActorsNotInPolicy,
  useApiMutation,
  useApiQueryClient,
} from '@oxide/api'

import { ListboxField, SideModalForm } from 'app/components/form'
import { useRequiredParams } from 'app/hooks'

import type { AddRoleModalProps, EditRoleModalProps } from './access-util'
import { actorToItem, defaultValues, roleItems } from './access-util'

export function OrgAccessAddUserSideModal({ onDismiss, policy }: AddRoleModalProps) {
  const orgParams = useRequiredParams('orgName')

  const actors = useActorsNotInPolicy(policy)

  const queryClient = useApiQueryClient()
  const updatePolicy = useApiMutation('organizationPolicyUpdate', {
    onSuccess: () => {
      queryClient.invalidateQueries('organizationPolicyView', { path: orgParams })
      onDismiss()
    },
  })

  return (
    <SideModalForm
      onDismiss={onDismiss}
      title="Add user or group"
      id="org-access-add-user"
      formOptions={{ defaultValues }}
      onSubmit={({ identityId, roleName }) => {
        // can't happen because roleName is validated not to be '', but TS
        // wants to be sure
        if (roleName === '') return

        // actor is guaranteed to be in the list because it came from there
        const identityType = actors.find((a) => a.id === identityId)!.identityType

        updatePolicy.mutate({
          path: orgParams,
          body: updateRole({ identityId, identityType, roleName }, policy),
        })
      }}
      loading={updatePolicy.isLoading}
      submitError={updatePolicy.error}
      submitLabel="Assign role"
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

export function OrgAccessEditUserSideModal({
  onDismiss,
  identityId,
  identityType,
  policy,
  defaultValues,
}: EditRoleModalProps) {
  const orgParams = useRequiredParams('orgName')

  const queryClient = useApiQueryClient()
  const updatePolicy = useApiMutation('organizationPolicyUpdate', {
    onSuccess: () => {
      queryClient.invalidateQueries('organizationPolicyView', { path: orgParams })
      onDismiss()
    },
  })

  return (
    <SideModalForm
      // TODO: show user name in header or SOMEWHERE
      title="Change user role"
      id="org-access-edit-user"
      formOptions={{ defaultValues }}
      onSubmit={({ roleName }) => {
        updatePolicy.mutate({
          path: orgParams,
          body: updateRole({ identityId, identityType, roleName }, policy),
        })
      }}
      loading={updatePolicy.isLoading}
      submitError={updatePolicy.error}
      onDismiss={onDismiss}
      submitLabel="Update role"
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
