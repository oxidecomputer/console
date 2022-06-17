import { useMemo } from 'react'

import type { ProjectRole, ProjectRolePolicy } from '@oxide/api'
import { setUserRole } from '@oxide/api'
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
  const { data: users } = useApiQuery('usersGet', {})
  const { data: policy } = useApiQuery(
    'organizationProjectsGetProjectPolicy',
    projectParams
  )

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
      id="add-user-to-project-form"
      initialValues={initialValues}
      onSubmit={
        onSubmit ||
        (({ userId, roleName }) => {
          // TODO: validate properly so you can't submit if it's ''
          if (roleName === '') return

          updatePolicy.mutate({
            ...projectParams,
            // assume policy is present because submit is disabled otherwise
            // TODO: is there a better way to ensure policy is present at submit time?
            body: setUserRole(userId, roleName, policy!),
          })
        })
      }
      submitDisabled={updatePolicy.isLoading || !policy}
      error={updatePolicy.error?.error as Error | undefined}
      {...props}
    >
      <ListboxField id="userId" name="userId" items={userItems} label="User" required />
      <ListboxField id="roleName" name="roleName" label="Role" items={roles} required />
      <Form.Submit>Add user</Form.Submit>
    </SideModalForm>
  )
}
