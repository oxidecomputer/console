import React from 'react'
import 'twin.macro'

import { Link } from 'react-router-dom'

import { useApiQuery } from '@oxide/api'
import { useBreadcrumbs } from '../../hooks'
import { Breadcrumbs, PageHeader, PageTitle } from '@oxide/ui'

const ProjectsPage = () => {
  const breadcrumbs = useBreadcrumbs()
  const { data } = useApiQuery('apiProjectsGet', {})

  if (!data) return <div>loading</div>

  return (
    <>
      <Breadcrumbs data={breadcrumbs} />
      <PageHeader>
        <PageTitle icon="projects">Projects</PageTitle>
      </PageHeader>
      {data.items.length === 0 && <div tw="mt-4">No projects yet!</div>}
      <ul css={{ listStyleType: 'disc', margin: '1rem' }}>
        {data.items.map((item) => (
          <li key={item.id}>
            <Link to={`/projects/${item.name}`}>{item.name}</Link>
          </li>
        ))}
      </ul>
    </>
  )
}

export default ProjectsPage
