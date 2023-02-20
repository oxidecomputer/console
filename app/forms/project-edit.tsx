import type { LoaderFunctionArgs } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

import {
  apiQueryClient,
  toApiSelector,
  toPathQuery,
  useApiMutation,
  useApiQuery,
  useApiQueryClient,
} from '@oxide/api'
import { Success16Icon } from '@oxide/ui'

import { DescriptionField, NameField, SideModalForm } from 'app/components/form'
import { pb } from 'app/util/path-builder'

import { requireProjectParams, useProjectParams, useToast } from '../hooks'

EditProjectSideModalForm.loader = async ({ params }: LoaderFunctionArgs) => {
  const { projectName, orgName } = requireProjectParams(params)
  await apiQueryClient.prefetchQuery('projectViewV1', {
    path: { project: projectName },
    query: { organization: orgName },
  })
  return null
}

export function EditProjectSideModalForm() {
  const queryClient = useApiQueryClient()
  const addToast = useToast()
  const navigate = useNavigate()

  const projectParams = useProjectParams()
  const { orgName } = projectParams

  const onDismiss = () => navigate(pb.projects({ orgName }))

  const { data: project } = useApiQuery(
    'projectViewV1',
    // ok, I immediately feel this is a bad idea and want to change course. too
    // many function calls. type inference on hover helps show what you're doing
    // but it's still very alienating from the simple objects actually being
    // passed around
    toPathQuery('project', toApiSelector(projectParams))
  )

  const editProject = useApiMutation('projectUpdateV1', {
    onSuccess(project) {
      // refetch list of projects in sidebar
      // TODO: check this invalidation
      queryClient.invalidateQueries('projectListV1', { query: { organization: orgName } })
      // avoid the project fetch when the project page loads since we have the data
      queryClient.setQueryData(
        'projectViewV1',
        {
          path: { project: project.name },
          query: { organization: orgName },
        },
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
          ...toPathQuery('project', toApiSelector(projectParams)),
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
