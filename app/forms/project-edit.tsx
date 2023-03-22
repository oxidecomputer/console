import type { LoaderFunctionArgs } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

import { apiQueryClient, useApiMutation, useApiQuery, useApiQueryClient } from '@oxide/api'
import { Success12Icon } from '@oxide/ui'
import { toPathQuery } from '@oxide/util'

import { DescriptionField, NameField, SideModalForm } from 'app/components/form'
import { pb } from 'app/util/path-builder'

import { getProjectSelector, useProjectSelector, useToast } from '../hooks'

EditProjectSideModalForm.loader = async ({ params }: LoaderFunctionArgs) => {
  await apiQueryClient.prefetchQuery(
    'projectViewV1',
    toPathQuery('project', getProjectSelector(params))
  )
  return null
}

export function EditProjectSideModalForm() {
  const queryClient = useApiQueryClient()
  const addToast = useToast()
  const navigate = useNavigate()

  const projectSelector = useProjectSelector()
  const projectPathQuery = toPathQuery('project', projectSelector)
  const { organization } = projectSelector

  const onDismiss = () => navigate(pb.projects(projectSelector))

  const { data: project } = useApiQuery('projectViewV1', projectPathQuery)

  const editProject = useApiMutation('projectUpdateV1', {
    onSuccess(project) {
      // refetch list of projects in sidebar
      // TODO: check this invalidation
      queryClient.invalidateQueries('projectListV1', { query: { organization } })
      // avoid the project fetch when the project page loads since we have the data
      queryClient.setQueryData(
        'projectViewV1',
        { path: { project: project.name }, query: { organization } },
        project
      )
      addToast({
        icon: <Success12Icon />,
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
        editProject.mutate({ ...projectPathQuery, body: { name, description } })
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
