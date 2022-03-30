import React from 'react'

import { Success16Icon } from '@oxide/ui'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { useParams, useToast } from '../hooks'
import { Form, NameField, DescriptionField } from '@oxide/form'
import type { PrebuiltFormProps } from '@oxide/form'

const values = {
  name: '',
  description: '',
}

export function CreateProjectForm({
  id = 'create-project-form',
  title = 'Create project',
  initialValues = values,
  onSubmit,
  onSuccess,
  onError,
  ...props
}: PrebuiltFormProps<typeof values>) {
  const queryClient = useApiQueryClient()
  const addToast = useToast()

  const { orgName } = useParams('orgName')

  const createProject = useApiMutation('organizationProjectsPost', {
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
        content: 'Your project has been created.',
        timeout: 5000,
      })
      onSuccess?.(project)
    },
    onError,
  })

  return (
    <Form
      id={id}
      initialValues={initialValues}
      title={title}
      onSubmit={
        onSubmit ||
        (({ name, description }) => {
          createProject.mutate({
            orgName,
            body: { name, description },
          })
        })
      }
      mutation={createProject}
      {...props}
    >
      <NameField id="name" />
      <DescriptionField id="description" />
      <Form.Actions>
        <Form.Submit>Create project</Form.Submit>
        <Form.Cancel />
      </Form.Actions>
    </Form>
  )
}

export default CreateProjectForm
