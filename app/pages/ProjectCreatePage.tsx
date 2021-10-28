import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Formik, Form } from 'formik'

import {
  Button,
  PageHeader,
  PageTitle,
  TextField,
  TextFieldError,
  TextFieldHint,
  TextFieldLabel,
  FolderLargeIcon,
  CheckmarkRoundelSmallIcon,
} from '@oxide/ui'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { useToast } from '../hooks'
import { getServerError } from '../util/errors'
import { validateName } from '../util/validate'

const ERROR_CODES = {
  ObjectAlreadyExists:
    'A project with that name already exists in this organization',
}

const ProjectCreatePage = () => {
  const navigate = useNavigate()

  const queryClient = useApiQueryClient()
  const addToast = useToast()

  const createProject = useApiMutation('projectsPost', {
    onSuccess: (data) => {
      // refetch list of projects in sidebar
      queryClient.invalidateQueries('projectsGet', {})
      // avoid the project fetch when the project page loads since we have the data
      queryClient.setQueryData(
        'projectsGetProject',
        { projectName: data.name },
        data
      )
      addToast({
        icon: <CheckmarkRoundelSmallIcon title="Success" />,
        title: 'Success!',
        content: 'Your project has been created.',
        timeout: 5000,
      })
      navigate(`/projects/${data.name}`)
    },
  })

  return (
    <>
      <PageHeader>
        <PageTitle icon={<FolderLargeIcon title="Projects" />}>
          Create a new project
        </PageTitle>
      </PageHeader>
      <Formik
        initialValues={{ name: '', description: '' }}
        onSubmit={({ name, description }) => {
          createProject.mutate({ projectCreateParams: { name, description } })
        }}
      >
        <Form>
          <div className="mb-4">
            <TextFieldLabel htmlFor="project-name">
              Choose a name
            </TextFieldLabel>
            <TextField
              id="project-name"
              name="name"
              placeholder="Enter name"
              validate={validateName}
              autoComplete="off"
            />
            <TextFieldError name="name" />
          </div>
          <div className="mb-8">
            <TextFieldLabel htmlFor="project-description">
              Choose a description
            </TextFieldLabel>
            <TextFieldHint id="description-hint">
              What is unique about your project?
            </TextFieldHint>
            <TextField
              id="project-description"
              name="description"
              aria-describedby="description-hint"
              placeholder="A project"
              autoComplete="off"
            />
          </div>
          <Button
            type="submit"
            variant="dim"
            className="w-[30rem]"
            disabled={createProject.isLoading}
          >
            Create project
          </Button>
          <div className="text-red-500">
            {getServerError(createProject.error, ERROR_CODES)}
          </div>
        </Form>
      </Formik>
    </>
  )
}

export default ProjectCreatePage
