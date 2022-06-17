import { useMemo } from 'react'

import type { ProjectRole, ProjectRolePolicy } from '@oxide/api'
import { setUserRole } from '@oxide/api'
import { useApiQueryClient } from '@oxide/api'
import { useApiMutation } from '@oxide/api'
import { useApiQuery } from '@oxide/api'

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

type RoleItem = { value: ProjectRole; label: string }

const roles: RoleItem[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'collaborator', label: 'Collaborator' },
  { value: 'viewer', label: 'Viewer' },
]

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
  const { data: users } = useApiQuery('usersGet', {})

  const userItems = useMemo(() => {
    // IDs are UUIDs, so no need to include identity type in set value to disambiguate
    const usersInPolicy = new Set(policy?.roleAssignments.map((ra) => ra.identityId) || [])
    return (
      users?.items
        // only show users for adding if they're not already in the policy
        .filter((u) => !usersInPolicy.has(u.id))
        .map((u) => ({ value: u.id, label: u.name })) || []
    )
  }, [users, policy])

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
          // TODO: validate properly so you can't submit if it's ''
          if (roleName === '') return

          updatePolicy.mutate({
            ...projectParams,
            body: setUserRole(userId, roleName, policy),
          })
        })
      }
      submitDisabled={updatePolicy.isLoading}
      error={updatePolicy.error?.error as Error | undefined}
      {...props}
    >
      <ListboxField id="userId" name="userId" items={userItems} label="User" required />
      <ListboxField id="roleName" name="roleName" label="Role" items={roles} required />
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
      <ListboxField id="roleName" name="roleName" label="Role" items={roles} required />
      <Form.Submit>Update role</Form.Submit>
    </SideModalForm>
  )
}
