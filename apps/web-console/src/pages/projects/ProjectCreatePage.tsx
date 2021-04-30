import { useEffect } from 'react'
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
import { useBreadcrumbs, useAsync } from '../../hooks'
import { api } from '@oxide/api'
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

  const createProject = useAsync(() =>
    api.apiProjectsPost({ apiProjectCreateParams: { name, description } })
  )

  const onCreateClick = async () => {
    // TODO: validate client-side before attempting to POST
    await createProject.run()
  }

  // redirect on successful post
  useEffect(() => {
    if (createProject.data) {
      history.push(`/projects/${createProject.data.name}`)
    }
  }, [createProject.data, createProject.data?.name, history])

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
          disabled={createProject.pending}
        >
          Create project
        </Button>
      </Form>
    </>
  )
}

export default ProjectCreatePage
