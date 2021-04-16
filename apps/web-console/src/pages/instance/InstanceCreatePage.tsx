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
  RadioGroup,
  RadioField,
  Tabs,
  Text,
  TextField,
  TextWithIcon,
} from '@oxide/ui'
import { useBreadcrumbs, useAsync } from '../../hooks'
import { api } from '@oxide/api'

const Title = styled(TextWithIcon).attrs({
  text: { variant: 'title', as: 'h1' },
  icon: { name: 'instances' },
})`
  margin-top: ${({ theme }) => theme.spacing(1)};

  ${Icon} {
    font-size: ${({ theme }) => theme.spacing(8)};
    margin-right: ${({ theme }) => theme.spacing(3)};
  }
`

const Box = styled.div`
  border: 1px solid white;
  padding: 1rem;
`

const Form = styled.form`
  margin-top: ${({ theme }) => theme.spacing(4)};
  ${({ theme }) => theme.spaceBetweenY(4)}
`

const StyledText = styled(Text).attrs({
  as: 'legend',
  color: 'white',
  size: 'lg',
})``

const StyledTabs = styled(Tabs)`
  margin-top: ${({ theme }) => theme.spacing(1)};
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
  const [imageField, setImageField] = useState('centos')
  const [distributionField, setDistributionField] = useState('custom-centos')

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
      <Form>
        <StyledText>Choose an image</StyledText>
        <StyledTabs
          label="Choose an existing distribution or a custom image"
          tabs={['Distributions', 'Custom Images']}
        >
          <div>
            <RadioGroup
              hideLegend
              legend="Choose a distribution"
              checked={distributionField}
              handleChange={setDistributionField}
              direction="fixed-row"
              name="distributions"
            >
              <RadioField value="centos" variant="card">
                CentOS
              </RadioField>
              <RadioField value="debian" variant="card">
                Debian
              </RadioField>
              <RadioField value="fedora" variant="card">
                Fedora
              </RadioField>
            </RadioGroup>
          </div>
          <div>
            <RadioGroup
              hideLegend
              legend="Choose a custom image"
              checked={imageField}
              handleChange={setImageField}
              direction="fixed-row"
              name="custom-image"
            >
              <RadioField value="custom-centos" variant="card">
                CentOS Custom Image
              </RadioField>
              <RadioField value="custom-debian" variant="card">
                Debian Custom Image
              </RadioField>
              <RadioField value="custom-fedora" variant="card">
                Fedora Custom Image
              </RadioField>
            </RadioGroup>
          </div>
        </StyledTabs>

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
      </Form>
    </>
  )
}

export default InstancesPage
