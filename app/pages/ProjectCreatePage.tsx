import type { FormEvent } from 'react'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Button,
  PageHeader,
  PageTitle,
  TextField,
  TextFieldHint,
  TextFieldLabel,
} from '@oxide/ui'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { useToast } from '../hooks'
import { getServerError } from '../util/errors'

const ERROR_CODES = {
  ObjectAlreadyExists:
    'A project with that name already exists in this organization',
}

const ProjectCreatePage = () => {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

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
        title: 'Success!',
        content: 'Your project has been created.',
        icon: 'checkO',
        timeout: 5000,
      })
      navigate(`/projects/${data.name}`)
    },
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // TODO: validate client-side before attempting to POST
    if (!createProject.isLoading) {
      createProject.mutate({ projectCreateParams: { name, description } })
    }
  }

  return (
    <>
      <PageHeader>
        <PageTitle icon="project">Create a new project</PageTitle>
      </PageHeader>
      <form action="#" onSubmit={handleSubmit} className="mt-4 mb-20 space-y-8">
        <div>
          <TextFieldLabel htmlFor="project_name">Choose a name</TextFieldLabel>
          <TextField
            id="project_name"
            name="project_name"
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name"
            value={name}
          />
        </div>
        <div>
          <TextFieldLabel htmlFor="project_description">
            Choose a description
          </TextFieldLabel>
          <TextFieldHint id="description-hint">
            What is unique about your project?
          </TextFieldHint>
          <TextField
            id="project_description"
            name="project_description"
            aria-describedby="description-hint"
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A project"
            value={description}
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
      </form>
    </>
  )
}

export default ProjectCreatePage
