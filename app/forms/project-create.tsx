import type { Project, ProjectCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import type { SideModalProps } from '@oxide/ui'
import { Success16Icon } from '@oxide/ui'

import { DescriptionField, NameField, SideModalForm } from 'app/components/form'
import type { CreateFormProps } from 'app/forms'

import { useParams, useToast } from '../hooks'

const values = {
  name: '',
  description: '',
}

type CreateProjectSideModalFormProps = Omit<SideModalProps, 'id'> &
  CreateFormProps<ProjectCreate, Project>

export function CreateProjectSideModalForm({
  id = 'create-project-form',
  title = 'Create project',
  initialValues = values,
  onSubmit,
  onSuccess,
  onError,
  onDismiss,
  ...props
}: CreateProjectSideModalFormProps) {
  const queryClient = useApiQueryClient()
  const addToast = useToast()

  const { orgName } = useParams('orgName')

  const createProject = useApiMutation('organizationProjectsPost', {
    onSuccess(project) {
      // refetch list of projects in sidebar
      queryClient.invalidateQueries('organizationProjectsGet', { orgName })
      // avoid the project fetch when the project page loads since we have the data
      queryClient.setQueryData(
        'organizationProjectsGetProject',
        { orgName, projectName: project.name },
        project
      )
      addToast({
        icon: <Success16Icon />,
        title: 'Success!',
        content: 'Your project has been created.',
        timeout: 5000,
      })
      onSuccess?.(project)
      onDismiss()
    },
    onError,
  })

  return (
    <SideModalForm
      id={id}
      initialValues={initialValues}
      title={title}
      onDismiss={onDismiss}
      onSubmit={
        onSubmit ||
        (({ name, description }) => {
          createProject.mutate({
            orgName,
            body: { name, description },
          })
        })
      }
      submitDisabled={createProject.isLoading}
      error={createProject.error?.error as Error | undefined}
      {...props}
    >
      <NameField id="name" />
      <DescriptionField id="description" />
    </SideModalForm>
  )
}

export default CreateProjectSideModalForm
