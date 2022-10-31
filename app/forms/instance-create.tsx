import * as Yup from 'yup'
import invariant from 'tiny-invariant'

import type {
  Instance,
  InstanceCreate,
  InstanceNetworkInterfaceAttachment,
} from '@oxide/api'
import { genName } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import {
  Divider,
  Instances24Icon,
  RadioCard,
  Success16Icon,
  Tab,
  Tabs,
  TextInputHint,
} from '@oxide/ui'
import { GiB } from '@oxide/util'

import type { DiskTableItem } from 'app/components/form'
import { CheckboxField } from 'app/components/form'
import { FullPageForm } from 'app/components/form'
import { DiskSizeField } from 'app/components/form'
import {
  DescriptionField,
  DisksTableField,
  Form,
  NameField,
  NetworkInterfaceField,
  RadioField,
  TextField,
} from 'app/components/form'
import { ImageSelectField } from 'app/components/form/fields/ImageSelectField'
import type { CreateFormProps } from 'app/forms'
import { useRequiredParams, useToast } from 'app/hooks'

type InstanceCreateInput = Assign<
  InstanceCreate,
  {
    networkInterfaceType: InstanceNetworkInterfaceAttachment['type']
    type: typeof INSTANCE_SIZES[number]['id']
    disks: DiskTableItem[]
    bootDiskName: string
    bootDiskSize: number
    globalImage: string
  }
>

const values: InstanceCreateInput = {
  name: '',
  description: '',
  /**
   * This value controls the selector which drives memory and ncpus. It's not actually
   * submitted to the API.
   */
  type: 'general-xs',
  memory: 0,
  ncpus: 1,
  hostname: '',

  bootDiskName: '',
  bootDiskSize: 10,
  globalImage: '',

  disks: [],
  networkInterfaces: { type: 'default' },
  /**
   * This is a hack to ensure the network interface radio has a default selection.
   * We actually don't care about this value outside of that.
   */
  networkInterfaceType: 'default',

  start: true,
}

export function CreateInstanceForm({
  id = 'create-instance-form',
  initialValues = values,
  onSubmit,
  onSuccess,
  onDismiss,
  onError,
  ...props
}: CreateFormProps<InstanceCreateInput, Instance>) {
  const queryClient = useApiQueryClient()
  const addToast = useToast()
  const pageParams = useRequiredParams('orgName', 'projectName')

  const createDisk = useApiMutation('diskCreate')

  const createInstance = useApiMutation('instanceCreate', {
    onSuccess(instance) {
      // refetch list of instances
      queryClient.invalidateQueries('instanceList', { path: pageParams })
      // avoid the instance fetch when the instance page loads since we have the data
      queryClient.setQueryData(
        'instanceView',
        { path: { ...pageParams, instanceName: instance.name } },
        instance
      )
      addToast({
        icon: <Success16Icon />,
        title: 'Success!',
        content: 'Your instance has been created.',
      })
      onSuccess?.(instance)
    },
    onError,
  })

  const images = useApiQuery('systemImageList', {}).data?.items || []

  initialValues.globalImage = images[0]?.id || ''

  return (
    <FullPageForm
      id={id}
      initialValues={initialValues}
      title="Create instance"
      icon={<Instances24Icon />}
      validationSchema={Yup.object({
        // needed to cover case where there are no images, in which case there
        // are no individual radio fields marked required, which unfortunately
        // is how required radio fields work
        globalImage: Yup.string().required(),
      })}
      onSubmit={
        onSubmit ||
        (async (values) => {
          const instance = INSTANCE_SIZES.find((option) => option.id === values['type'])
          invariant(instance, 'Expected instance type to be defined')
          const image = images.find((i) => values.globalImage === i.id)
          invariant(image, 'Expected image to be defined')

          const bootDiskName = values.bootDiskName || genName(values.name, image.name)

          await createDisk.mutateAsync({
            path: pageParams,
            body: {
              // TODO: Determine the pattern of the default boot disk name
              name: bootDiskName,
              description: `Created as a boot disk for ${values.bootDiskName}`,
              // TODO: Verify size is larger than the minimum image size
              size: values.bootDiskSize * GiB,
              diskSource: {
                type: 'global_image',
                imageId: values.globalImage,
              },
            },
          })
          createInstance.mutate({
            path: pageParams,
            body: {
              name: values.name,
              hostname: values.hostname || values.name,
              description: `An instance in project: ${pageParams.projectName}`,
              memory: instance.memory * GiB,
              ncpus: instance.ncpus,
              disks: [
                {
                  type: 'attach',
                  name: bootDiskName,
                },
                ...values.disks,
              ],
              externalIps: [{ type: 'ephemeral' }],
              start: values.start,
            },
          })
        })
      }
      {...props}
      submitDisabled={createDisk.isLoading || createInstance.isLoading}
      error={(createDisk.error?.error || createInstance.error?.error) as Error | undefined}
    >
      <NameField id="name" />
      <DescriptionField id="description" />
      <CheckboxField id="start-instance" name="start" label="Start Instance">
        Start Instance
      </CheckboxField>

      <Divider />

      <Form.Heading id="hardware">Hardware</Form.Heading>
      <Tabs id="choose-cpu-ram" fullWidth aria-labelledby="hardware">
        <Tab>General Purpose</Tab>
        <Tab.Panel>
          <TextInputHint id="hw-gp-help-text" className="mb-12 max-w-xl text-sans-md">
            General purpose instances provide a good balance of CPU, memory, and high
            performance storage; well suited for a wide range of use cases.
          </TextInputHint>
          <RadioField id="hw-general-purpose" name="type" label="">
            {renderLargeRadioCards('general')}
          </RadioField>
        </Tab.Panel>

        <Tab>CPU Optimized</Tab>
        <Tab.Panel>
          <TextInputHint id="hw-cpu-help-text" className="mb-12 max-w-xl  text-sans-md">
            CPU optimized instances provide a good balance of...
          </TextInputHint>
          <RadioField id="hw-cpu-optimized" name="type" label="">
            {renderLargeRadioCards('cpuOptimized')}
          </RadioField>
        </Tab.Panel>

        <Tab>Memory optimized</Tab>
        <Tab.Panel>
          <TextInputHint id="hw-mem-help-text" className="mb-12 max-w-xl  text-sans-md">
            CPU optimized instances provide a good balance of...
          </TextInputHint>
          <RadioField id="hw-mem-optimized" name="type" label="">
            {renderLargeRadioCards('memoryOptimized')}
          </RadioField>
        </Tab.Panel>

        <Tab>Custom</Tab>
        <Tab.Panel>
          <TextInputHint id="hw-custom-help-text" className="mb-12 max-w-xl  text-sans-md">
            Custom instances...
          </TextInputHint>
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
          {images.length === 0 && <span>No images found</span>}
          <ImageSelectField
            id="boot-disk-image"
            name="globalImage"
            images={images}
            required
          />

          <NameField
            id="boot-disk-name"
            name="bootDiskName"
            label="Disk name"
            description="Will be autogenerated if name not provided"
            required={false}
          />
          <DiskSizeField id="disk-size" label="Disk size" name="bootDiskSize" />
        </Tab.Panel>
        <Tab>Images</Tab>
        <Tab.Panel>
          <span>No images found</span>
        </Tab.Panel>
        <Tab>Snapshots</Tab>
        <Tab.Panel>
          <span>No snapshots found</span>
        </Tab.Panel>
      </Tabs>
      <Divider />
      <Form.Heading id="additional-disks">Additional disks</Form.Heading>

      <DisksTableField />

      <Divider />
      <Form.Heading id="networking">Networking</Form.Heading>

      <NetworkInterfaceField />

      <TextField id="hostname" description="Will be generated if not provided" />

      <Form.Actions>
        <Form.Submit loading={createDisk.isLoading || createInstance.isLoading}>
          Create instance
        </Form.Submit>
        {onDismiss && <Form.Cancel onClick={onDismiss} />}
      </Form.Actions>
    </FullPageForm>
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
