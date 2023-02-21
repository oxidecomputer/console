import { useNavigate } from 'react-router-dom'

import type { ProjectCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { Success16Icon } from '@oxide/ui'
import { toPathQuery } from '@oxide/util'

import { DescriptionField, NameField, SideModalForm } from 'app/components/form'
import { pb } from 'app/util/path-builder'

import { useOrgSelector, useToast } from '../hooks'

const defaultValues: ProjectCreate = {
  name: '',
  description: '',
}

export function CreateProjectSideModalForm() {
  const navigate = useNavigate()
  const queryClient = useApiQueryClient()
  const addToast = useToast()

  const { organization } = useOrgSelector()

  const onDismiss = () => navigate(pb.projects({ organization }))

  const createProject = useApiMutation('projectCreateV1', {
    onSuccess(project) {
      // refetch list of projects in sidebar
      queryClient.invalidateQueries('projectListV1', { query: { organization } })
      // avoid the project fetch when the project page loads since we have the data
      const projectSelector = { organization, project: project.name }
      queryClient.setQueryData(
        'projectViewV1',
        toPathQuery('project', projectSelector),
        project
      )
      addToast({
        icon: <Success16Icon />,
        title: 'Success!',
        content: 'Your project has been created.',
      })
      navigate(pb.instances(projectSelector))
    },
  })

  return (
    <SideModalForm
      id="create-project-form"
      formOptions={{ defaultValues }}
      title="Create project"
      onDismiss={onDismiss}
      onSubmit={({ name, description }) => {
        createProject.mutate({
          query: { organization },
          body: { name, description },
        })
      }}
      loading={createProject.isLoading}
      submitError={createProject.error}
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
