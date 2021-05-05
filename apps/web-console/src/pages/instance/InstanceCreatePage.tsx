import type { FormEvent } from 'react'
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
  TextInputGroup,
  TextWithIcon,
} from '@oxide/ui'
import type { RadioFieldProps, RadioGroupProps } from '@oxide/ui'
import { useBreadcrumbs } from '../../hooks'
import { useApiMutation } from '@oxide/api'
import { Debug } from '../../components/Debug'
import { spaceBetweenX, spaceBetweenY, spacing } from '@oxide/css-helpers'

const Title = styled(TextWithIcon).attrs({
  text: { variant: 'title', as: 'h1' },
  icon: { name: 'instances' },
})`
  margin-top: ${spacing(1)};

  ${Icon} {
    font-size: ${spacing(8)};
    margin-right: ${spacing(3)};
  }
`

const Form = styled.form`
  margin-top: ${spacing(4)};
  margin-bottom: ${spacing(20)};
  ${spaceBetweenY(8)}
`

const Heading = styled(Text).attrs({
  color: 'white',
  size: 'lg',
})`
  display: block;

  margin-top: ${spacing(8)};

  &:first-child {
    margin-top: 0;
  }
`

const Description = styled(Text).attrs({
  color: 'gray300',
  size: 'sm',
})`
  display: block;

  margin-top: ${spacing(2)};
  max-width: ${spacing(150)};
`

const StyledTabs = styled(Tabs)`
  margin-top: ${spacing(1)};
`

const RadioFieldText = styled(Text).attrs({
  color: 'green50',
  size: 'base',
})`
  display: block;
`

const StyledButton = styled(Button).attrs({ variant: 'subtle' })``

const Row = styled.div`
  display: flex;
  flex-direction: row;

  ${spaceBetweenX(6)}
`

const FooterText = styled(Text).attrs({ size: 'xs' })`
  display: block;
  margin-top: ${spacing(8)};
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
    category: 'general',
    id: 'general-lg',
    memory: 24,
    ncpus: 6,
  },
  {
    category: 'general',
    id: 'general-xl',
    memory: 32,
    ncpus: 8,
  },
  {
    category: 'general',
    id: 'general-2xl',
    memory: 40,
    ncpus: 10,
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

const GB = 1024 * 1024 * 1024

const RadioCardField = (props: RadioFieldProps) => {
  return <RadioField {...props} variant="card" />
}

const InstanceCreatePage = () => {
  const breadcrumbs = useBreadcrumbs()

  const history = useHistory()
  const { projectName } = useParams<Params>()

  // form state
  const [instanceName, setInstanceName] = useState('')
  const [hostname, setHostname] = useState('')
  const [imageField, setImageField] = useState('')
  const [instanceSizeValue, setInstanceSizeValue] = useState('')
  const [storageField, setStorageField] = useState('')
  const [configurationField, setConfigurationField] = useState('')
  const [tagsField, setTagsField] = useState('')

  const getParams = () => {
    // FIXME: Refactor once the backend API is more settled
    const instance = INSTANCE_SIZES.find(
      (option) => option.id === instanceSizeValue
    ) || { memory: 0, ncpus: 0 }

    const params = {
      description: `An instance in project: ${projectName}`,
      hostname,
      memory: instance.memory * GB,
      name: instanceName,
      ncpus: instance.ncpus,
      storageField: storageField,
      configurationField: configurationField,
      tagsField: tagsField,
    }
    console.log('params', params)
    return params
  }

  const createInstance = useApiMutation('apiProjectInstancesPost', {
    onSuccess: () => {
      history.push(`/projects/${projectName}/instances`)
    },
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // TODO: validate client-side before attempting to POST
    if (!createInstance.isLoading) {
      createInstance.mutate({
        projectName,
        apiInstanceCreateParams: getParams(),
      })
    }
  }

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
      <Form action="#" onSubmit={handleSubmit}>
        <Heading>Choose an image</Heading>
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
            <RadioCardField value="centos">CentOS</RadioCardField>
            <RadioCardField value="debian">Debian</RadioCardField>
            <RadioCardField value="fedora">Fedora</RadioCardField>
            <RadioCardField value="freeBsd">FreeBSD</RadioCardField>
            <RadioCardField value="ubuntu">Ubuntu</RadioCardField>
            <RadioCardField value="windows1">Windows</RadioCardField>
            <RadioCardField value="windows2">Windows</RadioCardField>
          </RadioGroup>
          <RadioGroup
            hideLegend
            legend="Choose a custom image"
            checked={imageField}
            handleChange={setImageField}
            direction="fixed-row"
            name="custom-image"
          >
            <RadioCardField value="custom-centos">Custom CentOS</RadioCardField>
            <RadioCardField value="custom-debian">Custom Debian</RadioCardField>
            <RadioCardField value="custom-fedora">Custom Fedora</RadioCardField>
          </RadioGroup>
        </StyledTabs>
        <Heading>Choose CPUs and RAM</Heading>
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
        <RadioGroup
          legend="Add storage"
          checked={storageField}
          handleChange={setStorageField}
          direction="fixed-row"
          name="storage"
        >
          <RadioCardField value="100gb">100 GB</RadioCardField>
          <RadioCardField value="200gb">200 GB</RadioCardField>
          <RadioCardField value="500gb">500 GB</RadioCardField>
          <RadioCardField value="1000gb">1,000 GB</RadioCardField>
          <RadioCardField value="2000gb">2,000 GB</RadioCardField>
          <RadioCardField value="custom">Custom</RadioCardField>
        </RadioGroup>
        <RadioGroup
          legend="Choose configuration options"
          checked={configurationField}
          handleChange={setConfigurationField}
          direction="row"
          name="configuration-options"
        >
          <RadioField
            value="auto"
            hint="Some details about automatically formatting and mounting disks."
          >
            Automatically format and mount
          </RadioField>
          <RadioField
            value="manual"
            hint="Some details about manually formatting and mounting disks."
          >
            Manually format and mount
          </RadioField>
        </RadioGroup>
        <Heading>Authentication</Heading>
        <Description>
          We don’t have an SSH key stored for you. Please add one. Adding an SSH
          Key adds it to your user profile so any instances in any project that
          you have access to will updated with this additional key. Your
          existing keys will remain on all your instances.
        </Description>
        <StyledButton>Add an SSH key</StyledButton>
        <Heading>Finalize and create</Heading>
        <Row>
          <TextInputGroup
            id="instance-name"
            label="Choose a name"
            hint="Choose an identifying name you will remember. Names may contain alphanumeric characters, dashes, and periods."
            onChange={setInstanceName}
            placeholder="web1"
            required
            value={instanceName}
          />
          <TextInputGroup
            id="hostname"
            label="Choose a hostname"
            hint="Choose a hostname for the instance. In the future this will be optional."
            onChange={setHostname}
            placeholder="example.com"
            required
            value={hostname}
          />
        </Row>
        <TextInputGroup
          id="tags"
          label="Add tags"
          hint="Use tags to organize and relate resources. Tags may contain letters, numbers, colons, dashes, and underscores."
          onChange={setTagsField}
          required
          value={tagsField}
        />

        <Button type="submit" fullWidth disabled={createInstance.isLoading}>
          Create instance
        </Button>
        <FooterText>
          Equivalent <a href="#">REST</a> or <a href="#">command line</a>
        </FooterText>
      </Form>
    </>
  )
}

export default InstanceCreatePage
