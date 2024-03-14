/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import * as Accordion from '@radix-ui/react-accordion'
import { useEffect, useState } from 'react'
import { useWatch } from 'react-hook-form'
import { useNavigate, type LoaderFunctionArgs } from 'react-router-dom'
import type { SetRequired } from 'type-fest'

import {
  apiQueryClient,
  genName,
  INSTANCE_MAX_CPU,
  INSTANCE_MAX_RAM_GiB,
  useApiMutation,
  useApiQueryClient,
  usePrefetchedApiQuery,
  type InstanceCreate,
} from '@oxide/api'
import {
  DirectionRightIcon,
  EmptyMessage,
  FieldLabel,
  FormDivider,
  Images16Icon,
  Instances24Icon,
  Key16Icon,
  Message,
  RadioCard,
  Table,
  Tabs,
  TextInputHint,
  Truncate,
} from '@oxide/ui'
import { formatDateTime, GiB, invariant } from '@oxide/util'

import {
  CheckboxField,
  DescriptionField,
  DiskSizeField,
  DisksTableField,
  FileField,
  Form,
  FullPageForm,
  ImageSelectField,
  NameField,
  NetworkInterfaceField,
  RadioFieldDyn,
  TextField,
  type DiskTableItem,
} from 'app/components/form'
import {
  getProjectSelector,
  useForm,
  useInstanceTemplate,
  useProjectSelector,
  useToast,
} from 'app/hooks'
import { readBlobAsBase64 } from 'app/util/file'
import { links } from 'app/util/links'
import { pb } from 'app/util/path-builder'

export type InstanceCreateInput = Assign<
  // API accepts undefined but it's easier if we don't
  SetRequired<InstanceCreate, 'networkInterfaces'>,
  {
    presetId: (typeof PRESETS)[number]['id']
    disks: DiskTableItem[]
    bootDiskName: string
    bootDiskSize: number
    image: string
    userData: File | null
  }
>

export const baseDefaultValues: InstanceCreateInput = {
  name: '',
  description: '',
  /**
   * This value controls the selector which drives memory and ncpus. It's not actually
   * submitted to the API.
   */
  presetId: 'general-xs',
  memory: 8,
  ncpus: 2,
  hostname: '',

  bootDiskName: '',
  bootDiskSize: 10,
  image: '',

  disks: [],
  networkInterfaces: { type: 'default' },

  start: true,

  userData: null,
}

CreateInstanceForm.loader = async ({ params }: LoaderFunctionArgs) => {
  await Promise.all([
    // fetch both project and silo images
    apiQueryClient.prefetchQuery('imageList', { query: getProjectSelector(params) }),
    apiQueryClient.prefetchQuery('imageList', {}),
    apiQueryClient.prefetchQuery('currentUserSshKeyList', {}),
  ])
  return null
}

export function CreateInstanceForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useApiQueryClient()
  const addToast = useToast()
  const projectSelector = useProjectSelector()
  const navigate = useNavigate()

  const createInstance = useApiMutation('instanceCreate', {
    onSuccess(instance) {
      // refetch list of instances
      queryClient.invalidateQueries('instanceList')
      // avoid the instance fetch when the instance page loads since we have the data
      queryClient.setQueryData(
        'instanceView',
        { path: { instance: instance.name }, query: projectSelector },
        instance
      )
      addToast({ content: 'Your instance has been created' })
      navigate(pb.instancePage({ ...projectSelector, instance: instance.name }))
    },
  })

  const siloImages = usePrefetchedApiQuery('imageList', {}).data.items
  const projectImages = usePrefetchedApiQuery('imageList', { query: projectSelector }).data
    .items
  const allImages = [...siloImages, ...projectImages]

  const defaultImage = allImages[0]

  const defaultValues: InstanceCreateInput = {
    ...baseDefaultValues,
    image: defaultImage?.id || '',
    // Use 2x the image size as the default boot disk size
    bootDiskSize: Math.ceil(defaultImage?.size / GiB) * 2 || 10,
  }

  const form = useForm({ defaultValues })
  const { control, setValue } = form

  useInstanceTemplate(setValue)

  const imageInput = useWatch({ control: control, name: 'image' })
  const image = allImages.find((i) => i.id === imageInput)
  const imageSize = image?.size ? Math.ceil(image.size / GiB) : undefined

  useEffect(() => {
    if (createInstance.error) {
      setIsSubmitting(false)
    }
  }, [createInstance.error])

  return (
    <FullPageForm
      submitDisabled={allImages.length ? undefined : 'Image required'}
      id="create-instance-form"
      form={form}
      title="Create instance"
      icon={<Instances24Icon />}
      onSubmit={async (values) => {
        setIsSubmitting(true)
        // we should never have a presetId that's not in the list
        const preset = PRESETS.find((option) => option.id === values.presetId)!
        const instance =
          values.presetId === 'custom'
            ? { memory: values.memory, ncpus: values.ncpus }
            : { memory: preset.memory, ncpus: preset.ncpus }
        const image = allImages.find((i) => values.image === i.id)
        // There should always be an image present, because …
        // - The form is disabled unless there are images available.
        // - The form defaults to including at least one image.
        invariant(image, 'Expected image to be defined')

        const bootDiskName = values.bootDiskName || genName(values.name, image.name)

        const userData = values.userData
          ? await readBlobAsBase64(values.userData)
          : undefined

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

                // Minimum size as greater than the image is validated
                // directly on the boot disk size input
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
            userData,
          },
        })
      }}
      loading={createInstance.isPending}
      submitError={createInstance.error}
    >
      <NameField name="name" control={control} disabled={isSubmitting} />
      <DescriptionField name="description" control={control} disabled={isSubmitting} />
      <CheckboxField
        id="start-instance"
        name="start"
        control={control}
        disabled={isSubmitting}
      >
        Start Instance
      </CheckboxField>

      <FormDivider />

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
          // Having an option selected from a non-current tab is confusing,
          // especially in combination with the custom inputs. So we auto
          // select the first option from the current tab
          const firstOption = PRESETS.find((preset) => preset.category === val)
          if (firstOption) {
            setValue('presetId', firstOption.id)
          }
        }}
      >
        <Tabs.List aria-labelledby="hardware">
          <Tabs.Trigger value="general" disabled={isSubmitting}>
            General Purpose
          </Tabs.Trigger>
          <Tabs.Trigger value="highCPU" disabled={isSubmitting}>
            High CPU
          </Tabs.Trigger>
          <Tabs.Trigger value="highMemory" disabled={isSubmitting}>
            High Memory
          </Tabs.Trigger>
          <Tabs.Trigger value="custom" disabled={isSubmitting}>
            Custom
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="general">
          <RadioFieldDyn name="presetId" label="" control={control} disabled={isSubmitting}>
            {renderLargeRadioCards('general')}
          </RadioFieldDyn>
        </Tabs.Content>

        <Tabs.Content value="highCPU">
          <RadioFieldDyn name="presetId" label="" control={control}>
            {renderLargeRadioCards('highCPU')}
          </RadioFieldDyn>
        </Tabs.Content>

        <Tabs.Content value="highMemory">
          <RadioFieldDyn name="presetId" label="" control={control}>
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
            max={INSTANCE_MAX_CPU}
            control={control}
            validate={(cpus) => {
              if (cpus < 1) {
                return `Must be at least 1 vCPU`
              }
              if (cpus > INSTANCE_MAX_CPU) {
                return `CPUs capped to ${INSTANCE_MAX_CPU}`
              }
            }}
            disabled={isSubmitting}
          />
          <TextField
            units="GiB"
            type="number"
            required
            label="Memory"
            name="memory"
            min={1}
            max={INSTANCE_MAX_RAM_GiB}
            control={control}
            validate={(memory) => {
              if (memory < 1) {
                return `Must be at least 1 GiB`
              }
              if (memory > INSTANCE_MAX_RAM_GiB) {
                return `Can be at most ${INSTANCE_MAX_RAM_GiB} GiB`
              }
            }}
            disabled={isSubmitting}
          />
        </Tabs.Content>
      </Tabs.Root>

      <FormDivider />

      <Form.Heading id="boot-disk">Boot disk</Form.Heading>
      <Tabs.Root
        id="boot-disk-tabs"
        className="full-width"
        // default to the project images tab if there are only project images
        defaultValue={
          projectImages.length > 0 && siloImages.length === 0 ? 'project' : 'silo'
        }
      >
        <Tabs.List aria-describedby="boot-disk">
          <Tabs.Trigger value="silo" disabled={isSubmitting}>
            Silo images
          </Tabs.Trigger>
          <Tabs.Trigger value="project" disabled={isSubmitting}>
            Project images
          </Tabs.Trigger>
        </Tabs.List>
        {allImages.length === 0 && (
          <Message
            className="mb-8 ml-10 max-w-lg"
            variant="notice"
            content="Images are required to create a boot disk."
          />
        )}
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
            <ImageSelectField
              images={siloImages}
              control={control}
              disabled={isSubmitting}
            />
          )}
        </Tabs.Content>
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
            <ImageSelectField
              images={projectImages}
              control={control}
              disabled={isSubmitting}
            />
          )}
        </Tabs.Content>
      </Tabs.Root>

      <div className="!my-16 content-['a']"></div>

      <DiskSizeField
        label="Disk size"
        name="bootDiskSize"
        control={control}
        validate={(diskSizeGiB: number) => {
          if (imageSize && diskSizeGiB < imageSize) {
            return `Must be as large as selected image (min. ${imageSize} GiB)`
          }
        }}
        disabled={isSubmitting}
      />
      <NameField
        name="bootDiskName"
        label="Disk name"
        tooltipText="Will be autogenerated if name not provided"
        required={false}
        control={control}
        disabled={isSubmitting}
      />
      <FormDivider />
      <Form.Heading id="additional-disks">Additional disks</Form.Heading>

      <DisksTableField control={control} disabled={isSubmitting} />

      <FormDivider />
      <Form.Heading id="authentication">Authentication</Form.Heading>

      <SshKeysTable />

      <FormDivider />
      <Form.Heading id="advanced">Advanced</Form.Heading>

      <Accordion.Root type="multiple" className="mt-12">
        <Accordion.Item value="networking">
          <AccordionHeader id="networking">Networking</AccordionHeader>
          <AccordionContent>
            <NetworkInterfaceField control={control} disabled={isSubmitting} />

            <TextField
              name="hostname"
              tooltipText="Will be generated if not provided"
              control={control}
              disabled={isSubmitting}
            />
          </AccordionContent>
        </Accordion.Item>
        <Accordion.Item value="configuration">
          <AccordionHeader id="configuration">Configuration</AccordionHeader>
          <AccordionContent>
            <FileField
              id="user-data-input"
              description={
                <>
                  Data or scripts to be passed to cloud-init as{' '}
                  <a href={links.cloudInitFormat} target="_blank" rel="noreferrer">
                    user data
                  </a>{' '}
                  <a href={links.cloudInitExamples} target="_blank" rel="noreferrer">
                    (examples)
                  </a>{' '}
                  if the selected boot image supports it. Maximum size 32 KiB.
                </>
              }
              name="userData"
              label="User Data"
              control={control}
            />
          </AccordionContent>
        </Accordion.Item>
      </Accordion.Root>

      <Form.Actions>
        <Form.Submit loading={createInstance.isPending}>Create instance</Form.Submit>
        <Form.Cancel onClick={() => navigate(pb.instances(projectSelector))} />
      </Form.Actions>
    </FullPageForm>
  )
}

const AccordionHeader = ({ id, children }: { id: string; children: React.ReactNode }) => (
  <Accordion.Header id={id} className="max-w-lg">
    <Accordion.Trigger className="group flex w-full items-center justify-between border-t py-2 text-sans-xl border-secondary [&>svg]:data-[state=open]:rotate-90">
      <div className="text-secondary">{children}</div>
      <DirectionRightIcon className="transition-all text-secondary" />
    </Accordion.Trigger>
  </Accordion.Header>
)

const AccordionContent = ({ children }: { children: React.ReactNode }) => (
  <Accordion.Content className="AccordionContent max-w-lg overflow-hidden">
    <div className="ox-accordion-content py-8">{children}</div>
  </Accordion.Content>
)

const SshKeysTable = () => {
  const keys = usePrefetchedApiQuery('currentUserSshKeyList', {}).data?.items || []

  return (
    <div className="max-w-lg">
      <div className="mb-2">
        <FieldLabel id="ssh-keys-label">SSH keys</FieldLabel>
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

      <Message
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
  return PRESETS.filter((option) => option.category === category).map((option) => (
    <RadioCard key={option.id} value={option.id}>
      <div>
        {option.ncpus} <RadioCard.Unit aria-label="CPU">vCPUs</RadioCard.Unit>
      </div>
      <div>
        {option.memory} <RadioCard.Unit aria-label="gibibytes RAM">GiB RAM</RadioCard.Unit>
      </div>
    </RadioCard>
  ))
}

export const PRESETS = [
  { category: 'general', id: 'general-xs', memory: 8, ncpus: 2 },
  { category: 'general', id: 'general-sm', memory: 16, ncpus: 4 },
  { category: 'general', id: 'general-md', memory: 32, ncpus: 8 },
  { category: 'general', id: 'general-lg', memory: 64, ncpus: 16 },
  { category: 'general', id: 'general-xl', memory: 128, ncpus: 32 },

  { category: 'highCPU', id: 'highCPU-xs', memory: 4, ncpus: 2 },
  { category: 'highCPU', id: 'highCPU-sm', memory: 8, ncpus: 4 },
  { category: 'highCPU', id: 'highCPU-md', memory: 16, ncpus: 8 },
  { category: 'highCPU', id: 'highCPU-lg', memory: 32, ncpus: 16 },
  { category: 'highCPU', id: 'highCPU-xl', memory: 64, ncpus: 32 },

  { category: 'highMemory', id: 'highMemory-xs', memory: 16, ncpus: 2 },
  { category: 'highMemory', id: 'highMemory-sm', memory: 32, ncpus: 4 },
  { category: 'highMemory', id: 'highMemory-md', memory: 64, ncpus: 8 },
  { category: 'highMemory', id: 'highMemory-lg', memory: 128, ncpus: 16 },

  { category: 'custom', id: 'custom', memory: 0, ncpus: 0 },
] as const
