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
  memory: 8,
  ncpus: 2,
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
        let instance = { memory: 0, ncpus: 0 }
        const preset = INSTANCE_SIZES.find((option) => option.id === values['type'])

        if (values['type'] === 'custom') {
          instance = {
            memory:
              typeof values.memory === 'string'
                ? parseInt(values.memory, 10)
                : values.memory,
            ncpus:
              typeof values.ncpus === 'string' ? parseInt(values.ncpus, 10) : values.ncpus,
          }
        } else if (preset) {
          instance = {
            memory: preset.memory,
            ncpus: preset.ncpus,
          }
        }

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
      {({ control, setValue }) => (
        <>
          <NameField name="name" control={control} />
          <DescriptionField name="description" control={control} />
          <CheckboxField id="start-instance" name="start" control={control}>
            Start Instance
          </CheckboxField>

          <Divider />

          <Form.Heading id="hardware">Hardware</Form.Heading>

          <TextInputHint id="hw-gp-help-text" className="mb-12 max-w-xl text-sans-md">
            Pick a pre-configured machine type that offers balanced vCPU and memory for most
            workloads or create a custom machine.
          </TextInputHint>

          <Tabs.Root
            id="choose-cpu-ram"
            className="full-width"
            defaultValue="general"
            onValueChange={(val) => {
              // Having an option selected from a non-current tab
              // is confusing, especially in combination with the custom inputs
              // This auto selected the first option from the current selected category
              const firstOption = INSTANCE_SIZES.filter(
                (preset) => preset.category === val
              )[0]
              if (firstOption) {
                setValue('type', firstOption.id)
              }
            }}
          >
            <Tabs.List aria-labelledby="hardware">
              <Tabs.Trigger value="general">General Purpose</Tabs.Trigger>
              <Tabs.Trigger value="highCPU">High CPU</Tabs.Trigger>
              <Tabs.Trigger value="highMemory">High Memory</Tabs.Trigger>
              <Tabs.Trigger value="custom">Custom</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="general">
              <RadioFieldDyn name="type" label="" control={control}>
                {renderLargeRadioCards('general')}
              </RadioFieldDyn>
            </Tabs.Content>

            <Tabs.Content value="highCPU">
              <RadioFieldDyn name="type" label="" control={control}>
                {renderLargeRadioCards('highCPU')}
              </RadioFieldDyn>
            </Tabs.Content>

            <Tabs.Content value="highMemory">
              <RadioFieldDyn name="type" label="" control={control}>
                {renderLargeRadioCards('highMemory')}
              </RadioFieldDyn>
            </Tabs.Content>

            <Tabs.Content value="custom">
              <TextField
                type="number"
                required
                label="CPUs"
                name="ncpus"
                min={1}
                max={32}
                control={control}
              />
              <TextField
                units="GB"
                type="number"
                required
                label="Memory"
                name="memory"
                min={1}
                max={128}
                control={control}
              />
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
          vCPU{option.ncpus === 1 ? '' : 's'}
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
    id: 'general-sm',
    memory: 8,
    ncpus: 2,
  },
  {
    category: 'general',
    id: 'general-md',
    memory: 16,
    ncpus: 4,
  },
  {
    category: 'general',
    id: 'general-lg',
    memory: 32,
    ncpus: 8,
  },
  {
    category: 'general',
    id: 'general-xl',
    memory: 64,
    ncpus: 16,
  },
  {
    category: 'general',
    id: 'general-2xl',
    memory: 128,
    ncpus: 32,
  },
  {
    category: 'highCPU',
    id: 'highCPU-xs',
    memory: 4,
    ncpus: 2,
  },
  {
    category: 'highCPU',
    id: 'highCPU-sm',
    memory: 8,
    ncpus: 4,
  },
  {
    category: 'highCPU',
    id: 'highCPU-md',
    memory: 16,
    ncpus: 8,
  },
  {
    category: 'highCPU',
    id: 'highCPU-lg',
    memory: 32,
    ncpus: 16,
  },
  {
    category: 'highCPU',
    id: 'highCPU-xl',
    memory: 64,
    ncpus: 32,
  },
  {
    category: 'highMemory',
    id: 'highMemory-xs',
    memory: 16,
    ncpus: 2,
  },
  {
    category: 'highMemory',
    id: 'highMemory-sm',
    memory: 32,
    ncpus: 4,
  },
  {
    category: 'highMemory',
    id: 'highMemory-md',
    memory: 64,
    ncpus: 8,
  },
  {
    category: 'highMemory',
    id: 'highMemory-lg',
    memory: 128,
    ncpus: 16,
  },
  {
    category: 'custom',
    id: 'custom',
    memory: 0,
    ncpus: 0,
  },
] as const
