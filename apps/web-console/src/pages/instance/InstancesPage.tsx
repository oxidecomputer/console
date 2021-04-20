import React from 'react'
import styled from 'styled-components'

import { useParams, Link } from 'react-router-dom'

import { useApi } from '@oxide/api'
import { Breadcrumbs, PageHeader, TextWithIcon } from '@oxide/ui'
import { useBreadcrumbs } from '../../hooks'

const Title = styled(TextWithIcon).attrs({
  text: { variant: 'title', as: 'h1' },
  icon: { name: 'instances' },
})``

type Params = {
  projectName: string
}

const InstancesPage = () => {
  const breadcrumbs = useBreadcrumbs()

  const { projectName } = useParams<Params>()
  const { data } = useApi('apiProjectInstancesGet', { projectName })

  if (!data) return <div>loading</div>

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
      <Link
        style={{ marginTop: '1rem' }}
        to={`/projects/${projectName}/instances-new`}
      >
        Create instance
      </Link>
    </>
  )
}

export default InstancesPage
