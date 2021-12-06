import React from 'react'
import { Link } from 'react-router-dom'

import { useApiQuery } from '@oxide/api'
import { buttonStyle, PageHeader, PageTitle, Instances24Icon } from '@oxide/ui'
import { InstancesTable } from '../../../components/InstancesTable'
import { useParams } from '../../../hooks'

export const InstancesPage = () => {
  const { orgName, projectName } = useParams('orgName', 'projectName')
  const { data: project } = useApiQuery('organizationProjectsGetProject', {
    organizationName: orgName,
    projectName,
  })

  if (!project) return null

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Instances24Icon title="Project" />}>
          {project.name}
        </PageTitle>
      </PageHeader>

      <InstancesTable className="mb-12" />
      <div className="space-x-4">
        <Link
          to={`/orgs/${orgName}/projects/${projectName}/instances/new`}
          className={buttonStyle()}
        >
          Create instance
        </Link>
        <Link
          to={`/orgs/${orgName}/projects/${projectName}/access`}
          className={buttonStyle({ variant: 'ghost' })}
        >
          Access &amp; IAM
        </Link>
      </div>
    </>
  )
}
