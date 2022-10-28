import type { Policy, RoleKey } from '@oxide/api'
import {
  allRoles,
  setUserRole,
  useApiMutation,
  useApiQueryClient,
  useUsersNotInPolicy,
} from '@oxide/api'
import { capitalize } from '@oxide/util'

import { ListboxField, SideModalForm } from 'app/components/hook-form'

type AddUserValues = {
  userId: string
  roleName: RoleKey | ''
}

const defaultValues: AddUserValues = {
  userId: '',
  roleName: '',
}

const roleItems = allRoles.map((role) => ({ value: role, label: capitalize(role) }))

type AddRoleModalProps = {
  onSuccess: () => void
  onDismiss: () => void
  policy: Policy
}

export function SiloAccessAddUserSideModal({
  onSuccess,
  onDismiss,
  policy,
}: AddRoleModalProps) {
  const users = useUsersNotInPolicy(policy)
  const userItems = users.map((u) => ({ value: u.id, label: u.displayName }))

  const queryClient = useApiQueryClient()
  const updatePolicy = useApiMutation('policyUpdate', {
    onSuccess: () => {
      queryClient.invalidateQueries('policyView', {})
      onSuccess()
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
          body: setUserRole(userId, roleName, policy),
        })
      }}
      submitDisabled={updatePolicy.isLoading}
      submitError={updatePolicy.error}
      submitLabel="Add user"
    >
      {(control) => (
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

type EditRoleModalProps = AddRoleModalProps & {
  userId: string
  defaultValues: { roleName: RoleKey }
}

export function SiloAccessEditUserSideModal({
  onSuccess,
  onDismiss,
  userId,
  policy,
  defaultValues,
}: EditRoleModalProps) {
  const queryClient = useApiQueryClient()
  const updatePolicy = useApiMutation('policyUpdate', {
    onSuccess: () => {
      queryClient.invalidateQueries('policyView', {})
      onSuccess()
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
          body: setUserRole(userId, roleName, policy),
        })
      }}
      submitDisabled={updatePolicy.isLoading || !policy}
      submitError={updatePolicy.error}
      submitLabel="Update role"
      onDismiss={onDismiss}
    >
      {(control) => (
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
