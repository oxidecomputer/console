import * as Yup from 'yup'

import type { Policy, RoleKey } from '@oxide/api'
import { allRoles, useUsersNotInPolicy } from '@oxide/api'
import { setUserRole } from '@oxide/api'
import { useApiQueryClient } from '@oxide/api'
import { useApiMutation } from '@oxide/api'
import { capitalize } from '@oxide/util'

import { Form, ListboxField, SideModalForm } from 'app/components/form'
import { useRequiredParams } from 'app/hooks'

import type { CreateSideModalFormProps, EditSideModalFormProps } from '.'

type AddUserValues = {
  userId: string
  roleName: RoleKey | ''
}

const initialValues: AddUserValues = {
  userId: '',
  roleName: '',
}

const roleItems = allRoles.map((role) => ({ value: role, label: capitalize(role) }))

type AddRoleModalProps = CreateSideModalFormProps<AddUserValues, Policy> & {
  policy: Policy
}

export function OrgAccessAddUserSideModal({
  onSubmit,
  onSuccess,
  onDismiss,
  policy,
  ...props
}: AddRoleModalProps) {
  const orgParams = useRequiredParams('orgName')

  const users = useUsersNotInPolicy(policy)
  const userItems = users.map((u) => ({ value: u.id, label: u.displayName }))

  const queryClient = useApiQueryClient()
  const updatePolicy = useApiMutation('organizationPolicyUpdate', {
    onSuccess: (data) => {
      queryClient.invalidateQueries('organizationPolicyView', { path: orgParams })
      onSuccess?.(data)
      onDismiss()
    },
  })

  return (
    <SideModalForm
      onDismiss={onDismiss}
      title="Add user to organization"
      id="org-access-add-user"
      initialValues={initialValues}
      onSubmit={
        onSubmit ||
        (({ userId, roleName }) => {
          // can't happen because roleName is validated not to be '', but TS
          // wants to be sure
          if (roleName === '') return

          updatePolicy.mutate({
            path: orgParams,
            body: setUserRole(userId, roleName, policy),
          })
        })
      }
      validationSchema={Yup.object({
        userId: Yup.string().required(),
        roleName: Yup.string().required(),
      })}
      submitDisabled={updatePolicy.isLoading}
      error={updatePolicy.error?.error as Error | undefined}
      {...props}
    >
      <ListboxField id="userId" name="userId" items={userItems} label="User" required />
      <ListboxField id="roleName" name="roleName" label="Role" items={roleItems} required />
      <Form.Submit>Add user</Form.Submit>
    </SideModalForm>
  )
}

type EditUserValues = {
  roleName: RoleKey
}

type EditRoleModalProps = EditSideModalFormProps<EditUserValues, Policy> & {
  userId: string
  policy: Policy
}

export function OrgAccessEditUserSideModal({
  onSubmit,
  onSuccess,
  onDismiss,
  userId,
  policy,
  ...props
}: EditRoleModalProps) {
  const orgParams = useRequiredParams('orgName')

  const queryClient = useApiQueryClient()
  const updatePolicy = useApiMutation('organizationPolicyUpdate', {
    onSuccess: (data) => {
      queryClient.invalidateQueries('organizationPolicyView', { path: orgParams })
      onSuccess?.(data)
      onDismiss()
    },
  })

  return (
    <SideModalForm
      onDismiss={onDismiss}
      // TODO: show user name in header or SOMEWHERE
      title="Change user role"
      id="org-access-edit-user"
      onSubmit={
        onSubmit ||
        (({ roleName }) => {
          updatePolicy.mutate({
            path: orgParams,
            body: setUserRole(userId, roleName, policy),
          })
        })
      }
      submitDisabled={updatePolicy.isLoading || !policy}
      error={updatePolicy.error?.error as Error | undefined}
      {...props}
    >
      <ListboxField id="roleName" name="roleName" label="Role" items={roleItems} required />
      <Form.Submit>Update role</Form.Submit>
    </SideModalForm>
  )
}
