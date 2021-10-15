import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@reach/tabs'
import cn from 'classnames'
import { Formik, Form } from 'formik'

import {
  classed,
  Badge,
  Button,
  PageHeader,
  PageTitle,
  RadioGroupHint,
  RadioGroup,
  RadioCard,
  TabListLine,
  TextField,
  TextFieldHint,
  TextFieldLabel,
} from '@oxide/ui'
import { useApiMutation } from '@oxide/api'
import { getServerError } from '../../../util/errors'
import { INSTANCE_SIZES } from './instance-types'
import { NewDiskModal } from './new-disk-modal'
import { ExistingDiskModal } from './existing-disk-modal'
import { NetworkModal } from './network-modal'
import { useParams } from '../../../hooks'

// TODO: these probably should not both exist
const headingStyle = 'text-white text-display-xl font-sans font-light'
const Heading = classed.h2`text-white text-display-xl mt-16 mb-8 font-sans font-light`

// TODO: need to fix page container if we want these to go all the way across
const Divider = () => <hr className="my-16 border-gray-400" />

const GB = 1024 * 1024 * 1024

const ERROR_CODES = {
  ObjectAlreadyExists:
    'An instance with that name already exists in this project',
}

export function InstanceCreateForm({ projectName }: { projectName: string }) {
  const navigate = useNavigate()

  // modals
  const [showNewDiskModal, setShowNewDiskModal] = useState(false)
  const [showExistingDiskModal, setShowExistingDiskModal] = useState(false)
  const [showNetworkModal, setShowNetworkModal] = useState(false)

  const createInstance = useApiMutation('projectInstancesPost', {
    onSuccess: () => {
      navigate(`/projects/${projectName}`)
    },
  })

  const renderLargeRadioCards = (category: string) => {
    return INSTANCE_SIZES.filter((option) => option.category === category).map(
      (option) => (
        <RadioCard key={option.id} value={option.id}>
          <div>{option.ncpus} CPUs</div>
          <div>{option.memory} GB RAM</div>
        </RadioCard>
      )
    )
  }

  return (
    <Formik
      initialValues={{
        'instance-name': '',
        'instance-type': '',
        hostname: '',
        storage: '',
      }}
      onSubmit={(values) => {
        if (!createInstance.isLoading) {
          const instance = INSTANCE_SIZES.find(
            (option) => option.id === values['instance-type']
          ) || { memory: 0, ncpus: 0 }

          createInstance.mutate({
            projectName,
            instanceCreateParams: {
              name: values['instance-name'],
              hostname: values.hostname,
              description: `An instance in project: ${projectName}`,
              memory: instance.memory * GB,
              ncpus: instance.ncpus,
            },
          })
        }
      }}
    >
      <Form className="mt-4 mb-20">
        <Heading>Choose an image</Heading>
        <Tabs className="mt-1">
          <TabListLine>
            <TabList aria-label="Choose an image">
              <Tab>Distributions</Tab>
              <Tab>Custom Images</Tab>
            </TabList>
          </TabListLine>
          <TabPanels>
            <TabPanel>
              <fieldset>
                <legend className="sr-only">Choose a pre-built image</legend>
                <RadioGroup name="disk-image">
                  <RadioCard value="centos">CentOS</RadioCard>
                  <RadioCard value="debian">Debian</RadioCard>
                  <RadioCard value="fedora">Fedora</RadioCard>
                  <RadioCard value="freeBsd">FreeBSD</RadioCard>
                  <RadioCard value="ubuntu">Ubuntu</RadioCard>
                  <RadioCard value="windows">Windows</RadioCard>
                </RadioGroup>
              </fieldset>
            </TabPanel>
            <TabPanel>
              <fieldset>
                <legend className="sr-only">Choose a custom image</legend>
                <RadioGroup name="disk-image">
                  <RadioCard value="custom-centos">Custom CentOS</RadioCard>
                  <RadioCard value="custom-debian">Custom Debian</RadioCard>
                  <RadioCard value="custom-fedora">Custom Fedora</RadioCard>
                </RadioGroup>
              </fieldset>
            </TabPanel>
          </TabPanels>
        </Tabs>
        <Divider />
        <Heading>Choose CPUs and RAM</Heading>
        <Tabs className="mt-1">
          <TabListLine>
            <TabList aria-label="Choose CPUs and RAM">
              <Tab>General purpose</Tab>
              <Tab>CPU-optimized</Tab>
              <Tab>Memory-optimized</Tab>
              <Tab>
                Custom{' '}
                <Badge size="sm" variant="dim" color="green">
                  New
                </Badge>
              </Tab>
            </TabList>
          </TabListLine>
          <TabPanels>
            <TabPanel>
              <fieldset aria-describedby="general-instance-hint">
                <legend className="sr-only">
                  Choose a general purpose instance
                </legend>
                <RadioGroupHint id="general-instance-hint">
                  General purpose instances provide a good balance of CPU,
                  memory, and high performance storage; well suited for a wide
                  range of use cases.
                </RadioGroupHint>
                {/* TODO: find the logic behind this ad hoc spacing */}
                <RadioGroup name="instance-type" className="mt-8">
                  {renderLargeRadioCards('general')}
                </RadioGroup>
              </fieldset>
            </TabPanel>
            <TabPanel>
              <fieldset aria-describedby="cpu-instance-hint">
                <legend className="sr-only">
                  Choose a CPU-optimized instance
                </legend>
                <RadioGroupHint id="cpu-instance-hint">
                  CPU optimized instances provide a good balance of...
                </RadioGroupHint>
                <RadioGroup name="instance-type" className="mt-8">
                  {renderLargeRadioCards('cpuOptimized')}
                </RadioGroup>
              </fieldset>
            </TabPanel>
            <TabPanel>
              <fieldset aria-describedby="memory-instance-hint">
                <legend className="sr-only">
                  Choose a memory-optimized instance
                </legend>
                <RadioGroupHint id="memory-instance-hint">
                  Memory optimized instances provide a good balance of...
                </RadioGroupHint>
                <RadioGroup name="instance-type" className="mt-8">
                  {renderLargeRadioCards('memoryOptimized')}
                </RadioGroup>
              </fieldset>
            </TabPanel>
            <TabPanel>
              <fieldset aria-describedby="custom-instance-hint">
                <legend className="sr-only">Choose a custom instance</legend>
                <RadioGroupHint id="custom-instance-hint">
                  Custom instances...
                </RadioGroupHint>
                <RadioGroup name="instance-type" className="mt-8">
                  {renderLargeRadioCards('custom')}
                </RadioGroup>
              </fieldset>
            </TabPanel>
          </TabPanels>
        </Tabs>
        <Divider />
        <div className="flex mt-20">
          <fieldset>
            <legend className={cn(headingStyle, 'mb-8')}>
              Boot disk storage
            </legend>
            <RadioGroup name="storage">
              <RadioCard value="100gb">100 GB</RadioCard>
              <RadioCard value="200gb">200 GB</RadioCard>
              <RadioCard value="500gb">500 GB</RadioCard>
              <RadioCard value="1000gb">1,000 GB</RadioCard>
              <RadioCard value="2000gb">2,000 GB</RadioCard>
              <RadioCard value="custom">Custom</RadioCard>
            </RadioGroup>
          </fieldset>

          <div className="ml-20 min-w-[24rem]">
            <h2 className={cn(headingStyle, 'mb-8')}>Additional volumes</h2>
            <Button
              variant="dim"
              className="w-full mb-3"
              onClick={() => setShowNewDiskModal(true)}
            >
              Add new disk
            </Button>
            <NewDiskModal
              isOpen={showNewDiskModal}
              onDismiss={() => setShowNewDiskModal(false)}
            />
            <Button
              variant="dim"
              className="w-full"
              onClick={() => setShowExistingDiskModal(true)}
            >
              Add existing disk
            </Button>
            <ExistingDiskModal
              isOpen={showExistingDiskModal}
              onDismiss={() => setShowExistingDiskModal(false)}
              projectName={projectName}
            />
          </div>
        </div>
        <Divider />
        <Heading>Networking</Heading>
        <Button
          variant="dim"
          className="w-[30rem]"
          onClick={() => setShowNetworkModal(true)}
        >
          Add network interface
        </Button>
        <NetworkModal
          isOpen={showNetworkModal}
          onDismiss={() => setShowNetworkModal(false)}
        />

        <Divider />

        <Heading>Finalize and create</Heading>
        <div>
          <TextFieldLabel htmlFor="instance-name">Choose a name</TextFieldLabel>
          <TextFieldHint id="instance-name-hint">
            Choose an identifying name you will remember. Names may contain
            alphanumeric characters, dashes, and periods.
          </TextFieldHint>
          <TextField
            id="instance-name"
            name="instance-name"
            aria-describedby="instance-name-hint"
            placeholder="web1"
          />
        </div>
        <div className="mt-8">
          <TextFieldLabel htmlFor="hostname">Choose a hostname</TextFieldLabel>
          <TextFieldHint id="hostname-hint">
            Optional. If left blank, we will use the instance name.
          </TextFieldHint>
          <TextField
            id="hostname"
            name="hostname"
            aria-describedby="hostname-hint"
            placeholder="example.com"
          />
        </div>

        {/* this is going to be a tag multiselect, not a text input */}
        <div className="mt-8">
          <TextFieldLabel htmlFor="tags">Add tags</TextFieldLabel>
          <TextFieldHint id="tags-hint">
            Use tags to organize and relate resources. Tags may contain letters,
            numbers, colons, dashes, and underscores.
          </TextFieldHint>
          <TextField id="tags" name="tags" aria-describedby="tags-hint" />
        </div>

        <Button
          type="submit"
          className="w-[30rem] mt-16"
          disabled={createInstance.isLoading}
          variant="dim"
        >
          Create instance
        </Button>
        <div className="text-red-500">
          {getServerError(createInstance.error, ERROR_CODES)}
        </div>
      </Form>
    </Formik>
  )
}

const InstanceCreatePage = () => {
  const { projectName } = useParams('projectName')

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
