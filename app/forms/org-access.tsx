import * as Yup from 'yup'

import type { OrganizationRole, OrganizationRolePolicy } from '@oxide/api'
import { orgRoles, useUsersNotInPolicy } from '@oxide/api'
import { setUserRole } from '@oxide/api'
import { useApiQueryClient } from '@oxide/api'
import { useApiMutation } from '@oxide/api'
import { capitalize } from '@oxide/util'

import { Form, ListboxField, SideModalForm } from 'app/components/form'
import { useParams } from 'app/hooks'

import type { CreateSideModalFormProps, EditSideModalFormProps } from '.'

type AddUserValues = {
  userId: string
  roleName: OrganizationRole | ''
}

const initialValues: AddUserValues = {
  userId: '',
  roleName: '',
}

const roleItems = orgRoles.map((role) => ({ value: role, label: capitalize(role) }))

type AddRoleModalProps = CreateSideModalFormProps<AddUserValues, OrganizationRolePolicy> & {
  policy: OrganizationRolePolicy
}

export function OrgAccessAddUserSideModal({
  onSubmit,
  onSuccess,
  onDismiss,
  policy,
  ...props
}: AddRoleModalProps) {
  const orgParams = useParams('orgName')

  const users = useUsersNotInPolicy(policy)
  const userItems = users.map((u) => ({ value: u.id, label: u.id }))

  const queryClient = useApiQueryClient()
  const updatePolicy = useApiMutation('organizationPutPolicy', {
    onSuccess: (data) => {
      queryClient.invalidateQueries('organizationGetPolicy', orgParams)
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
            ...orgParams,
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
  roleName: OrganizationRole
}

type EditRoleModalProps = EditSideModalFormProps<EditUserValues, OrganizationRolePolicy> & {
  userId: string
  policy: OrganizationRolePolicy
}

export function OrgAccessEditUserSideModal({
  onSubmit,
  onSuccess,
  onDismiss,
  userId,
  policy,
  ...props
}: EditRoleModalProps) {
  const orgParams = useParams('orgName')

  const queryClient = useApiQueryClient()
  const updatePolicy = useApiMutation('organizationPutPolicy', {
    onSuccess: (data) => {
      queryClient.invalidateQueries('organizationGetPolicy', orgParams)
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
            ...orgParams,
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
