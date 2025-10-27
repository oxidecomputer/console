/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import * as Accordion from '@radix-ui/react-accordion'
import { useEffect, useMemo, useState } from 'react'
import { useController, useForm, useWatch, type Control } from 'react-hook-form'
import { useNavigate, type LoaderFunctionArgs } from 'react-router'
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
  type AntiAffinityGroup,
  type ExternalIpCreate,
  type FloatingIp,
  type Image,
  type InstanceCreate,
  type InstanceDiskAttachment,
  type NameOrId,
  type SiloIpPool,
} from '@oxide/api'
import {
  Affinity16Icon,
  Images16Icon,
  Instances16Icon,
  Instances24Icon,
  IpGlobal16Icon,
  Storage16Icon,
} from '@oxide/design-system/icons/react'

import { AccordionItem } from '~/components/AccordionItem'
import { DocsPopover } from '~/components/DocsPopover'
import { CheckboxField } from '~/components/form/fields/CheckboxField'
import { ComboboxField } from '~/components/form/fields/ComboboxField'
import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { DiskSizeField } from '~/components/form/fields/DiskSizeField'
import {
  DisksTableField,
  type DiskTableItem,
} from '~/components/form/fields/DisksTableField'
import { FileField } from '~/components/form/fields/FileField'
import { BootDiskImageSelectField as ImageSelectField } from '~/components/form/fields/ImageSelectField'
import { toIpPoolItem } from '~/components/form/fields/ip-pool-item'
import { NameField } from '~/components/form/fields/NameField'
import { NetworkInterfaceField } from '~/components/form/fields/NetworkInterfaceField'
import { NumberField } from '~/components/form/fields/NumberField'
import { RadioFieldDyn } from '~/components/form/fields/RadioField'
import { SshKeysField } from '~/components/form/fields/SshKeysField'
import { TextField } from '~/components/form/fields/TextField'
import { Form } from '~/components/form/Form'
import { FullPageForm } from '~/components/form/FullPageForm'
import { HL } from '~/components/HL'
import { getProjectSelector, useProjectSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { Button } from '~/ui/lib/Button'
import { Checkbox } from '~/ui/lib/Checkbox'
import { toComboboxItems } from '~/ui/lib/Combobox'
import { FormDivider } from '~/ui/lib/Divider'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { Listbox } from '~/ui/lib/Listbox'
import { Message } from '~/ui/lib/Message'
import { ClearAndAddButtons, MiniTable } from '~/ui/lib/MiniTable'
import { Modal } from '~/ui/lib/Modal'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { RadioCard } from '~/ui/lib/Radio'
import { Slash } from '~/ui/lib/Slash'
import { Tabs } from '~/ui/lib/Tabs'
import { TextInputHint } from '~/ui/lib/TextInput'
import { TipIcon } from '~/ui/lib/TipIcon'
import { ALL_ISH } from '~/util/consts'
import { readBlobAsBase64 } from '~/util/file'
import { docLinks, links } from '~/util/links'
import { diskSizeNearest10 } from '~/util/math'
import { pb } from '~/util/path-builder'
import { GiB } from '~/util/units'

const getBootDiskAttachment = (
  values: InstanceCreateInput,
  images: Array<Image>
): InstanceDiskAttachment => {
  if (values.bootDiskSourceType === 'disk') {
    return { type: 'attach', name: values.diskSource }
  }
  const source =
    values.bootDiskSourceType === 'siloImage'
      ? values.siloImageSource
      : values.projectImageSource
  const sourceName = images.find((image) => image.id === source)?.name
  return {
    type: 'create',
    name: values.bootDiskName || genName(values.name, sourceName || source),
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
    otherDisks: DiskTableItem[]
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

  otherDisks: [],
  networkInterfaces: { type: 'default' },

  sshPublicKeys: [],

  start: true,

  userData: null,
  externalIps: [{ type: 'ephemeral' }],
  antiAffinityGroups: [],
}

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { project } = getProjectSelector(params)
  await Promise.all([
    // fetch both project and silo images
    apiQueryClient.prefetchQuery('imageList', { query: { project } }),
    apiQueryClient.prefetchQuery('imageList', {}),
    apiQueryClient.prefetchQuery('diskList', {
      query: { project, limit: ALL_ISH },
    }),
    apiQueryClient.prefetchQuery('currentUserSshKeyList', {}),
    apiQueryClient.prefetchQuery('projectIpPoolList', { query: { limit: ALL_ISH } }),
    apiQueryClient.prefetchQuery('floatingIpList', { query: { project, limit: ALL_ISH } }),
    apiQueryClient.prefetchQuery('antiAffinityGroupList', {
      query: { project, limit: ALL_ISH },
    }),
  ])
  return null
}

export const handle = { crumb: 'New instance' }

export default function CreateInstanceForm() {
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
      addToast(<>Instance <HL>{instance.name}</HL> created</>) // prettier-ignore
      navigate(pb.instance({ project, instance: instance.name }))
    },
  })

  const siloImages = usePrefetchedApiQuery('imageList', {}).data.items
  const projectImages = usePrefetchedApiQuery('imageList', { query: { project } }).data
    .items
  const allImages = [...siloImages, ...projectImages]

  const defaultImage = allImages[0]

  const allDisks = usePrefetchedApiQuery('diskList', {
    query: { project, limit: ALL_ISH },
  }).data.items
  const disks = useMemo(() => toComboboxItems(allDisks.filter(diskCan.attach)), [allDisks])

  const { data: sshKeys } = usePrefetchedApiQuery('currentUserSshKeyList', {})
  const allKeys = useMemo(() => sshKeys.items.map((key) => key.id), [sshKeys])

  // projectIpPoolList fetches the pools linked to the current silo
  const { data: siloPools } = usePrefetchedApiQuery('projectIpPoolList', {
    query: { limit: ALL_ISH },
  })
  const defaultPool = useMemo(
    () => (siloPools ? siloPools.items.find((p) => p.isDefault)?.name : undefined),
    [siloPools]
  )

  const defaultSource =
    siloImages.length > 0 ? 'siloImage' : projectImages.length > 0 ? 'projectImage' : 'disk'

  const defaultValues: InstanceCreateInput = {
    ...baseDefaultValues,
    bootDiskSourceType: defaultSource,
    sshPublicKeys: allKeys,
    bootDiskSize: diskSizeNearest10(defaultImage?.size / GiB),
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

  const otherDisks = useWatch({ control, name: 'otherDisks' })
  const unavailableDiskNames = [
    ...allDisks, // existing disks from the API
    ...otherDisks.filter((disk) => disk.type === 'create'), // disks being created here
  ].map((d) => d.name)

  // additional form elements for projectImage and siloImage tabs
  const bootDiskSizeAndName = (
    <>
      <div key="divider" className="my-12! content-['a']" />
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
        // TODO: would be cool to generate the name already and use it as a placeholder
        description="A name will be generated if left blank"
        required={false}
        control={control}
        disabled={isSubmitting}
        validate={(name) => {
          // don't allow the user to use an existing disk name for the boot disk's name
          if (unavailableDiskNames.includes(name)) {
            return 'Name is already in use'
          }
        }}
      />
    </>
  )

  const bootDiskName = useWatch({ control, name: 'bootDiskName' })

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Instances24Icon />}>Create instance</PageTitle>
        <DocsPopover
          heading="instances"
          icon={<Instances16Icon />}
          summary="Instances are virtual machines that run on the Oxide platform."
          links={[docLinks.instances, docLinks.instanceActions, docLinks.quickStart]}
        />
      </PageHeader>
      <FullPageForm
        submitDisabled={allImages.length ? undefined : 'Image required'}
        id="create-instance-form"
        form={form}
        onSubmit={async (values) => {
          setIsSubmitting(true)
          // we should never have a presetId that's not in the list
          const preset = PRESETS.find((option) => option.id === values.presetId)!
          const instance =
            values.presetId === 'custom'
              ? { memory: values.memory, ncpus: values.ncpus }
              : { memory: preset.memory, ncpus: preset.ncpus }

          const bootDisk = getBootDiskAttachment(values, allImages)

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
              disks: values.otherDisks,
              bootDisk,
              externalIps: values.externalIps,
              start: values.start,
              networkInterfaces: values.networkInterfaces,
              sshPublicKeys: values.sshPublicKeys,
              userData,
              antiAffinityGroups: values.antiAffinityGroups,
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
        <TextInputHint id="hw-gp-help-text" className="text-sans-md mb-12 max-w-xl">
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
            <RadioFieldDyn
              name="presetId"
              label=""
              control={control}
              disabled={isSubmitting}
            >
              {renderLargeRadioCards('general')}
            </RadioFieldDyn>
          </Tabs.Content>

          <Tabs.Content value="highCPU">
            <RadioFieldDyn
              name="presetId"
              label=""
              control={control}
              disabled={isSubmitting}
            >
              {renderLargeRadioCards('highCPU')}
            </RadioFieldDyn>
          </Tabs.Content>

          <Tabs.Content value="highMemory">
            <RadioFieldDyn
              name="presetId"
              label=""
              control={control}
              disabled={isSubmitting}
            >
              {renderLargeRadioCards('highMemory')}
            </RadioFieldDyn>
          </Tabs.Content>

          <Tabs.Content value="custom">
            <NumberField
              required
              label="CPUs"
              name="ncpus"
              min={1}
              control={control}
              validate={(cpus) => {
                if (cpus < 1) {
                  return `Must be at least 1 vCPU`
                }
                if (cpus > INSTANCE_MAX_CPU) {
                  return `Can be at most ${INSTANCE_MAX_CPU}`
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
              setValue('bootDiskSize', diskSizeNearest10(imageSizeGiB))
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
            <Tabs.Trigger
              value={'disk' satisfies BootDiskSourceType}
              disabled={isSubmitting}
            >
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
              <div className="border-default flex max-w-lg items-center justify-center rounded-lg border p-6">
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
              <div className="border-default flex max-w-lg items-center justify-center rounded-lg border p-6">
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
              <div className="border-default flex max-w-lg items-center justify-center rounded-lg border p-6">
                <EmptyMessage
                  icon={<Storage16Icon />}
                  title="No detached disks found"
                  body="Only detached disks can be used as a boot disk"
                />
              </div>
            ) : (
              <ComboboxField
                label="Disk"
                name="diskSource"
                description="Existing disks that are not attached to an instance"
                items={disks}
                required
                control={control}
                placeholder="Select a disk"
              />
            )}
          </Tabs.Content>
        </Tabs.Root>
        <FormDivider />
        <Form.Heading id="additional-disks">Additional disks</Form.Heading>
        <DisksTableField
          control={control}
          disabled={isSubmitting}
          // Don't allow the user to create a new disk with a name that matches other disk names (either the boot disk,
          // the names of disks that will be created and attached to this instance, or disks that already exist).
          unavailableDiskNames={[bootDiskName, ...unavailableDiskNames]}
        />
        <FormDivider />
        <Form.Heading id="authentication">Authentication</Form.Heading>
        <SshKeysField control={control} isSubmitting={isSubmitting} />
        <FormDivider />
        <Form.Heading id="advanced">Advanced</Form.Heading>
        <AdvancedAccordion
          control={control}
          isSubmitting={isSubmitting}
          siloPools={siloPools.items}
        />
        <Form.Actions>
          <Form.Submit loading={createInstance.isPending}>Create instance</Form.Submit>
          <Form.Cancel onClick={() => navigate(pb.instances({ project }))} />
        </Form.Actions>
      </FullPageForm>
    </>
  )
}

// `ip is …` guard is necessary until we upgrade to 5.5, which handles this automatically
const isFloating = (
  ip: ExternalIpCreate
): ip is { type: 'floating'; floatingIp: NameOrId } => ip.type === 'floating'

const FloatingIpLabel = ({ ip }: { ip: FloatingIp }) => (
  <div>
    <div>{ip.name}</div>
    <div className="text-secondary selected:text-accent-secondary flex gap-0.5">
      <div>{ip.ip}</div>
      {ip.description && (
        <>
          <Slash />
          <div className="grow overflow-hidden text-left text-ellipsis whitespace-pre">
            {ip.description}
          </div>
        </>
      )}
    </div>
  </div>
)

const AdvancedAccordion = ({
  control,
  isSubmitting,
  siloPools,
}: {
  control: Control<InstanceCreateInput>
  isSubmitting: boolean
  siloPools: Array<SiloIpPool>
}) => {
  // we track this state manually for the sole reason that we need to be able to
  // tell, inside AccordionItem, when an accordion is opened so we can scroll its
  // contents into view
  const [openItems, setOpenItems] = useState<string[]>([])
  const [floatingIpModalOpen, setFloatingIpModalOpen] = useState(false)
  const [selectedFloatingIp, setSelectedFloatingIp] = useState<FloatingIp | undefined>()
  const [antiAffinityGroupModalOpen, setAntiAffinityGroupModalOpen] = useState(false)
  const [selectedAntiAffinityGroup, setSelectedAntiAffinityGroup] = useState<
    AntiAffinityGroup | undefined
  >()

  const externalIps = useController({ control, name: 'externalIps' })
  const antiAffinityGroups = useController({ control, name: 'antiAffinityGroups' })
  const ephemeralIp = externalIps.field.value?.find((ip) => ip.type === 'ephemeral')
  const assignEphemeralIp = !!ephemeralIp
  const selectedPool = ephemeralIp && 'pool' in ephemeralIp ? ephemeralIp.pool : undefined
  const defaultPool = siloPools.find((pool) => pool.isDefault)?.name
  const attachedFloatingIps = (externalIps.field.value || []).filter(isFloating)

  const instanceName = useWatch({ control, name: 'name' })

  const { project } = useProjectSelector()
  const { data: floatingIpList } = usePrefetchedApiQuery('floatingIpList', {
    query: { project, limit: ALL_ISH },
  })
  const { data: antiAffinityGroupList } = usePrefetchedApiQuery('antiAffinityGroupList', {
    query: { project, limit: ALL_ISH },
  })

  // Filter out the IPs that are already attached to an instance
  const attachableFloatingIps = useMemo(
    () => floatingIpList.items.filter((ip) => !ip.instanceId),
    [floatingIpList]
  )

  // To find available floating IPs, we remove the ones that are already committed to this instance
  const availableFloatingIps = attachableFloatingIps.filter(
    (ip) => !attachedFloatingIps.find((attachedIp) => attachedIp.floatingIp === ip.name)
  )
  const attachedFloatingIpsData = attachedFloatingIps
    .map((ip) => attachableFloatingIps.find((fip) => fip.name === ip.floatingIp))
    .filter((ip) => !!ip)

  const attachedAntiAffinityGroupNames = antiAffinityGroups.field.value || []

  const attachedAntiAffinityGroupData = attachedAntiAffinityGroupNames
    .map((name) => antiAffinityGroupList.items.find((group) => group.name === name))
    .filter((group) => !!group)

  // Available anti-affinity groups with those already attached removed
  const availableAntiAffinityGroups = antiAffinityGroupList.items.filter(
    (group) => !attachedAntiAffinityGroupNames.includes(group.name)
  )

  const closeFloatingIpModal = () => {
    setFloatingIpModalOpen(false)
    setSelectedFloatingIp(undefined)
  }

  const attachFloatingIp = () => {
    if (selectedFloatingIp) {
      externalIps.field.onChange([
        ...(externalIps.field.value || []),
        { type: 'floating', floatingIp: selectedFloatingIp.name },
      ])
    }
    closeFloatingIpModal()
  }

  const detachFloatingIp = (name: string) => {
    externalIps.field.onChange(
      externalIps.field.value?.filter(
        (ip) => !(ip.type === 'floating' && ip.floatingIp === name)
      )
    )
  }

  const closeAntiAffinityGroupModal = () => {
    setAntiAffinityGroupModalOpen(false)
    setSelectedAntiAffinityGroup(undefined)
  }

  const attachAntiAffinityGroup = () => {
    if (selectedAntiAffinityGroup) {
      antiAffinityGroups.field.onChange([
        ...(antiAffinityGroups.field.value || []),
        selectedAntiAffinityGroup.name,
      ])
    }
    closeAntiAffinityGroupModal()
  }

  const detachAntiAffinityGroup = (name: string) => {
    antiAffinityGroups.field.onChange(
      antiAffinityGroups.field.value?.filter((groupName) => groupName !== name)
    )
  }

  const selectedFloatingIpMessage = (
    <>
      This instance will be reachable at{' '}
      {selectedFloatingIp ? <HL>{selectedFloatingIp.ip}</HL> : 'the selected IP'}
    </>
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

        <div className="py-2">
          <TextField
            name="hostname"
            description="Will be set to instance name if left blank"
            control={control}
            disabled={isSubmitting}
            placeholder={instanceName}
          />
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <h2 className="text-sans-md flex items-center">
            Ephemeral IP{' '}
            <TipIcon className="ml-1.5">
              Ephemeral IPs are allocated when the instance is created and deallocated when
              it is deleted
            </TipIcon>
          </h2>
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
          >
            Allocate and attach an ephemeral IP address
          </Checkbox>
          {assignEphemeralIp && (
            <Listbox
              name="pools"
              label="IP pool for ephemeral IP"
              placeholder={defaultPool ? `${defaultPool} (default)` : 'Select a pool'}
              selected={`${siloPools.find((pool) => pool.name === selectedPool)?.name}`}
              items={siloPools.map(toIpPoolItem)}
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

        <div className="flex flex-1 flex-col gap-2">
          <h2 className="text-sans-md flex items-center">
            Floating IPs{' '}
            <TipIcon className="ml-1.5">
              Floating IPs exist independently of instances and can be attached to and
              detached from them as needed
            </TipIcon>
          </h2>
          {floatingIpList.items.length === 0 ? (
            <div className="border-default flex max-w-lg items-center justify-center rounded-lg border">
              <EmptyMessage
                icon={<IpGlobal16Icon />}
                title="No floating IPs found"
                body="Create a floating IP to attach it to this instance"
              />
            </div>
          ) : (
            <div className="flex flex-col items-start gap-3">
              <MiniTable
                ariaLabel="Floating IPs"
                items={attachedFloatingIpsData}
                columns={[
                  { header: 'Name', cell: (item) => item.name },
                  { header: 'IP', cell: (item) => item.ip },
                ]}
                rowKey={(item) => item.name}
                onRemoveItem={(item) => detachFloatingIp(item.name)}
                removeLabel={(item) => `remove floating IP ${item.name}`}
              />
              <Button
                variant="secondary"
                size="sm"
                disabled={availableFloatingIps.length === 0}
                disabledReason="No floating IPs available"
                onClick={() => setFloatingIpModalOpen(true)}
              >
                Attach floating IP
              </Button>
            </div>
          )}
          <Modal
            isOpen={floatingIpModalOpen}
            onDismiss={closeFloatingIpModal}
            title="Attach floating IP"
          >
            <Modal.Body>
              <Modal.Section>
                <Message variant="info" content={selectedFloatingIpMessage} />
                <form>
                  <Listbox
                    name="floatingIp"
                    items={availableFloatingIps.map((i) => ({
                      value: i.name,
                      label: <FloatingIpLabel ip={i} />,
                      selectedLabel: `${i.name} (${i.ip})`,
                    }))}
                    label="Floating IP"
                    onChange={(name) => {
                      setSelectedFloatingIp(
                        availableFloatingIps.find((i) => i.name === name)
                      )
                    }}
                    required
                    placeholder="Select a floating IP"
                    selected={selectedFloatingIp?.name || ''}
                  />
                </form>
              </Modal.Section>
            </Modal.Body>
            <Modal.Footer
              actionText="Attach"
              disabled={!selectedFloatingIp}
              onAction={attachFloatingIp}
              onDismiss={closeFloatingIpModal}
            ></Modal.Footer>
          </Modal>
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
        <div className="flex flex-1 flex-col gap-2">
          <h2 className="text-sans-md flex items-center">
            Anti-affinity groups
            <TipIcon className="ml-1.5">
              Instances in an anti-affinity group will be placed on different sleds when
              they start
            </TipIcon>
          </h2>
          {antiAffinityGroupList.items.length === 0 ? (
            <div className="border-default flex max-w-lg items-center justify-center rounded-lg border p-6">
              <EmptyMessage
                icon={<Affinity16Icon />}
                title="No anti-affinity groups found"
                body="Create an anti-affinity group to see it here"
              />
            </div>
          ) : (
            <>
              <MiniTable
                ariaLabel="Anti-affinity groups"
                items={attachedAntiAffinityGroupData}
                columns={[
                  { header: 'Name', cell: (item) => item.name },
                  { header: 'Policy', cell: (item) => item.policy },
                ]}
                rowKey={(item) => item.name}
                onRemoveItem={(item) => detachAntiAffinityGroup(item.name)}
                removeLabel={(item) => `remove anti-affinity group ${item.name}`}
                emptyState={{
                  title: 'No anti-affinity groups',
                  body: 'Add instance to group',
                }}
              />
              <ClearAndAddButtons
                addButtonCopy="Add group"
                disabled={availableAntiAffinityGroups.length === 0}
                onSubmit={() => setAntiAffinityGroupModalOpen(true)}
                onClear={() => antiAffinityGroups.field.onChange([])}
              />
            </>
          )}

          <Modal
            isOpen={antiAffinityGroupModalOpen}
            onDismiss={closeAntiAffinityGroupModal}
            title="Add instance to group"
          >
            <Modal.Body>
              <Modal.Section>
                <Message
                  variant="info"
                  content="Instances in an anti-affinity group will be placed on different sleds when they start. The policy attribute determines whether instances can still start when a unique sled is not available."
                />
                <form>
                  <Listbox
                    name="antiAffinityGroup"
                    items={availableAntiAffinityGroups.map((group) => ({
                      value: group.name,
                      label: (
                        <div>
                          <div>{group.name}</div>
                          <div className="text-secondary selected:text-accent-secondary flex gap-0.5">
                            <div>{group.policy}</div>
                            {group.description && (
                              <>
                                <Slash />
                                <div className="grow overflow-hidden text-left overflow-ellipsis whitespace-pre">
                                  {group.description}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      ),
                      selectedLabel: group.name,
                    }))}
                    label="Group"
                    onChange={(name) => {
                      setSelectedAntiAffinityGroup(
                        availableAntiAffinityGroups.find((group) => group.name === name)
                      )
                    }}
                    required
                    placeholder="Select a group"
                    selected={selectedAntiAffinityGroup?.name || ''}
                  />
                </form>
              </Modal.Section>
            </Modal.Body>
            <Modal.Footer
              actionText="Add"
              disabled={!selectedAntiAffinityGroup}
              onAction={attachAntiAffinityGroup}
              onDismiss={closeAntiAffinityGroupModal}
            ></Modal.Footer>
          </Modal>
        </div>
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

  { category: 'highCPU', id: 'highCPU-xs', memory: 4, ncpus: 2 },
  { category: 'highCPU', id: 'highCPU-sm', memory: 8, ncpus: 4 },
  { category: 'highCPU', id: 'highCPU-md', memory: 16, ncpus: 8 },
  { category: 'highCPU', id: 'highCPU-lg', memory: 32, ncpus: 16 },

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
