import React from 'react'

import { Breadcrumbs, PageHeader, PageTitle, Table2 } from '@oxide/ui'
import { useBreadcrumbs } from '../../hooks'

const ProjectPage = () => {
  const breadcrumbs = useBreadcrumbs()

  return (
    <>
      <Breadcrumbs data={breadcrumbs} />
      <PageHeader>
        <PageTitle icon="users">Access &amp; IAM</PageTitle>
      </PageHeader>

      <Table2 className="mt-4" />
    </>
  )
}

export default ProjectPage
