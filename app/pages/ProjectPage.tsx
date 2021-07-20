import React from 'react'
import { useParams, Link } from 'react-router-dom'

import { useApiQuery } from '@oxide/api'
import { Breadcrumbs, buttonStyle, PageHeader, PageTitle } from '@oxide/ui'
import { InstancesTable } from '../components/InstancesTable'
import { useBreadcrumbs } from '../hooks'

const ProjectPage = () => {
  const breadcrumbs = useBreadcrumbs()

  const { projectName } = useParams()
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
        <Link
          to={`/projects/${projectName}/instances/new`}
          className={buttonStyle()}
        >
          Create instance
        </Link>
        <Link
          to={`/projects/${projectName}/access`}
          className={buttonStyle({ variant: 'ghost' })}
        >
          Access &amp; IAM
        </Link>
      </div>
    </>
  )
}

export default ProjectPage
