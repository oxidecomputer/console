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
  FieldTitle,
} from '@oxide/ui'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { useParams, useToast } from '../hooks'
import { getServerError } from '../util/errors'
import { validateName } from '../util/validate'

const ERROR_CODES = {
  ObjectAlreadyExists:
    'A project with that name already exists in this organization',
}

// TODO
// exists primarily so we can test it without worrying about route params
export const ProjectCreateForm = ({ orgName }: { orgName: string }) => {}

const ProjectCreatePage = () => {
  const { orgName } = useParams('orgName')
  const navigate = useNavigate()

  const queryClient = useApiQueryClient()
  const addToast = useToast()

  const createProject = useApiMutation('organizationProjectsPost', {
    onSuccess: (data) => {
      // refetch list of projects in sidebar
      queryClient.invalidateQueries('organizationProjectsGet', {
        organizationName: orgName,
      })
      // avoid the project fetch when the project page loads since we have the data
      queryClient.setQueryData(
        'organizationProjectsGetProject',
        { organizationName: orgName, projectName: data.name },
        data
      )
      addToast({
        icon: <Success16Icon />,
        title: 'Success!',
        content: 'Your project has been created.',
        timeout: 5000,
      })
      navigate(`/orgs/${orgName}/projects/${data.name}`)
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
            organizationName: orgName,
            projectCreateParams: { name, description },
          })
        }}
      >
        <Form>
          <div className="mb-4">
            <FieldTitle htmlFor="project-name">Choose a name</FieldTitle>
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
            <FieldTitle htmlFor="project-description">
              Choose a description
            </FieldTitle>
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
