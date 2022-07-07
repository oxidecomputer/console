import { useNavigate } from 'react-router-dom'

import type { Project, ProjectCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { Success16Icon } from '@oxide/ui'

import { DescriptionField, NameField, SideModalForm } from 'app/components/form'
import type { CreateSideModalFormProps } from 'app/forms'

import { useParams, useToast } from '../hooks'

const values = {
  name: '',
  description: '',
}

export function CreateProjectSideModalForm({
  id = 'create-project-form',
  title = 'Create project',
  initialValues = values,
  onSubmit,
  onSuccess,
  onError,
  onDismiss,
  ...props
}: CreateSideModalFormProps<ProjectCreate, Project>) {
  const navigate = useNavigate()
  const queryClient = useApiQueryClient()
  const addToast = useToast()

  const { orgName } = useParams('orgName')

  const createProject = useApiMutation('projectCreate', {
    onSuccess(project) {
      // refetch list of projects in sidebar
      queryClient.invalidateQueries('projectList', { orgName })
      // avoid the project fetch when the project page loads since we have the data
      queryClient.setQueryData(
        'projectView',
        { orgName, projectName: project.name },
        project
      )
      addToast({
        icon: <Success16Icon />,
        title: 'Success!',
        content: 'Your project has been created.',
      })
      onSuccess?.(project)
      navigate(`/orgs/${orgName}/projects/${project.name}/instances`)
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
