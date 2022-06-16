import { useMemo } from 'react'

import type { ProjectRole, ProjectRolePolicy } from '@oxide/api'
import { useApiQueryClient } from '@oxide/api'
import { useApiMutation } from '@oxide/api'
import { useApiQuery } from '@oxide/api'

import { Form, ListboxField, SideModalForm } from 'app/components/form'
import { useParams } from 'app/hooks'

import type { CreateSideModalFormProps } from '.'

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

export function AddUserToProjectForm({
  onSubmit,
  onSuccess,
  onDismiss,
  ...props
}: CreateSideModalFormProps<AddUserValues, ProjectRolePolicy>) {
  const projectParams = useParams('orgName', 'projectName')
  const queryClient = useApiQueryClient()
  const { data: users } = useApiQuery('usersGet', {})
  const { data: policy } = useApiQuery(
    'organizationProjectsGetProjectPolicy',
    projectParams
  )
  const userItems = useMemo(
    () => users?.items.map((u) => ({ value: u.id, label: u.name })) || [],
    [users]
  )

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
      id="add-user-to-project-form"
      initialValues={initialValues}
      onSubmit={
        onSubmit ||
        (({ userId, roleName }) => {
          // TODO: validate properly so you can't submit if it's ''
          if (roleName === '') return

          updatePolicy.mutate({
            ...projectParams,
            body: {
              // TODO: this is Not Entirely Right
              roleAssignments: [
                ...(policy?.roleAssignments || []),
                { identityId: userId, identityType: 'silo_user', roleName },
              ],
            },
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
