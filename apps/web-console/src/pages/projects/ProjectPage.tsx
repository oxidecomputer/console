import React from 'react'
import styled from 'styled-components'

import { useParams, Link } from 'react-router-dom'

import { useApiData, api } from '@oxide/api'
import { Breadcrumbs, PageHeader, TextWithIcon } from '@oxide/ui'

const Title = styled(TextWithIcon).attrs({
  text: { variant: 'title', as: 'h1' },
  icon: { name: 'instances' },
})``

const breadcrumbsBase = [
  { href: '/', label: 'Maze War' },
  { href: '/projects', label: 'Projects' },
]

type Params = {
  projectName: string
}

const ProjectPage = () => {
  const { projectName } = useParams<Params>()
  const { data } = useApiData(api.apiProjectsGetProject, { projectName })

  if (!data) return <div>loading</div>

  return (
    <>
      <Breadcrumbs data={[...breadcrumbsBase, { label: projectName }]} />
      <PageHeader>
        <Title>{data.name}</Title>
      </PageHeader>
      <ul css={{ listStyleType: 'disc', margin: '1rem' }}>
        <li>ID: {data.id}</li>
        <li>Description: {data.description}</li>
      </ul>
      <p>
        <Link to={`/projects/${projectName}/instances`}>Instances</Link>
      </p>
    </>
  )
}

export default ProjectPage
