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
  RadioGroup,
  RadioField,
  Tabs,
  Text,
  TextField,
  TextWithIcon,
} from '@oxide/ui'
import type { RadioFieldProps, RadioGroupProps } from '@oxide/ui'
import { useBreadcrumbs, useAsync } from '../../hooks'
import { api } from '@oxide/api'
import { Debug } from '../../components/Debug'

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

const INSTANCE_SIZES = {
  general: [
    {
      value: 'general-xs',
      memory: 2,
      ncpus: 1,
    },
    {
      value: 'general-sm',
      memory: 4,
      ncpus: 2,
    },
    {
      value: 'general-med',
      memory: 16,
      ncpus: 4,
    },
  ],
  cpuOptimized: [
    {
      value: 'cpuOptimied-xs',
      memory: 2,
      ncpus: 1,
    },
    {
      value: 'cpuOptimied-sm',
      memory: 4,
      ncpus: 2,
    },
    {
      value: 'cpuOptimied-med',
      memory: 16,
      ncpus: 4,
    },
  ],
  memoryOptimized: [
    {
      value: 'memoryOptimized-xs',
      memory: 2,
      ncpus: 1,
    },
    {
      value: 'memoryOptimized-sm',
      memory: 4,
      ncpus: 2,
    },
    {
      value: 'memoryOptimized-med',
      memory: 16,
      ncpus: 4,
    },
  ],
  storageOptimized: [
    {
      value: 'storageOptimized-xs',
      memory: 2,
      ncpus: 1,
    },
    {
      value: 'storageOptimized-sm',
      memory: 4,
      ncpus: 2,
    },
    {
      value: 'storageOptimized-med',
      memory: 16,
      ncpus: 4,
    },
  ],
  custom: [
    {
      value: 'custom-xs',
      memory: 2,
      ncpus: 1,
    },
    {
      value: 'custom-sm',
      memory: 4,
      ncpus: 2,
    },
    {
      value: 'custom-med',
      memory: 16,
      ncpus: 4,
    },
  ],
}

const InstancesPage = () => {
  const breadcrumbs = useBreadcrumbs()

  const history = useHistory()
  const { projectName } = useParams<Params>()

  // form state
  const [instanceName, setInstanceName] = useState('')
  const [imageField, setImageField] = useState('')
  const [cpuRamField, setCpuRamField] = useState('')

  const getParams = () => {
    // TODO: validate client-side before attempting to POST
    const group = cpuRamField.split('-')[0]
    const foundInstance = INSTANCE_SIZES[group].find(
      (instance) => instance.value === cpuRamField
    )
    const memory = foundInstance.memory
    const ncpus = foundInstance.ncpus

    return {
      description: `An instance in project: ${projectName}`,
      hostname: 'oxide.com',
      memory: memory,
      name: instanceName,
      ncpus: ncpus,
    }
  }

  const createInstance = useAsync(() =>
    api.apiProjectInstancesPost({
      projectName,
      apiInstanceCreateParams: getParams(),
    })
  )

  const onCreateClick = async () => {
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

  const renderLargeRadioFields = (group: keyof typeof INSTANCE_SIZES) => {
    const data = INSTANCE_SIZES[group]
    return data.map((option) => (
      <RadioField key={option.value} value={option.value} variant="card">
        <RadioFieldText>{option.ncpus} CPUs</RadioFieldText>
        <RadioFieldText>{option.memory} GB RAM</RadioFieldText>
      </RadioField>
    ))
  }

  const renderTabPanels = (
    data: Array<Pick<RadioGroupProps, 'legend' | 'hint' | 'children'>>
  ) =>
    data.map((group, index) => (
      <RadioGroup
        checked={cpuRamField}
        direction="fixed-row"
        handleChange={setCpuRamField}
        hideLegend
        hint={group.hint}
        key={`distributions-${index}`}
        legend={group.legend}
        name={`distrbutions-${index}`}
      >
        {group.children}
      </RadioGroup>
    ))

  return (
    <>
      <Debug>Post: {JSON.stringify(createInstance)}</Debug>
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
          {renderTabPanels([
            {
              legend: 'Choose a general purpose instance',
              hint:
                'General purpose instances provide a good balance of CPU, memory, and high performance storage; well suited for a wide range of use cases.',
              children: renderLargeRadioFields('general'),
            },
            {
              legend: 'Choose a CPU optimized instance',
              hint: 'CPU optimized instances provide a good balance of...',
              children: renderLargeRadioFields('cpuOptimized'),
            },
            {
              legend: 'Choose a Memory optimized instance',
              hint: 'Memory optimized instances provide a good balance of...',
              children: renderLargeRadioFields('memoryOptimized'),
            },
            {
              legend: 'Choose a Storage optimized instance',
              hint: 'Storage optimized instances provide a good balance of...',
              children: renderLargeRadioFields('storageOptimized'),
            },
            {
              legend: 'Choose a custom instance',
              hint: 'Custom instances...',
              children: renderLargeRadioFields('custom'),
            },
          ])}
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

        <Button onClick={onCreateClick} disabled={createInstance.pending}>
          Create instance
        </Button>
      </Form>
    </>
  )
}

export default InstancesPage
