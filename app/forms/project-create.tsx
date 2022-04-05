import React from 'react'

import { Success16Icon } from '@oxide/ui'
import type { Project } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { useToast } from '../hooks'
import { Form, NameField, DescriptionField } from '@oxide/form'
import type { PrebuiltFormProps } from '@oxide/form'
import { invariant } from '@oxide/util'

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
}: PrebuiltFormProps<typeof values, Project, 'orgName'>) {
  const queryClient = useApiQueryClient()
  const addToast = useToast()

  const createProject = useApiMutation('organizationProjectsPost', {
    onSuccess(project, { orgName }) {
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
      onSuccess?.(project, { orgName })
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
        (({ orgName, ...body }) => {
          invariant(orgName, `instance-create form is missing a path param`)
          createProject.mutate({
            orgName,
            body,
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
