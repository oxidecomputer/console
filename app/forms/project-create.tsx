import { useNavigate } from 'react-router-dom'

import type { Project, ProjectCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { Success16Icon } from '@oxide/ui'

import { DescriptionField, NameField, SideModalForm } from 'app/components/hook-form'
import type { SideModalFormProps } from 'app/components/hook-form'
import { pb } from 'app/util/path-builder'

import { useRequiredParams, useToast } from '../hooks'

const values = {
  name: '',
  description: '',
}

export function CreateProjectSideModalForm({
  title = 'Create project',
  defaultValues = values,
  onSuccess,
  onError,
}: SideModalFormProps<ProjectCreate, Project>) {
  const navigate = useNavigate()
  const queryClient = useApiQueryClient()
  const addToast = useToast()

  const { orgName } = useRequiredParams('orgName')

  const onDismiss = () => navigate(pb.projects({ orgName }))

  const createProject = useApiMutation('projectCreate', {
    onSuccess(project) {
      // refetch list of projects in sidebar
      queryClient.invalidateQueries('projectList', { path: { orgName } })
      // avoid the project fetch when the project page loads since we have the data
      const projectParams = { orgName, projectName: project.name }
      queryClient.setQueryData('projectView', { path: projectParams }, project)
      addToast({
        icon: <Success16Icon />,
        title: 'Success!',
        content: 'Your project has been created.',
      })
      onSuccess?.(project)
      navigate(pb.instances(projectParams))
    },
    onError,
  })

  return (
    <SideModalForm
      id="create-project-form"
      formOptions={{ defaultValues }}
      title={title}
      onDismiss={onDismiss}
      onSubmit={({ name, description }) => {
        createProject.mutate({
          path: { orgName },
          body: { name, description },
        })
      }}
      submitDisabled={createProject.isLoading}
      error={createProject.error?.error as Error | undefined}
      isOpen
    >
      {(control) => (
        <>
          <NameField name="name" control={control} />
          <DescriptionField name="description" control={control} />
        </>
      )}
    </SideModalForm>
  )
}
