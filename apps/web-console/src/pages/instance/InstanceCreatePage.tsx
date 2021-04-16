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
import type { RadioFieldProps } from '@oxide/ui'
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
  color: 'white',
  size: 'lg',
})`
  display: block;

  margin-top: ${({ theme }) => theme.spacing(8)};

  &:first-child {
    margin-top: 0;
  }
`

const StyledTabs = styled(Tabs)`
  margin-top: ${({ theme }) => theme.spacing(1)};
`

const RadioFieldText = styled(Text).attrs({
  color: 'green50',
  size: 'base',
})`
  display: block;
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
  const [imageField, setImageField] = useState('')
  const [cpuRamField, setCpuRamField] = useState('')

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
    const fields = {
      image: imageField,
      cpuRam: cpuRamField,
    }
    console.log('Create instance with these fields:', fields)
    await createInstance.run()
  }

  // redirect on successful post
  useEffect(() => {
    if (createInstance.data) {
      history.push(`/projects/${projectName}/instances`)
    }
  }, [createInstance.data, history, projectName])

  const renderRadioFields = (data: RadioFieldProps[]) =>
    data.map((option) => {
      return (
        <RadioField key={option.value} value={option.value} variant="card">
          {option.children}
        </RadioField>
      )
    })

  return (
    <>
      <Breadcrumbs data={breadcrumbs} />
      <PageHeader>
        <Title>Create Instance</Title>
      </PageHeader>
      <Form>
        <StyledText>Choose an image</StyledText>
        <StyledTabs
          label="Choose an image"
          tabs={['Distributions', 'Custom Images']}
        >
          <RadioGroup
            hideLegend
            legend="Choose a distribution"
            checked={imageField}
            handleChange={setImageField}
            direction="fixed-row"
            name="distributions"
          >
            {renderRadioFields([
              { value: 'centos', children: 'CentOS' },
              { value: 'debian', children: 'Debian' },
              { value: 'fedora', children: 'Fedora' },
              { value: 'freeBsd', children: 'FreeBSD' },
              { value: 'ubuntu', children: 'Ubuntu' },
              { value: 'windows1', children: 'Windows' },
              { value: 'windows2', children: 'Windows' },
            ])}
          </RadioGroup>
          <RadioGroup
            hideLegend
            legend="Choose a custom image"
            checked={imageField}
            handleChange={setImageField}
            direction="fixed-row"
            name="custom-image"
          >
            {renderRadioFields([
              { value: 'custom-centos', children: 'Custom CentOS' },
              { value: 'custom-debian', children: 'Custom Debian' },
              { value: 'custom-fedora', children: 'Custom Fedora' },
            ])}
          </RadioGroup>
        </StyledTabs>
        <StyledText>Choose CPUs and RAM</StyledText>
        <StyledTabs
          label="Choose CPUs and RAM"
          tabs={[
            'General purpose',
            'CPU-Optimized',
            'Memory-Optimized',
            'Storage-Optimized',
            'Custom',
          ]}
        >
          <RadioGroup
            hideLegend
            legend="Choose a general purpose instance"
            hint="General purpose instances provide a good balance of CPU, memory, and high performance storage; well suited for a wide range of use cases."
            checked={cpuRamField}
            handleChange={setCpuRamField}
            direction="fixed-row"
            name="distributions"
          >
            {renderRadioFields([
              {
                value: 'general-xs',
                children: (
                  <>
                    <RadioFieldText>1 CPUs</RadioFieldText>
                    <RadioFieldText>2 GB RAM</RadioFieldText>
                  </>
                ),
              },
              {
                value: 'general-sm',
                children: (
                  <>
                    <RadioFieldText>2 CPUs</RadioFieldText>
                    <RadioFieldText>4 GB RAM</RadioFieldText>
                  </>
                ),
              },
              {
                value: 'general-med',
                children: (
                  <>
                    <RadioFieldText>4 CPUs</RadioFieldText>
                    <RadioFieldText>16 GB RAM</RadioFieldText>
                  </>
                ),
              },
            ])}
          </RadioGroup>
        </StyledTabs>
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
      <Box>Post error: {JSON.stringify(createInstance.error)}</Box>
    </>
  )
}

export default InstancesPage
