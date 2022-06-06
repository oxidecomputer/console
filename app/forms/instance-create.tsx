import type {
  Instance,
  InstanceCreate,
  InstanceNetworkInterfaceAttachment,
} from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import type { CreateFormProps } from 'app/forms'
import type { DiskTableItem, FullPageFormProps } from 'app/components/form'
import { FullPageForm } from 'app/components/form'
import { DiskSizeField } from 'app/components/form'
import {
  DescriptionField,
  DisksTableField,
  Form,
  NameField,
  NetworkInterfaceField,
  RadioField,
  TagsField,
  TextField,
} from 'app/components/form'
import {
  Divider,
  Radio,
  RadioCard,
  Tab,
  Tabs,
  TextFieldHint,
  CentosDistroIcon,
  DebianDistroIcon,
  FedoraDistroIcon,
  FreebsdDistroIcon,
  UbuntuDistroIcon,
  WindowsDistroIcon,
  Success16Icon,
  Instances24Icon,
} from '@oxide/ui'
import { useParams, useToast } from 'app/hooks'
import invariant from 'tiny-invariant'
import { GiB } from '@oxide/util'
import { formatDiskCreate } from './disk-create'

type InstanceCreateInput = Assign<
  InstanceCreate,
  {
    tags: object
    networkInterfaceType: InstanceNetworkInterfaceAttachment['type']
    type: typeof INSTANCE_SIZES[number]['id']
    disks: DiskTableItem[]
    bootDiskName: string
    bootDiskSize: number
    bootDiskBlockSize: string
  }
>

const values: InstanceCreateInput = {
  name: '',
  description: '',
  tags: {},
  /**
   * This value controls the selector which drives memory and ncpus. It's not actually
   * submitted to the API.
   */
  type: 'general-xs',
  memory: 0,
  ncpus: 1,
  hostname: '',
  bootDiskName: '',
  bootDiskSize: 0,
  bootDiskBlockSize: '4096',
  disks: [],
  networkInterfaces: { type: 'default' },
  /**
   * This is a hack to ensure the network interface radio has a default selection.
   * We actually don't care about this value outside of that.
   */
  networkInterfaceType: 'default',
}

type CreateInstanceFormProps = CreateFormProps<InstanceCreateInput, Instance> &
  Omit<FullPageFormProps<InstanceCreateInput>, 'icon'>

export default function CreateInstanceForm({
  id = 'create-instance-form',
  title = 'Create instance',
  initialValues = values,
  onSubmit,
  onSuccess,
  onError,
  ...props
}: CreateInstanceFormProps) {
  const queryClient = useApiQueryClient()
  const addToast = useToast()
  const pageParams = useParams('orgName', 'projectName')

  const createDisk = useApiMutation('projectDisksPost')

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
    <FullPageForm
      id={id}
      initialValues={initialValues}
      title={title}
      icon={<Instances24Icon />}
      onSubmit={
        onSubmit ||
        (async (values) => {
          const instance = INSTANCE_SIZES.find((option) => option.id === values['type'])
          invariant(instance, 'Expected instance type to be defined')
          await createDisk.mutateAsync({
            ...pageParams,
            body: {
              ...formatDiskCreate({
                name: values.bootDiskName || 'boot-disk',
                description: '',
                size: values.bootDiskSize,
                blockSize: values.bootDiskBlockSize,
              }),
            },
          })
          createInstance.mutate({
            ...pageParams,
            body: {
              name: values.name,
              hostname: values.hostname || values.name,
              description: `An instance in project: ${pageParams.projectName}`,
              memory: instance.memory * GiB,
              ncpus: instance.ncpus,
              disks: [
                {
                  type: 'attach',
                  name: values.bootDiskName || 'boot-disk',
                },
                ...values.disks.map((disk) =>
                  disk.type === 'create'
                    ? { type: disk.type, ...formatDiskCreate(disk) }
                    : disk
                ),
              ],
            },
          })
        })
      }
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
          <RadioField id="hw-general-purpose" name="type" label="">
            {renderLargeRadioCards('general')}
          </RadioField>
        </Tab.Panel>

        <Tab>CPU Optimized</Tab>
        <Tab.Panel>
          <TextFieldHint id="hw-cpu-help-text" className="mb-12 max-w-xl">
            CPU optimized instances provide a good balance of...
          </TextFieldHint>
          <RadioField id="hw-cpu-optimized" name="type" label="">
            {renderLargeRadioCards('cpuOptimized')}
          </RadioField>
        </Tab.Panel>

        <Tab>Memory optimized</Tab>
        <Tab.Panel>
          <TextFieldHint id="hw-mem-help-text" className="mb-12 max-w-xl">
            CPU optimized instances provide a good balance of...
          </TextFieldHint>
          <RadioField id="hw-mem-optimized" name="type" label="">
            {renderLargeRadioCards('memoryOptimized')}
          </RadioField>
        </Tab.Panel>

        <Tab>Custom</Tab>
        <Tab.Panel>
          <TextFieldHint id="hw-custom-help-text" className="mb-12 max-w-xl">
            Custom instances...
          </TextFieldHint>
          <RadioField id="hw-custom" name="type" label="">
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
              Icon: UbuntuDistroIcon,
            })}
            {renderDistroRadioCard({
              label: 'FreeBSD',
              value: 'freeBsd',
              Icon: FreebsdDistroIcon,
            })}
            {renderDistroRadioCard({
              label: 'Fedora',
              value: 'fedora',
              Icon: FedoraDistroIcon,
            })}
            {renderDistroRadioCard({
              label: 'Debian',
              value: 'debian',
              Icon: DebianDistroIcon,
            })}
            {renderDistroRadioCard({
              label: 'CentOS',
              value: 'centos',
              Icon: CentosDistroIcon,
            })}
            {renderDistroRadioCard({
              label: 'Windows',
              value: 'windows',
              Icon: WindowsDistroIcon,
            })}
          </RadioField>

          <NameField
            id="boot-disk-name"
            name="bootDiskName"
            label="Disk name"
            description="Will be autogenerated if name not provided"
          />
          <RadioField
            column
            id="boot-disk-block-size"
            name="bootDiskBlockSize"
            label="Block size"
            units="Bytes"
          >
            <Radio value="512">512</Radio>
            <Radio value="4096">4096</Radio>
          </RadioField>
          <DiskSizeField
            id="disk-size"
            label="Disk size"
            blockSizeField="bootDiskBlockSize"
            name="bootDiskSize"
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
    </FullPageForm>
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
] as const
