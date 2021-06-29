import React from 'react'
import { useParams, Link } from 'react-router-dom'
import 'twin.macro'

import { useApiQuery } from '@oxide/api'
import { Breadcrumbs, Button, PageHeader, PageTitle } from '@oxide/ui'
import { useBreadcrumbs } from '../../hooks'
import { pluralize } from '../../util/str'

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
      <Button variant="link">
        <Link to={`/projects/${projectName}/instances`}>
          See {pluralize('Instance', instances.items.length)}
        </Link>
      </Button>
      <Link tw="block mt-4" to={`/projects/${projectName}/instances/new`}>
        <Button>Create instance</Button>
      </Link>
      <Button tw="block mt-4" variant="ghost">
        <Link to={`/projects/${projectName}/access`}>Access &amp; IAM</Link>
      </Button>
    </>
  )
}

export default ProjectPage
