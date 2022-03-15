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
  Folder24Icon,
  Success16Icon,
  FieldLabel,
} from '@oxide/ui'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { useParams, useToast } from '../hooks'
import { getServerError } from '../util/errors'
import { validateName } from '../util/validate'

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
      <Formik
        initialValues={{ name: '', description: '' }}
        onSubmit={({ name, description }) => {
          createProject.mutate({
            orgName,
            body: { name, description },
          })
        }}
      >
        <Form>
          <div className="mb-4">
            <FieldLabel htmlFor="project-name">Choose a name</FieldLabel>
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
            <FieldLabel htmlFor="project-description">
              Choose a description
            </FieldLabel>
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
            variant="secondary"
            className="w-[30rem]"
            disabled={createProject.isLoading}
          >
            Create project
          </Button>
          <div className="mt-2 text-destructive">
            {getServerError(createProject.error, ERROR_CODES)}
          </div>
        </Form>
      </Formik>
    </>
  )
}
