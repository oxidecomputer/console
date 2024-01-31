/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import * as Accordion from '@radix-ui/react-accordion'
import cn from 'classnames'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useWatch, type Control } from 'react-hook-form'
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
  FormDivider,
  Images16Icon,
  Instances24Icon,
  Message,
  RadioCard,
  Tabs,
  TextInputHint,
} from '@oxide/ui'
import { GiB, invariant } from '@oxide/util'

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
  NumberField,
  RadioFieldDyn,
  SshKeysField,
  TextField,
  type DiskTableItem,
} from 'app/components/form'
import { getProjectSelector, useForm, useProjectSelector, useToast } from 'app/hooks'
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
    // ssh keys are always specified. we do not need the undefined case
    sshPublicKeys: NonNullable<InstanceCreate['sshPublicKeys']>
  }
>

const baseDefaultValues: InstanceCreateInput = {
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

  sshPublicKeys: [],

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

  const { data: sshKeys } = usePrefetchedApiQuery('currentUserSshKeyList', {})
  const allKeys = useMemo(() => sshKeys.items.map((key) => key.id), [sshKeys])

  const defaultValues: InstanceCreateInput = {
    ...baseDefaultValues,
    image: defaultImage?.id || '',
    sshPublicKeys: allKeys,
    // Use 2x the image size as the default boot disk size
    bootDiskSize: Math.ceil(defaultImage?.size / GiB) * 2 || 10,
  }

  const form = useForm({ defaultValues })
  const { control, setValue } = form

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
            hostname: values.hostname.trim() || values.name,
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
            sshPublicKeys: values.sshPublicKeys,
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
          <NumberField
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
          <NumberField
            units="GiB"
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

      <SshKeysField control={control} />

      <FormDivider />
      <Form.Heading id="advanced">Advanced</Form.Heading>

      <AdvancedAccordion control={control} isSubmitting={isSubmitting} />

      <Form.Actions>
        <Form.Submit loading={createInstance.isPending}>Create instance</Form.Submit>
        <Form.Cancel onClick={() => navigate(pb.instances(projectSelector))} />
      </Form.Actions>
    </FullPageForm>
  )
}

const AdvancedAccordion = ({
  control,
  isSubmitting,
}: {
  control: Control<InstanceCreateInput>
  isSubmitting: boolean
}) => {
  // we track this state manually for the sole reason that we need to be able to
  // tell, inside AccordionItem, when an accordion is opened so we can scroll its
  // contents into view
  const [openItems, setOpenItems] = useState<string[]>([])

  return (
    <Accordion.Root
      type="multiple"
      className="mt-12 max-w-lg"
      value={openItems}
      onValueChange={setOpenItems}
    >
      <AccordionItem
        value="networking"
        label="Networking"
        isOpen={openItems.includes('networking')}
      >
        <NetworkInterfaceField control={control} disabled={isSubmitting} />

        <TextField
          name="hostname"
          tooltipText="Will be generated if not provided"
          control={control}
          disabled={isSubmitting}
        />
      </AccordionItem>
      <AccordionItem
        value="configuration"
        label="Configuration"
        isOpen={openItems.includes('configuration')}
      >
        <FileField
          id="user-data-input"
          description={<UserDataDescription />}
          name="userData"
          label="User Data"
          control={control}
        />
      </AccordionItem>
    </Accordion.Root>
  )
}

type AccordionItemProps = {
  value: string
  isOpen: boolean
  label: string
  children: React.ReactNode
}

function AccordionItem({ value, label, children, isOpen }: AccordionItemProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [isOpen])

  return (
    <Accordion.Item value={value}>
      <Accordion.Header className="max-w-lg">
        <Accordion.Trigger className="group flex w-full items-center justify-between border-t py-2 text-sans-xl border-secondary [&>svg]:data-[state=open]:rotate-90">
          <div className="text-secondary">{label}</div>
          <DirectionRightIcon className="transition-all text-secondary" />
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content
        ref={contentRef}
        forceMount
        className={cn('ox-accordion-content overflow-hidden py-8', { hidden: !isOpen })}
      >
        {children}
      </Accordion.Content>
    </Accordion.Item>
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

const PRESETS = [
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

const UserDataDescription = () => (
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
)
