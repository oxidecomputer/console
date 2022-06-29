import * as Yup from 'yup'

import type { ProjectRole, ProjectRolePolicy } from '@oxide/api'
import { projectRoles } from '@oxide/api'
import { useUsersNotInPolicy } from '@oxide/api'
import { setUserRole } from '@oxide/api'
import { useApiQueryClient } from '@oxide/api'
import { useApiMutation } from '@oxide/api'
import { capitalize } from '@oxide/util'

import { Form, ListboxField, SideModalForm } from 'app/components/form'
import { useParams } from 'app/hooks'

import type { CreateSideModalFormProps, EditSideModalFormProps } from '.'

type AddUserValues = {
  userId: string
  roleName: ProjectRole | ''
}

const initialValues: AddUserValues = {
  userId: '',
  roleName: '',
}

const roleItems = projectRoles.map((role) => ({ value: role, label: capitalize(role) }))

type AddRoleModalProps = CreateSideModalFormProps<AddUserValues, ProjectRolePolicy> & {
  policy: ProjectRolePolicy
}

export function ProjectAccessAddUserSideModal({
  onSubmit,
  onSuccess,
  onDismiss,
  policy,
  ...props
}: AddRoleModalProps) {
  const projectParams = useParams('orgName', 'projectName')

  const users = useUsersNotInPolicy(policy)
  const userItems = users.map((u) => ({ value: u.id, label: u.id }))

  const queryClient = useApiQueryClient()
  const updatePolicy = useApiMutation('organizationProjectsPutProjectPolicy', {
    onSuccess: (data) => {
      queryClient.invalidateQueries('organizationProjectsGetProjectPolicy', projectParams)
      onSuccess?.(data)
      onDismiss()
    },
  })

  return (
    <SideModalForm
      onDismiss={onDismiss}
      title="Add user to project"
      id="project-access-add-user"
      initialValues={initialValues}
      onSubmit={
        onSubmit ||
        (({ userId, roleName }) => {
          // can't happen because roleName is validated not to be '', but TS
          // wants to be sure
          if (roleName === '') return

          updatePolicy.mutate({
            ...projectParams,
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
  roleName: ProjectRole
}

type EditRoleModalProps = EditSideModalFormProps<EditUserValues, ProjectRolePolicy> & {
  userId: string
  policy: ProjectRolePolicy
}

export function ProjectAccessEditUserSideModal({
  onSubmit,
  onSuccess,
  onDismiss,
  userId,
  policy,
  ...props
}: EditRoleModalProps) {
  const projectParams = useParams('orgName', 'projectName')

  const queryClient = useApiQueryClient()
  const updatePolicy = useApiMutation('organizationProjectsPutProjectPolicy', {
    onSuccess: (data) => {
      queryClient.invalidateQueries('organizationProjectsGetProjectPolicy', projectParams)
      onSuccess?.(data)
      onDismiss()
    },
  })

  return (
    <SideModalForm
      onDismiss={onDismiss}
      // TODO: show user name in header or SOMEWHERE
      title="Change user role"
      id="project-access-edit-user"
      onSubmit={
        onSubmit ||
        (({ roleName }) => {
          updatePolicy.mutate({
            ...projectParams,
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
