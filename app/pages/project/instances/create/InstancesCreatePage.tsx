import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import cn from 'classnames'

import {
  Button,
  RadioGroupHint,
  RadioGroup,
  RadioCard,
  Tabs,
  Tab,
  Badge,
  CentOSResponsiveIcon,
  DebianResponsiveIcon,
  FedoraResponsiveIcon,
  FreeBSDResponsiveIcon,
  UbuntuResponsiveIcon,
  WindowsResponsiveIcon,
} from '@oxide/ui'
import { useApiMutation } from '@oxide/api'
import { INSTANCE_SIZES } from './instance-types'
import { ExistingDiskModal } from './modals/existing-disk-modal'
import { NetworkModal } from './modals/network-modal'
import { useParams } from 'app/hooks'
import { Form, NameField, TagsField, TextField } from '@oxide/form'
import { useForm } from 'app/hooks/use-form'

// TODO: these probably should not both exist
const headingStyle = 'text-white text-sans-xl'

const GB = 1024 * 1024 * 1024

const ERROR_CODES = {
  ObjectAlreadyExists:
    'An instance with that name already exists in this project',
}

export default function InstanceCreatePage() {
  const navigate = useNavigate()
  const { orgName, projectName } = useParams('orgName', 'projectName')
  const [diskForm, invokeDiskForm] = useForm('disk-create')

  const [showExistingDiskModal, setShowExistingDiskModal] = useState(false)
  const [showNetworkModal, setShowNetworkModal] = useState(false)

  const createInstance = useApiMutation('projectInstancesPost', {
    onSuccess() {
      navigate('..') // project page
    },
  })

  const renderLargeRadioCards = (category: string) => {
    return INSTANCE_SIZES.filter((option) => option.category === category).map(
      (option) => (
        <RadioCard key={option.id} value={option.id} className="w-40">
          <div>
            {option.ncpus} <RadioCard.Unit>CPUs</RadioCard.Unit>
          </div>
          <div>
            {option.memory} <RadioCard.Unit>GB RAM</RadioCard.Unit>
          </div>
        </RadioCard>
      )
    )
  }

  interface DistroRadioCardProps {
    label: string
    value: string
    Icon: React.ComponentType<{ className: string }>
  }
  const renderDistroRadioCard = ({
    label,
    value,
    Icon,
  }: DistroRadioCardProps) => {
    return (
      <RadioCard value={value} className="h-44 w-44 pb-6">
        <div className="flex h-full flex-col items-center justify-end space-y-4">
          <Icon className="h-12 w-12 text-tertiary" />
          <span className="text-sans-xl text-secondary">{label}</span>
        </div>
      </RadioCard>
    )
  }

  return (
    <>
      <Form
        id="instances-create-form"
        initialValues={{
          'instance-name': '',
          'instance-type': '',
          'instance-tags': {},
          'disk-name': '',
          'disk-image': '',
          hostname: '',
          storage: '',
        }}
        onSubmit={(values) => {
          if (!createInstance.isLoading) {
            const instance = INSTANCE_SIZES.find(
              (option) => option.id === values['instance-type']
            ) || { memory: 0, ncpus: 0 }

            createInstance.mutate({
              orgName,
              projectName,
              body: {
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
        <NameField id="instance-name" title="Name" />
        <TagsField
          id="instance-tags"
          hint="Add tag key/value pairs to your instance to organize your project"
        />
        <Form.Section title="Hardware">
          <Tabs
            id="tabs-choose-cpu-and-ram"
            className="mt-1"
            aria-labelledby="choose-cpu-ram"
            fullWidth
          >
            <Tab>General purpose</Tab>
            <Tab.Panel>
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
            </Tab.Panel>

            <Tab>CPU-optimized</Tab>
            <Tab.Panel>
              <fieldset aria-describedby="cpu-instance-hint">
                <legend className="sr-only">
                  Choose a CPU-optimized instance
                </legend>
                <RadioGroupHint id="cpu-instance-hint">
                  CPU optimized instances provide a good balance of...
                </RadioGroupHint>
                <RadioGroup name="instance-type" className="mt-8" required>
                  {renderLargeRadioCards('cpuOptimized')}
                </RadioGroup>
              </fieldset>
            </Tab.Panel>

            <Tab>Memory-optimized</Tab>
            <Tab.Panel>
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
            </Tab.Panel>

            <Tab id="tab-custom">
              Custom <Badge>New</Badge>
            </Tab>
            <Tab.Panel>
              <fieldset aria-describedby="custom-instance-hint">
                <legend className="sr-only">Choose a custom instance</legend>
                <RadioGroupHint id="custom-instance-hint">
                  Custom instances...
                </RadioGroupHint>
                <RadioGroup name="instance-type" className="mt-8">
                  {renderLargeRadioCards('custom')}
                </RadioGroup>
              </fieldset>
            </Tab.Panel>
          </Tabs>
        </Form.Section>
        <Form.Section title="Boot disk">
          <Tabs
            id="tabs-choose-image"
            className="mt-1"
            aria-labelledby="choose-an-image"
            fullWidth
          >
            <Tab>Distributions</Tab>
            <Tab.Panel>
              <fieldset>
                <legend className="sr-only">Choose a pre-built image</legend>
                <RadioGroup name="disk-image" className="gap-3">
                  {renderDistroRadioCard({
                    label: 'Ubuntu',
                    value: 'ubuntu',
                    Icon: UbuntuResponsiveIcon,
                  })}
                  {renderDistroRadioCard({
                    label: 'FreeBSD',
                    value: 'freeBsd',
                    Icon: FreeBSDResponsiveIcon,
                  })}
                  {renderDistroRadioCard({
                    label: 'Fedora',
                    value: 'fedora',
                    Icon: FedoraResponsiveIcon,
                  })}
                  {renderDistroRadioCard({
                    label: 'Debian',
                    value: 'debian',
                    Icon: DebianResponsiveIcon,
                  })}
                  {renderDistroRadioCard({
                    label: 'CentOS',
                    value: 'centos',
                    Icon: CentOSResponsiveIcon,
                  })}
                  {renderDistroRadioCard({
                    label: 'Windows',
                    value: 'windows',
                    Icon: WindowsResponsiveIcon,
                  })}
                </RadioGroup>
              </fieldset>
            </Tab.Panel>

            <Tab>Images</Tab>
            <Tab.Panel>
              <fieldset>
                <legend className="sr-only">Choose a custom image</legend>
                <RadioGroup name="disk-image" required>
                  <RadioCard value="custom-centos">Custom CentOS</RadioCard>
                  <RadioCard value="custom-debian">Custom Debian</RadioCard>
                  <RadioCard value="custom-fedora">Custom Fedora</RadioCard>
                </RadioGroup>
              </fieldset>
            </Tab.Panel>
            <Tab>Snapshots</Tab>
            <Tab.Panel>
              <fieldset>
                <legend className="sr-only">Choose a snapshot</legend>
                TODO
              </fieldset>
            </Tab.Panel>
          </Tabs>
          <div>
            <fieldset>
              <legend className={cn(headingStyle, 'mb-8')}>
                Boot disk storage
              </legend>
              <RadioGroup name="storage">
                <RadioCard value="100gb">
                  100 <RadioCard.Unit>GB</RadioCard.Unit>
                </RadioCard>
                <RadioCard value="200gb">
                  200 <RadioCard.Unit>GB</RadioCard.Unit>
                </RadioCard>
                <RadioCard value="500gb">
                  500 <RadioCard.Unit>GB</RadioCard.Unit>
                </RadioCard>
                <RadioCard value="1000gb">
                  1,000 <RadioCard.Unit>GB</RadioCard.Unit>
                </RadioCard>
                <RadioCard value="2000gb">
                  2,000 <RadioCard.Unit>GB</RadioCard.Unit>
                </RadioCard>
                <RadioCard value="custom">Custom</RadioCard>
              </RadioGroup>
            </fieldset>

            <div className="ml-20 min-w-[24rem]">
              <h2 className={cn(headingStyle, 'mb-8')}>Additional volumes</h2>
              <Button
                variant="secondary"
                className="mb-3 w-full"
                onClick={() => invokeDiskForm()}
              >
                Add new disk
              </Button>
              {diskForm}
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setShowExistingDiskModal(true)}
              >
                Add existing disk
              </Button>
              <ExistingDiskModal
                isOpen={showExistingDiskModal}
                onDismiss={() => setShowExistingDiskModal(false)}
                orgName={orgName}
                projectName={projectName}
              />
            </div>
          </div>
          <TextField id="disk-name" label="Disk name" />
        </Form.Section>

        <Form.Section title="Networking">
          <TextField id="instance-hostname" label="Hostname" />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowNetworkModal(true)}
          >
            Add network interface
          </Button>
        </Form.Section>
        <NetworkModal
          isOpen={showNetworkModal}
          onDismiss={() => setShowNetworkModal(false)}
          orgName={orgName}
          projectName={projectName}
        />

        <Form.Actions>
          <Form.Submit>Create instance</Form.Submit>
          <Button variant="ghost" color="neutral">
            Equivalent CLI Command
          </Button>
        </Form.Actions>
      </Form>
    </>
  )
}
