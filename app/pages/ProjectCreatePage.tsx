import React from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Button,
  PageHeader,
  PageTitle,
  Folder24Icon,
  Success16Icon,
} from '@oxide/ui'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { useParams, useToast } from '../hooks'
import { Form, NameField, DescriptionField } from '@oxide/form'

const ERROR_CODES = {
  ObjectAlreadyExists:
    'A project with that name already exists in this organization',
}

export default function ProjectCreatePage() {
  const queryClient = useApiQueryClient()
  const addToast = useToast()
  const navigate = useNavigate()

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
      navigate(`../${project.name}`)
    },
  })

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Folder24Icon title="Projects" />}>
          Create a new project
        </PageTitle>
      </PageHeader>
      <Form
        id="create-project-form"
        initialValues={{ name: '', description: '' }}
        onSubmit={({ name, description }) => {
          createProject.mutate({
            orgName,
            body: { name, description },
          })
        }}
      >
        <NameField id="name" />
        <DescriptionField id="description" />
        <Form.Actions mutation={createProject} errorCodes={ERROR_CODES}>
          <Button>Create project</Button>
          <Button variant="ghost">Equivalent CLI</Button>
        </Form.Actions>
      </Form>
    </>
  )
}
