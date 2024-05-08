/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import * as Accordion from '@radix-ui/react-accordion'
import { useEffect, useMemo, useState } from 'react'
import { useController, useWatch, type Control } from 'react-hook-form'
import { useNavigate, type LoaderFunctionArgs } from 'react-router-dom'
import type { SetRequired } from 'type-fest'

import {
  apiQueryClient,
  diskCan,
  genName,
  INSTANCE_MAX_CPU,
  INSTANCE_MAX_RAM_GiB,
  useApiMutation,
  useApiQueryClient,
  usePrefetchedApiQuery,
  type InstanceCreate,
  type InstanceDiskAttachment,
} from '@oxide/api'
import {
  Images16Icon,
  Instances24Icon,
  Storage16Icon,
} from '@oxide/design-system/icons/react'

import { AccordionItem } from '~/components/AccordionItem'
import { ExternalLink } from '~/components/ExternalLink'
import { CheckboxField } from '~/components/form/fields/CheckboxField'
import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { DiskSizeField } from '~/components/form/fields/DiskSizeField'
import {
  DisksTableField,
  type DiskTableItem,
} from '~/components/form/fields/DisksTableField'
import { FileField } from '~/components/form/fields/FileField'
import { BootDiskImageSelectField as ImageSelectField } from '~/components/form/fields/ImageSelectField'
import { ListboxField } from '~/components/form/fields/ListboxField'
import { NameField } from '~/components/form/fields/NameField'
import { NetworkInterfaceField } from '~/components/form/fields/NetworkInterfaceField'
import { NumberField } from '~/components/form/fields/NumberField'
import { RadioFieldDyn } from '~/components/form/fields/RadioField'
import { SshKeysField } from '~/components/form/fields/SshKeysField'
import { TextField } from '~/components/form/fields/TextField'
import { Form } from '~/components/form/Form'
import { FullPageForm } from '~/components/form/FullPageForm'
import { getProjectSelector, useForm, useProjectSelector } from '~/hooks'
import { addToast } from '~/stores/toast'
import { Badge } from '~/ui/lib/Badge'
import { Checkbox } from '~/ui/lib/Checkbox'
import { FormDivider } from '~/ui/lib/Divider'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { Listbox } from '~/ui/lib/Listbox'
import { Message } from '~/ui/lib/Message'
import { RadioCard } from '~/ui/lib/Radio'
import { Tabs } from '~/ui/lib/Tabs'
import { TextInputHint } from '~/ui/lib/TextInput'
import { readBlobAsBase64 } from '~/util/file'
import { links } from '~/util/links'
import { nearest10 } from '~/util/math'
import { pb } from '~/util/path-builder'
import { GiB } from '~/util/units'

const getBootDiskAttachment = (values: InstanceCreateInput): InstanceDiskAttachment => {
  if (values.bootDiskSourceType === 'disk') {
    return { type: 'attach', name: values.diskSource }
  }
  const source =
    values.bootDiskSourceType === 'siloImage'
      ? values.siloImageSource
      : values.projectImageSource
  return {
    type: 'create',
    name: values.bootDiskName || genName(values.name, source),
    description: `Created as a boot disk for ${values.name}`,
    size: values.bootDiskSize * GiB,
    diskSource: { type: 'image', imageId: source },
  }
}

type BootDiskSourceType = 'siloImage' | 'projectImage' | 'disk'

export type InstanceCreateInput = Assign<
  // API accepts undefined but it's easier if we don't
  SetRequired<InstanceCreate, 'networkInterfaces'>,
  {
    presetId: (typeof PRESETS)[number]['id']
    disks: DiskTableItem[]
    bootDiskName: string
    bootDiskSize: number

    // bootDiskSourceType is a switch picking between the three sources listed below it
    bootDiskSourceType: BootDiskSourceType
    siloImageSource: string
    projectImageSource: string
    diskSource: string

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

  bootDiskSourceType: 'siloImage',
  siloImageSource: '',
  projectImageSource: '',
  diskSource: '',

  disks: [],
  networkInterfaces: { type: 'default' },

  sshPublicKeys: [],

  start: true,

  userData: null,
  externalIps: [{ type: 'ephemeral' }],
}

const DISK_FETCH_LIMIT = 1000

CreateInstanceForm.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project } = getProjectSelector(params)
  await Promise.all([
    // fetch both project and silo images
    apiQueryClient.prefetchQuery('imageList', { query: { project } }),
    apiQueryClient.prefetchQuery('imageList', {}),
    apiQueryClient.prefetchQuery('diskList', {
      query: { project, limit: DISK_FETCH_LIMIT },
    }),
    apiQueryClient.prefetchQuery('currentUserSshKeyList', {}),
    apiQueryClient.prefetchQuery('projectIpPoolList', { query: { limit: 1000 } }),
  ])
  return null
}

export function CreateInstanceForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useApiQueryClient()
  const { project } = useProjectSelector()
  const navigate = useNavigate()

  const createInstance = useApiMutation('instanceCreate', {
    onSuccess(instance) {
      // refetch list of instances
      queryClient.invalidateQueries('instanceList')
      // avoid the instance fetch when the instance page loads since we have the data
      queryClient.setQueryData(
        'instanceView',
        { path: { instance: instance.name }, query: { project } },
        instance
      )
      addToast({ content: 'Your instance has been created' })
      navigate(pb.instancePage({ project, instance: instance.name }))
    },
  })

  const siloImages = usePrefetchedApiQuery('imageList', {}).data.items
  const projectImages = usePrefetchedApiQuery('imageList', { query: { project } }).data
    .items
  const allImages = [...siloImages, ...projectImages]

  const defaultImage = allImages[0]

  const allDisks = usePrefetchedApiQuery('diskList', {
    query: { project, limit: DISK_FETCH_LIMIT },
  }).data.items
  const disks = useMemo(
    () => allDisks.filter(diskCan.attach).map(({ name }) => ({ value: name, label: name })),
    [allDisks]
  )

  const { data: sshKeys } = usePrefetchedApiQuery('currentUserSshKeyList', {})
  const allKeys = useMemo(() => sshKeys.items.map((key) => key.id), [sshKeys])

  const { data: allPools } = usePrefetchedApiQuery('projectIpPoolList', {
    query: { limit: 1000 },
  })
  const defaultPool = useMemo(
    () => (allPools ? allPools.items.find((p) => p.isDefault)?.name : undefined),
    [allPools]
  )

  const defaultSource =
    siloImages.length > 0 ? 'siloImage' : projectImages.length > 0 ? 'projectImage' : 'disk'

  const defaultValues: InstanceCreateInput = {
    ...baseDefaultValues,
    bootDiskSourceType: defaultSource,
    siloImageSource: siloImages?.[0]?.id || '',
    projectImageSource: projectImages?.[0]?.id || '',
    diskSource: disks?.[0]?.value || '',
    sshPublicKeys: allKeys,
    bootDiskSize: nearest10(defaultImage?.size / GiB),
    externalIps: [{ type: 'ephemeral', pool: defaultPool }],
  }

  const form = useForm({ defaultValues })
  const { control, setValue } = form

  const bootDiskSourceType = useWatch({ control: control, name: 'bootDiskSourceType' })
  const siloImageSource = useWatch({ control: control, name: 'siloImageSource' })
  const projectImageSource = useWatch({ control: control, name: 'projectImageSource' })
  const diskSource = useWatch({ control: control, name: 'diskSource' })
  const bootDiskSource =
    bootDiskSourceType === 'siloImage'
      ? siloImageSource
      : bootDiskSourceType === 'projectImage'
        ? projectImageSource
        : diskSource
  const bootDiskSize = useWatch({ control: control, name: 'bootDiskSize' })
  const image = allImages.find((i) => i.id === bootDiskSource)
  const imageSizeGiB = image?.size ? Math.ceil(image.size / GiB) : undefined

  useEffect(() => {
    if (createInstance.error) {
      setIsSubmitting(false)
    }
  }, [createInstance.error])

  // additional form elements for projectImage and siloImage tabs
  const bootDiskSizeAndName = (
    <>
      <div key="divider" className="!my-12 content-['a']" />
      <DiskSizeField
        key="diskSizeField"
        label="Disk size"
        name="bootDiskSize"
        control={control}
        min={imageSizeGiB || 1}
        validate={(diskSizeGiB: number) => {
          if (imageSizeGiB && diskSizeGiB < imageSizeGiB) {
            return `Must be as large as selected image (min. ${imageSizeGiB} GiB)`
          }
        }}
        disabled={isSubmitting}
      />
      <NameField
        key="bootDiskName"
        name="bootDiskName"
        label="Disk name"
        tooltipText="Will be autogenerated if name not provided"
        required={false}
        control={control}
        disabled={isSubmitting}
      />
    </>
  )

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

        const bootDisk = getBootDiskAttachment(values)

        const userData = values.userData
          ? await readBlobAsBase64(values.userData)
          : undefined

        await createInstance.mutateAsync({
          query: { project },
          body: {
            name: values.name,
            hostname: values.hostname || values.name,
            description: values.description,
            memory: instance.memory * GiB,
            ncpus: instance.ncpus,
            disks: [bootDisk, ...values.disks],
            externalIps: values.externalIps,
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
          <RadioFieldDyn name="presetId" label="" control={control} disabled={isSubmitting}>
            {renderLargeRadioCards('highCPU')}
          </RadioFieldDyn>
        </Tabs.Content>

        <Tabs.Content value="highMemory">
          <RadioFieldDyn name="presetId" label="" control={control} disabled={isSubmitting}>
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
        defaultValue={defaultSource}
        onValueChange={(val) => {
          setValue('bootDiskSourceType', val as BootDiskSourceType)
          if (imageSizeGiB && imageSizeGiB > bootDiskSize) {
            setValue('bootDiskSize', nearest10(imageSizeGiB))
          }
        }}
      >
        <Tabs.List aria-describedby="boot-disk">
          <Tabs.Trigger
            value={'siloImage' satisfies BootDiskSourceType}
            disabled={isSubmitting}
          >
            Silo images
          </Tabs.Trigger>
          <Tabs.Trigger
            value={'projectImage' satisfies BootDiskSourceType}
            disabled={isSubmitting}
          >
            Project images
          </Tabs.Trigger>
          <Tabs.Trigger value={'disk' satisfies BootDiskSourceType} disabled={isSubmitting}>
            Existing disks
          </Tabs.Trigger>
        </Tabs.List>
        {allImages.length === 0 && disks.length === 0 && (
          <Message
            className="mb-8 ml-10 max-w-lg"
            variant="notice"
            content="Images or disks are required to create or attach a boot disk."
          />
        )}
        <Tabs.Content
          value={'siloImage' satisfies BootDiskSourceType}
          className="space-y-4"
        >
          {siloImages.length === 0 ? (
            <div className="flex max-w-lg items-center justify-center rounded-lg border p-6 border-default">
              <EmptyMessage
                icon={<Images16Icon />}
                title="No silo images found"
                body="Promote a project image to see it here"
              />
            </div>
          ) : (
            <>
              <ImageSelectField
                images={siloImages}
                control={control}
                disabled={isSubmitting}
                name="siloImageSource"
              />
              {bootDiskSizeAndName}
            </>
          )}
        </Tabs.Content>
        <Tabs.Content
          value={'projectImage' satisfies BootDiskSourceType}
          className="space-y-4"
        >
          {projectImages.length === 0 ? (
            <div className="flex max-w-lg items-center justify-center rounded-lg border p-6 border-default">
              <EmptyMessage
                icon={<Images16Icon />}
                title="No project images found"
                body="Upload an image to see it here"
                buttonText="Upload image"
                onClick={() => navigate(pb.projectImagesNew({ project }))}
              />
            </div>
          ) : (
            <>
              <ImageSelectField
                images={projectImages}
                control={control}
                disabled={isSubmitting}
                name="projectImageSource"
              />
              {bootDiskSizeAndName}
            </>
          )}
        </Tabs.Content>

        <Tabs.Content value={'disk' satisfies BootDiskSourceType} className="space-y-4">
          {disks.length === 0 ? (
            <div className="flex max-w-lg items-center justify-center rounded-lg border p-6 border-default">
              <EmptyMessage
                icon={<Storage16Icon />}
                title="No detached disks found"
                body="Only detached disks can be used as a boot disk"
              />
            </div>
          ) : (
            <ListboxField
              label="Disk"
              name="diskSource"
              description="Existing disks that are not attached to an instance"
              items={disks}
              required
              control={control}
            />
          )}
        </Tabs.Content>
      </Tabs.Root>
      <FormDivider />
      <Form.Heading id="additional-disks">Additional disks</Form.Heading>
      <DisksTableField control={control} disabled={isSubmitting} />
      <FormDivider />
      <Form.Heading id="authentication">Authentication</Form.Heading>
      <SshKeysField control={control} isSubmitting={isSubmitting} />
      <FormDivider />
      <Form.Heading id="advanced">Advanced</Form.Heading>
      <AdvancedAccordion
        control={control}
        isSubmitting={isSubmitting}
        allPools={allPools.items}
      />
      <Form.Actions>
        <Form.Submit loading={createInstance.isPending}>Create instance</Form.Submit>
        <Form.Cancel onClick={() => navigate(pb.instances({ project }))} />
      </Form.Actions>
    </FullPageForm>
  )
}

const AdvancedAccordion = ({
  control,
  isSubmitting,
  allPools,
}: {
  control: Control<InstanceCreateInput>
  isSubmitting: boolean
  allPools: Array<{ name: string; isDefault: boolean }>
}) => {
  // we track this state manually for the sole reason that we need to be able to
  // tell, inside AccordionItem, when an accordion is opened so we can scroll its
  // contents into view
  const [openItems, setOpenItems] = useState<string[]>([])
  const externalIps = useController({ control, name: 'externalIps' })
  const ephemeralIp = externalIps.field.value?.find((ip) => ip.type === 'ephemeral')
  const assignEphemeralIp = !!ephemeralIp
  const selectedPool = ephemeralIp && 'pool' in ephemeralIp ? ephemeralIp.pool : undefined
  const defaultPool = allPools.find((pool) => pool.isDefault)?.name

  const poolLabel = (pool: { name: string; isDefault: boolean }) => (
    <div className="flex items-center gap-2">
      {pool.name}
      {pool.isDefault && <Badge>default</Badge>}
    </div>
  )

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

        <div className="max-w-lg space-y-2">
          <h2 className="text-sans-md">
            Ephemeral IP{' '}
            <TextInputHint id="ephemeral-ip-description" className="mb-2">
              Ephemeral IPs are allocated when the instance is created and deallocated when
              it is deleted.{' '}
              <ExternalLink href={links.externalAddresses}>Learn more.</ExternalLink>
            </TextInputHint>
          </h2>
          <div className="flex items-start gap-2.5">
            <Checkbox
              id="assignEphemeralIp"
              checked={assignEphemeralIp}
              onChange={() => {
                const newExternalIps = assignEphemeralIp
                  ? externalIps.field.value?.filter((ip) => ip.type !== 'ephemeral')
                  : [
                      ...(externalIps.field.value || []),
                      { type: 'ephemeral', pool: selectedPool || defaultPool },
                    ]
                externalIps.field.onChange(newExternalIps)
              }}
            />
            <label htmlFor="assignEphemeralIp" className="text-sans-md">
              Automatically assign an ephemeral IP address
            </label>
          </div>
          {assignEphemeralIp && (
            <Listbox
              className="pt-1"
              name="pools"
              aria-label="ephemeral IP pool"
              placeholder={defaultPool ? `${defaultPool} (default)` : 'Select pool'}
              selected={`${allPools.find((pool) => pool.name === selectedPool)?.name}`}
              items={
                allPools.map((pool) => ({
                  label: poolLabel(pool),
                  value: pool.name,
                })) || []
              }
              disabled={!assignEphemeralIp || isSubmitting}
              required
              onChange={(value) => {
                const newExternalIps = externalIps.field.value?.map((ip) =>
                  ip.type === 'ephemeral' ? { ...ip, pool: value } : ip
                )
                externalIps.field.onChange(newExternalIps)
              }}
            />
          )}
        </div>
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
          disabled={isSubmitting}
        />
      </AccordionItem>
    </Accordion.Root>
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
