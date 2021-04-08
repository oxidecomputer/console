import React from 'react'
import styled from 'styled-components'

import { useParams, Link } from 'react-router-dom'

import { useApiData, api } from '@oxide/api'
import { LiveBreadcrumbs, PageHeader, TextWithIcon } from '@oxide/ui'

const Title = styled(TextWithIcon).attrs({
  text: { variant: 'title', as: 'h1' },
  icon: { name: 'instances' },
})``

type Params = {
  projectName: string
}

const ProjectPage = () => {
  const { projectName } = useParams<Params>()
  const { data: project } = useApiData(api.apiProjectsGetProject, {
    projectName,
  })
  const { data: instances } = useApiData(api.apiProjectInstancesGet, {
    projectName,
  })

  if (!project || !instances) return <div>loading</div>

  return (
    <>
      <LiveBreadcrumbs />
      <PageHeader>
        <Title>{project.name}</Title>
      </PageHeader>
      <ul css={{ listStyleType: 'disc', margin: '1rem' }}>
        <li>ID: {project.id}</li>
        <li>Description: {project.description}</li>
      </ul>
      <p>
        <Link to={`/projects/${projectName}/instances`}>
          See {instances.items?.length || 0} Instances
        </Link>
      </p>
    </>
  )
}

export default ProjectPage
