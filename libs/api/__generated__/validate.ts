/* eslint-disable */
import { ZodType, z } from 'zod'

import { processResponseBody, snakeify } from './util'

/**
 * Zod only supports string enums at the moment. A previous issue was opened
 * and closed as stale but it provided a hint on how to implement it.
 *
 * @see https://github.com/colinhacks/zod/issues/1118
 * TODO: PR an update for zod to support other native enum types
 */
const IntEnum = <T extends readonly number[]>(values: T) =>
  z.number().refine((v) => values.includes(v)) as ZodType<T[number]>

/** Helper to ensure booleans provided as strings end up with the correct value */
const SafeBoolean = z.preprocess((v) => (v === 'false' ? false : v), z.coerce.boolean())

/**
 * Properties that should uniquely identify a Sled.
 */
export const Baseboard = z.preprocess(
  processResponseBody,
  z.object({ part: z.string(), revision: z.number(), serial: z.string() })
)

/**
 * A type storing a range over `T`.
 *
 * This type supports ranges similar to the `RangeTo`, `Range` and `RangeFrom` types in the standard library. Those cover `(..end)`, `(start..end)`, and `(start..)` respectively.
 */
export const BinRangedouble = z.preprocess(
  processResponseBody,
  z.union([
    z.object({ end: z.number(), type: z.enum(['range_to']) }),
    z.object({ end: z.number(), start: z.number(), type: z.enum(['range']) }),
    z.object({ start: z.number(), type: z.enum(['range_from']) }),
  ])
)

/**
 * A type storing a range over `T`.
 *
 * This type supports ranges similar to the `RangeTo`, `Range` and `RangeFrom` types in the standard library. Those cover `(..end)`, `(start..end)`, and `(start..)` respectively.
 */
export const BinRangeint64 = z.preprocess(
  processResponseBody,
  z.union([
    z.object({ end: z.number(), type: z.enum(['range_to']) }),
    z.object({ end: z.number(), start: z.number(), type: z.enum(['range']) }),
    z.object({ start: z.number(), type: z.enum(['range_from']) }),
  ])
)

/**
 * Type storing bin edges and a count of samples within it.
 */
export const Bindouble = z.preprocess(
  processResponseBody,
  z.object({ count: z.number().min(0), range: BinRangedouble })
)

/**
 * Type storing bin edges and a count of samples within it.
 */
export const Binint64 = z.preprocess(
  processResponseBody,
  z.object({ count: z.number().min(0), range: BinRangeint64 })
)

/**
 * disk block size in bytes
 */
export const BlockSize = z.preprocess(
  processResponseBody,
  IntEnum([512, 2048, 4096] as const)
)

/**
 * Byte count to express memory or storage capacity.
 */
export const ByteCount = z.preprocess(processResponseBody, z.number().min(0))

/**
 * A name unique within the parent collection
 *
 * Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. Names cannot be a UUID though they may contain a UUID.
 */
export const Name = z.preprocess(
  processResponseBody,
  z
    .string()
    .min(1)
    .max(63)
    .regex(
      /^(?![0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$)^[a-z][a-z0-9-]*[a-zA-Z0-9]*$/
    )
)

/**
 * The service intended to use this certificate.
 */
export const ServiceUsingCertificate = z.preprocess(
  processResponseBody,
  z.enum(['external_api'])
)

/**
 * View of a Certificate
 */
export const Certificate = z.preprocess(
  processResponseBody,
  z.object({
    description: z.string(),
    id: z.string().uuid(),
    name: Name,
    service: ServiceUsingCertificate,
    timeCreated: z.coerce.date(),
    timeModified: z.coerce.date(),
  })
)

/**
 * Create-time parameters for a `Certificate`
 */
export const CertificateCreate = z.preprocess(
  processResponseBody,
  z.object({
    cert: z.number().min(0).max(255).array(),
    description: z.string(),
    key: z.number().min(0).max(255).array(),
    name: Name,
    service: ServiceUsingCertificate,
  })
)

/**
 * A single page of results
 */
export const CertificateResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: Certificate.array(), nextPage: z.string().optional() })
)

export const UpdateableComponentType = z.preprocess(
  processResponseBody,
  z.enum([
    'bootloader_for_rot',
    'bootloader_for_sp',
    'bootloader_for_host_proc',
    'hubris_for_psc_rot',
    'hubris_for_psc_sp',
    'hubris_for_sidecar_rot',
    'hubris_for_sidecar_sp',
    'hubris_for_gimlet_rot',
    'hubris_for_gimlet_sp',
    'helios_host_phase1',
    'helios_host_phase2',
    'host_omicron',
  ])
)

export const SemverVersion = z.preprocess(
  processResponseBody,
  z
    .string()
    .regex(
      /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/
    )
)

/**
 * Identity-related metadata that's included in "asset" public API objects (which generally have no name or description)
 */
export const ComponentUpdate = z.preprocess(
  processResponseBody,
  z.object({
    componentType: UpdateableComponentType,
    id: z.string().uuid(),
    timeCreated: z.coerce.date(),
    timeModified: z.coerce.date(),
    version: SemverVersion,
  })
)

/**
 * A single page of results
 */
export const ComponentUpdateResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: ComponentUpdate.array(), nextPage: z.string().optional() })
)

/**
 * A cumulative or counter data type.
 */
export const Cumulativedouble = z.preprocess(
  processResponseBody,
  z.object({ startTime: z.coerce.date(), value: z.number() })
)

/**
 * A cumulative or counter data type.
 */
export const Cumulativeint64 = z.preprocess(
  processResponseBody,
  z.object({ startTime: z.coerce.date(), value: z.number() })
)

/**
 * Info about the current user
 */
export const CurrentUser = z.preprocess(
  processResponseBody,
  z.object({
    displayName: z.string(),
    id: z.string().uuid(),
    siloId: z.string().uuid(),
    siloName: Name,
  })
)

/**
 * Histogram metric
 *
 * A histogram maintains the count of any number of samples, over a set of bins. Bins are specified on construction via their _left_ edges, inclusive. There can't be any "gaps" in the bins, and an additional bin may be added to the left, right, or both so that the bins extend to the entire range of the support.
 *
 * Note that any gaps, unsorted bins, or non-finite values will result in an error.
 */
export const Histogramint64 = z.preprocess(
  processResponseBody,
  z.object({
    bins: Binint64.array(),
    nSamples: z.number().min(0),
    startTime: z.coerce.date(),
  })
)

/**
 * Histogram metric
 *
 * A histogram maintains the count of any number of samples, over a set of bins. Bins are specified on construction via their _left_ edges, inclusive. There can't be any "gaps" in the bins, and an additional bin may be added to the left, right, or both so that the bins extend to the entire range of the support.
 *
 * Note that any gaps, unsorted bins, or non-finite values will result in an error.
 */
export const Histogramdouble = z.preprocess(
  processResponseBody,
  z.object({
    bins: Bindouble.array(),
    nSamples: z.number().min(0),
    startTime: z.coerce.date(),
  })
)

/**
 * A `Datum` is a single sampled data point from a metric.
 */
export const Datum = z.preprocess(
  processResponseBody,
  z.union([
    z.object({ datum: SafeBoolean, type: z.enum(['bool']) }),
    z.object({ datum: z.number(), type: z.enum(['i64']) }),
    z.object({ datum: z.number(), type: z.enum(['f64']) }),
    z.object({ datum: z.string(), type: z.enum(['string']) }),
    z.object({ datum: z.number().min(0).max(255).array(), type: z.enum(['bytes']) }),
    z.object({ datum: Cumulativeint64, type: z.enum(['cumulative_i64']) }),
    z.object({ datum: Cumulativedouble, type: z.enum(['cumulative_f64']) }),
    z.object({ datum: Histogramint64, type: z.enum(['histogram_i64']) }),
    z.object({ datum: Histogramdouble, type: z.enum(['histogram_f64']) }),
  ])
)

export const DerEncodedKeyPair = z.preprocess(
  processResponseBody,
  z.object({ privateKey: z.string(), publicCert: z.string() })
)

export const DeviceAccessTokenRequest = z.preprocess(
  processResponseBody,
  z.object({ clientId: z.string().uuid(), deviceCode: z.string(), grantType: z.string() })
)

export const DeviceAuthRequest = z.preprocess(
  processResponseBody,
  z.object({ clientId: z.string().uuid() })
)

export const DeviceAuthVerify = z.preprocess(
  processResponseBody,
  z.object({ userCode: z.string() })
)

export const Digest = z.preprocess(
  processResponseBody,
  z.object({ type: z.enum(['sha256']), value: z.string() })
)

/**
 * State of a Disk
 */
export const DiskState = z.preprocess(
  processResponseBody,
  z.union([
    z.object({ state: z.enum(['creating']) }),
    z.object({ state: z.enum(['detached']) }),
    z.object({ state: z.enum(['import_ready']) }),
    z.object({ state: z.enum(['importing_from_url']) }),
    z.object({ state: z.enum(['importing_from_bulk_writes']) }),
    z.object({ state: z.enum(['finalizing']) }),
    z.object({ state: z.enum(['maintenance']) }),
    z.object({ instance: z.string().uuid(), state: z.enum(['attaching']) }),
    z.object({ instance: z.string().uuid(), state: z.enum(['attached']) }),
    z.object({ instance: z.string().uuid(), state: z.enum(['detaching']) }),
    z.object({ state: z.enum(['destroyed']) }),
    z.object({ state: z.enum(['faulted']) }),
  ])
)

/**
 * View of a Disk
 */
export const Disk = z.preprocess(
  processResponseBody,
  z.object({
    blockSize: ByteCount,
    description: z.string(),
    devicePath: z.string(),
    id: z.string().uuid(),
    imageId: z.string().uuid().optional(),
    name: Name,
    projectId: z.string().uuid(),
    size: ByteCount,
    snapshotId: z.string().uuid().optional(),
    state: DiskState,
    timeCreated: z.coerce.date(),
    timeModified: z.coerce.date(),
  })
)

/**
 * Different sources for a disk
 */
export const DiskSource = z.preprocess(
  processResponseBody,
  z.union([
    z.object({ blockSize: BlockSize, type: z.enum(['blank']) }),
    z.object({ snapshotId: z.string().uuid(), type: z.enum(['snapshot']) }),
    z.object({ imageId: z.string().uuid(), type: z.enum(['image']) }),
    z.object({ blockSize: BlockSize, type: z.enum(['importing_blocks']) }),
  ])
)

/**
 * Create-time parameters for a `Disk`
 */
export const DiskCreate = z.preprocess(
  processResponseBody,
  z.object({ description: z.string(), diskSource: DiskSource, name: Name, size: ByteCount })
)

export const NameOrId = z.preprocess(
  processResponseBody,
  z.union([z.string().uuid(), Name])
)

export const DiskPath = z.preprocess(processResponseBody, z.object({ disk: NameOrId }))

/**
 * A single page of results
 */
export const DiskResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: Disk.array(), nextPage: z.string().optional() })
)

/**
 * Error information from a response.
 */
export const Error = z.preprocess(
  processResponseBody,
  z.object({ errorCode: z.string().optional(), message: z.string(), requestId: z.string() })
)

export const ExpectedDigest = z.preprocess(
  processResponseBody,
  z.object({ sha256: z.string() })
)

/**
 * The kind of an external IP address for an instance
 */
export const IpKind = z.preprocess(processResponseBody, z.enum(['ephemeral', 'floating']))

export const ExternalIp = z.preprocess(
  processResponseBody,
  z.object({ ip: z.string(), kind: IpKind })
)

/**
 * Parameters for creating an external IP address for instances.
 */
export const ExternalIpCreate = z.preprocess(
  processResponseBody,
  z.object({ poolName: Name.optional(), type: z.enum(['ephemeral']) })
)

/**
 * A single page of results
 */
export const ExternalIpResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: ExternalIp.array(), nextPage: z.string().optional() })
)

/**
 * Parameters for finalizing a disk
 */
export const FinalizeDisk = z.preprocess(
  processResponseBody,
  z.object({ snapshotName: Name.optional() })
)

export const FleetRole = z.preprocess(
  processResponseBody,
  z.enum(['admin', 'collaborator', 'viewer'])
)

/**
 * Describes what kind of identity is described by an id
 */
export const IdentityType = z.preprocess(
  processResponseBody,
  z.enum(['silo_user', 'silo_group'])
)

/**
 * Describes the assignment of a particular role on a particular resource to a particular identity (user, group, etc.)
 *
 * The resource is not part of this structure.  Rather, `RoleAssignment`s are put into a `Policy` and that Policy is applied to a particular resource.
 */
export const FleetRoleRoleAssignment = z.preprocess(
  processResponseBody,
  z.object({
    identityId: z.string().uuid(),
    identityType: IdentityType,
    roleName: FleetRole,
  })
)

/**
 * Policy for a particular resource
 *
 * Note that the Policy only describes access granted explicitly for this resource.  The policies of parent resources can also cause a user to have access to this resource.
 */
export const FleetRolePolicy = z.preprocess(
  processResponseBody,
  z.object({ roleAssignments: FleetRoleRoleAssignment.array() })
)

/**
 * View of a Group
 */
export const Group = z.preprocess(
  processResponseBody,
  z.object({ displayName: z.string(), id: z.string().uuid(), siloId: z.string().uuid() })
)

/**
 * A single page of results
 */
export const GroupResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: Group.array(), nextPage: z.string().optional() })
)

export const IdentityProviderType = z.preprocess(processResponseBody, z.enum(['saml']))

/**
 * View of an Identity Provider
 */
export const IdentityProvider = z.preprocess(
  processResponseBody,
  z.object({
    description: z.string(),
    id: z.string().uuid(),
    name: Name,
    providerType: IdentityProviderType,
    timeCreated: z.coerce.date(),
    timeModified: z.coerce.date(),
  })
)

/**
 * A single page of results
 */
export const IdentityProviderResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: IdentityProvider.array(), nextPage: z.string().optional() })
)

export const IdpMetadataSource = z.preprocess(
  processResponseBody,
  z.union([
    z.object({ type: z.enum(['url']), url: z.string() }),
    z.object({ data: z.string(), type: z.enum(['base64_encoded_xml']) }),
  ])
)

/**
 * Client view of images
 */
export const Image = z.preprocess(
  processResponseBody,
  z.object({
    blockSize: ByteCount,
    description: z.string(),
    digest: Digest.optional(),
    id: z.string().uuid(),
    name: Name,
    os: z.string(),
    projectId: z.string().uuid().optional(),
    size: ByteCount,
    timeCreated: z.coerce.date(),
    timeModified: z.coerce.date(),
    url: z.string().optional(),
    version: z.string(),
  })
)

/**
 * The source of the underlying image.
 */
export const ImageSource = z.preprocess(
  processResponseBody,
  z.union([
    z.object({ type: z.enum(['url']), url: z.string() }),
    z.object({ id: z.string().uuid(), type: z.enum(['snapshot']) }),
    z.object({ type: z.enum(['you_can_boot_anything_as_long_as_its_alpine']) }),
  ])
)

/**
 * Create-time parameters for an `Image`
 */
export const ImageCreate = z.preprocess(
  processResponseBody,
  z.object({
    blockSize: BlockSize,
    description: z.string(),
    name: Name,
    os: z.string(),
    source: ImageSource,
    version: z.string(),
  })
)

/**
 * A single page of results
 */
export const ImageResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: Image.array(), nextPage: z.string().optional() })
)

/**
 * Parameters for importing blocks with a bulk write
 */
export const ImportBlocksBulkWrite = z.preprocess(
  processResponseBody,
  z.object({ base64EncodedData: z.string(), offset: z.number().min(0) })
)

/**
 * Parameters for importing blocks from a URL to a disk
 */
export const ImportBlocksFromUrl = z.preprocess(
  processResponseBody,
  z.object({ expectedDigest: ExpectedDigest.optional(), url: z.string() })
)

/**
 * The number of CPUs in an Instance
 */
export const InstanceCpuCount = z.preprocess(
  processResponseBody,
  z.number().min(0).max(65535)
)

/**
 * Running state of an Instance (primarily: booted or stopped)
 *
 * This typically reflects whether it's starting, running, stopping, or stopped, but also includes states related to the Instance's lifecycle
 */
export const InstanceState = z.preprocess(
  processResponseBody,
  z.enum([
    'creating',
    'starting',
    'running',
    'stopping',
    'stopped',
    'rebooting',
    'migrating',
    'repairing',
    'failed',
    'destroyed',
  ])
)

/**
 * View of an Instance
 */
export const Instance = z.preprocess(
  processResponseBody,
  z.object({
    description: z.string(),
    hostname: z.string(),
    id: z.string().uuid(),
    memory: ByteCount,
    name: Name,
    ncpus: InstanceCpuCount,
    projectId: z.string().uuid(),
    runState: InstanceState,
    timeCreated: z.coerce.date(),
    timeModified: z.coerce.date(),
    timeRunStateUpdated: z.coerce.date(),
  })
)

/**
 * Describe the instance's disks at creation time
 */
export const InstanceDiskAttachment = z.preprocess(
  processResponseBody,
  z.union([
    z.object({
      description: z.string(),
      diskSource: DiskSource,
      name: Name,
      size: ByteCount,
      type: z.enum(['create']),
    }),
    z.object({ name: Name, type: z.enum(['attach']) }),
  ])
)

/**
 * Create-time parameters for an `InstanceNetworkInterface`
 */
export const InstanceNetworkInterfaceCreate = z.preprocess(
  processResponseBody,
  z.object({
    description: z.string(),
    ip: z.string().optional(),
    name: Name,
    subnetName: Name,
    vpcName: Name,
  })
)

/**
 * Describes an attachment of an `InstanceNetworkInterface` to an `Instance`, at the time the instance is created.
 */
export const InstanceNetworkInterfaceAttachment = z.preprocess(
  processResponseBody,
  z.union([
    z.object({ params: InstanceNetworkInterfaceCreate.array(), type: z.enum(['create']) }),
    z.object({ type: z.enum(['default']) }),
    z.object({ type: z.enum(['none']) }),
  ])
)

/**
 * Create-time parameters for an `Instance`
 */
export const InstanceCreate = z.preprocess(
  processResponseBody,
  z.object({
    description: z.string(),
    disks: InstanceDiskAttachment.array().default([]).optional(),
    externalIps: ExternalIpCreate.array().default([]).optional(),
    hostname: z.string(),
    memory: ByteCount,
    name: Name,
    ncpus: InstanceCpuCount,
    networkInterfaces: InstanceNetworkInterfaceAttachment.default({
      type: 'default',
    }).optional(),
    start: SafeBoolean.default(true).optional(),
    userData: z.string().default('').optional(),
  })
)

/**
 * Migration parameters for an `Instance`
 */
export const InstanceMigrate = z.preprocess(
  processResponseBody,
  z.object({ dstSledId: z.string().uuid() })
)

/**
 * A MAC address
 *
 * A Media Access Control address, in EUI-48 format
 */
export const MacAddr = z.preprocess(
  processResponseBody,
  z
    .string()
    .min(5)
    .max(17)
    .regex(/^([0-9a-fA-F]{0,2}:){5}[0-9a-fA-F]{0,2}$/)
)

/**
 * An `InstanceNetworkInterface` represents a virtual network interface device attached to an instance.
 */
export const InstanceNetworkInterface = z.preprocess(
  processResponseBody,
  z.object({
    description: z.string(),
    id: z.string().uuid(),
    instanceId: z.string().uuid(),
    ip: z.string(),
    mac: MacAddr,
    name: Name,
    primary: SafeBoolean,
    subnetId: z.string().uuid(),
    timeCreated: z.coerce.date(),
    timeModified: z.coerce.date(),
    vpcId: z.string().uuid(),
  })
)

/**
 * A single page of results
 */
export const InstanceNetworkInterfaceResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: InstanceNetworkInterface.array(), nextPage: z.string().optional() })
)

/**
 * Parameters for updating an `InstanceNetworkInterface`
 *
 * Note that modifying IP addresses for an interface is not yet supported, a new interface must be created instead.
 */
export const InstanceNetworkInterfaceUpdate = z.preprocess(
  processResponseBody,
  z.object({
    description: z.string().optional(),
    name: Name.optional(),
    primary: SafeBoolean.default(false).optional(),
  })
)

/**
 * A single page of results
 */
export const InstanceResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: Instance.array(), nextPage: z.string().optional() })
)

/**
 * Contents of an Instance's serial console buffer.
 */
export const InstanceSerialConsoleData = z.preprocess(
  processResponseBody,
  z.object({ data: z.number().min(0).max(255).array(), lastByteOffset: z.number().min(0) })
)

/**
 * An IPv4 subnet
 *
 * An IPv4 subnet, including prefix and subnet mask
 */
export const Ipv4Net = z.preprocess(
  processResponseBody,
  z
    .string()
    .regex(
      /^(([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\/([8-9]|1[0-9]|2[0-9]|3[0-2])$/
    )
)

/**
 * An IPv6 subnet
 *
 * An IPv6 subnet, including prefix and subnet mask
 */
export const Ipv6Net = z.preprocess(
  processResponseBody,
  z
    .string()
    .regex(
      /^([fF][dD])[0-9a-fA-F]{2}:(([0-9a-fA-F]{1,4}:){6}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,6}:)\/([1-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8])$/
    )
)

export const IpNet = z.preprocess(processResponseBody, z.union([Ipv4Net, Ipv6Net]))

/**
 * Identity-related metadata that's included in nearly all public API objects
 */
export const IpPool = z.preprocess(
  processResponseBody,
  z.object({
    description: z.string(),
    id: z.string().uuid(),
    name: Name,
    timeCreated: z.coerce.date(),
    timeModified: z.coerce.date(),
  })
)

/**
 * Create-time parameters for an `IpPool`
 */
export const IpPoolCreate = z.preprocess(
  processResponseBody,
  z.object({ description: z.string(), name: Name })
)

/**
 * A non-decreasing IPv4 address range, inclusive of both ends.
 *
 * The first address must be less than or equal to the last address.
 */
export const Ipv4Range = z.preprocess(
  processResponseBody,
  z.object({ first: z.string(), last: z.string() })
)

/**
 * A non-decreasing IPv6 address range, inclusive of both ends.
 *
 * The first address must be less than or equal to the last address.
 */
export const Ipv6Range = z.preprocess(
  processResponseBody,
  z.object({ first: z.string(), last: z.string() })
)

export const IpRange = z.preprocess(processResponseBody, z.union([Ipv4Range, Ipv6Range]))

export const IpPoolRange = z.preprocess(
  processResponseBody,
  z.object({ id: z.string().uuid(), range: IpRange, timeCreated: z.coerce.date() })
)

/**
 * A single page of results
 */
export const IpPoolRangeResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: IpPoolRange.array(), nextPage: z.string().optional() })
)

/**
 * A single page of results
 */
export const IpPoolResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: IpPool.array(), nextPage: z.string().optional() })
)

/**
 * Parameters for updating an IP Pool
 */
export const IpPoolUpdate = z.preprocess(
  processResponseBody,
  z.object({ description: z.string().optional(), name: Name.optional() })
)

/**
 * A range of IP ports
 *
 * An inclusive-inclusive range of IP ports. The second port may be omitted to represent a single port
 */
export const L4PortRange = z.preprocess(
  processResponseBody,
  z
    .string()
    .min(1)
    .max(11)
    .regex(/^[0-9]{1,5}(-[0-9]{1,5})?$/)
)

/**
 * A `Measurement` is a timestamped datum from a single metric
 */
export const Measurement = z.preprocess(
  processResponseBody,
  z.object({ datum: Datum, timestamp: z.coerce.date() })
)

/**
 * A single page of results
 */
export const MeasurementResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: Measurement.array(), nextPage: z.string().optional() })
)

/**
 * A password used to authenticate a user
 *
 * Passwords may be subject to additional constraints.
 */
export const Password = z.preprocess(processResponseBody, z.string().max(512))

export const PhysicalDiskType = z.preprocess(
  processResponseBody,
  z.enum(['internal', 'external'])
)

/**
 * View of a Physical Disk
 *
 * Physical disks reside in a particular sled and are used to store both Instance Disk data as well as internal metadata.
 */
export const PhysicalDisk = z.preprocess(
  processResponseBody,
  z.object({
    diskType: PhysicalDiskType,
    id: z.string().uuid(),
    model: z.string(),
    serial: z.string(),
    sledId: z.string().uuid().optional(),
    timeCreated: z.coerce.date(),
    timeModified: z.coerce.date(),
    vendor: z.string(),
  })
)

/**
 * A single page of results
 */
export const PhysicalDiskResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: PhysicalDisk.array(), nextPage: z.string().optional() })
)

/**
 * View of a Project
 */
export const Project = z.preprocess(
  processResponseBody,
  z.object({
    description: z.string(),
    id: z.string().uuid(),
    name: Name,
    timeCreated: z.coerce.date(),
    timeModified: z.coerce.date(),
  })
)

/**
 * Create-time parameters for a `Project`
 */
export const ProjectCreate = z.preprocess(
  processResponseBody,
  z.object({ description: z.string(), name: Name })
)

/**
 * A single page of results
 */
export const ProjectResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: Project.array(), nextPage: z.string().optional() })
)

export const ProjectRole = z.preprocess(
  processResponseBody,
  z.enum(['admin', 'collaborator', 'viewer'])
)

/**
 * Describes the assignment of a particular role on a particular resource to a particular identity (user, group, etc.)
 *
 * The resource is not part of this structure.  Rather, `RoleAssignment`s are put into a `Policy` and that Policy is applied to a particular resource.
 */
export const ProjectRoleRoleAssignment = z.preprocess(
  processResponseBody,
  z.object({
    identityId: z.string().uuid(),
    identityType: IdentityType,
    roleName: ProjectRole,
  })
)

/**
 * Policy for a particular resource
 *
 * Note that the Policy only describes access granted explicitly for this resource.  The policies of parent resources can also cause a user to have access to this resource.
 */
export const ProjectRolePolicy = z.preprocess(
  processResponseBody,
  z.object({ roleAssignments: ProjectRoleRoleAssignment.array() })
)

/**
 * Updateable properties of a `Project`
 */
export const ProjectUpdate = z.preprocess(
  processResponseBody,
  z.object({ description: z.string().optional(), name: Name.optional() })
)

/**
 * View of an Rack
 */
export const Rack = z.preprocess(
  processResponseBody,
  z.object({
    id: z.string().uuid(),
    timeCreated: z.coerce.date(),
    timeModified: z.coerce.date(),
  })
)

/**
 * A single page of results
 */
export const RackResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: Rack.array(), nextPage: z.string().optional() })
)

/**
 * A name for a built-in role
 *
 * Role names consist of two string components separated by dot (".").
 */
export const RoleName = z.preprocess(
  processResponseBody,
  z
    .string()
    .max(63)
    .regex(/[a-z-]+\.[a-z-]+/)
)

/**
 * View of a Role
 */
export const Role = z.preprocess(
  processResponseBody,
  z.object({ description: z.string(), name: RoleName })
)

/**
 * A single page of results
 */
export const RoleResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: Role.array(), nextPage: z.string().optional() })
)

/**
 * A `RouteDestination` is used to match traffic with a routing rule, on the destination of that traffic.
 *
 * When traffic is to be sent to a destination that is within a given `RouteDestination`, the corresponding `RouterRoute` applies, and traffic will be forward to the `RouteTarget` for that rule.
 */
export const RouteDestination = z.preprocess(
  processResponseBody,
  z.union([
    z.object({ type: z.enum(['ip']), value: z.string() }),
    z.object({ type: z.enum(['ip_net']), value: IpNet }),
    z.object({ type: z.enum(['vpc']), value: Name }),
    z.object({ type: z.enum(['subnet']), value: Name }),
  ])
)

/**
 * A `RouteTarget` describes the possible locations that traffic matching a route destination can be sent.
 */
export const RouteTarget = z.preprocess(
  processResponseBody,
  z.union([
    z.object({ type: z.enum(['ip']), value: z.string() }),
    z.object({ type: z.enum(['vpc']), value: Name }),
    z.object({ type: z.enum(['subnet']), value: Name }),
    z.object({ type: z.enum(['instance']), value: Name }),
    z.object({ type: z.enum(['internet_gateway']), value: Name }),
  ])
)

/**
 * The kind of a `RouterRoute`
 *
 * The kind determines certain attributes such as if the route is modifiable and describes how or where the route was created.
 */
export const RouterRouteKind = z.preprocess(
  processResponseBody,
  z.enum(['default', 'vpc_subnet', 'vpc_peering', 'custom'])
)

/**
 * A route defines a rule that governs where traffic should be sent based on its destination.
 */
export const RouterRoute = z.preprocess(
  processResponseBody,
  z.object({
    description: z.string(),
    destination: RouteDestination,
    id: z.string().uuid(),
    kind: RouterRouteKind,
    name: Name,
    target: RouteTarget,
    timeCreated: z.coerce.date(),
    timeModified: z.coerce.date(),
    vpcRouterId: z.string().uuid(),
  })
)

/**
 * Create-time parameters for a `RouterRoute`
 */
export const RouterRouteCreate = z.preprocess(
  processResponseBody,
  z.object({
    description: z.string(),
    destination: RouteDestination,
    name: Name,
    target: RouteTarget,
  })
)

/**
 * A single page of results
 */
export const RouterRouteResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: RouterRoute.array(), nextPage: z.string().optional() })
)

/**
 * Updateable properties of a `RouterRoute`
 */
export const RouterRouteUpdate = z.preprocess(
  processResponseBody,
  z.object({
    description: z.string().optional(),
    destination: RouteDestination,
    name: Name.optional(),
    target: RouteTarget,
  })
)

/**
 * Identity-related metadata that's included in nearly all public API objects
 */
export const SamlIdentityProvider = z.preprocess(
  processResponseBody,
  z.object({
    acsUrl: z.string(),
    description: z.string(),
    id: z.string().uuid(),
    idpEntityId: z.string(),
    name: Name,
    publicCert: z.string().optional(),
    sloUrl: z.string(),
    spClientId: z.string(),
    technicalContactEmail: z.string(),
    timeCreated: z.coerce.date(),
    timeModified: z.coerce.date(),
  })
)

/**
 * Create-time identity-related parameters
 */
export const SamlIdentityProviderCreate = z.preprocess(
  processResponseBody,
  z.object({
    acsUrl: z.string(),
    description: z.string(),
    groupAttributeName: z.string().optional(),
    idpEntityId: z.string(),
    idpMetadataSource: IdpMetadataSource,
    name: Name,
    signingKeypair: DerEncodedKeyPair.default(null).optional(),
    sloUrl: z.string(),
    spClientId: z.string(),
    technicalContactEmail: z.string(),
  })
)

/**
 * Describes how identities are managed and users are authenticated in this Silo
 */
export const SiloIdentityMode = z.preprocess(
  processResponseBody,
  z.enum(['saml_jit', 'local_only'])
)

/**
 * View of a Silo
 *
 * A Silo is the highest level unit of isolation.
 */
export const Silo = z.preprocess(
  processResponseBody,
  z.object({
    description: z.string(),
    discoverable: SafeBoolean,
    id: z.string().uuid(),
    identityMode: SiloIdentityMode,
    name: Name,
    timeCreated: z.coerce.date(),
    timeModified: z.coerce.date(),
  })
)

/**
 * Create-time parameters for a `Silo`
 */
export const SiloCreate = z.preprocess(
  processResponseBody,
  z.object({
    adminGroupName: z.string().optional(),
    description: z.string(),
    discoverable: SafeBoolean,
    identityMode: SiloIdentityMode,
    name: Name,
  })
)

/**
 * A single page of results
 */
export const SiloResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: Silo.array(), nextPage: z.string().optional() })
)

export const SiloRole = z.preprocess(
  processResponseBody,
  z.enum(['admin', 'collaborator', 'viewer'])
)

/**
 * Describes the assignment of a particular role on a particular resource to a particular identity (user, group, etc.)
 *
 * The resource is not part of this structure.  Rather, `RoleAssignment`s are put into a `Policy` and that Policy is applied to a particular resource.
 */
export const SiloRoleRoleAssignment = z.preprocess(
  processResponseBody,
  z.object({
    identityId: z.string().uuid(),
    identityType: IdentityType,
    roleName: SiloRole,
  })
)

/**
 * Policy for a particular resource
 *
 * Note that the Policy only describes access granted explicitly for this resource.  The policies of parent resources can also cause a user to have access to this resource.
 */
export const SiloRolePolicy = z.preprocess(
  processResponseBody,
  z.object({ roleAssignments: SiloRoleRoleAssignment.array() })
)

/**
 * An operator's view of a Sled.
 */
export const Sled = z.preprocess(
  processResponseBody,
  z.object({
    baseboard: Baseboard,
    id: z.string().uuid(),
    rackId: z.string().uuid(),
    timeCreated: z.coerce.date(),
    timeModified: z.coerce.date(),
    usableHardwareThreads: z.number().min(0).max(4294967295),
    usablePhysicalRam: ByteCount,
  })
)

/**
 * A single page of results
 */
export const SledResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: Sled.array(), nextPage: z.string().optional() })
)

export const SnapshotState = z.preprocess(
  processResponseBody,
  z.enum(['creating', 'ready', 'faulted', 'destroyed'])
)

/**
 * View of a Snapshot
 */
export const Snapshot = z.preprocess(
  processResponseBody,
  z.object({
    description: z.string(),
    diskId: z.string().uuid(),
    id: z.string().uuid(),
    name: Name,
    projectId: z.string().uuid(),
    size: ByteCount,
    state: SnapshotState,
    timeCreated: z.coerce.date(),
    timeModified: z.coerce.date(),
  })
)

/**
 * Create-time parameters for a `Snapshot`
 */
export const SnapshotCreate = z.preprocess(
  processResponseBody,
  z.object({ description: z.string(), disk: Name, name: Name })
)

/**
 * A single page of results
 */
export const SnapshotResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: Snapshot.array(), nextPage: z.string().optional() })
)

export const SpoofLoginBody = z.preprocess(
  processResponseBody,
  z.object({ username: z.string() })
)

/**
 * View of an SSH Key
 */
export const SshKey = z.preprocess(
  processResponseBody,
  z.object({
    description: z.string(),
    id: z.string().uuid(),
    name: Name,
    publicKey: z.string(),
    siloUserId: z.string().uuid(),
    timeCreated: z.coerce.date(),
    timeModified: z.coerce.date(),
  })
)

/**
 * Create-time parameters for an `SshKey`
 */
export const SshKeyCreate = z.preprocess(
  processResponseBody,
  z.object({ description: z.string(), name: Name, publicKey: z.string() })
)

/**
 * A single page of results
 */
export const SshKeyResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: SshKey.array(), nextPage: z.string().optional() })
)

/**
 * Identity-related metadata that's included in "asset" public API objects (which generally have no name or description)
 */
export const SystemUpdate = z.preprocess(
  processResponseBody,
  z.object({
    id: z.string().uuid(),
    timeCreated: z.coerce.date(),
    timeModified: z.coerce.date(),
    version: SemverVersion,
  })
)

/**
 * A single page of results
 */
export const SystemUpdateResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: SystemUpdate.array(), nextPage: z.string().optional() })
)

export const SystemUpdateStart = z.preprocess(
  processResponseBody,
  z.object({ version: SemverVersion })
)

export const UpdateStatus = z.preprocess(
  processResponseBody,
  z.union([
    z.object({ status: z.enum(['updating']) }),
    z.object({ status: z.enum(['steady']) }),
  ])
)

export const VersionRange = z.preprocess(
  processResponseBody,
  z.object({ high: SemverVersion, low: SemverVersion })
)

export const SystemVersion = z.preprocess(
  processResponseBody,
  z.object({ status: UpdateStatus, versionRange: VersionRange })
)

/**
 * Identity-related metadata that's included in "asset" public API objects (which generally have no name or description)
 */
export const UpdateDeployment = z.preprocess(
  processResponseBody,
  z.object({
    id: z.string().uuid(),
    status: UpdateStatus,
    timeCreated: z.coerce.date(),
    timeModified: z.coerce.date(),
    version: SemverVersion,
  })
)

/**
 * A single page of results
 */
export const UpdateDeploymentResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: UpdateDeployment.array(), nextPage: z.string().optional() })
)

/**
 * Identity-related metadata that's included in "asset" public API objects (which generally have no name or description)
 */
export const UpdateableComponent = z.preprocess(
  processResponseBody,
  z.object({
    componentType: UpdateableComponentType,
    deviceId: z.string(),
    id: z.string().uuid(),
    status: UpdateStatus,
    systemVersion: SemverVersion,
    timeCreated: z.coerce.date(),
    timeModified: z.coerce.date(),
    version: SemverVersion,
  })
)

/**
 * A single page of results
 */
export const UpdateableComponentResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: UpdateableComponent.array(), nextPage: z.string().optional() })
)

/**
 * View of a User
 */
export const User = z.preprocess(
  processResponseBody,
  z.object({ displayName: z.string(), id: z.string().uuid(), siloId: z.string().uuid() })
)

/**
 * View of a Built-in User
 *
 * A Built-in User is explicitly created as opposed to being derived from an Identify Provider.
 */
export const UserBuiltin = z.preprocess(
  processResponseBody,
  z.object({
    description: z.string(),
    id: z.string().uuid(),
    name: Name,
    timeCreated: z.coerce.date(),
    timeModified: z.coerce.date(),
  })
)

/**
 * A single page of results
 */
export const UserBuiltinResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: UserBuiltin.array(), nextPage: z.string().optional() })
)

/**
 * A name unique within the parent collection
 *
 * Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. Names cannot be a UUID though they may contain a UUID.
 */
export const UserId = z.preprocess(
  processResponseBody,
  z
    .string()
    .min(1)
    .max(63)
    .regex(
      /^(?![0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$)^[a-z][a-z0-9-]*[a-zA-Z0-9]*$/
    )
)

/**
 * Parameters for setting a user's password
 */
export const UserPassword = z.preprocess(
  processResponseBody,
  z.union([
    z.object({ details: Password, userPasswordValue: z.enum(['password']) }),
    z.object({ userPasswordValue: z.enum(['invalid_password']) }),
  ])
)

/**
 * Create-time parameters for a `User`
 */
export const UserCreate = z.preprocess(
  processResponseBody,
  z.object({ externalId: UserId, password: UserPassword })
)

/**
 * A single page of results
 */
export const UserResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: User.array(), nextPage: z.string().optional() })
)

/**
 * Credentials for local user login
 */
export const UsernamePasswordCredentials = z.preprocess(
  processResponseBody,
  z.object({ password: Password, username: UserId })
)

/**
 * View of a VPC
 */
export const Vpc = z.preprocess(
  processResponseBody,
  z.object({
    description: z.string(),
    dnsName: Name,
    id: z.string().uuid(),
    ipv6Prefix: Ipv6Net,
    name: Name,
    projectId: z.string().uuid(),
    systemRouterId: z.string().uuid(),
    timeCreated: z.coerce.date(),
    timeModified: z.coerce.date(),
  })
)

/**
 * Create-time parameters for a `Vpc`
 */
export const VpcCreate = z.preprocess(
  processResponseBody,
  z.object({
    description: z.string(),
    dnsName: Name,
    ipv6Prefix: Ipv6Net.optional(),
    name: Name,
  })
)

export const VpcFirewallRuleAction = z.preprocess(
  processResponseBody,
  z.enum(['allow', 'deny'])
)

export const VpcFirewallRuleDirection = z.preprocess(
  processResponseBody,
  z.enum(['inbound', 'outbound'])
)

/**
 * The `VpcFirewallRuleHostFilter` is used to filter traffic on the basis of its source or destination host.
 */
export const VpcFirewallRuleHostFilter = z.preprocess(
  processResponseBody,
  z.union([
    z.object({ type: z.enum(['vpc']), value: Name }),
    z.object({ type: z.enum(['subnet']), value: Name }),
    z.object({ type: z.enum(['instance']), value: Name }),
    z.object({ type: z.enum(['ip']), value: z.string() }),
    z.object({ type: z.enum(['ip_net']), value: IpNet }),
  ])
)

/**
 * The protocols that may be specified in a firewall rule's filter
 */
export const VpcFirewallRuleProtocol = z.preprocess(
  processResponseBody,
  z.enum(['TCP', 'UDP', 'ICMP'])
)

/**
 * Filter for a firewall rule. A given packet must match every field that is present for the rule to apply to it. A packet matches a field if any entry in that field matches the packet.
 */
export const VpcFirewallRuleFilter = z.preprocess(
  processResponseBody,
  z.object({
    hosts: VpcFirewallRuleHostFilter.array().optional(),
    ports: L4PortRange.array().optional(),
    protocols: VpcFirewallRuleProtocol.array().optional(),
  })
)

export const VpcFirewallRuleStatus = z.preprocess(
  processResponseBody,
  z.enum(['disabled', 'enabled'])
)

/**
 * A `VpcFirewallRuleTarget` is used to specify the set of `Instance`s to which a firewall rule applies.
 */
export const VpcFirewallRuleTarget = z.preprocess(
  processResponseBody,
  z.union([
    z.object({ type: z.enum(['vpc']), value: Name }),
    z.object({ type: z.enum(['subnet']), value: Name }),
    z.object({ type: z.enum(['instance']), value: Name }),
    z.object({ type: z.enum(['ip']), value: z.string() }),
    z.object({ type: z.enum(['ip_net']), value: IpNet }),
  ])
)

/**
 * A single rule in a VPC firewall
 */
export const VpcFirewallRule = z.preprocess(
  processResponseBody,
  z.object({
    action: VpcFirewallRuleAction,
    description: z.string(),
    direction: VpcFirewallRuleDirection,
    filters: VpcFirewallRuleFilter,
    id: z.string().uuid(),
    name: Name,
    priority: z.number().min(0).max(65535),
    status: VpcFirewallRuleStatus,
    targets: VpcFirewallRuleTarget.array(),
    timeCreated: z.coerce.date(),
    timeModified: z.coerce.date(),
    vpcId: z.string().uuid(),
  })
)

/**
 * A single rule in a VPC firewall
 */
export const VpcFirewallRuleUpdate = z.preprocess(
  processResponseBody,
  z.object({
    action: VpcFirewallRuleAction,
    description: z.string(),
    direction: VpcFirewallRuleDirection,
    filters: VpcFirewallRuleFilter,
    name: Name,
    priority: z.number().min(0).max(65535),
    status: VpcFirewallRuleStatus,
    targets: VpcFirewallRuleTarget.array(),
  })
)

/**
 * Updateable properties of a `Vpc`'s firewall Note that VpcFirewallRules are implicitly created along with a Vpc, so there is no explicit creation.
 */
export const VpcFirewallRuleUpdateParams = z.preprocess(
  processResponseBody,
  z.object({ rules: VpcFirewallRuleUpdate.array() })
)

/**
 * Collection of a Vpc's firewall rules
 */
export const VpcFirewallRules = z.preprocess(
  processResponseBody,
  z.object({ rules: VpcFirewallRule.array() })
)

/**
 * A single page of results
 */
export const VpcResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: Vpc.array(), nextPage: z.string().optional() })
)

export const VpcRouterKind = z.preprocess(processResponseBody, z.enum(['system', 'custom']))

/**
 * A VPC router defines a series of rules that indicate where traffic should be sent depending on its destination.
 */
export const VpcRouter = z.preprocess(
  processResponseBody,
  z.object({
    description: z.string(),
    id: z.string().uuid(),
    kind: VpcRouterKind,
    name: Name,
    timeCreated: z.coerce.date(),
    timeModified: z.coerce.date(),
    vpcId: z.string().uuid(),
  })
)

/**
 * Create-time parameters for a `VpcRouter`
 */
export const VpcRouterCreate = z.preprocess(
  processResponseBody,
  z.object({ description: z.string(), name: Name })
)

/**
 * A single page of results
 */
export const VpcRouterResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: VpcRouter.array(), nextPage: z.string().optional() })
)

/**
 * Updateable properties of a `VpcRouter`
 */
export const VpcRouterUpdate = z.preprocess(
  processResponseBody,
  z.object({ description: z.string().optional(), name: Name.optional() })
)

/**
 * A VPC subnet represents a logical grouping for instances that allows network traffic between them, within a IPv4 subnetwork or optionall an IPv6 subnetwork.
 */
export const VpcSubnet = z.preprocess(
  processResponseBody,
  z.object({
    description: z.string(),
    id: z.string().uuid(),
    ipv4Block: Ipv4Net,
    ipv6Block: Ipv6Net,
    name: Name,
    timeCreated: z.coerce.date(),
    timeModified: z.coerce.date(),
    vpcId: z.string().uuid(),
  })
)

/**
 * Create-time parameters for a `VpcSubnet`
 */
export const VpcSubnetCreate = z.preprocess(
  processResponseBody,
  z.object({
    description: z.string(),
    ipv4Block: Ipv4Net,
    ipv6Block: Ipv6Net.optional(),
    name: Name,
  })
)

/**
 * A single page of results
 */
export const VpcSubnetResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: VpcSubnet.array(), nextPage: z.string().optional() })
)

/**
 * Updateable properties of a `VpcSubnet`
 */
export const VpcSubnetUpdate = z.preprocess(
  processResponseBody,
  z.object({ description: z.string().optional(), name: Name.optional() })
)

/**
 * Updateable properties of a `Vpc`
 */
export const VpcUpdate = z.preprocess(
  processResponseBody,
  z.object({
    description: z.string().optional(),
    dnsName: Name.optional(),
    name: Name.optional(),
  })
)

/**
 * Supported set of sort modes for scanning by name or id
 */
export const NameOrIdSortMode = z.preprocess(
  processResponseBody,
  z.enum(['name_ascending', 'name_descending', 'id_ascending'])
)

export const DiskMetricName = z.preprocess(
  processResponseBody,
  z.enum(['activated', 'flush', 'read', 'read_bytes', 'write', 'write_bytes'])
)

/**
 * Supported set of sort modes for scanning by id only.
 *
 * Currently, we only support scanning in ascending order.
 */
export const IdSortMode = z.preprocess(processResponseBody, z.enum(['id_ascending']))

export const SystemMetricName = z.preprocess(
  processResponseBody,
  z.enum(['virtual_disk_space_provisioned', 'cpus_provisioned', 'ram_provisioned'])
)

/**
 * Supported set of sort modes for scanning by name only
 *
 * Currently, we only support scanning in ascending order.
 */
export const NameSortMode = z.preprocess(processResponseBody, z.enum(['name_ascending']))

export const DeviceAuthRequestParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({}),
  })
)

export const DeviceAuthConfirmParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({}),
  })
)

export const DeviceAccessTokenParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({}),
  })
)

export const LoginSpoofParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({}),
  })
)

export const LoginLocalParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      siloName: Name,
    }),
    query: z.object({}),
  })
)

export const LoginSamlBeginParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      providerName: Name,
      siloName: Name,
    }),
    query: z.object({}),
  })
)

export const LoginSamlParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      providerName: Name,
      siloName: Name,
    }),
    query: z.object({}),
  })
)

export const LogoutParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({}),
  })
)

export const DiskListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      project: NameOrId.optional(),
      sortBy: NameOrIdSortMode.optional(),
    }),
  })
)

export const DiskCreateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      project: NameOrId.optional(),
    }),
  })
)

export const DiskViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      disk: NameOrId,
    }),
    query: z.object({
      project: NameOrId.optional(),
    }),
  })
)

export const DiskDeleteParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      disk: NameOrId,
    }),
    query: z.object({
      project: NameOrId.optional(),
    }),
  })
)

export const DiskBulkWriteImportParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      disk: NameOrId,
    }),
    query: z.object({
      project: NameOrId.optional(),
    }),
  })
)

export const DiskBulkWriteImportStartParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      disk: NameOrId,
    }),
    query: z.object({
      project: NameOrId.optional(),
    }),
  })
)

export const DiskBulkWriteImportStopParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      disk: NameOrId,
    }),
    query: z.object({
      project: NameOrId.optional(),
    }),
  })
)

export const DiskFinalizeImportParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      disk: NameOrId,
    }),
    query: z.object({
      project: NameOrId.optional(),
    }),
  })
)

export const DiskImportBlocksFromUrlParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      disk: NameOrId,
    }),
    query: z.object({
      project: NameOrId.optional(),
    }),
  })
)

export const DiskMetricsListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      disk: NameOrId,
      metric: DiskMetricName,
    }),
    query: z.object({
      endTime: z.coerce.date().optional(),
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      startTime: z.coerce.date().optional(),
      project: NameOrId.optional(),
    }),
  })
)

export const GroupListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      sortBy: IdSortMode.optional(),
    }),
  })
)

export const GroupViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      group: z.string().uuid(),
    }),
    query: z.object({}),
  })
)

export const ImageListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      includeSiloImages: SafeBoolean.optional(),
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      project: NameOrId.optional(),
      sortBy: NameOrIdSortMode.optional(),
    }),
  })
)

export const ImageCreateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      project: NameOrId.optional(),
    }),
  })
)

export const ImageViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      image: NameOrId,
    }),
    query: z.object({
      project: NameOrId.optional(),
    }),
  })
)

export const ImageDeleteParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      image: NameOrId,
    }),
    query: z.object({
      project: NameOrId.optional(),
    }),
  })
)

export const ImagePromoteParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      image: NameOrId,
    }),
    query: z.object({
      project: NameOrId.optional(),
    }),
  })
)

export const InstanceListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      project: NameOrId.optional(),
      sortBy: NameOrIdSortMode.optional(),
    }),
  })
)

export const InstanceCreateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      project: NameOrId.optional(),
    }),
  })
)

export const InstanceViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      instance: NameOrId,
    }),
    query: z.object({
      project: NameOrId.optional(),
    }),
  })
)

export const InstanceDeleteParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      instance: NameOrId,
    }),
    query: z.object({
      project: NameOrId.optional(),
    }),
  })
)

export const InstanceDiskListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      instance: NameOrId,
    }),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      project: NameOrId.optional(),
      sortBy: NameOrIdSortMode.optional(),
    }),
  })
)

export const InstanceDiskAttachParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      instance: NameOrId,
    }),
    query: z.object({
      project: NameOrId.optional(),
    }),
  })
)

export const InstanceDiskDetachParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      instance: NameOrId,
    }),
    query: z.object({
      project: NameOrId.optional(),
    }),
  })
)

export const InstanceExternalIpListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      instance: NameOrId,
    }),
    query: z.object({
      project: NameOrId.optional(),
    }),
  })
)

export const InstanceMigrateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      instance: NameOrId,
    }),
    query: z.object({
      project: NameOrId.optional(),
    }),
  })
)

export const InstanceRebootParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      instance: NameOrId,
    }),
    query: z.object({
      project: NameOrId.optional(),
    }),
  })
)

export const InstanceSerialConsoleParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      instance: NameOrId,
    }),
    query: z.object({
      fromStart: z.number().min(0).optional(),
      maxBytes: z.number().min(0).optional(),
      mostRecent: z.number().min(0).optional(),
      project: NameOrId.optional(),
    }),
  })
)

export const InstanceSerialConsoleStreamParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      instance: NameOrId,
    }),
    query: z.object({
      fromStart: z.number().min(0).optional(),
      maxBytes: z.number().min(0).optional(),
      mostRecent: z.number().min(0).optional(),
      project: NameOrId.optional(),
    }),
  })
)

export const InstanceStartParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      instance: NameOrId,
    }),
    query: z.object({
      project: NameOrId.optional(),
    }),
  })
)

export const InstanceStopParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      instance: NameOrId,
    }),
    query: z.object({
      project: NameOrId.optional(),
    }),
  })
)

export const CurrentUserViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({}),
  })
)

export const CurrentUserGroupsParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      sortBy: IdSortMode.optional(),
    }),
  })
)

export const CurrentUserSshKeyListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      sortBy: NameOrIdSortMode.optional(),
    }),
  })
)

export const CurrentUserSshKeyCreateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({}),
  })
)

export const CurrentUserSshKeyViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      sshKey: NameOrId,
    }),
    query: z.object({}),
  })
)

export const CurrentUserSshKeyDeleteParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      sshKey: NameOrId,
    }),
    query: z.object({}),
  })
)

export const InstanceNetworkInterfaceListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      instance: NameOrId.optional(),
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      project: NameOrId.optional(),
      sortBy: NameOrIdSortMode.optional(),
    }),
  })
)

export const InstanceNetworkInterfaceCreateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      instance: NameOrId.optional(),
      project: NameOrId.optional(),
    }),
  })
)

export const InstanceNetworkInterfaceViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      interface: NameOrId,
    }),
    query: z.object({
      instance: NameOrId.optional(),
      project: NameOrId.optional(),
    }),
  })
)

export const InstanceNetworkInterfaceUpdateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      interface: NameOrId,
    }),
    query: z.object({
      instance: NameOrId.optional(),
      project: NameOrId.optional(),
    }),
  })
)

export const InstanceNetworkInterfaceDeleteParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      interface: NameOrId,
    }),
    query: z.object({
      instance: NameOrId.optional(),
      project: NameOrId.optional(),
    }),
  })
)

export const PolicyViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({}),
  })
)

export const PolicyUpdateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({}),
  })
)

export const ProjectListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      sortBy: NameOrIdSortMode.optional(),
    }),
  })
)

export const ProjectCreateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({}),
  })
)

export const ProjectViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      project: NameOrId,
    }),
    query: z.object({}),
  })
)

export const ProjectUpdateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      project: NameOrId,
    }),
    query: z.object({}),
  })
)

export const ProjectDeleteParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      project: NameOrId,
    }),
    query: z.object({}),
  })
)

export const ProjectPolicyViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      project: NameOrId,
    }),
    query: z.object({}),
  })
)

export const ProjectPolicyUpdateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      project: NameOrId,
    }),
    query: z.object({}),
  })
)

export const SnapshotListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      project: NameOrId.optional(),
      sortBy: NameOrIdSortMode.optional(),
    }),
  })
)

export const SnapshotCreateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      project: NameOrId.optional(),
    }),
  })
)

export const SnapshotViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      snapshot: NameOrId,
    }),
    query: z.object({
      project: NameOrId.optional(),
    }),
  })
)

export const SnapshotDeleteParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      snapshot: NameOrId,
    }),
    query: z.object({
      project: NameOrId.optional(),
    }),
  })
)

export const CertificateListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      sortBy: NameOrIdSortMode.optional(),
    }),
  })
)

export const CertificateCreateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({}),
  })
)

export const CertificateViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      certificate: NameOrId,
    }),
    query: z.object({}),
  })
)

export const CertificateDeleteParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      certificate: NameOrId,
    }),
    query: z.object({}),
  })
)

export const PhysicalDiskListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      sortBy: IdSortMode.optional(),
    }),
  })
)

export const RackListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      sortBy: IdSortMode.optional(),
    }),
  })
)

export const RackViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      rackId: z.string().uuid(),
    }),
    query: z.object({}),
  })
)

export const SledListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      sortBy: IdSortMode.optional(),
    }),
  })
)

export const SledViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      sledId: z.string().uuid(),
    }),
    query: z.object({}),
  })
)

export const SledPhysicalDiskListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      sledId: z.string().uuid(),
    }),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      sortBy: IdSortMode.optional(),
    }),
  })
)

export const SiloIdentityProviderListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      silo: NameOrId.optional(),
      sortBy: NameOrIdSortMode.optional(),
    }),
  })
)

export const LocalIdpUserCreateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      silo: NameOrId.optional(),
    }),
  })
)

export const LocalIdpUserDeleteParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      userId: z.string().uuid(),
    }),
    query: z.object({
      silo: NameOrId.optional(),
    }),
  })
)

export const LocalIdpUserSetPasswordParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      userId: z.string().uuid(),
    }),
    query: z.object({
      silo: NameOrId.optional(),
    }),
  })
)

export const SamlIdentityProviderCreateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      silo: NameOrId.optional(),
    }),
  })
)

export const SamlIdentityProviderViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      provider: NameOrId,
    }),
    query: z.object({
      silo: NameOrId.optional(),
    }),
  })
)

export const IpPoolListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      sortBy: NameOrIdSortMode.optional(),
    }),
  })
)

export const IpPoolCreateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({}),
  })
)

export const IpPoolViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      pool: NameOrId,
    }),
    query: z.object({}),
  })
)

export const IpPoolUpdateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      pool: NameOrId,
    }),
    query: z.object({}),
  })
)

export const IpPoolDeleteParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      pool: NameOrId,
    }),
    query: z.object({}),
  })
)

export const IpPoolRangeListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      pool: NameOrId,
    }),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
    }),
  })
)

export const IpPoolRangeAddParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      pool: NameOrId,
    }),
    query: z.object({}),
  })
)

export const IpPoolRangeRemoveParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      pool: NameOrId,
    }),
    query: z.object({}),
  })
)

export const IpPoolServiceViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({}),
  })
)

export const IpPoolServiceRangeListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
    }),
  })
)

export const IpPoolServiceRangeAddParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({}),
  })
)

export const IpPoolServiceRangeRemoveParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({}),
  })
)

export const SystemMetricParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      metricName: SystemMetricName,
    }),
    query: z.object({
      endTime: z.coerce.date().optional(),
      id: z.string().uuid().optional(),
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      startTime: z.coerce.date().optional(),
    }),
  })
)

export const SystemPolicyViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({}),
  })
)

export const SystemPolicyUpdateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({}),
  })
)

export const RoleListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
    }),
  })
)

export const RoleViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      roleName: z.string(),
    }),
    query: z.object({}),
  })
)

export const SiloListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      sortBy: NameOrIdSortMode.optional(),
    }),
  })
)

export const SiloCreateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({}),
  })
)

export const SiloViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      silo: NameOrId,
    }),
    query: z.object({}),
  })
)

export const SiloDeleteParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      silo: NameOrId,
    }),
    query: z.object({}),
  })
)

export const SiloPolicyViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      silo: NameOrId,
    }),
    query: z.object({}),
  })
)

export const SiloPolicyUpdateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      silo: NameOrId,
    }),
    query: z.object({}),
  })
)

export const SystemComponentVersionListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      sortBy: IdSortMode.optional(),
    }),
  })
)

export const UpdateDeploymentsListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      sortBy: IdSortMode.optional(),
    }),
  })
)

export const UpdateDeploymentViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      id: z.string().uuid(),
    }),
    query: z.object({}),
  })
)

export const SystemUpdateRefreshParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({}),
  })
)

export const SystemUpdateStartParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({}),
  })
)

export const SystemUpdateStopParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({}),
  })
)

export const SystemUpdateListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      sortBy: IdSortMode.optional(),
    }),
  })
)

export const SystemUpdateViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      version: SemverVersion,
    }),
    query: z.object({}),
  })
)

export const SystemUpdateComponentsListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      version: SemverVersion,
    }),
    query: z.object({}),
  })
)

export const SystemVersionParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({}),
  })
)

export const SiloUserListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      silo: NameOrId.optional(),
      sortBy: IdSortMode.optional(),
    }),
  })
)

export const SiloUserViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      userId: z.string().uuid(),
    }),
    query: z.object({
      silo: NameOrId.optional(),
    }),
  })
)

export const UserBuiltinListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      sortBy: NameSortMode.optional(),
    }),
  })
)

export const UserBuiltinViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      user: NameOrId,
    }),
    query: z.object({}),
  })
)

export const UserListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      group: z.string().uuid().optional(),
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      sortBy: IdSortMode.optional(),
    }),
  })
)

export const VpcFirewallRulesViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      project: NameOrId.optional(),
      vpc: NameOrId.optional(),
    }),
  })
)

export const VpcFirewallRulesUpdateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      project: NameOrId.optional(),
      vpc: NameOrId.optional(),
    }),
  })
)

export const VpcRouterRouteListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      project: NameOrId.optional(),
      router: NameOrId.optional(),
      sortBy: NameOrIdSortMode.optional(),
      vpc: NameOrId.optional(),
    }),
  })
)

export const VpcRouterRouteCreateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      project: NameOrId.optional(),
      router: NameOrId.optional(),
      vpc: NameOrId.optional(),
    }),
  })
)

export const VpcRouterRouteViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      route: NameOrId,
    }),
    query: z.object({
      project: NameOrId.optional(),
      router: NameOrId.optional(),
      vpc: NameOrId.optional(),
    }),
  })
)

export const VpcRouterRouteUpdateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      route: NameOrId,
    }),
    query: z.object({
      project: NameOrId.optional(),
      router: NameOrId.optional(),
      vpc: NameOrId.optional(),
    }),
  })
)

export const VpcRouterRouteDeleteParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      route: NameOrId,
    }),
    query: z.object({
      project: NameOrId.optional(),
      router: NameOrId.optional(),
      vpc: NameOrId.optional(),
    }),
  })
)

export const VpcRouterListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      project: NameOrId.optional(),
      sortBy: NameOrIdSortMode.optional(),
      vpc: NameOrId.optional(),
    }),
  })
)

export const VpcRouterCreateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      project: NameOrId.optional(),
      vpc: NameOrId.optional(),
    }),
  })
)

export const VpcRouterViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      router: NameOrId,
    }),
    query: z.object({
      project: NameOrId.optional(),
      vpc: NameOrId.optional(),
    }),
  })
)

export const VpcRouterUpdateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      router: NameOrId,
    }),
    query: z.object({
      project: NameOrId.optional(),
      vpc: NameOrId.optional(),
    }),
  })
)

export const VpcRouterDeleteParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      router: NameOrId,
    }),
    query: z.object({
      project: NameOrId.optional(),
      vpc: NameOrId.optional(),
    }),
  })
)

export const VpcSubnetListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      project: NameOrId.optional(),
      sortBy: NameOrIdSortMode.optional(),
      vpc: NameOrId.optional(),
    }),
  })
)

export const VpcSubnetCreateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      project: NameOrId.optional(),
      vpc: NameOrId.optional(),
    }),
  })
)

export const VpcSubnetViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      subnet: NameOrId,
    }),
    query: z.object({
      project: NameOrId.optional(),
      vpc: NameOrId.optional(),
    }),
  })
)

export const VpcSubnetUpdateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      subnet: NameOrId,
    }),
    query: z.object({
      project: NameOrId.optional(),
      vpc: NameOrId.optional(),
    }),
  })
)

export const VpcSubnetDeleteParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      subnet: NameOrId,
    }),
    query: z.object({
      project: NameOrId.optional(),
      vpc: NameOrId.optional(),
    }),
  })
)

export const VpcSubnetListNetworkInterfacesParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      subnet: NameOrId,
    }),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      project: NameOrId.optional(),
      sortBy: NameOrIdSortMode.optional(),
      vpc: NameOrId.optional(),
    }),
  })
)

export const VpcListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      project: NameOrId.optional(),
      sortBy: NameOrIdSortMode.optional(),
    }),
  })
)

export const VpcCreateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      project: NameOrId.optional(),
    }),
  })
)

export const VpcViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      vpc: NameOrId,
    }),
    query: z.object({
      project: NameOrId.optional(),
    }),
  })
)

export const VpcUpdateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      vpc: NameOrId,
    }),
    query: z.object({
      project: NameOrId.optional(),
    }),
  })
)

export const VpcDeleteParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      vpc: NameOrId,
    }),
    query: z.object({
      project: NameOrId.optional(),
    }),
  })
)
