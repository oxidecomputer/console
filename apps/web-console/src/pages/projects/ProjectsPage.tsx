import React from 'react'
import styled from 'styled-components'

import { Link } from 'react-router-dom'

import { useApiData, api } from '@oxide/api'
import { LiveBreadcrumbs, PageHeader, TextWithIcon } from '@oxide/ui'

const Title = styled(TextWithIcon).attrs({
  text: { variant: 'title', as: 'h1' },
  icon: { name: 'instances' },
})``

const ProjectsPage = () => {
  const { data } = useApiData(api.apiProjectsGet, {})

  if (!data) return <div>loading</div>

  return (
    <>
      <LiveBreadcrumbs />
      <PageHeader>
        <Title>Projects</Title>
      </PageHeader>
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
