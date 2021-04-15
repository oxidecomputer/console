import type { ChangeEvent } from 'react'
import React, { useState } from 'react'
import styled from 'styled-components'
import { v4 as uuid } from 'uuid'

import { useParams, Link } from 'react-router-dom'

import { useApi, api, useAsync } from '@oxide/api'
import {
  Breadcrumbs,
  Button,
  PageHeader,
  TextField,
  TextWithIcon,
} from '@oxide/ui'
import { useBreadcrumbs } from '../../hooks'

const Title = styled(TextWithIcon).attrs({
  text: { variant: 'title', as: 'h1' },
  icon: { name: 'instances' },
})``

type Params = {
  projectName: string
}

const Box = styled.div`
  margin-top: 1rem;
  border: 1px solid white;
  padding: 1rem;
`

const InstancesPage = () => {
  const breadcrumbs = useBreadcrumbs()

  const { projectName } = useParams<Params>()
  const { data, mutate } = useApi('apiProjectInstancesGet', { projectName })

  const [ncpus, setNcpus] = useState('2')

  const createInstance = useAsync(() =>
    api.apiProjectInstancesPost({
      projectName,
      apiInstanceCreateParams: {
        bootDiskSize: 1,
        description: `An instance in project: ${projectName}`,
        hostname: 'oxide.com',
        memory: 10,
        name: `i-${uuid().substr(0, 8)}`,
        // deliberately allow passing strings here to trigger 400s
        ncpus: /^\d+$/.test(ncpus) ? parseInt(ncpus, 10) : ncpus,
      },
    })
  )

  const onCreateClick = async () => {
    await createInstance.execute()
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
      <Box>Post response: {JSON.stringify(createInstance.value)}</Box>
      <Box>Post error: {JSON.stringify(createInstance.error)}</Box>
      <div style={{ marginTop: '1rem' }}>
        <TextField
          value={ncpus}
          required
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setNcpus(e.target.value)
          }
        >
          Number of CPUs
        </TextField>
      </div>

      <Button
        onClick={onCreateClick}
        style={{ marginTop: '1rem' }}
        disabled={createInstance.isPending}
      >
        Create instance
      </Button>
    </>
  )
}

export default InstancesPage
