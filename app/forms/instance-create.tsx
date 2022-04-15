import React from 'react'
import type { Instance } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import type { PrebuiltFormProps } from 'app/forms'
import {
  DescriptionField,
  Form,
  NameField,
  RadioField,
  TagsField,
  TextField,
} from '@oxide/form'
import {
  CentOSResponsiveIcon,
  DebianResponsiveIcon,
  Divider,
  FedoraResponsiveIcon,
  FreeBSDResponsiveIcon,
  RadioCard,
  Success16Icon,
  Tab,
  Tabs,
  TextFieldHint,
  UbuntuResponsiveIcon,
  WindowsResponsiveIcon,
} from '@oxide/ui'
import { useParams, useToast } from 'app/hooks'
import { DisksTableField } from 'app/components/fields/DisksTableField'
import filesize from 'filesize'
import { NetworkInterfaceField } from 'app/components/fields/NetworkInterfaceField'

const values = {
  name: '',
  description: '',
  tags: {},
  type: '',
  hostname: '',
  disks: [],
  attachedDisks: [],
  networkInterfaces: { type: 'Default' },
  /**
   * This is a hack to ensure the network interface radio has a default selection.
   * We actually don't care about this value outside of that.
   */
  networkInterfaceType: 'Default',
}

export default function CreateInstanceForm({
  id = 'create-instance-form',
  title = 'Create instance',
  initialValues = values,
  onSubmit,
  onSuccess,
  onError,
  ...props
}: PrebuiltFormProps<typeof values, Instance>) {
  const queryClient = useApiQueryClient()
  const addToast = useToast()
  const pageParams = useParams('orgName', 'projectName')

  const createInstance = useApiMutation('projectInstancesPost', {
    onSuccess(instance) {
      // refetch list of instances
      queryClient.invalidateQueries('projectInstancesGet', pageParams)
      // avoid the instance fetch when the instance page loads since we have the data
      queryClient.setQueryData(
        'projectInstancesGetInstance',
        { ...pageParams, instanceName: instance.name },
        instance
      )
      addToast({
        icon: <Success16Icon />,
        title: 'Success!',
        content: 'Your instance has been created.',
        timeout: 5000,
      })
      onSuccess?.(instance)
    },
    onError,
  })

  return (
    <Form
      id={id}
      initialValues={initialValues}
      title={title}
      onSubmit={
        onSubmit ||
        ((values) => {
          const instance = INSTANCE_SIZES.find(
            (option) => option.id === values['type']
          ) || {
            memory: 0,
            ncpus: 0,
          }
          createInstance.mutate({
            ...pageParams,
            body: {
              name: values.name,
              hostname: values.hostname || values.name,
              description: `An instance in project: ${pageParams.projectName}`,
              memory: filesize(instance.memory, { output: 'object', base: 2 }).value,
              ncpus: instance.ncpus,
              disks: values.disks,
            },
          })
        })
      }
      mutation={createInstance}
      {...props}
    >
      <NameField id="name" />
      <DescriptionField id="description" />
      <TagsField id="tags" />

      <Divider />

      <Form.Heading id="hardware">Hardware</Form.Heading>
      <Tabs id="choose-cpu-ram" fullWidth aria-labelledby="hardware">
        <Tab>General Purpose</Tab>
        <Tab.Panel>
          <TextFieldHint id="hw-gp-help-text" className="mb-12 max-w-xl">
            General purpose instances provide a good balance of CPU, memory, and high
            performance storage; well suited for a wide range of use cases.
          </TextFieldHint>
          <RadioField id="hw-general-purpose" name="instance-type" label="">
            {renderLargeRadioCards('general')}
          </RadioField>
        </Tab.Panel>

        <Tab>CPU Optimized</Tab>
        <Tab.Panel>
          <TextFieldHint id="hw-cpu-help-text" className="mb-12 max-w-xl">
            CPU optimized instances provide a good balance of...
          </TextFieldHint>
          <RadioField id="hw-cpu-optimized" name="instance-type" label="">
            {renderLargeRadioCards('cpuOptimized')}
          </RadioField>
        </Tab.Panel>

        <Tab>Memory optimized</Tab>
        <Tab.Panel>
          <TextFieldHint id="hw-mem-help-text" className="mb-12 max-w-xl">
            CPU optimized instances provide a good balance of...
          </TextFieldHint>
          <RadioField id="hw-mem-optimized" name="instance-type" label="">
            {renderLargeRadioCards('memoryOptimized')}
          </RadioField>
        </Tab.Panel>

        <Tab>Custom</Tab>
        <Tab.Panel>
          <TextFieldHint id="hw-custom-help-text" className="mb-12 max-w-xl">
            Custom instances...
          </TextFieldHint>
          <RadioField id="hw-custom" name="instance-type" label="">
            {renderLargeRadioCards('custom')}
          </RadioField>
        </Tab.Panel>
      </Tabs>

      <Divider />

      <Form.Heading id="boot-disk">Boot disk</Form.Heading>
      <Tabs id="boot-disk-tabs" aria-describedby="boot-disk" fullWidth>
        <Tab>Distros</Tab>
        <Tab.Panel className="space-y-4">
          <RadioField id="boot-disk-distro" name="disk-image">
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
          </RadioField>

          <NameField
            id="disk-name"
            name="disk-name"
            label="Disk name"
            description="Will be autogenerated if name not provided"
            required={false}
          />
        </Tab.Panel>
        <Tab>Images</Tab>
        <Tab.Panel></Tab.Panel>
        <Tab>Snapshots</Tab>
        <Tab.Panel></Tab.Panel>
      </Tabs>
      <Divider />
      <Form.Heading id="additional-disks">Additional disks</Form.Heading>

      <DisksTableField />

      <Divider />
      <Form.Heading id="networking">Networking</Form.Heading>

      <NetworkInterfaceField />

      <TextField id="hostname" description="Will be generated if not provided" />

      <Form.Actions>
        <Form.Submit>{title}</Form.Submit>
        <Form.Cancel />
      </Form.Actions>
    </Form>
  )
}

interface DistroRadioCardProps {
  label: string
  value: string
  Icon: React.ComponentType<{ className: string }>
}
const renderDistroRadioCard = ({ label, value, Icon }: DistroRadioCardProps) => {
  return (
    <RadioCard value={value} className="h-44 w-44 pb-6">
      <div className="flex h-full flex-col items-center justify-end space-y-4">
        <Icon className="h-12 w-12 text-tertiary" />
        <span className="text-sans-xl text-secondary">{label}</span>
      </div>
    </RadioCard>
  )
}

const renderLargeRadioCards = (category: string) => {
  return INSTANCE_SIZES.filter((option) => option.category === category).map((option) => (
    <RadioCard key={option.id} value={option.id}>
      <div>
        {option.ncpus}{' '}
        <RadioCard.Unit aria-label={`c-p-u${option.ncpus === 1 ? '' : 'se'}`}>
          CPU{option.ncpus === 1 ? '' : 's'}
        </RadioCard.Unit>
      </div>
      <div>
        {option.memory} <RadioCard.Unit aria-label="gigabytes RAM">GB RAM</RadioCard.Unit>
      </div>
    </RadioCard>
  ))
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
