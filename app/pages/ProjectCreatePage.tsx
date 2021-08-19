import type { FormEvent } from 'react'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button, PageHeader, PageTitle, TextInputGroup } from '@oxide/ui'
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
        <TextInputGroup
          id="project-name"
          label="Choose a name"
          onChange={setName}
          placeholder="Enter name"
          required
          value={name}
        />
        <TextInputGroup
          id="project-description"
          label="Choose a description"
          hint="What is unique about your project?"
          onChange={setDescription}
          placeholder="A project"
          required
          value={description}
        />
        <Button type="submit" fullWidth disabled={createProject.isLoading}>
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
