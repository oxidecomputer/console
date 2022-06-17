import type { ProjectRole, ProjectRolePolicy } from '@oxide/api'
import { setUserRole } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'

import { Form, ListboxField, SideModalForm } from 'app/components/form'
import { useParams } from 'app/hooks'

import type { EditSideModalFormProps } from '.'

type EditUserValues = {
  roleName: ProjectRole | ''
}

// TODO: share with add user
type RoleItem = { value: ProjectRole; label: string }
const roles: RoleItem[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'collaborator', label: 'Collaborator' },
  { value: 'viewer', label: 'Viewer' },
]

type Props = EditSideModalFormProps<EditUserValues, ProjectRolePolicy> & {
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
}: Props) {
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
      title="Edit user access"
      id="project-access-edit-user"
      onSubmit={
        onSubmit ||
        (({ roleName }) => {
          // TODO: validate properly so you can't submit if it's ''
          if (roleName === '') return

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
      <Form.Submit>Update user</Form.Submit>
    </SideModalForm>
  )
}
