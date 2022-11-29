import {
  updateRole,
  useActorsNotInPolicy,
  useApiMutation,
  useApiQueryClient,
} from '@oxide/api'

import { ListboxField, SideModalForm } from 'app/components/form'

import { defaultValues, roleItems } from './access-util'
import type { AddRoleModalProps, EditRoleModalProps } from './access-util'

export function SiloAccessAddUserSideModal({ onDismiss, policy }: AddRoleModalProps) {
  const users = useActorsNotInPolicy(policy)
  const userItems = users.map((u) => ({ value: u.id, label: u.displayName }))

  const queryClient = useApiQueryClient()
  const updatePolicy = useApiMutation('policyUpdate', {
    onSuccess: () => {
      queryClient.invalidateQueries('policyView', {})
      onDismiss()
    },
  })

  return (
    <SideModalForm
      onDismiss={onDismiss}
      title="Add user or group"
      id="silo-access-add-user"
      formOptions={{ defaultValues }}
      onSubmit={({ userId, roleName }) => {
        // can't happen because roleName is validated not to be '', but TS
        // wants to be sure
        if (roleName === '') return

        updatePolicy.mutate({
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

export function SiloAccessEditUserSideModal({
  onDismiss,
  identityId,
  identityType,
  policy,
  defaultValues,
}: EditRoleModalProps) {
  const queryClient = useApiQueryClient()
  const updatePolicy = useApiMutation('policyUpdate', {
    onSuccess: () => {
      queryClient.invalidateQueries('policyView', {})
      onDismiss()
    },
  })

  return (
    <SideModalForm
      // TODO: show user name in header or SOMEWHERE
      title="Change user role"
      id="silo-access-edit-user"
      formOptions={{ defaultValues }}
      onSubmit={({ roleName }) => {
        updatePolicy.mutate({
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
