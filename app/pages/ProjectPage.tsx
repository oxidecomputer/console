import React from 'react'
import { useParams, Link } from 'react-router-dom'

import { useApiQuery } from '@oxide/api'
import { buttonStyle, PageHeader, PageTitle } from '@oxide/ui'
import { InstancesTable } from '../components/InstancesTable'

const ProjectPage = () => {
  const { projectName } = useParams()
  const { data: project } = useApiQuery('projectsGetProject', {
    projectName,
  })

  if (!project) return <div>loading</div>

  return (
    <>
      <PageHeader>
        <PageTitle icon="project">{project.name}</PageTitle>
      </PageHeader>

      <InstancesTable className="my-12" />
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
