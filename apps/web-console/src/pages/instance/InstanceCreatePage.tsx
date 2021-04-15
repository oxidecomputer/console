import type { ChangeEvent } from 'react'
import { useEffect } from 'react'
import React, { useState } from 'react'
import styled from 'styled-components'
import { useParams, useHistory } from 'react-router-dom'

import {
  Breadcrumbs,
  Button,
  Icon,
  PageHeader,
  NumberField,
  TextField,
  TextWithIcon,
} from '@oxide/ui'
import { useBreadcrumbs, useAsync } from '../../hooks'
import { api } from '@oxide/api'

const Title = styled(TextWithIcon).attrs({
  text: { variant: 'title', as: 'h1' },
  icon: { name: 'instances' },
})`
  ${Icon} {
    font-size: ${({ theme }) => theme.spacing(8)};
    margin-right: ${({ theme }) => theme.spacing(3)};
  }
`

const Box = styled.div`
  margin-top: 1rem;
  border: 1px solid white;
  padding: 1rem;
`

type Params = {
  projectName: string
}

const InstancesPage = () => {
  const breadcrumbs = useBreadcrumbs()

  const history = useHistory()
  const { projectName } = useParams<Params>()

  // form state
  const [instanceName, setInstanceName] = useState('')
  const [ncpus, setNcpus] = useState(1)

  const createInstance = useAsync(() =>
    api.apiProjectInstancesPost({
      projectName,
      apiInstanceCreateParams: {
        bootDiskSize: 1,
        description: `An instance in project: ${projectName}`,
        hostname: 'oxide.com',
        memory: 10,
        name: instanceName,
        ncpus,
      },
    })
  )

  const onCreateClick = async () => {
    // TODO: validate client-side before attempting post
    await createInstance.execute()
  }

  // redirect on successful post
  useEffect(() => {
    if (createInstance.result) {
      history.push(`/projects/${projectName}/instances`)
    }
  }, [createInstance.result, history, projectName])

  return (
    <>
      <Breadcrumbs data={breadcrumbs} />
      <PageHeader>
        <Title>Create Instance</Title>
      </PageHeader>
      <Box>Post error: {JSON.stringify(createInstance.error)}</Box>
      <div style={{ marginTop: '1rem' }}>
        <TextField
          value={instanceName}
          required
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setInstanceName(e.target.value)
          }
          placeholder="db1"
        >
          Instance name
        </TextField>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <NumberField value={ncpus} required handleChange={setNcpus}>
          Number of CPUs
        </NumberField>
      </div>

      <Button
        onClick={onCreateClick}
        style={{ marginTop: '1rem' }}
        disabled={createInstance.pending}
      >
        Create instance
      </Button>
    </>
  )
}

export default InstancesPage
