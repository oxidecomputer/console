import { useMemo } from 'react'

import type { ProjectRoles, ProjectRolesPolicy } from '@oxide/api'
import { useApiQueryClient } from '@oxide/api'
import { useApiMutation } from '@oxide/api'
import { useApiQuery } from '@oxide/api'

import { Form, ListboxField } from 'app/components/form'
import type { PrebuiltFormProps } from 'app/forms'
import { useParams } from 'app/hooks'

type AddUserValues = {
  userId: string
  roleName: ProjectRoles | ''
}

const initialValues: AddUserValues = {
  userId: '',
  roleName: '',
}

type RoleItem = { value: ProjectRoles; label: string }

const roles: RoleItem[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'collaborator', label: 'Collaborator' },
  { value: 'viewer', label: 'Viewer' },
]

export function AddUserToProjectForm({
  onSubmit,
  onSuccess,
  ...props
}: PrebuiltFormProps<AddUserValues, ProjectRolesPolicy>) {
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
    },
  })

  return (
    <Form
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
      mutation={updatePolicy}
      {...props}
    >
      <ListboxField id="userId" name="userId" items={userItems} label="User" required />
      <ListboxField id="roleName" name="roleName" label="Role" items={roles} required />
      <Form.Actions>
        <Form.Submit>Add user</Form.Submit>
        <Form.Cancel />
      </Form.Actions>
    </Form>
  )
}
