import React from 'react'

import { useParams, Link } from 'react-router-dom'

import { useApiQuery } from '@oxide/api'
import { Breadcrumbs, PageHeader, PageTitle } from '@oxide/ui'
import { useBreadcrumbs } from '../../hooks'

type Params = {
  projectName: string
}

const ProjectPage = () => {
  const breadcrumbs = useBreadcrumbs()

  const { projectName } = useParams<Params>()
  const { data: project } = useApiQuery('apiProjectsGetProject', {
    projectName,
  })
  const { data: instances } = useApiQuery('apiProjectInstancesGet', {
    projectName,
  })

  if (!project || !instances) return <div>loading</div>

  return (
    <>
      <Breadcrumbs data={breadcrumbs} />
      <PageHeader>
        <PageTitle icon="project">{project.name}</PageTitle>
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
