import type { SideModalProps } from '@oxide/ui'
import { Success16Icon } from '@oxide/ui'
import type { Project, ProjectCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { useParams, useToast } from '../hooks'
import { NameField, DescriptionField, SideModalForm, Form } from 'app/components/form'
import type { EditFormProps } from 'app/forms'

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

  const createProject = useApiMutation('organizationProjectsPutProject', {
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
          createProject.mutate({
            projectName: initialValues.name,
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
      <Form.Submit>Save changes</Form.Submit>
    </SideModalForm>
  )
}

export default EditProjectSideModalForm
