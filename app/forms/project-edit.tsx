import type { Project, ProjectCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { Success16Icon } from '@oxide/ui'

import { DescriptionField, Form, NameField, SideModalForm } from 'app/components/form'

import type { EditSideModalFormProps } from '.'
import { useRequiredParams, useToast } from '../hooks'

export function EditProjectSideModalForm({
  id = 'edit-project-form',
  title = 'Edit project',
  initialValues,
  onSubmit,
  onSuccess,
  onError,
  onDismiss,
  ...props
}: EditSideModalFormProps<ProjectCreate, Project>) {
  const queryClient = useApiQueryClient()
  const addToast = useToast()

  const { orgName } = useRequiredParams('orgName')

  const editProject = useApiMutation('projectUpdate', {
    onSuccess(project) {
      // refetch list of projects in sidebar
      queryClient.invalidateQueries('projectList', { path: { orgName } })
      // avoid the project fetch when the project page loads since we have the data
      queryClient.setQueryData(
        'projectView',
        { path: { orgName, projectName: project.name } },
        project
      )
      addToast({
        icon: <Success16Icon />,
        title: 'Success!',
        content: 'Your project has been updated.',
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
          editProject.mutate({
            path: {
              projectName: initialValues.name,
              orgName,
            },
            body: { name, description },
          })
        })
      }
      submitDisabled={editProject.isLoading}
      error={editProject.error?.error as Error | undefined}
      {...props}
    >
      <NameField id="name" />
      <DescriptionField id="description" />
      <Form.Submit>Save changes</Form.Submit>
    </SideModalForm>
  )
}

export default EditProjectSideModalForm
