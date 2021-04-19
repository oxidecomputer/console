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
import type { RadioFieldProps, RadioGroupProps } from '@oxide/ui'
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

  const renderLargeRadioFields = (
    data: Array<{ value: string; fields: string[] }>
  ) =>
    renderRadioFields(
      data.map((option) => {
        return {
          value: option.value,
          children: option.fields.map((fieldText, index) => (
            <RadioFieldText key={`field-text-${index}`}>
              {fieldText}
            </RadioFieldText>
          )),
        }
      })
    )

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
              children: renderLargeRadioFields([
                {
                  value: 'general-xs',
                  fields: ['1 CPUs', '2 GB RAM'],
                },
                {
                  value: 'general-sm',
                  fields: ['2 CPUs', '4 GB RAM'],
                },
                {
                  value: 'general-med',
                  fields: ['4 CPUs', '16 GB RAM'],
                },
              ]),
            },
            {
              legend: 'Choose a CPU optimized instance',
              hint: 'CPU optimized instances provide a good balance of...',
              children: renderLargeRadioFields([
                {
                  value: 'cpu-optimized-xs',
                  fields: ['1 CPUs', '2 GB RAM'],
                },
                {
                  value: 'cpu-optimized-sm',
                  fields: ['2 CPUs', '4 GB RAM'],
                },
                {
                  value: 'cpu-optimized-med',
                  fields: ['4 CPUs', '16 GB RAM'],
                },
              ]),
            },
            {
              legend: 'Choose a Memory optimized instance',
              hint: 'Memory optimized instances provide a good balance of...',
              children: renderLargeRadioFields([
                {
                  value: 'memory-optimized-xs',
                  fields: ['1 CPUs', '2 GB RAM'],
                },
                {
                  value: 'memory-optimized-sm',
                  fields: ['2 CPUs', '4 GB RAM'],
                },
                {
                  value: 'memory-optimized-med',
                  fields: ['4 CPUs', '16 GB RAM'],
                },
              ]),
            },
            {
              legend: 'Choose a Storage optimized instance',
              hint: 'Storage optimized instances provide a good balance of...',
              children: renderLargeRadioFields([
                {
                  value: 'storage-optimized-xs',
                  fields: ['1 CPUs', '2 GB RAM'],
                },
                {
                  value: 'storage-optimized-sm',
                  fields: ['2 CPUs', '4 GB RAM'],
                },
                {
                  value: 'storage-optimized-med',
                  fields: ['4 CPUs', '16 GB RAM'],
                },
              ]),
            },
            {
              legend: 'Choose a custom instance',
              hint: 'Custom instances...',
              children: renderLargeRadioFields([
                {
                  value: 'custom-xs',
                  fields: ['1 CPUs', '2 GB RAM'],
                },
                {
                  value: 'custom-sm',
                  fields: ['2 CPUs', '4 GB RAM'],
                },
                {
                  value: 'custom-med',
                  fields: ['4 CPUs', '16 GB RAM'],
                },
              ]),
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
