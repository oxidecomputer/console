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
import { useApiQuery, useApiMutation } from '@oxide/api'
import { Debug } from '../../components/Debug'
import { spaceBetweenY, spacing } from '@oxide/css-helpers'

const Title = styled(TextWithIcon).attrs({
  text: { variant: 'title', as: 'h1' },
  icon: { name: 'instances' },
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

  const { refetch: refetchProjects } = useApiQuery(
    'apiProjectsGet',
    {},
    { enabled: false }
  )

  const createProject = useApiMutation('apiProjectsPost', {
    onSuccess: (data) => {
      refetchProjects()
      history.push(`/projects/${data.name}`)
    },
  })

  const onCreateClick = () => {
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
        <Title>Create Instance</Title>
      </PageHeader>
      <Form>
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
        <Button
          fullWidth
          onClick={onCreateClick}
          disabled={createProject.isLoading}
        >
          Create project
        </Button>
      </Form>
    </>
  )
}

export default ProjectCreatePage
