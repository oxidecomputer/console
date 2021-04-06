import React from 'react'
import styled from 'styled-components'

import { useParams, Link } from 'react-router-dom'

import { useApiData, api } from '@oxide/api'
import { Breadcrumbs, PageHeader, TextWithIcon } from '@oxide/ui'

const Title = styled(TextWithIcon).attrs({
  text: { variant: 'title', as: 'h1' },
  icon: { name: 'instances' },
})``

type Params = {
  projectName: string
}

const InstancesPage = () => {
  const { projectName } = useParams<Params>()
  const { data } = useApiData(api.apiProjectInstancesGet, { projectName })

  if (!data) return <div>loading</div>

  console.log({ data })

  const breadcrumbs = [
    { href: '/', label: 'Maze War' },
    { href: '/projects', label: 'Projects' },
    { href: `/projects/${projectName}`, label: projectName },
    { label: 'Instances' },
  ]

  return (
    <>
      <Breadcrumbs data={breadcrumbs} />
      <PageHeader>
        <Title>Instances for Project: {projectName}</Title>
      </PageHeader>
      <ul css={{ listStyleType: 'disc', margin: '1rem' }}>
        {data.items.map((item) => (
          <li key={item.id}>
            <Link to={`/projects/${projectName}/instances/${item.name}`}>
              {item.name}
            </Link>
          </li>
        ))}
        {data.items.length === 0 && <p>No instances!</p>}
      </ul>
    </>
  )
}

export default InstancesPage
