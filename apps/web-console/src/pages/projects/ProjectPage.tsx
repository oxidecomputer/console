import React from 'react'
import { useParams, Link } from 'react-router-dom'
import 'twin.macro'

import { useApiQuery } from '@oxide/api'
import { Breadcrumbs, Button, PageHeader, PageTitle } from '@oxide/ui'
import { InstancesTable } from './InstancesTable'
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

  if (!project) return <div>loading</div>

  return (
    <>
      <Breadcrumbs data={breadcrumbs} />
      <PageHeader>
        <PageTitle icon="project">{project.name}</PageTitle>
      </PageHeader>

      <InstancesTable />
      <Link tw="block mt-4" to={`/projects/${projectName}/instances/new`}>
        <Button>Create instance</Button>
      </Link>
      <Link className="block mt-4" to={`/projects/${projectName}/access`}>
        <Button variant="ghost">Access &amp; IAM</Button>
      </Link>
    </>
  )
}

export default ProjectPage
