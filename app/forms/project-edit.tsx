import type { LoaderFunctionArgs } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

import { apiQueryClient, useApiMutation, useApiQuery, useApiQueryClient } from '@oxide/api'
import { Success16Icon } from '@oxide/ui'

import { DescriptionField, NameField, SideModalForm } from 'app/components/form'
import { pb } from 'app/util/path-builder'

import { requireProjectParams, useRequiredParams, useToast } from '../hooks'

EditProjectSideModalForm.loader = async ({ params }: LoaderFunctionArgs) => {
  await apiQueryClient.prefetchQuery('projectView', {
    path: requireProjectParams(params),
  })
  return null
}

export function EditProjectSideModalForm() {
  const queryClient = useApiQueryClient()
  const addToast = useToast()
  const navigate = useNavigate()

  const { orgName, projectName } = useRequiredParams('orgName', 'projectName')

  const onDismiss = () => navigate(pb.projects({ orgName }))

  const { data: project } = useApiQuery('projectView', { path: { orgName, projectName } })

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
      onDismiss()
    },
  })

  return (
    <SideModalForm
      id="edit-project-form"
      formOptions={{ defaultValues: project }}
      title="Edit project"
      onDismiss={onDismiss}
      onSubmit={({ name, description }) => {
        editProject.mutate({
          path: { orgName, projectName },
          body: { name, description },
        })
      }}
      loading={editProject.isLoading}
      submitError={editProject.error}
      submitLabel="Save changes"
    >
      {({ control }) => (
        <>
          <NameField name="name" control={control} />
          <DescriptionField name="description" control={control} />
        </>
      )}
    </SideModalForm>
  )
}
