import React from 'react'
import styled from 'styled-components'
import { v4 as uuid } from 'uuid'

import { useParams, Link } from 'react-router-dom'

import { useApi, api } from '@oxide/api'
import { Breadcrumbs, Button, PageHeader, TextWithIcon } from '@oxide/ui'
import { useBreadcrumbs } from '../../hooks'

const Title = styled(TextWithIcon).attrs({
  text: { variant: 'title', as: 'h1' },
  icon: { name: 'instances' },
})``

const createInstance = (projectName: string) =>
  api.apiProjectInstancesPost({
    projectName,
    apiInstanceCreateParams: {
      bootDiskSize: 1,
      description: `An instance in project: ${projectName}`,
      hostname: 'oxide.com',
      memory: 10,
      name: `i-${uuid().substr(0, 8)}`,
      ncpus: 2,
    },
  })

type Params = {
  projectName: string
}

const InstancesPage = () => {
  const breadcrumbs = useBreadcrumbs()

  const { projectName } = useParams<Params>()
  const { data, mutate } = useApi('apiProjectInstancesGet', { projectName })

  const onCreateClick = async () => {
    await createInstance(projectName)
    mutate()
  }

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
      <Button onClick={onCreateClick} style={{ marginTop: '1rem' }}>
        Create instance
      </Button>
    </>
  )
}

export default InstancesPage
