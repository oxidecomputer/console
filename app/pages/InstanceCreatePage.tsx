import type { FormEvent } from 'react'
import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@reach/tabs'

import {
  classed,
  Badge,
  Button,
  PageHeader,
  PageTitle,
  RadioGroup,
  RadioField,
  TextInputGroup,
} from '@oxide/ui'
import type { RadioGroupProps } from '@oxide/ui'
import { useApiMutation } from '@oxide/api'
import { getServerError } from '../util/errors'
import { INSTANCE_SIZES } from './instance-types'

const Heading = classed.h2`text-white text-display-xl !mt-16 font-sans font-light first-of-type:mt-0`

const Description = classed.p`text-gray-50 text-sm mt-2 max-w-prose`

const GB = 1024 * 1024 * 1024

const ERROR_CODES = {
  ObjectAlreadyExists:
    'An instance with that name already exists in this project',
}

export function InstanceCreateForm({ projectName }: { projectName: string }) {
  const navigate = useNavigate()

  // form state
  const [instanceName, setInstanceName] = useState('')
  const [hostname, setHostname] = useState('')
  const [imageField, setImageField] = useState('')
  const [instanceSizeValue, setInstanceSizeValue] = useState('')
  const [storageField, setStorageField] = useState('')
  const [configurationField, setConfigurationField] = useState('')
  const [tagsField, setTagsField] = useState('')

  const getParams = () => {
    // TODO: Refactor once the backend API is more settled
    const instance = INSTANCE_SIZES.find(
      (option) => option.id === instanceSizeValue
    ) || { memory: 0, ncpus: 0 }

    return {
      description: `An instance in project: ${projectName}`,
      hostname,
      memory: instance.memory * GB,
      name: instanceName,
      ncpus: instance.ncpus,
      storageField: storageField,
      configurationField: configurationField,
      tagsField: tagsField,
    }
  }

  const createInstance = useApiMutation('projectInstancesPost', {
    onSuccess: () => {
      navigate(`/projects/${projectName}`)
    },
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // TODO: validate client-side before attempting to POST
    if (!createInstance.isLoading) {
      createInstance.mutate({ projectName, instanceCreateParams: getParams() })
    }
  }

  const renderLargeRadioFields = (category: string) => {
    return INSTANCE_SIZES.filter((option) => option.category === category).map(
      (option) => (
        <RadioField key={option.id} value={option.id}>
          <div>{option.ncpus} CPUs</div>
          <div>{option.memory} GB RAM</div>
        </RadioField>
      )
    )
  }

  const renderTabPanels = (
    data: Array<Pick<RadioGroupProps, 'legend' | 'hint' | 'children'>>
  ) =>
    data.map((group, index) => (
      <TabPanel key={`distributions-${index}`}>
        <RadioGroup
          checked={instanceSizeValue}
          handleChange={setInstanceSizeValue}
          hideLegend
          hint={group.hint}
          legend={group.legend}
          name={`distributions-${index}`}
        >
          {group.children}
        </RadioGroup>
      </TabPanel>
    ))

  return (
    <form action="#" onSubmit={handleSubmit} className="mt-4 mb-20 space-y-8">
      <Heading>Choose an image</Heading>
      <Tabs className="mt-1">
        <TabList aria-label="Choose an image">
          <Tab>Distributions</Tab>
          <Tab>Custom Images</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <RadioGroup
              hideLegend
              legend="Choose a distribution"
              checked={imageField}
              handleChange={setImageField}
              name="distributions"
            >
              <RadioField value="centos">CentOS</RadioField>
              <RadioField value="debian">Debian</RadioField>
              <RadioField value="fedora">Fedora</RadioField>
              <RadioField value="freeBsd">FreeBSD</RadioField>
              <RadioField value="ubuntu">Ubuntu</RadioField>
              <RadioField value="windows1">Windows</RadioField>
              <RadioField value="windows2">Windows</RadioField>
            </RadioGroup>
          </TabPanel>
          <TabPanel>
            <RadioGroup
              hideLegend
              legend="Choose a custom image"
              checked={imageField}
              handleChange={setImageField}
              name="custom-image"
            >
              <RadioField value="custom-centos">Custom CentOS</RadioField>
              <RadioField value="custom-debian">Custom Debian</RadioField>
              <RadioField value="custom-fedora">Custom Fedora</RadioField>
            </RadioGroup>
          </TabPanel>
        </TabPanels>
      </Tabs>
      <Heading>Choose CPUs and RAM</Heading>
      <Tabs className="mt-1">
        <TabList aria-label="Choose CPUs and RAM">
          <Tab>General purpose</Tab>
          <Tab>CPU-optimized</Tab>
          <Tab>Memory-optimized</Tab>
          <Tab>Storage-optimized</Tab>
          <Tab>
            Custom{' '}
            <Badge size="sm" variant="dim" color="green">
              New
            </Badge>
          </Tab>
        </TabList>
        <TabPanels>
          {renderTabPanels([
            {
              legend: 'Choose a general purpose instance',
              hint: 'General purpose instances provide a good balance of CPU, memory, and high performance storage; well suited for a wide range of use cases.',
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
        </TabPanels>
      </Tabs>
      <Heading>Boot disk storage</Heading>
      <RadioGroup
        legend="Add storage"
        checked={storageField}
        handleChange={setStorageField}
        name="storage"
      >
        <RadioField value="100gb">100 GB</RadioField>
        <RadioField value="200gb">200 GB</RadioField>
        <RadioField value="500gb">500 GB</RadioField>
        <RadioField value="1000gb">1,000 GB</RadioField>
        <RadioField value="2000gb">2,000 GB</RadioField>
        <RadioField value="custom">Custom</RadioField>
      </RadioGroup>
      <RadioGroup
        legend="Choose configuration options"
        checked={configurationField}
        handleChange={setConfigurationField}
        name="configuration-options"
      >
        <RadioField value="auto">Automatically format and mount</RadioField>
        <RadioField value="manual">Manually format and mount</RadioField>
      </RadioGroup>
      <Heading>Authentication</Heading>
      <Description>
        We don’t have an SSH key stored for you. Please add one. Adding an SSH
        Key adds it to your user profile so any instances in any project that
        you have access to will updated with this additional key. Your existing
        keys will remain on all your instances.
      </Description>
      <Button variant="dim">Add an SSH key</Button>
      <Heading>Finalize and create</Heading>
      <div className="flex space-x-6">
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
      </div>
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
      <div className="text-red-500">
        {getServerError(createInstance.error, ERROR_CODES)}
      </div>
    </form>
  )
}

const InstanceCreatePage = () => {
  const { projectName } = useParams()

  return (
    <>
      <PageHeader>
        <PageTitle icon="instances">Create a new instance</PageTitle>
      </PageHeader>
      <InstanceCreateForm projectName={projectName} />
    </>
  )
}

export default InstanceCreatePage
