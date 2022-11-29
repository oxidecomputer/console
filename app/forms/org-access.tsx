import {
  updateRole,
  useApiMutation,
  useApiQueryClient,
  useUsersNotInPolicy,
} from '@oxide/api'

import { ListboxField, SideModalForm } from 'app/components/form'
import { useRequiredParams } from 'app/hooks'

import type { AddRoleModalProps, EditRoleModalProps } from './access-util'
import { defaultValues, roleItems } from './access-util'

export function OrgAccessAddUserSideModal({ onDismiss, policy }: AddRoleModalProps) {
  const orgParams = useRequiredParams('orgName')

  const users = useUsersNotInPolicy(policy)
  const userItems = users.map((u) => ({ value: u.id, label: u.displayName }))

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
      title="Add user to organization"
      id="org-access-add-user"
      formOptions={{ defaultValues }}
      onSubmit={({ userId, roleName }) => {
        // can't happen because roleName is validated not to be '', but TS
        // wants to be sure
        if (roleName === '') return

        updatePolicy.mutate({
          path: orgParams,
          body: updateRole(
            { identityId: userId, identityType: 'silo_user', roleName },
            policy
          ),
        })
      }}
      loading={updatePolicy.isLoading}
      submitError={updatePolicy.error}
      submitLabel="Add user"
    >
      {({ control }) => (
        <>
          <ListboxField
            name="userId"
            items={userItems}
            label="User"
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
