import type { Project, ProjectCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import type { SideModalProps } from '@oxide/ui'
import { Success16Icon } from '@oxide/ui'

import { DescriptionField, Form, NameField, SideModalForm } from 'app/components/form'
import type { EditFormProps } from 'app/forms'

import { useParams, useToast } from '../hooks'

type EditProjectSideModalFormProps = Omit<SideModalProps, 'id'> &
  EditFormProps<ProjectCreate, Project>

export function EditProjectSideModalForm({
  id = 'edit-project-form',
  title = 'Edit project',
  initialValues,
  onSubmit,
  onSuccess,
  onError,
  onDismiss,
  ...props
}: EditProjectSideModalFormProps) {
  const queryClient = useApiQueryClient()
  const addToast = useToast()

  const { orgName } = useParams('orgName')

  const editProject = useApiMutation('organizationProjectsPutProject', {
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
        content: 'Your project has been updated.',
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
          editProject.mutate({
            projectName: initialValues.name,
            orgName,
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
