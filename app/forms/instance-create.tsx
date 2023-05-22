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
  EmptyMessage,
  FieldLabel,
  Images16Icon,
  InlineMessage,
  Instances24Icon,
  Key16Icon,
  RadioCard,
  Table,
  Tabs,
  TextInputHint,
  Truncate,
} from '@oxide/ui'
import { formatDateTime } from '@oxide/util'
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
    apiQueryClient.prefetchQuery('imageList', {
      query: { includeSiloImages: true, ...getProjectSelector(params) },
    }),
    apiQueryClient.prefetchQuery('currentUserSshKeyList', {}),
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
        content: 'Your instance has been created',
      })
      navigate(pb.instancePage({ ...projectSelector, instance: instance.name }))
    },
  })

  const images =
    useApiQuery('imageList', { query: { includeSiloImages: true, ...projectSelector } })
      .data?.items || []
  const siloImages = images.filter((i) => !i.projectId)
  const projectImages = images.filter((i) => i.projectId)

  const defaultImage = images[0]

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

        const image = images.find((i) => values.image === i.id)
        invariant(image, 'Expected image to be defined')

        const bootDiskName = values.bootDiskName || genName(values.name, image.name)

        createInstance.mutate({
          query: projectSelector,
          body: {
            name: values.name,
            hostname: values.hostname || values.name,
            description: values.description,
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
                  type: 'image',
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
          <Tabs.Root id="boot-disk-tabs" className="full-width" defaultValue="project">
            <Tabs.List aria-describedby="boot-disk">
              <Tabs.Trigger value="project">Project images</Tabs.Trigger>
              <Tabs.Trigger value="silo">Silo images</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="project" className="space-y-4">
              {projectImages.length === 0 ? (
                <div className="flex max-w-lg items-center justify-center rounded-lg border p-6 border-default">
                  <EmptyMessage
                    icon={<Images16Icon />}
                    title="No project images found"
                    body="An image needs to be uploaded to be seen here"
                    buttonText="Upload image"
                    onClick={() => navigate(pb.projectImageNew(projectSelector))}
                  />
                </div>
              ) : (
                <ImageSelectField images={projectImages} control={control} />
              )}
            </Tabs.Content>
            <Tabs.Content value="silo" className="space-y-4">
              {siloImages.length === 0 ? (
                <div className="flex max-w-lg items-center justify-center rounded-lg border p-6 border-default">
                  <EmptyMessage
                    icon={<Images16Icon />}
                    title="No silo images found"
                    body="Project images need to be promoted to be seen here"
                  />
                </div>
              ) : (
                <ImageSelectField images={siloImages} control={control} />
              )}
            </Tabs.Content>
          </Tabs.Root>

          <div className="!my-16 content-['a']"></div>

          <DiskSizeField label="Disk size" name="bootDiskSize" control={control} />
          <NameField
            name="bootDiskName"
            label="Disk name"
            description="Will be autogenerated if name not provided"
            required={false}
            control={control}
          />
          <Divider />
          <Form.Heading id="additional-disks">Additional disks</Form.Heading>

          <DisksTableField control={control} />

          <Divider />
          <Form.Heading id="authentication">Authentication</Form.Heading>

          <SshKeysTable />

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

const SshKeysTable = () => {
  const keys = useApiQuery('currentUserSshKeyList', {}).data?.items || []

  return (
    <div className="max-w-lg">
      <div className="mb-2">
        <FieldLabel id="ssh-keys-label" tip="hello">
          SSH keys
        </FieldLabel>
        <TextInputHint id="ssh-keys-label-help-text">
          SSH keys can be added and removed in your user settings
        </TextInputHint>
      </div>

      {keys.length > 0 ? (
        <Table className="w-full">
          <Table.Header>
            <Table.HeaderRow>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>Created</Table.HeadCell>
            </Table.HeaderRow>
          </Table.Header>
          <Table.Body>
            {keys.map((key) => (
              <Table.Row key={key.id}>
                <Table.Cell height="auto">
                  <Truncate text={key.name} maxLength={28} />
                </Table.Cell>
                <Table.Cell height="auto" className="text-secondary">
                  {formatDateTime(key.timeCreated)}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      ) : (
        <div className="mb-4 flex max-w-lg items-center justify-center rounded-lg border p-6 border-default">
          <EmptyMessage
            icon={<Key16Icon />}
            title="No SSH keys"
            body="You need to add a SSH key to be able to see it here"
          />
        </div>
      )}

      <InlineMessage
        variant="notice"
        content={
          <>
            If your image supports the cidata volume and{' '}
            <a
              target="_blank"
              href="https://cloudinit.readthedocs.io/en/latest/"
              rel="noreferrer"
            >
              cloud-init
            </a>
            , the keys above will be added to your instance. Keys are added when the
            instance is created and are not updated after instance launch.
          </>
        }
      />
    </div>
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
