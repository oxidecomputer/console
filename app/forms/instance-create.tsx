import type { LoaderFunctionArgs } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import invariant from 'tiny-invariant'
import type { SetRequired } from 'type-fest'

import type { InstanceCreate } from '@oxide/api'
import {
  apiQueryClient,
  genName,
  useApiMutation,
  useApiQuery,
  useApiQueryClient,
} from '@oxide/api'
import {
  Divider,
  Instances24Icon,
  RadioCard,
  Success12Icon,
  Tabs,
  TextInputHint,
} from '@oxide/ui'
import { GiB } from '@oxide/util'

import { Form, FullPageForm } from 'app/components/form'
import type { DiskTableItem } from 'app/components/form'
import {
  CheckboxField,
  DescriptionField,
  DiskSizeField,
  DisksTableField,
  ImageSelectField,
  NameField,
  NetworkInterfaceField,
  RadioFieldDyn,
  TextField,
} from 'app/components/form'
import { getProjectSelector, useProjectSelector, useToast } from 'app/hooks'
import { pb } from 'app/util/path-builder'

export type InstanceCreateInput = Assign<
  // API accepts undefined but it's easier if we don't
  SetRequired<InstanceCreate, 'networkInterfaces'>,
  {
    type: (typeof INSTANCE_SIZES)[number]['id']
    disks: DiskTableItem[]
    bootDiskName: string
    bootDiskSize: number
    image: string
  }
>

const baseDefaultValues: InstanceCreateInput = {
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
  image: '',

  disks: [],
  networkInterfaces: { type: 'default' },

  start: true,
}

CreateInstanceForm.loader = async ({ params }: LoaderFunctionArgs) => {
  await Promise.all([
    apiQueryClient.prefetchQuery('imageList', { query: getProjectSelector(params) }),
    apiQueryClient.prefetchQuery('systemImageList', {}),
  ])
  return null
}

export function CreateInstanceForm() {
  const queryClient = useApiQueryClient()
  const addToast = useToast()
  const projectSelector = useProjectSelector()
  const navigate = useNavigate()

  const createInstance = useApiMutation('instanceCreate', {
    onSuccess(instance) {
      // refetch list of instances
      queryClient.invalidateQueries('instanceList', { query: projectSelector })
      // avoid the instance fetch when the instance page loads since we have the data
      queryClient.setQueryData(
        'instanceView',
        { path: { instance: instance.name }, query: projectSelector },
        instance
      )
      addToast({
        icon: <Success12Icon />,
        title: 'Success!',
        content: 'Your instance has been created.',
      })
      navigate(pb.instancePage({ ...projectSelector, instance: instance.name }))
    },
  })

  const systemImages = useApiQuery('systemImageList', {}).data?.items || []
  const projectImages =
    useApiQuery('imageList', { query: projectSelector }).data?.items || []

  const defaultImage = systemImages[0]

  const defaultValues: InstanceCreateInput = {
    ...baseDefaultValues,
    image: defaultImage?.id || '',
    // Use 2x the image size as the default boot disk size
    bootDiskSize: Math.ceil(defaultImage?.size / GiB) * 2 || 10,
  }

  return (
    <FullPageForm
      id="create-instance-form"
      formOptions={{ defaultValues }}
      title="Create instance"
      icon={<Instances24Icon />}
      onSubmit={(values) => {
        const instance = INSTANCE_SIZES.find((option) => option.id === values['type'])
        invariant(instance, 'Expected instance type to be defined')

        const projectImage = projectImages.find((i) => values.image === i.id)
        const systemImage = systemImages.find((i) => values.image === i.id)
        const image = projectImage || systemImage
        invariant(image, 'Expected image to be defined')

        const bootDiskName = values.bootDiskName || genName(values.name, image.name)

        createInstance.mutate({
          query: projectSelector,
          body: {
            name: values.name,
            hostname: values.hostname || values.name,
            description: `An instance in project: ${projectSelector.project}`,
            memory: instance.memory * GiB,
            ncpus: instance.ncpus,
            disks: [
              {
                type: 'create',
                // TODO: Determine the pattern of the default boot disk name
                name: bootDiskName,
                description: `Created as a boot disk for ${values.name}`,

                // TODO: Verify size is larger than the minimum image size
                size: values.bootDiskSize * GiB,
                diskSource: {
                  type: projectImage ? 'image' : 'global_image',
                  imageId: values.image,
                },
              },
              ...values.disks,
            ],
            externalIps: [{ type: 'ephemeral' }],
            start: values.start,
            networkInterfaces: values.networkInterfaces,
          },
        })
      }}
      loading={createInstance.isLoading}
      submitError={createInstance.error}
    >
      {({ control }) => (
        <>
          <NameField name="name" control={control} />
          <DescriptionField name="description" control={control} />
          <CheckboxField id="start-instance" name="start" control={control}>
            Start Instance
          </CheckboxField>

          <Divider />

          <Form.Heading id="hardware">Hardware</Form.Heading>
          <Tabs.Root
            id="choose-cpu-ram"
            className="full-width"
            defaultValue="general-purpose"
          >
            <Tabs.List aria-labelledby="hardware">
              <Tabs.Trigger value="general-purpose">General Purpose</Tabs.Trigger>
              <Tabs.Trigger value="cpu-optimized">CPU Optimized</Tabs.Trigger>
              <Tabs.Trigger value="memory-optimized">Memory optimized</Tabs.Trigger>
              <Tabs.Trigger value="custom">Custom</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="general-purpose">
              <TextInputHint id="hw-gp-help-text" className="mb-12 max-w-xl text-sans-md">
                General purpose instances provide a good balance of CPU, memory, and high
                performance storage; well suited for a wide range of use cases.
              </TextInputHint>
              <RadioFieldDyn name="type" label="" control={control}>
                {renderLargeRadioCards('general')}
              </RadioFieldDyn>
            </Tabs.Content>

            <Tabs.Content value="cpu-optimized">
              <TextInputHint id="hw-cpu-help-text" className="mb-12 max-w-xl  text-sans-md">
                CPU optimized instances provide a good balance of...
              </TextInputHint>
              <RadioFieldDyn name="type" label="" control={control}>
                {renderLargeRadioCards('cpuOptimized')}
              </RadioFieldDyn>
            </Tabs.Content>

            <Tabs.Content value="memory-optimized">
              <TextInputHint id="hw-mem-help-text" className="mb-12 max-w-xl  text-sans-md">
                CPU optimized instances provide a good balance of...
              </TextInputHint>
              <RadioFieldDyn name="type" label="" control={control}>
                {renderLargeRadioCards('memoryOptimized')}
              </RadioFieldDyn>
            </Tabs.Content>

            <Tabs.Content value="custom">
              <TextInputHint
                // TODO: is this getting hooked up to the field with describedby?
                id="hw-custom-help-text"
                className="mb-12 max-w-xl  text-sans-md"
              >
                Custom instances...
              </TextInputHint>
              <RadioFieldDyn name="type" label="" control={control}>
                {renderLargeRadioCards('custom')}
              </RadioFieldDyn>
            </Tabs.Content>
          </Tabs.Root>

          <Divider />

          <Form.Heading id="boot-disk">Boot disk</Form.Heading>
          <Tabs.Root id="boot-disk-tabs" className="full-width" defaultValue="system">
            <Tabs.List aria-describedby="boot-disk">
              <Tabs.Trigger value="system">System images</Tabs.Trigger>
              <Tabs.Trigger value="project">Project images</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="system" className="space-y-4">
              {systemImages.length === 0 && <span>No images found</span>}
              <ImageSelectField images={systemImages} required control={control} />
            </Tabs.Content>
            <Tabs.Content value="project">
              {projectImages.length === 0 && <span>No images found</span>}
              <ImageSelectField images={projectImages} required control={control} />
            </Tabs.Content>
          </Tabs.Root>

          <NameField
            name="bootDiskName"
            label="Disk name"
            description="Will be autogenerated if name not provided"
            required={false}
            control={control}
          />
          <DiskSizeField label="Disk size" name="bootDiskSize" control={control} />
          <Divider />
          <Form.Heading id="additional-disks">Additional disks</Form.Heading>

          <DisksTableField control={control} />

          <Divider />
          <Form.Heading id="networking">Networking</Form.Heading>

          <NetworkInterfaceField control={control} />

          <TextField
            name="hostname"
            description="Will be generated if not provided"
            control={control}
          />

          <Form.Actions>
            <Form.Submit loading={createInstance.isLoading}>Create instance</Form.Submit>
            <Form.Cancel onClick={() => navigate(pb.instances(projectSelector))} />
          </Form.Actions>
        </>
      )}
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
