/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { useController, useForm, useWatch, type Control } from 'react-hook-form'
import { Link, useNavigate, type LoaderFunctionArgs } from 'react-router'
import * as R from 'remeda'
import { match, P } from 'ts-pattern'
import type { SetRequired } from 'type-fest'

import {
  api,
  diskCan,
  genName,
  INSTANCE_MAX_CPU,
  INSTANCE_MAX_RAM_GiB,
  isUnicastPool,
  MAX_DISK_SIZE_GiB,
  poolHasIpVersion,
  q,
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
  type ExternalIpCreate,
  type FloatingIp,
  type Image,
  type InstanceCreate,
  type InstanceDiskAttachment,
  type InstanceNetworkInterfaceAttachment,
  type IpVersion,
  type NameOrId,
  type UnicastIpPool,
} from '@oxide/api'
import {
  Images16Icon,
  Instances16Icon,
  Instances24Icon,
  IpGlobal16Icon,
  Storage16Icon,
} from '@oxide/design-system/icons/react'

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
import { IpPoolSelector } from '~/components/form/fields/IpPoolSelector'
import { NameField } from '~/components/form/fields/NameField'
import { NetworkInterfaceField } from '~/components/form/fields/NetworkInterfaceField'
import { NumberField } from '~/components/form/fields/NumberField'
import { RadioFieldDyn } from '~/components/form/fields/RadioField'
import { SshKeysField } from '~/components/form/fields/SshKeysField'
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
import { MiniTable } from '~/ui/lib/MiniTable'
import { Modal } from '~/ui/lib/Modal'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { RadioCard } from '~/ui/lib/Radio'
import { Slash } from '~/ui/lib/Slash'
import { Tabs } from '~/ui/lib/Tabs'
import { TextInputHint } from '~/ui/lib/TextInput'
import { TipIcon } from '~/ui/lib/TipIcon'
import { Tooltip } from '~/ui/lib/Tooltip'
import { Wrap } from '~/ui/util/wrap'
import { ALL_ISH } from '~/util/consts'
import { readBlobAsBase64 } from '~/util/file'
import { ipHasVersion } from '~/util/ip'
import { docLinks, links } from '~/util/links'
import { diskSizeNearest10 } from '~/util/math'
import { pb } from '~/util/path-builder'
import { GiB } from '~/util/units'

// for referential stability
const EMPTY_NAME_OR_ID_LIST: NameOrId[] = []

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
    diskBackend: {
      type: 'distributed',
      diskSource: {
        type: 'image',
        imageId: source,
        readOnly: false,
      },
    },
  }
}

type BootDiskSourceType = 'siloImage' | 'projectImage' | 'disk'

export type InstanceCreateInput = Assign<
  // API accepts undefined but it's easier if we don't
  SetRequired<Omit<InstanceCreate, 'externalIps'>, 'networkInterfaces'>,
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
    bootDiskReadOnly: boolean

    userData: File | null
    // ssh keys are always specified. we do not need the undefined case
    sshPublicKeys: NonNullable<InstanceCreate['sshPublicKeys']>
    // Pool for ephemeral IP selection
    ephemeralIpPool: string
    assignEphemeralIp: boolean

    // Selected floating IPs to attach on create.
    floatingIps: NameOrId[]
  }
>

// Stable array refs to avoid useEffect churn when
// getCompatibleVersionsFromNicType is used in dependency arrays
const IP_VERSIONS_V4: IpVersion[] = ['v4']
const IP_VERSIONS_V6: IpVersion[] = ['v6']
const IP_VERSIONS_DUAL: IpVersion[] = ['v4', 'v6']
const IP_VERSIONS_NONE: IpVersion[] = []

/**
 * Determine compatible IP versions based on network interface configuration.
 * External IPs route through the primary interface, so only its IP stack matters.
 */
function getCompatibleVersionsFromNicType(
  networkInterfaces: InstanceNetworkInterfaceAttachment
): IpVersion[] {
  return match(networkInterfaces)
    .returnType<IpVersion[]>()
    .with({ type: 'default_ipv4' }, () => IP_VERSIONS_V4)
    .with({ type: 'default_ipv6' }, () => IP_VERSIONS_V6)
    .with({ type: 'default_dual_stack' }, () => IP_VERSIONS_DUAL)
    .with({ type: 'none' }, () => IP_VERSIONS_NONE)
    .with({ type: 'create', params: [] }, () => IP_VERSIONS_NONE)
    .with({ type: 'create', params: P.select() }, (params) =>
      // Derive from the first NIC's ipConfig (first NIC becomes primary).
      // ipConfig not provided = defaults to dual-stack
      match(params[0].ipConfig?.type)
        .returnType<IpVersion[]>()
        .with('v4', () => IP_VERSIONS_V4)
        .with('v6', () => IP_VERSIONS_V6)
        .with('dual_stack', () => IP_VERSIONS_DUAL)
        .with(P.nullish, () => IP_VERSIONS_DUAL)
        .exhaustive()
    )
    .exhaustive()
}

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
  bootDiskReadOnly: false,

  otherDisks: [],
  networkInterfaces: { type: 'default_ipv4' },

  sshPublicKeys: [],

  start: true,

  userData: null,
  ephemeralIpPool: '',
  assignEphemeralIp: false,
  floatingIps: [],
}

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { project } = getProjectSelector(params)
  await Promise.all([
    // fetch both project and silo images
    queryClient.prefetchQuery(q(api.imageList, { query: { project } })),
    queryClient.prefetchQuery(q(api.imageList, {})),
    queryClient.prefetchQuery(q(api.diskList, { query: { project, limit: ALL_ISH } })),
    queryClient.prefetchQuery(q(api.currentUserSshKeyList, {})),
    queryClient.prefetchQuery(q(api.ipPoolList, { query: { limit: ALL_ISH } })),
    queryClient.prefetchQuery(
      q(api.floatingIpList, { query: { project, limit: ALL_ISH } })
    ),
    queryClient.prefetchQuery(q(api.vpcList, { query: { project, limit: ALL_ISH } })),
  ])
  return null
}

export const handle = { crumb: 'New instance' }

export default function CreateInstanceForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { project } = useProjectSelector()
  const navigate = useNavigate()

  const createInstance = useApiMutation(api.instanceCreate, {
    onSuccess(instance) {
      // refetch list of instances
      queryClient.invalidateEndpoint('instanceList')
      // avoid the instance fetch when the instance page loads since we have the data
      const instanceView = q(api.instanceView, {
        path: { instance: instance.name },
        query: { project },
      })
      queryClient.setQueryData(instanceView.queryKey, instance)
      // prettier-ignore
      addToast(<>Instance <HL>{instance.name}</HL> created</>)
      navigate(pb.instance({ project, instance: instance.name }))
    },
  })

  const siloImages = usePrefetchedQuery(q(api.imageList, {})).data.items
  const projectImages = usePrefetchedQuery(q(api.imageList, { query: { project } })).data
    .items
  const allImages = [...siloImages, ...projectImages]

  const defaultImage = allImages[0]

  const allDisks = usePrefetchedQuery(
    q(api.diskList, { query: { project, limit: ALL_ISH } })
  ).data.items
  const disks = useMemo(() => toComboboxItems(allDisks.filter(diskCan.attach)), [allDisks])

  const { data: sshKeys } = usePrefetchedQuery(q(api.currentUserSshKeyList, {}))
  const allKeys = useMemo(() => sshKeys.items.map((key) => key.id), [sshKeys])

  // ipPoolList fetches the pools linked to the current silo
  const { data: siloPools } = usePrefetchedQuery(
    q(api.ipPoolList, { query: { limit: ALL_ISH } })
  )

  // Only unicast pools can be used for ephemeral IPs. Sort once here so
  // downstream filters (default pool pick, compatible pool list) preserve
  // the order without needing to re-sort.
  const unicastPools = useMemo(
    () =>
      R.sortBy(
        (siloPools?.items || []).filter(isUnicastPool),
        (p) => !p.isDefault, // defaults first
        (p) => p.ipVersion, // v4 first
        (p) => p.name
      ),
    [siloPools]
  )

  // Check if VPCs exist to determine default network interface type
  const { data: vpcs } = usePrefetchedQuery(
    q(api.vpcList, { query: { project, limit: ALL_ISH } })
  )
  const hasVpcs = vpcs.items.length > 0

  // Determine default network interface type:
  // - If VPCs exist: default to dual-stack (API default, works with both IPv4 and IPv6 subnets)
  // - If no VPCs exist: default to 'none' (user must create VPC first or use custom NICs)
  // Note: Decoupled from external IP pool configuration, as NIC IP stack and external IPs are separate concerns
  const defaultNetworkInterfaceType: InstanceNetworkInterfaceAttachment['type'] = hasVpcs
    ? 'default_dual_stack'
    : 'none'

  const defaultSource =
    siloImages.length > 0 ? 'siloImage' : projectImages.length > 0 ? 'projectImage' : 'disk'

  const defaultCompatibleVersions = getCompatibleVersionsFromNicType({
    type: defaultNetworkInterfaceType,
  })
  const compatibleDefaultPools = unicastPools
    .filter(poolHasIpVersion(defaultCompatibleVersions))
    .filter((p) => p.isDefault)
  // TODO: when we switch to dual stack ephemeral IPs, this will need to change
  // to handle selecting default pools for both v4 and v6
  const defaultEphemeralIpPool =
    compatibleDefaultPools.length > 0 ? compatibleDefaultPools[0].name : ''

  const defaultValues: InstanceCreateInput = {
    ...baseDefaultValues,
    networkInterfaces: { type: defaultNetworkInterfaceType },
    bootDiskSourceType: defaultSource,
    sshPublicKeys: allKeys,
    bootDiskSize: diskSizeNearest10(defaultImage?.size / GiB),
    ephemeralIpPool: defaultEphemeralIpPool || '',
    assignEphemeralIp: !!defaultEphemeralIpPool,
    floatingIps: [],
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
    ...otherDisks.filter((disk) => disk.action === 'create'), // disks being created here
  ].map((d) => d.name)

  // additional form elements for projectImage and siloImage tabs
  const bootDiskSizeAndName = (
    <>
      <div key="divider1" className="my-6! content-['a']" />
      <DiskSizeField
        key="diskSizeField"
        label="Disk size"
        name="bootDiskSize"
        control={control}
        min={imageSizeGiB || 1}
        // Max size applies: this disk can only be distributed
        max={MAX_DISK_SIZE_GiB}
        validate={(diskSizeGiB: number) => {
          if (imageSizeGiB && diskSizeGiB < imageSizeGiB) {
            return `Must be as large as selected image (min. ${imageSizeGiB} GiB)`
          }
        }}
        disabled={isSubmitting}
      />
      <div key="divider2" className="my-6! content-['a']" />
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
      {/* Read-only disk creation disabled pending propolis fix
          https://github.com/oxidecomputer/console/issues/3071
      <div key="divider3" className="my-6! content-['a']" />
      <CheckboxField
        key="bootDiskReadOnly"
        name="bootDiskReadOnly"
        control={control}
        disabled={isSubmitting}
      >
        Make disk read-only
      </CheckboxField>
      */}
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

          const assignEphemeralIp = values.assignEphemeralIp
          const ephemeralIpPool = values.ephemeralIpPool

          const externalIps: ExternalIpCreate[] = values.floatingIps.map((floatingIp) => ({
            type: 'floating' as const,
            floatingIp,
          }))

          if (assignEphemeralIp) {
            externalIps.push({
              type: 'ephemeral',
              // form validation is meant to ensure that pool is set when
              // assignEphemeralIp checkbox is checked
              poolSelector: { type: 'explicit', pool: ephemeralIpPool },
            })
          }

          const userData = values.userData
            ? await readBlobAsBase64(values.userData)
            : undefined

          await createInstance.mutateAsync({
            query: { project },
            body: {
              name: values.name,
              hostname: values.name,
              description: values.description,
              memory: instance.memory * GiB,
              ncpus: instance.ncpus,
              disks: values.otherDisks.map(
                (d): InstanceDiskAttachment =>
                  d.action === 'attach'
                    ? { type: 'attach', name: d.name }
                    : {
                        type: 'create',
                        name: d.name,
                        description: d.description,
                        size: d.size,
                        diskBackend: d.diskBackend,
                      }
              ),
              bootDisk,
              externalIps,
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
            <RadioFieldDyn name="presetId" control={control} disabled={isSubmitting}>
              {renderLargeRadioCards('general')}
            </RadioFieldDyn>
          </Tabs.Content>

          <Tabs.Content value="highCPU">
            <RadioFieldDyn name="presetId" control={control} disabled={isSubmitting}>
              {renderLargeRadioCards('highCPU')}
            </RadioFieldDyn>
          </Tabs.Content>

          <Tabs.Content value="highMemory">
            <RadioFieldDyn name="presetId" control={control} disabled={isSubmitting}>
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
        <Form.Heading id="networking">Networking</Form.Heading>
        <NetworkingSection
          control={control}
          isSubmitting={isSubmitting}
          unicastPools={unicastPools}
          hasVpcs={hasVpcs}
        />
        <FormDivider />
        <Form.Heading id="advanced">Advanced</Form.Heading>
        <FileField
          id="user-data-input"
          description={<UserDataDescription />}
          name="userData"
          label="User Data"
          control={control}
          disabled={isSubmitting}
        />
        <Form.Actions>
          <Form.Submit loading={createInstance.isPending}>Create instance</Form.Submit>
          <Form.Cancel onClick={() => navigate(pb.instances({ project }))} />
        </Form.Actions>
      </FullPageForm>
    </>
  )
}

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

const NetworkingSection = ({
  control,
  isSubmitting,
  unicastPools,
  hasVpcs,
}: {
  control: Control<InstanceCreateInput>
  isSubmitting: boolean
  unicastPools: UnicastIpPool[]
  hasVpcs: boolean
}) => {
  const networkInterfaces = useWatch({ control, name: 'networkInterfaces' })
  const [floatingIpModalOpen, setFloatingIpModalOpen] = useState(false)
  const [selectedFloatingIp, setSelectedFloatingIp] = useState<FloatingIp | undefined>()
  const assignEphemeralIpField = useController({ control, name: 'assignEphemeralIp' })
  const floatingIpsField = useController({ control, name: 'floatingIps' })
  const assignEphemeralIp = assignEphemeralIpField.field.value
  const attachedFloatingIps = floatingIpsField.field.value ?? EMPTY_NAME_OR_ID_LIST

  const ephemeralIpPoolField = useController({ control, name: 'ephemeralIpPool' })

  const ephemeralIpPool = ephemeralIpPoolField.field.value

  // Calculate compatible IP versions based on NIC type
  const compatibleVersions = useMemo(
    () => getCompatibleVersionsFromNicType(networkInterfaces),
    [networkInterfaces]
  )

  const { project } = useProjectSelector()
  const { data: floatingIpList } = usePrefetchedQuery(
    q(api.floatingIpList, { query: { project, limit: ALL_ISH } })
  )

  // Filter out the IPs that are already attached to an instance
  const attachableFloatingIps = useMemo(
    () => floatingIpList.items.filter((ip) => !ip.instanceId),
    [floatingIpList]
  )

  // To find available floating IPs, we remove the ones that are already committed to this instance
  // and filter by IP version compatibility with configured NICs
  const availableFloatingIps = useMemo(() => {
    return attachableFloatingIps
      .filter((ip) => !attachedFloatingIps.includes(ip.name))
      .filter(ipHasVersion(compatibleVersions))
  }, [attachableFloatingIps, attachedFloatingIps, compatibleVersions])

  const attachedFloatingIpsData = attachedFloatingIps
    .map((floatingIp) => attachableFloatingIps.find((fip) => fip.name === floatingIp))
    .filter((ip) => !!ip)

  // Filter unicast pools by compatible IP versions
  // unicastPools is already sorted (defaults first, v4 first, then by name),
  // so filtering preserves that order
  const compatiblePools = useMemo(
    () => unicastPools.filter(poolHasIpVersion(compatibleVersions)),
    [unicastPools, compatibleVersions]
  )

  useEffect(() => {
    if (!assignEphemeralIp || compatiblePools.length === 0) return

    const currentPoolValid =
      ephemeralIpPool && compatiblePools.some((p) => p.name === ephemeralIpPool)
    if (currentPoolValid) return

    const defaultPool = compatiblePools.find((p) => p.isDefault)
    if (defaultPool) {
      ephemeralIpPoolField.field.onChange(defaultPool.name)
    } else {
      ephemeralIpPoolField.field.onChange('')
    }
  }, [assignEphemeralIp, ephemeralIpPool, ephemeralIpPoolField, compatiblePools])

  // Track previous ability to attach ephemeral IP to detect transitions
  const prevCanAttachRef = useRef<boolean | undefined>(undefined)

  // Automatically manage ephemeral IP based on NIC and pool availability
  useEffect(() => {
    const hasCompatibleNics = compatibleVersions.length > 0
    const hasPools = compatiblePools.length > 0
    const canAttach = hasCompatibleNics && hasPools
    const hasDefaultPool = compatiblePools.some((p) => p.isDefault)
    const prevCanAttach = prevCanAttachRef.current

    if (!canAttach && assignEphemeralIp) {
      // Remove ephemeral IP when there are no compatible NICs or pools
      assignEphemeralIpField.field.onChange(false)
    } else if (
      canAttach &&
      hasDefaultPool &&
      prevCanAttach === false &&
      !assignEphemeralIp
    ) {
      // Add ephemeral IP when transitioning from unable to able to attach
      // (prevCanAttach === false means we couldn't attach before, either due to no NICs or no pools)
      assignEphemeralIpField.field.onChange(true)
    }

    prevCanAttachRef.current = canAttach
  }, [assignEphemeralIp, assignEphemeralIpField, compatiblePools, compatibleVersions])

  const ephemeralIpCheckboxState = useMemo(() => {
    const hasCompatibleNics = compatibleVersions.length > 0
    const hasCompatiblePools = compatiblePools.length > 0
    const canAttachEphemeralIp = hasCompatibleNics && hasCompatiblePools

    let disabledReason: React.ReactNode = undefined
    if (!hasCompatibleNics) {
      disabledReason = (
        <>
          Add a compatible network interface
          <br />
          to attach an ephemeral IP address
        </>
      )
    } else if (!hasCompatiblePools) {
      // TODO: "compatible" not clear enough. also this can happen if there are
      // no pools at all as well as when there are no pools compatible withe
      // the NIC stack. We could do a different messages for each.
      disabledReason = (
        <>
          No compatible IP pools available
          <br />
          for this network interface type
        </>
      )
    }

    return { canAttachEphemeralIp, disabledReason }
  }, [compatibleVersions, compatiblePools])

  const closeFloatingIpModal = () => {
    setFloatingIpModalOpen(false)
    setSelectedFloatingIp(undefined)
  }

  const attachFloatingIp = () => {
    if (selectedFloatingIp) {
      const current = floatingIpsField.field.value || []
      const next = current.includes(selectedFloatingIp.name)
        ? current
        : [...current, selectedFloatingIp.name]
      floatingIpsField.field.onChange(next)
    }
    closeFloatingIpModal()
  }

  const detachFloatingIp = (name: string) => {
    const current = floatingIpsField.field.value || []
    floatingIpsField.field.onChange(current.filter((floatingIp) => floatingIp !== name))
  }

  const selectedFloatingIpMessage = (
    <>
      This instance will be reachable at{' '}
      {selectedFloatingIp ? <HL>{selectedFloatingIp.ip}</HL> : 'the selected IP'}
    </>
  )

  return (
    <>
      {!hasVpcs && (
        <Message
          className="mb-4"
          variant="notice"
          content={
            <>
              A VPC is required to add network interfaces.{' '}
              <Link to={pb.vpcsNew({ project })}>Create a VPC</Link> to enable networking.
            </>
          }
        />
      )}
      <NetworkInterfaceField control={control} disabled={isSubmitting} hasVpcs={hasVpcs} />

      <div className="flex flex-1 flex-col gap-4">
        <h2 className="text-sans-md flex items-center">
          Ephemeral IP{' '}
          <TipIcon className="ml-1.5">
            Ephemeral IPs are allocated when the instance is created and deallocated when it
            is deleted
          </TipIcon>
        </h2>

        <Wrap
          when={!!ephemeralIpCheckboxState.disabledReason}
          with={<Tooltip content={ephemeralIpCheckboxState.disabledReason} />}
        >
          {/* TODO: Wrapping the checkbox in a <span> makes it so the tooltip
           * shows up when you hover anywhere on the label or checkbox, not
           * just the checkbox itself. The downside is the placement of the tooltip
           * is a little weird (I'd like it better if it was anchored to the checkbox),
           * but I think having it show up on label hover is worth it.
           */}
          <span>
            <Checkbox
              id="assignEphemeralIp"
              checked={ephemeralIpCheckboxState.canAttachEphemeralIp && assignEphemeralIp}
              disabled={!ephemeralIpCheckboxState.canAttachEphemeralIp}
              onChange={() => {
                assignEphemeralIpField.field.onChange(!assignEphemeralIp)
              }}
            >
              Allocate and attach an ephemeral IP address
            </Checkbox>
          </span>
        </Wrap>
        <IpPoolSelector
          className={assignEphemeralIp ? '' : 'hidden'}
          control={control}
          poolFieldName="ephemeralIpPool"
          pools={compatiblePools}
          disabled={isSubmitting}
          compatibleVersions={compatibleVersions}
          required={assignEphemeralIp}
        />
      </div>

      <div className="flex flex-1 flex-col gap-4">
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
          <div className="flex max-w-lg flex-col items-start gap-3">
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
              className="shrink-0"
              disabled={
                availableFloatingIps.length === 0 || compatibleVersions.length === 0
              }
              disabledReason={
                compatibleVersions.length === 0 ? (
                  <>
                    A network interface is required
                    <br />
                    to attach a floating IP
                  </>
                ) : availableFloatingIps.length === 0 ? (
                  'No floating IPs available'
                ) : undefined
              }
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
                    setSelectedFloatingIp(availableFloatingIps.find((i) => i.name === name))
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
    </>
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
