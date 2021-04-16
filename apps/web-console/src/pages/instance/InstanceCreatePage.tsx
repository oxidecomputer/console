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
  border: 1px solid white;
  padding: 1rem;
`

const FormContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(4)};
  ${({ theme }) => theme.spaceBetweenY(4)}
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
    await createInstance.run()
  }

  // redirect on successful post
  useEffect(() => {
    if (createInstance.data) {
      history.push(`/projects/${projectName}/instances`)
    }
  }, [createInstance.data, history, projectName])

  return (
    <>
      <Breadcrumbs data={breadcrumbs} />
      <PageHeader>
        <Title>Create Instance</Title>
      </PageHeader>
      <FormContainer>
        <Box>Post error: {JSON.stringify(createInstance.error)}</Box>
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
        <NumberField value={ncpus} handleChange={setNcpus}>
          Number of CPUs
        </NumberField>

        <Button onClick={onCreateClick} disabled={createInstance.pending}>
          Create instance
        </Button>
      </FormContainer>
    </>
  )
}

export default InstancesPage
