import type { Project, ProjectCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { Success16Icon } from '@oxide/ui'

import { DescriptionField, NameField, SideModalForm } from 'app/components/hook-form'
import type { EditSideModalFormProps } from 'app/components/hook-form'

import { useRequiredParams, useToast } from '../hooks'

export function EditProjectSideModalForm({
  title = 'Edit project',
  defaultValues,
  onSuccess,
  onError,
  onDismiss,
  isOpen,
}: EditSideModalFormProps<ProjectCreate, Project>) {
  console.log('edit project', { defaultValues })
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
      id="edit-project-form"
      formOptions={{ defaultValues }}
      title={title}
      onDismiss={onDismiss}
      onSubmit={({ name, description }) => {
        editProject.mutate({
          path: {
            projectName: defaultValues.name,
            orgName,
          },
          body: { name, description },
        })
      }}
      submitDisabled={editProject.isLoading}
      error={editProject.error?.error as Error | undefined}
      submitLabel="Save changes"
      isOpen={isOpen}
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

export default EditProjectSideModalForm
