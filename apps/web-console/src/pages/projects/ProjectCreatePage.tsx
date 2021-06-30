import type { FormEvent } from 'react'
import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'

import {
  Breadcrumbs,
  Button,
  PageHeader,
  PageTitle,
  TextInputGroup,
} from '@oxide/ui'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { useBreadcrumbs, useToast } from '../../hooks'
import { getServerError } from '../../util/errors'

const ERROR_CODES = {
  ObjectAlreadyExists:
    'A project with that name already exists in this organization',
}

const ProjectCreatePage = () => {
  const history = useHistory()
  const breadcrumbs = useBreadcrumbs()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const queryClient = useApiQueryClient()
  const addToast = useToast()

  const createProject = useApiMutation('apiProjectsPost', {
    onSuccess: (data) => {
      // refetch list of projects in sidebar
      queryClient.invalidateQueries('apiProjectsGet', {})
      // avoid the project fetch when the project page loads since we have the data
      queryClient.setQueryData(
        'apiProjectsGetProject',
        { projectName: data.name },
        data
      )
      addToast({
        type: 'default',
        title: 'Success!',
        content: 'Your project has been created.',
        icon: 'checkO',
        timeout: 5000,
      })
      history.push(`/projects/${data.name}`)
    },
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // TODO: validate client-side before attempting to POST
    if (!createProject.isLoading) {
      createProject.mutate({
        apiProjectCreateParams: { name, description },
      })
    }
  }

  return (
    <>
      <Breadcrumbs data={breadcrumbs} />
      <PageHeader>
        <PageTitle icon="project">Create Project</PageTitle>
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
