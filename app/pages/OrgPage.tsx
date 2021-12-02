import React from 'react'
import { Link } from 'react-router-dom'

import { useApiQuery } from '@oxide/api'
import { buttonStyle, PageHeader, PageTitle, Folder24Icon } from '@oxide/ui'
import { useParams } from '../hooks'

export default function OrgPage() {
  const { orgName } = useParams('orgName')
  const { data: org } = useApiQuery('organizationsGetOrganization', {
    organizationName: orgName,
  })

  if (!org) return null

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Folder24Icon title="Organization" />}>
          {org.name}
        </PageTitle>
      </PageHeader>

      <div className="space-x-4">
        <Link to="projects/new" className={buttonStyle()}>
          Create project
        </Link>
      </div>
    </>
  )
}
