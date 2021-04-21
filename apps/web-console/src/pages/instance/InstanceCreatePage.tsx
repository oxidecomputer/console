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

// This data structure is completely made up for the purposes of demonstration
// only. It is not meant to reflect any opinions on how the backend API endpoint
// should be structured. Thank you for reading and have a good day!
const INSTANCE_SIZES = [
  {
    category: 'general',
    id: 'general-xs',
    memory: 2,
    ncpus: 1,
  },
  {
    category: 'general',
    id: 'general-sm',
    memory: 4,
    ncpus: 2,
  },
  {
    category: 'general',
    id: 'general-med',
    memory: 16,
    ncpus: 4,
  },

  {
    category: 'cpuOptimized',
    id: 'cpuOptimized-xs',
    memory: 3,
    ncpus: 1,
  },
  {
    category: 'cpuOptimized',
    id: 'cpuOptimized-sm',
    memory: 5,
    ncpus: 3,
  },
  {
    category: 'cpuOptimized',
    id: 'cpuOptimized-med',
    memory: 7,
    ncpus: 5,
  },
  {
    category: 'memoryOptimized',
    id: 'memoryOptimized-xs',
    memory: 3,
    ncpus: 2,
  },
  {
    category: 'memoryOptimized',
    id: 'memoryOptimized-sm',
    memory: 5,
    ncpus: 3,
  },
  {
    category: 'memoryOptimized',
    id: 'memoryOptimized-med',
    memory: 17,
    ncpus: 5,
  },
  {
    category: 'storageOptimized',
    id: 'storageOptimized-xs',
    memory: 1,
    ncpus: 1,
  },
  {
    category: 'storageOptimized',
    id: 'storageOptimized-sm',
    memory: 3,
    ncpus: 1,
  },
  {
    category: 'storageOptimized',
    id: 'storageOptimized-med',
    memory: 15,
    ncpus: 3,
  },
  {
    category: 'custom',
    id: 'custom-xs',
    memory: 2,
    ncpus: 1,
  },
  {
    category: 'custom',
    id: 'custom-sm',
    memory: 4,
    ncpus: 2,
  },
  {
    category: 'custom',
    id: 'custom-med',
    memory: 16,
    ncpus: 4,
  },
]

const InstancesPage = () => {
  const breadcrumbs = useBreadcrumbs()

  const history = useHistory()
  const { projectName } = useParams<Params>()

  // form state
  const [instanceName, setInstanceName] = useState('')
  const [imageField, setImageField] = useState('')
  const [instanceSizeValue, setInstanceSizeValue] = useState('')

  const getParams = () => {
    // FIXME: Refactor once the backend API is more settled
    const instance = INSTANCE_SIZES.find(
      (option) => option.id === instanceSizeValue
    ) || { memory: 0, ncpus: 0 }

    const params = {
      description: `An instance in project: ${projectName}`,
      hostname: 'oxide.com',
      memory: instance.memory,
      name: instanceName,
      ncpus: instance.ncpus,
    }
    console.log('params', params)
    return params
  }

  const createInstance = useAsync(() =>
    api.apiProjectInstancesPost({
      projectName,
      apiInstanceCreateParams: getParams(),
    })
  )

  const onCreateClick = async () => {
    // TODO: validate client-side before attempting to POST
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

  const renderLargeRadioFields = (category: string) => {
    return INSTANCE_SIZES.filter((option) => option.category === category).map(
      (option) => (
        <RadioField key={option.id} value={option.id} variant="card">
          <RadioFieldText>{option.ncpus} CPUs</RadioFieldText>
          <RadioFieldText>{option.memory} GB RAM</RadioFieldText>
        </RadioField>
      )
    )
  }

  const renderTabPanels = (
    data: Array<Pick<RadioGroupProps, 'legend' | 'hint' | 'children'>>
  ) =>
    data.map((group, index) => (
      <RadioGroup
        checked={instanceSizeValue}
        direction="fixed-row"
        handleChange={setInstanceSizeValue}
        hideLegend
        hint={group.hint}
        key={`distributions-${index}`}
        legend={group.legend}
        name={`distributions-${index}`}
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
