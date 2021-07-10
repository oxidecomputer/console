import React from 'react'
import { useParams, Link } from 'react-router-dom'

import { useApiQuery } from '@oxide/api'
import { Breadcrumbs, Button, PageHeader, PageTitle } from '@oxide/ui'
import { InstancesTable } from '../components/InstancesTable'
import { useBreadcrumbs } from '../hooks'

type Params = {
  projectName: string
}

const ProjectPage = () => {
  const breadcrumbs = useBreadcrumbs()

  const { projectName } = useParams<Params>()
  const { data: project } = useApiQuery('projectsGetProject', {
    projectName,
  })

  if (!project) return <div>loading</div>

  return (
    <>
      <Breadcrumbs data={breadcrumbs} />
      <PageHeader>
        <PageTitle icon="project">{project.name}</PageTitle>
      </PageHeader>

      <InstancesTable className="mb-12" />
      <div className="space-x-4">
        <Link to={`/projects/${projectName}/instances/new`}>
          <Button>Create instance</Button>
        </Link>
        <Link to={`/projects/${projectName}/access`}>
          <Button variant="ghost">Access &amp; IAM</Button>
        </Link>
      </div>
    </>
  )
}

export default ProjectPage
