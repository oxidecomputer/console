import type { FormEvent } from 'react'
import React, { useState } from 'react'
import styled from 'styled-components'
import { useHistory } from 'react-router-dom'

import {
  Breadcrumbs,
  Button,
  Icon,
  PageHeader,
  TextInputGroup,
  TextWithIcon,
} from '@oxide/ui'
import { useBreadcrumbs } from '../../hooks'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { Debug } from '../../components/Debug'
import { spaceBetweenY, spacing } from '@oxide/css-helpers'

const Title = styled(TextWithIcon).attrs({
  text: { variant: 'title', as: 'h1' },
  icon: { name: 'project' },
})`
  margin-top: ${spacing(1)};

  ${Icon} {
    font-size: ${spacing(8)};
    margin-right: ${spacing(3)};
  }
`

const Form = styled.form`
  margin-top: ${spacing(4)};
  margin-bottom: ${spacing(20)};
  ${spaceBetweenY(8)}
`

const ProjectCreatePage = () => {
  const history = useHistory()
  const breadcrumbs = useBreadcrumbs()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const queryClient = useApiQueryClient()

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
      history.push(`/projects/${data.name}`)
    },
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // TODO: validate client-side before attempting to POST
    createProject.mutate({
      apiProjectCreateParams: { name, description },
    })
  }

  return (
    <>
      <Debug>Post: {JSON.stringify(createProject)}</Debug>
      <Breadcrumbs data={breadcrumbs} />
      <PageHeader>
        <Title>Create Project</Title>
      </PageHeader>
      <Form action="#" onSubmit={handleSubmit}>
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
      </Form>
    </>
  )
}

export default ProjectCreatePage
