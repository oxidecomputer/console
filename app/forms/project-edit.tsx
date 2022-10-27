import type { LoaderFunctionArgs } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useLoaderData } from 'react-router-dom'

import type { Project, ProjectCreate } from '@oxide/api'
import { apiQueryClient } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { Success16Icon } from '@oxide/ui'

import { DescriptionField, NameField, SideModalForm } from 'app/components/hook-form'
import type { SideModalFormProps } from 'app/components/hook-form'
import { pb } from 'app/util/path-builder'

import { requireProjectParams, useRequiredParams, useToast } from '../hooks'

EditProjectSideModalForm.loader = async ({ params }: LoaderFunctionArgs) => {
  return apiQueryClient.fetchQuery('projectView', {
    path: requireProjectParams(params),
  })
}

export function EditProjectSideModalForm({
  title = 'Edit project',
  onSuccess,
  onError,
}: SideModalFormProps<ProjectCreate, Project>) {
  const queryClient = useApiQueryClient()
  const addToast = useToast()
  const navigate = useNavigate()

  const { orgName, projectName } = useRequiredParams('orgName', 'projectName')

  const onDismiss = () => navigate(pb.projects({ orgName }))

  const project = useLoaderData() as Project

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
      formOptions={{ defaultValues: project }}
      title={title}
      onDismiss={onDismiss}
      onSubmit={({ name, description }) => {
        editProject.mutate({
          path: { orgName, projectName },
          body: { name, description },
        })
      }}
      submitDisabled={editProject.isLoading}
      error={editProject.error?.error as Error | undefined}
      submitLabel="Save changes"
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
