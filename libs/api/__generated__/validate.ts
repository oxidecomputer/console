/* eslint-disable */
import { ZodType, z } from 'zod'

const DateType = z.preprocess((arg) => {
  if (typeof arg == 'string' || arg instanceof Date) return new Date(arg)
}, z.date())
type DateType = z.infer<typeof DateType>

/**
 * Zod only supports string enums at the moment. A previous issue was opened
 * and closed as stale but it provided a hint on how to implement it.
 *
 * @see https://github.com/colinhacks/zod/issues/1118
 * TODO: PR an update for zod to support other native enum types
 */
const IntEnum = <T extends readonly number[]>(values: T) =>
  z.number().refine((v) => values.includes(v)) as ZodType<T[number]>

/**
 * A type storing a range over `T`.
 *
 * This type supports ranges similar to the `RangeTo`, `Range` and `RangeFrom` types in the standard library. Those cover `(..end)`, `(start..end)`, and `(start..)` respectively.
 */
export const BinRangedouble = z.union([
  z.object({ end: z.number(), type: z.enum(['range_to']) }),
  z.object({ end: z.number(), start: z.number(), type: z.enum(['range']) }),
  z.object({ start: z.number(), type: z.enum(['range_from']) }),
])

/**
 * A type storing a range over `T`.
 *
 * This type supports ranges similar to the `RangeTo`, `Range` and `RangeFrom` types in the standard library. Those cover `(..end)`, `(start..end)`, and `(start..)` respectively.
 */
export const BinRangeint64 = z.union([
  z.object({ end: z.number(), type: z.enum(['range_to']) }),
  z.object({ end: z.number(), start: z.number(), type: z.enum(['range']) }),
  z.object({ start: z.number(), type: z.enum(['range_from']) }),
])

/**
 * Type storing bin edges and a count of samples within it.
 */
export const Bindouble = z.object({ count: z.number().min(0), range: BinRangedouble })

/**
 * Type storing bin edges and a count of samples within it.
 */
export const Binint64 = z.object({ count: z.number().min(0), range: BinRangeint64 })

/**
 * disk block size in bytes
 */
export const BlockSize = IntEnum([512, 2048, 4096] as const)

/**
 * A count of bytes, typically used either for memory or storage capacity
 *
 * The maximum supported byte count is `i64::MAX`.  This makes it somewhat inconvenient to define constructors: a u32 constructor can be infallible, but an i64 constructor can fail (if the value is negative) and a u64 constructor can fail (if the value is larger than i64::MAX).  We provide all of these for consumers' convenience.
 */
export const ByteCount = z.number().min(0)

/**
 * A cumulative or counter data type.
 */
export const Cumulativedouble = z.object({ startTime: DateType, value: z.number() })

/**
 * A cumulative or counter data type.
 */
export const Cumulativeint64 = z.object({ startTime: DateType, value: z.number() })

/**
 * A simple type for managing a histogram metric.
 *
 * A histogram maintains the count of any number of samples, over a set of bins. Bins are specified on construction via their _left_ edges, inclusive. There can't be any "gaps" in the bins, and an additional bin may be added to the left, right, or both so that the bins extend to the entire range of the support.
 *
 * Note that any gaps, unsorted bins, or non-finite values will result in an error.
 *
 * Example ------- ```rust use oximeter::histogram::{BinRange, Histogram};
 *
 * let edges = [0i64, 10, 20]; let mut hist = Histogram::new(&edges).unwrap(); assert_eq!(hist.n_bins(), 4); // One additional bin for the range (20..) assert_eq!(hist.n_samples(), 0); hist.sample(4); hist.sample(100); assert_eq!(hist.n_samples(), 2);
 *
 * let data = hist.iter().collect::<Vec<_>>(); assert_eq!(data[0].range, BinRange::range(i64::MIN, 0)); // An additional bin for `..0` assert_eq!(data[0].count, 0); // Nothing is in this bin
 *
 * assert_eq!(data[1].range, BinRange::range(0, 10)); // The range `0..10` assert_eq!(data[1].count, 1); // 4 is sampled into this bin ```
 *
 * Notes -----
 *
 * Histograms may be constructed either from their left bin edges, or from a sequence of ranges. In either case, the left-most bin may be converted upon construction. In particular, if the left-most value is not equal to the minimum of the support, a new bin will be added from the minimum to that provided value. If the left-most value _is_ the support's minimum, because the provided bin was unbounded below, such as `(..0)`, then that bin will be converted into one bounded below, `(MIN..0)` in this case.
 *
 * The short of this is that, most of the time, it shouldn't matter. If one specifies the extremes of the support as their bins, be aware that the left-most may be converted from a `BinRange::RangeTo` into a `BinRange::Range`. In other words, the first bin of a histogram is _always_ a `Bin::Range` or a `Bin::RangeFrom` after construction. In fact, every bin is one of those variants, the `BinRange::RangeTo` is only provided as a convenience during construction.
 */
export const Histogramint64 = z.object({
  bins: Binint64.array(),
  nSamples: z.number().min(0),
  startTime: DateType,
})

/**
 * A simple type for managing a histogram metric.
 *
 * A histogram maintains the count of any number of samples, over a set of bins. Bins are specified on construction via their _left_ edges, inclusive. There can't be any "gaps" in the bins, and an additional bin may be added to the left, right, or both so that the bins extend to the entire range of the support.
 *
 * Note that any gaps, unsorted bins, or non-finite values will result in an error.
 *
 * Example ------- ```rust use oximeter::histogram::{BinRange, Histogram};
 *
 * let edges = [0i64, 10, 20]; let mut hist = Histogram::new(&edges).unwrap(); assert_eq!(hist.n_bins(), 4); // One additional bin for the range (20..) assert_eq!(hist.n_samples(), 0); hist.sample(4); hist.sample(100); assert_eq!(hist.n_samples(), 2);
 *
 * let data = hist.iter().collect::<Vec<_>>(); assert_eq!(data[0].range, BinRange::range(i64::MIN, 0)); // An additional bin for `..0` assert_eq!(data[0].count, 0); // Nothing is in this bin
 *
 * assert_eq!(data[1].range, BinRange::range(0, 10)); // The range `0..10` assert_eq!(data[1].count, 1); // 4 is sampled into this bin ```
 *
 * Notes -----
 *
 * Histograms may be constructed either from their left bin edges, or from a sequence of ranges. In either case, the left-most bin may be converted upon construction. In particular, if the left-most value is not equal to the minimum of the support, a new bin will be added from the minimum to that provided value. If the left-most value _is_ the support's minimum, because the provided bin was unbounded below, such as `(..0)`, then that bin will be converted into one bounded below, `(MIN..0)` in this case.
 *
 * The short of this is that, most of the time, it shouldn't matter. If one specifies the extremes of the support as their bins, be aware that the left-most may be converted from a `BinRange::RangeTo` into a `BinRange::Range`. In other words, the first bin of a histogram is _always_ a `Bin::Range` or a `Bin::RangeFrom` after construction. In fact, every bin is one of those variants, the `BinRange::RangeTo` is only provided as a convenience during construction.
 */
export const Histogramdouble = z.object({
  bins: Bindouble.array(),
  nSamples: z.number().min(0),
  startTime: DateType,
})

/**
 * A `Datum` is a single sampled data point from a metric.
 */
export const Datum = z.union([
  z.object({ datum: z.boolean(), type: z.enum(['bool']) }),
  z.object({ datum: z.number(), type: z.enum(['i64']) }),
  z.object({ datum: z.number(), type: z.enum(['f64']) }),
  z.object({ datum: z.string(), type: z.enum(['string']) }),
  z.object({ datum: z.number().min(0).max(255).array(), type: z.enum(['bytes']) }),
  z.object({ datum: Cumulativeint64, type: z.enum(['cumulative_i64']) }),
  z.object({ datum: Cumulativedouble, type: z.enum(['cumulative_f64']) }),
  z.object({ datum: Histogramint64, type: z.enum(['histogram_i64']) }),
  z.object({ datum: Histogramdouble, type: z.enum(['histogram_f64']) }),
])

/**
 * The type of an individual datum of a metric.
 */
export const DatumType = z.enum([
  'bool',
  'i64',
  'f64',
  'string',
  'bytes',
  'cumulative_i64',
  'cumulative_f64',
  'histogram_i64',
  'histogram_f64',
])

export const DerEncodedKeyPair = z.object({
  privateKey: z.string(),
  publicCert: z.string(),
})

export const DeviceAccessTokenRequest = z.object({
  clientId: z.string().uuid(),
  deviceCode: z.string(),
  grantType: z.string(),
})

export const DeviceAuthRequest = z.object({ clientId: z.string().uuid() })

export const DeviceAuthVerify = z.object({ userCode: z.string() })

export const Digest = z.object({ type: z.enum(['sha256']), value: z.string() })

/**
 * A name unique within the parent collection
 *
 * Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. Names cannot be a UUID though they may contain a UUID.
 */
export const Name = z
  .string()
  .max(63)
  .regex(
    /^(?![0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$)^[a-z][a-z0-9-]*[a-zA-Z0-9]$/
  )

/**
 * State of a Disk (primarily: attached or not)
 */
export const DiskState = z.union([
  z.object({ state: z.enum(['creating']) }),
  z.object({ state: z.enum(['detached']) }),
  z.object({ instance: z.string().uuid(), state: z.enum(['attaching']) }),
  z.object({ instance: z.string().uuid(), state: z.enum(['attached']) }),
  z.object({ instance: z.string().uuid(), state: z.enum(['detaching']) }),
  z.object({ state: z.enum(['destroyed']) }),
  z.object({ state: z.enum(['faulted']) }),
])

/**
 * Client view of a {@link Disk}
 */
export const Disk = z.object({
  blockSize: ByteCount,
  description: z.string(),
  devicePath: z.string(),
  id: z.string().uuid(),
  imageId: z.string().uuid().nullable().optional(),
  name: Name,
  projectId: z.string().uuid(),
  size: ByteCount,
  snapshotId: z.string().uuid().nullable().optional(),
  state: DiskState,
  timeCreated: DateType,
  timeModified: DateType,
})

/**
 * Different sources for a disk
 */
export const DiskSource = z.union([
  z.object({ blockSize: BlockSize, type: z.enum(['blank']) }),
  z.object({ snapshotId: z.string().uuid(), type: z.enum(['snapshot']) }),
  z.object({ imageId: z.string().uuid(), type: z.enum(['image']) }),
  z.object({ imageId: z.string().uuid(), type: z.enum(['global_image']) }),
])

/**
 * Create-time parameters for a {@link Disk}
 */
export const DiskCreate = z.object({
  description: z.string(),
  diskSource: DiskSource,
  name: Name,
  size: ByteCount,
})

/**
 * Parameters for the {@link Disk} to be attached or detached to an instance
 */
export const DiskIdentifier = z.object({ name: Name })

/**
 * A single page of results
 */
export const DiskResultsPage = z.object({
  items: Disk.array(),
  nextPage: z.string().nullable().optional(),
})

/**
 * OS image distribution
 */
export const Distribution = z.object({ name: Name, version: z.string() })

/**
 * Error information from a response.
 */
export const Error = z.object({
  errorCode: z.string().optional(),
  message: z.string(),
  requestId: z.string(),
})

/**
 * The kind of an external IP address for an instance
 */
export const IpKind = z.enum(['ephemeral', 'floating'])

export const ExternalIp = z.object({ ip: z.string(), kind: IpKind })

/**
 * Parameters for creating an external IP address for instances.
 */
export const ExternalIpCreate = z.object({
  poolName: Name.nullable().optional(),
  type: z.enum(['ephemeral']),
})

/**
 * A single page of results
 */
export const ExternalIpResultsPage = z.object({
  items: ExternalIp.array(),
  nextPage: z.string().nullable().optional(),
})

/**
 * The source from which a field is derived, the target or metric.
 */
export const FieldSource = z.enum(['target', 'metric'])

/**
 * The `FieldType` identifies the data type of a target or metric field.
 */
export const FieldType = z.enum(['string', 'i64', 'ip_addr', 'uuid', 'bool'])

/**
 * The name and type information for a field of a timeseries schema.
 */
export const FieldSchema = z.object({
  name: z.string(),
  source: FieldSource,
  ty: FieldType,
})

export const FleetRole = z.enum(['admin', 'collaborator', 'viewer'])

/**
 * Describes what kind of identity is described by an id
 */
export const IdentityType = z.enum(['silo_user', 'silo_group'])

/**
 * Describes the assignment of a particular role on a particular resource to a particular identity (user, group, etc.)
 *
 * The resource is not part of this structure.  Rather, `RoleAssignment`s are put into a `Policy` and that Policy is applied to a particular resource.
 */
export const FleetRoleRoleAssignment = z.object({
  identityId: z.string().uuid(),
  identityType: IdentityType,
  roleName: FleetRole,
})

/**
 * Client view of a `Policy`, which describes how this resource may be accessed
 *
 * Note that the Policy only describes access granted explicitly for this resource.  The policies of parent resources can also cause a user to have access to this resource.
 */
export const FleetRolePolicy = z.object({
  roleAssignments: FleetRoleRoleAssignment.array(),
})

/**
 * Client view of global Images
 */
export const GlobalImage = z.object({
  blockSize: ByteCount,
  description: z.string(),
  digest: Digest.nullable().optional(),
  distribution: z.string(),
  id: z.string().uuid(),
  name: Name,
  size: ByteCount,
  timeCreated: DateType,
  timeModified: DateType,
  url: z.string().nullable().optional(),
  version: z.string(),
})

/**
 * The source of the underlying image.
 */
export const ImageSource = z.union([
  z.object({ type: z.enum(['url']), url: z.string() }),
  z.object({ id: z.string().uuid(), type: z.enum(['snapshot']) }),
  z.object({ type: z.enum(['you_can_boot_anything_as_long_as_its_alpine']) }),
])

/**
 * Create-time parameters for an {@link GlobalImage}
 */
export const GlobalImageCreate = z.object({
  blockSize: BlockSize,
  description: z.string(),
  distribution: Distribution,
  name: Name,
  source: ImageSource,
})

/**
 * A single page of results
 */
export const GlobalImageResultsPage = z.object({
  items: GlobalImage.array(),
  nextPage: z.string().nullable().optional(),
})

export const IdentityProviderType = z.enum(['saml'])

/**
 * Client view of an {@link IdentityProvider}
 */
export const IdentityProvider = z.object({
  description: z.string(),
  id: z.string().uuid(),
  name: Name,
  providerType: IdentityProviderType,
  timeCreated: DateType,
  timeModified: DateType,
})

/**
 * A single page of results
 */
export const IdentityProviderResultsPage = z.object({
  items: IdentityProvider.array(),
  nextPage: z.string().nullable().optional(),
})

export const IdpMetadataSource = z.union([
  z.object({ type: z.enum(['url']), url: z.string() }),
  z.object({ data: z.string(), type: z.enum(['base64_encoded_xml']) }),
])

/**
 * Client view of project Images
 */
export const Image = z.object({
  blockSize: ByteCount,
  description: z.string(),
  digest: Digest.nullable().optional(),
  id: z.string().uuid(),
  name: Name,
  projectId: z.string().uuid(),
  size: ByteCount,
  timeCreated: DateType,
  timeModified: DateType,
  url: z.string().nullable().optional(),
  version: z.string().nullable().optional(),
})

/**
 * Create-time parameters for an {@link Image}
 */
export const ImageCreate = z.object({
  blockSize: BlockSize,
  description: z.string(),
  name: Name,
  source: ImageSource,
})

/**
 * A single page of results
 */
export const ImageResultsPage = z.object({
  items: Image.array(),
  nextPage: z.string().nullable().optional(),
})

/**
 * The number of CPUs in an Instance
 */
export const InstanceCpuCount = z.number().min(0).max(65535)

/**
 * Running state of an Instance (primarily: booted or stopped)
 *
 * This typically reflects whether it's starting, running, stopping, or stopped, but also includes states related to the Instance's lifecycle
 */
export const InstanceState = z.enum([
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

/**
 * Client view of an {@link Instance}
 */
export const Instance = z.object({
  description: z.string(),
  hostname: z.string(),
  id: z.string().uuid(),
  memory: ByteCount,
  name: Name,
  ncpus: InstanceCpuCount,
  projectId: z.string().uuid(),
  runState: InstanceState,
  timeCreated: DateType,
  timeModified: DateType,
  timeRunStateUpdated: DateType,
})

/**
 * Describe the instance's disks at creation time
 */
export const InstanceDiskAttachment = z.union([
  z.object({
    description: z.string(),
    diskSource: DiskSource,
    name: Name,
    size: ByteCount,
    type: z.enum(['create']),
  }),
  z.object({ name: Name, type: z.enum(['attach']) }),
])

/**
 * Create-time parameters for a {@link NetworkInterface}
 */
export const NetworkInterfaceCreate = z.object({
  description: z.string(),
  ip: z.string().nullable().optional(),
  name: Name,
  subnetName: Name,
  vpcName: Name,
})

/**
 * Describes an attachment of a `NetworkInterface` to an `Instance`, at the time the instance is created.
 */
export const InstanceNetworkInterfaceAttachment = z.union([
  z.object({ params: NetworkInterfaceCreate.array(), type: z.enum(['create']) }),
  z.object({ type: z.enum(['default']) }),
  z.object({ type: z.enum(['none']) }),
])

/**
 * Create-time parameters for an {@link Instance}
 */
export const InstanceCreate = z.object({
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
  start: z.boolean().default(true).optional(),
  userData: z.string().default('').optional(),
})

/**
 * Migration parameters for an {@link Instance}
 */
export const InstanceMigrate = z.object({ dstSledId: z.string().uuid() })

/**
 * A single page of results
 */
export const InstanceResultsPage = z.object({
  items: Instance.array(),
  nextPage: z.string().nullable().optional(),
})

/**
 * Contents of an Instance's serial console buffer.
 */
export const InstanceSerialConsoleData = z.object({
  data: z.number().min(0).max(255).array(),
  lastByteOffset: z.number().min(0),
})

/**
 * An IPv4 subnet
 *
 * An IPv4 subnet, including prefix and subnet mask
 */
export const Ipv4Net = z
  .string()
  .regex(
    /^(10\.([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\/([8-9]|1[0-9]|2[0-9]|3[0-2])|172\.(1[6-9]|2[0-9]|3[0-1])\.([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\/(1[2-9]|2[0-9]|3[0-2])|192\.168\.([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\/(1[6-9]|2[0-9]|3[0-2]))$/
  )

/**
 * An IPv6 subnet
 *
 * An IPv6 subnet, including prefix and subnet mask
 */
export const Ipv6Net = z
  .string()
  .regex(
    /^([fF][dD])[0-9a-fA-F]{2}:(([0-9a-fA-F]{1,4}:){6}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,6}:)\/([1-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8])$/
  )

export const IpNet = z.union([Ipv4Net, Ipv6Net])

/**
 * Identity-related metadata that's included in nearly all public API objects
 */
export const IpPool = z.object({
  description: z.string(),
  id: z.string().uuid(),
  name: Name,
  projectId: z.string().uuid().nullable().optional(),
  timeCreated: DateType,
  timeModified: DateType,
})

/**
 * Create-time parameters for an IP Pool.
 *
 * See {@link IpPool}
 */
export const IpPoolCreate = z.object({
  description: z.string(),
  name: Name,
  organization: Name.optional(),
  project: Name.optional(),
})

/**
 * A non-decreasing IPv4 address range, inclusive of both ends.
 *
 * The first address must be less than or equal to the last address.
 */
export const Ipv4Range = z.object({ first: z.string(), last: z.string() })

/**
 * A non-decreasing IPv6 address range, inclusive of both ends.
 *
 * The first address must be less than or equal to the last address.
 */
export const Ipv6Range = z.object({ first: z.string(), last: z.string() })

export const IpRange = z.union([Ipv4Range, Ipv6Range])

export const IpPoolRange = z.object({
  id: z.string().uuid(),
  range: IpRange,
  timeCreated: DateType,
})

/**
 * A single page of results
 */
export const IpPoolRangeResultsPage = z.object({
  items: IpPoolRange.array(),
  nextPage: z.string().nullable().optional(),
})

/**
 * A single page of results
 */
export const IpPoolResultsPage = z.object({
  items: IpPool.array(),
  nextPage: z.string().nullable().optional(),
})

/**
 * Parameters for updating an IP Pool
 */
export const IpPoolUpdate = z.object({
  description: z.string().nullable().optional(),
  name: Name.nullable().optional(),
})

/**
 * A range of IP ports
 *
 * An inclusive-inclusive range of IP ports. The second port may be omitted to represent a single port
 */
export const L4PortRange = z
  .string()
  .min(1)
  .max(11)
  .regex(/^[0-9]{1,5}(-[0-9]{1,5})?$/)

/**
 * A MAC address
 *
 * A Media Access Control address, in EUI-48 format
 */
export const MacAddr = z
  .string()
  .min(17)
  .max(17)
  .regex(/^([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$/)

/**
 * A `Measurement` is a timestamped datum from a single metric
 */
export const Measurement = z.object({ datum: Datum, timestamp: DateType })

/**
 * A single page of results
 */
export const MeasurementResultsPage = z.object({
  items: Measurement.array(),
  nextPage: z.string().nullable().optional(),
})

/**
 * A `NetworkInterface` represents a virtual network interface device.
 */
export const NetworkInterface = z.object({
  description: z.string(),
  id: z.string().uuid(),
  instanceId: z.string().uuid(),
  ip: z.string(),
  mac: MacAddr,
  name: Name,
  primary: z.boolean(),
  subnetId: z.string().uuid(),
  timeCreated: DateType,
  timeModified: DateType,
  vpcId: z.string().uuid(),
})

/**
 * A single page of results
 */
export const NetworkInterfaceResultsPage = z.object({
  items: NetworkInterface.array(),
  nextPage: z.string().nullable().optional(),
})

/**
 * Parameters for updating a {@link NetworkInterface}.
 *
 * Note that modifying IP addresses for an interface is not yet supported, a new interface must be created instead.
 */
export const NetworkInterfaceUpdate = z.object({
  description: z.string().nullable().optional(),
  name: Name.nullable().optional(),
  primary: z.boolean().default(false).optional(),
})

/**
 * Unique name for a saga `Node`
 *
 * Each node requires a string name that's unique within its DAG.  The name is used to identify its output.  Nodes that depend on a given node (either directly or indirectly) can access the node's output using its name.
 */
export const NodeName = z.string()

/**
 * Client view of an {@link Organization}
 */
export const Organization = z.object({
  description: z.string(),
  id: z.string().uuid(),
  name: Name,
  timeCreated: DateType,
  timeModified: DateType,
})

/**
 * Create-time parameters for an {@link Organization}
 */
export const OrganizationCreate = z.object({ description: z.string(), name: Name })

/**
 * A single page of results
 */
export const OrganizationResultsPage = z.object({
  items: Organization.array(),
  nextPage: z.string().nullable().optional(),
})

export const OrganizationRole = z.enum(['admin', 'collaborator', 'viewer'])

/**
 * Describes the assignment of a particular role on a particular resource to a particular identity (user, group, etc.)
 *
 * The resource is not part of this structure.  Rather, `RoleAssignment`s are put into a `Policy` and that Policy is applied to a particular resource.
 */
export const OrganizationRoleRoleAssignment = z.object({
  identityId: z.string().uuid(),
  identityType: IdentityType,
  roleName: OrganizationRole,
})

/**
 * Client view of a `Policy`, which describes how this resource may be accessed
 *
 * Note that the Policy only describes access granted explicitly for this resource.  The policies of parent resources can also cause a user to have access to this resource.
 */
export const OrganizationRolePolicy = z.object({
  roleAssignments: OrganizationRoleRoleAssignment.array(),
})

/**
 * Updateable properties of an {@link Organization}
 */
export const OrganizationUpdate = z.object({
  description: z.string().nullable().optional(),
  name: Name.nullable().optional(),
})

/**
 * Client view of a {@link Project}
 */
export const Project = z.object({
  description: z.string(),
  id: z.string().uuid(),
  name: Name,
  organizationId: z.string().uuid(),
  timeCreated: DateType,
  timeModified: DateType,
})

/**
 * Create-time parameters for a {@link Project}
 */
export const ProjectCreate = z.object({ description: z.string(), name: Name })

/**
 * A single page of results
 */
export const ProjectResultsPage = z.object({
  items: Project.array(),
  nextPage: z.string().nullable().optional(),
})

export const ProjectRole = z.enum(['admin', 'collaborator', 'viewer'])

/**
 * Describes the assignment of a particular role on a particular resource to a particular identity (user, group, etc.)
 *
 * The resource is not part of this structure.  Rather, `RoleAssignment`s are put into a `Policy` and that Policy is applied to a particular resource.
 */
export const ProjectRoleRoleAssignment = z.object({
  identityId: z.string().uuid(),
  identityType: IdentityType,
  roleName: ProjectRole,
})

/**
 * Client view of a `Policy`, which describes how this resource may be accessed
 *
 * Note that the Policy only describes access granted explicitly for this resource.  The policies of parent resources can also cause a user to have access to this resource.
 */
export const ProjectRolePolicy = z.object({
  roleAssignments: ProjectRoleRoleAssignment.array(),
})

/**
 * Updateable properties of a {@link Project}
 */
export const ProjectUpdate = z.object({
  description: z.string().nullable().optional(),
  name: Name.nullable().optional(),
})

/**
 * Client view of an {@link Rack}
 */
export const Rack = z.object({
  id: z.string().uuid(),
  timeCreated: DateType,
  timeModified: DateType,
})

/**
 * A single page of results
 */
export const RackResultsPage = z.object({
  items: Rack.array(),
  nextPage: z.string().nullable().optional(),
})

/**
 * A name for a built-in role
 *
 * Role names consist of two string components separated by dot (".").
 */
export const RoleName = z
  .string()
  .max(63)
  .regex(/[a-z-]+\.[a-z-]+/)

/**
 * Client view of a {@link Role}
 */
export const Role = z.object({ description: z.string(), name: RoleName })

/**
 * A single page of results
 */
export const RoleResultsPage = z.object({
  items: Role.array(),
  nextPage: z.string().nullable().optional(),
})

/**
 * A `RouteDestination` is used to match traffic with a routing rule, on the destination of that traffic.
 *
 * When traffic is to be sent to a destination that is within a given `RouteDestination`, the corresponding {@link RouterRoute} applies, and traffic will be forward to the {@link RouteTarget} for that rule.
 */
export const RouteDestination = z.union([
  z.object({ type: z.enum(['ip']), value: z.string() }),
  z.object({ type: z.enum(['ip_net']), value: IpNet }),
  z.object({ type: z.enum(['vpc']), value: Name }),
  z.object({ type: z.enum(['subnet']), value: Name }),
])

/**
 * A `RouteTarget` describes the possible locations that traffic matching a route destination can be sent.
 */
export const RouteTarget = z.union([
  z.object({ type: z.enum(['ip']), value: z.string() }),
  z.object({ type: z.enum(['vpc']), value: Name }),
  z.object({ type: z.enum(['subnet']), value: Name }),
  z.object({ type: z.enum(['instance']), value: Name }),
  z.object({ type: z.enum(['internet_gateway']), value: Name }),
])

/**
 * The classification of a {@link RouterRoute} as defined by the system. The kind determines certain attributes such as if the route is modifiable and describes how or where the route was created.
 *
 * See [RFD-21](https://rfd.shared.oxide.computer/rfd/0021#concept-router) for more context
 */
export const RouterRouteKind = z.enum(['default', 'vpc_subnet', 'vpc_peering', 'custom'])

/**
 * A route defines a rule that governs where traffic should be sent based on its destination.
 */
export const RouterRoute = z.object({
  description: z.string(),
  destination: RouteDestination,
  id: z.string().uuid(),
  kind: RouterRouteKind,
  name: Name,
  target: RouteTarget,
  timeCreated: DateType,
  timeModified: DateType,
  vpcRouterId: z.string().uuid(),
})

/**
 * Create-time parameters for a {@link RouterRoute}
 */
export const RouterRouteCreateParams = z.object({
  description: z.string(),
  destination: RouteDestination,
  name: Name,
  target: RouteTarget,
})

/**
 * A single page of results
 */
export const RouterRouteResultsPage = z.object({
  items: RouterRoute.array(),
  nextPage: z.string().nullable().optional(),
})

/**
 * Updateable properties of a {@link RouterRoute}
 */
export const RouterRouteUpdateParams = z.object({
  description: z.string().nullable().optional(),
  destination: RouteDestination,
  name: Name.nullable().optional(),
  target: RouteTarget,
})

export const SagaErrorInfo = z.union([
  z.object({ error: z.enum(['action_failed']), sourceError: z.record(z.unknown()) }),
  z.object({ error: z.enum(['deserialize_failed']), message: z.string() }),
  z.object({ error: z.enum(['injected_error']) }),
  z.object({ error: z.enum(['serialize_failed']), message: z.string() }),
  z.object({ error: z.enum(['subsaga_create_failed']), message: z.string() }),
])

export const SagaState = z.union([
  z.object({ state: z.enum(['running']) }),
  z.object({ state: z.enum(['succeeded']) }),
  z.object({
    errorInfo: SagaErrorInfo,
    errorNodeName: NodeName,
    state: z.enum(['failed']),
  }),
])

export const Saga = z.object({ id: z.string().uuid(), state: SagaState })

/**
 * A single page of results
 */
export const SagaResultsPage = z.object({
  items: Saga.array(),
  nextPage: z.string().nullable().optional(),
})

/**
 * Identity-related metadata that's included in nearly all public API objects
 */
export const SamlIdentityProvider = z.object({
  acsUrl: z.string(),
  description: z.string(),
  id: z.string().uuid(),
  idpEntityId: z.string(),
  name: Name,
  publicCert: z.string().nullable().optional(),
  sloUrl: z.string(),
  spClientId: z.string(),
  technicalContactEmail: z.string(),
  timeCreated: DateType,
  timeModified: DateType,
})

/**
 * Create-time identity-related parameters
 */
export const SamlIdentityProviderCreate = z.object({
  acsUrl: z.string(),
  description: z.string(),
  groupAttributeName: z.string().nullable().optional(),
  idpEntityId: z.string(),
  idpMetadataSource: IdpMetadataSource,
  name: Name,
  signingKeypair: DerEncodedKeyPair.nullable().optional(),
  sloUrl: z.string(),
  spClientId: z.string(),
  technicalContactEmail: z.string(),
})

/**
 * Describes how identities are managed and users are authenticated in this Silo
 */
export const SiloIdentityMode = z.enum(['saml_jit', 'local_only'])

/**
 * Client view of a ['Silo']
 */
export const Silo = z.object({
  description: z.string(),
  discoverable: z.boolean(),
  id: z.string().uuid(),
  identityMode: SiloIdentityMode,
  name: Name,
  timeCreated: DateType,
  timeModified: DateType,
})

/**
 * Create-time parameters for a {@link Silo}
 */
export const SiloCreate = z.object({
  adminGroupName: z.string().nullable().optional(),
  description: z.string(),
  discoverable: z.boolean(),
  identityMode: SiloIdentityMode,
  name: Name,
})

/**
 * A single page of results
 */
export const SiloResultsPage = z.object({
  items: Silo.array(),
  nextPage: z.string().nullable().optional(),
})

export const SiloRole = z.enum(['admin', 'collaborator', 'viewer'])

/**
 * Describes the assignment of a particular role on a particular resource to a particular identity (user, group, etc.)
 *
 * The resource is not part of this structure.  Rather, `RoleAssignment`s are put into a `Policy` and that Policy is applied to a particular resource.
 */
export const SiloRoleRoleAssignment = z.object({
  identityId: z.string().uuid(),
  identityType: IdentityType,
  roleName: SiloRole,
})

/**
 * Client view of a `Policy`, which describes how this resource may be accessed
 *
 * Note that the Policy only describes access granted explicitly for this resource.  The policies of parent resources can also cause a user to have access to this resource.
 */
export const SiloRolePolicy = z.object({ roleAssignments: SiloRoleRoleAssignment.array() })

/**
 * Client view of an {@link Sled}
 */
export const Sled = z.object({
  id: z.string().uuid(),
  serviceAddress: z.string(),
  timeCreated: DateType,
  timeModified: DateType,
})

/**
 * A single page of results
 */
export const SledResultsPage = z.object({
  items: Sled.array(),
  nextPage: z.string().nullable().optional(),
})

export const SnapshotState = z.enum(['creating', 'ready', 'faulted', 'destroyed'])

/**
 * Client view of a Snapshot
 */
export const Snapshot = z.object({
  description: z.string(),
  diskId: z.string().uuid(),
  id: z.string().uuid(),
  name: Name,
  projectId: z.string().uuid(),
  size: ByteCount,
  state: SnapshotState,
  timeCreated: DateType,
  timeModified: DateType,
})

/**
 * Create-time parameters for a {@link Snapshot}
 */
export const SnapshotCreate = z.object({ description: z.string(), disk: Name, name: Name })

/**
 * A single page of results
 */
export const SnapshotResultsPage = z.object({
  items: Snapshot.array(),
  nextPage: z.string().nullable().optional(),
})

export const SpoofLoginBody = z.object({ username: z.string() })

/**
 * Client view of a {@link SshKey}
 */
export const SshKey = z.object({
  description: z.string(),
  id: z.string().uuid(),
  name: Name,
  publicKey: z.string(),
  siloUserId: z.string().uuid(),
  timeCreated: DateType,
  timeModified: DateType,
})

/**
 * Create-time parameters for an {@link SshKey}
 */
export const SshKeyCreate = z.object({
  description: z.string(),
  name: Name,
  publicKey: z.string(),
})

/**
 * A single page of results
 */
export const SshKeyResultsPage = z.object({
  items: SshKey.array(),
  nextPage: z.string().nullable().optional(),
})

/**
 * The name of a timeseries
 *
 * Names are constructed by concatenating the target and metric names with ':'. Target and metric names must be lowercase alphanumeric characters with '_' separating words.
 */
export const TimeseriesName = z
  .string()
  .regex(/(([a-z]+[a-z0-9]*)(_([a-z0-9]+))*):(([a-z]+[a-z0-9]*)(_([a-z0-9]+))*)/)

/**
 * The schema for a timeseries.
 *
 * This includes the name of the timeseries, as well as the datum type of its metric and the schema for each field.
 */
export const TimeseriesSchema = z.object({
  created: DateType,
  datumType: DatumType,
  fieldSchema: FieldSchema.array(),
  timeseriesName: TimeseriesName,
})

/**
 * A single page of results
 */
export const TimeseriesSchemaResultsPage = z.object({
  items: TimeseriesSchema.array(),
  nextPage: z.string().nullable().optional(),
})

/**
 * Client view of a {@link User}
 */
export const User = z.object({ displayName: z.string(), id: z.string().uuid() })

/**
 * Client view of a {@link UserBuiltin}
 */
export const UserBuiltin = z.object({
  description: z.string(),
  id: z.string().uuid(),
  name: Name,
  timeCreated: DateType,
  timeModified: DateType,
})

/**
 * A single page of results
 */
export const UserBuiltinResultsPage = z.object({
  items: UserBuiltin.array(),
  nextPage: z.string().nullable().optional(),
})

/**
 * A single page of results
 */
export const UserResultsPage = z.object({
  items: User.array(),
  nextPage: z.string().nullable().optional(),
})

/**
 * Client view of a {@link Vpc}
 */
export const Vpc = z.object({
  description: z.string(),
  dnsName: Name,
  id: z.string().uuid(),
  ipv6Prefix: Ipv6Net,
  name: Name,
  projectId: z.string().uuid(),
  systemRouterId: z.string().uuid(),
  timeCreated: DateType,
  timeModified: DateType,
})

/**
 * Create-time parameters for a {@link Vpc}
 */
export const VpcCreate = z.object({
  description: z.string(),
  dnsName: Name,
  ipv6Prefix: Ipv6Net.nullable().optional(),
  name: Name,
})

export const VpcFirewallRuleAction = z.enum(['allow', 'deny'])

export const VpcFirewallRuleDirection = z.enum(['inbound', 'outbound'])

/**
 * The `VpcFirewallRuleHostFilter` is used to filter traffic on the basis of its source or destination host.
 */
export const VpcFirewallRuleHostFilter = z.union([
  z.object({ type: z.enum(['vpc']), value: Name }),
  z.object({ type: z.enum(['subnet']), value: Name }),
  z.object({ type: z.enum(['instance']), value: Name }),
  z.object({ type: z.enum(['ip']), value: z.string() }),
  z.object({ type: z.enum(['ip_net']), value: IpNet }),
])

/**
 * The protocols that may be specified in a firewall rule's filter
 */
export const VpcFirewallRuleProtocol = z.enum(['TCP', 'UDP', 'ICMP'])

/**
 * Filter for a firewall rule. A given packet must match every field that is present for the rule to apply to it. A packet matches a field if any entry in that field matches the packet.
 */
export const VpcFirewallRuleFilter = z.object({
  hosts: VpcFirewallRuleHostFilter.array().nullable().optional(),
  ports: L4PortRange.array().nullable().optional(),
  protocols: VpcFirewallRuleProtocol.array().nullable().optional(),
})

export const VpcFirewallRuleStatus = z.enum(['disabled', 'enabled'])

/**
 * A `VpcFirewallRuleTarget` is used to specify the set of {@link Instance}s to which a firewall rule applies.
 */
export const VpcFirewallRuleTarget = z.union([
  z.object({ type: z.enum(['vpc']), value: Name }),
  z.object({ type: z.enum(['subnet']), value: Name }),
  z.object({ type: z.enum(['instance']), value: Name }),
  z.object({ type: z.enum(['ip']), value: z.string() }),
  z.object({ type: z.enum(['ip_net']), value: IpNet }),
])

/**
 * A single rule in a VPC firewall
 */
export const VpcFirewallRule = z.object({
  action: VpcFirewallRuleAction,
  description: z.string(),
  direction: VpcFirewallRuleDirection,
  filters: VpcFirewallRuleFilter,
  id: z.string().uuid(),
  name: Name,
  priority: z.number().min(0).max(65535),
  status: VpcFirewallRuleStatus,
  targets: VpcFirewallRuleTarget.array(),
  timeCreated: DateType,
  timeModified: DateType,
  vpcId: z.string().uuid(),
})

/**
 * A single rule in a VPC firewall
 */
export const VpcFirewallRuleUpdate = z.object({
  action: VpcFirewallRuleAction,
  description: z.string(),
  direction: VpcFirewallRuleDirection,
  filters: VpcFirewallRuleFilter,
  name: Name,
  priority: z.number().min(0).max(65535),
  status: VpcFirewallRuleStatus,
  targets: VpcFirewallRuleTarget.array(),
})

/**
 * Updateable properties of a `Vpc`'s firewall Note that VpcFirewallRules are implicitly created along with a Vpc, so there is no explicit creation.
 */
export const VpcFirewallRuleUpdateParams = z.object({
  rules: VpcFirewallRuleUpdate.array(),
})

/**
 * Collection of a Vpc's firewall rules
 */
export const VpcFirewallRules = z.object({ rules: VpcFirewallRule.array() })

/**
 * A single page of results
 */
export const VpcResultsPage = z.object({
  items: Vpc.array(),
  nextPage: z.string().nullable().optional(),
})

export const VpcRouterKind = z.enum(['system', 'custom'])

/**
 * A VPC router defines a series of rules that indicate where traffic should be sent depending on its destination.
 */
export const VpcRouter = z.object({
  description: z.string(),
  id: z.string().uuid(),
  kind: VpcRouterKind,
  name: Name,
  timeCreated: DateType,
  timeModified: DateType,
  vpcId: z.string().uuid(),
})

/**
 * Create-time parameters for a {@link VpcRouter}
 */
export const VpcRouterCreate = z.object({ description: z.string(), name: Name })

/**
 * A single page of results
 */
export const VpcRouterResultsPage = z.object({
  items: VpcRouter.array(),
  nextPage: z.string().nullable().optional(),
})

/**
 * Updateable properties of a {@link VpcRouter}
 */
export const VpcRouterUpdate = z.object({
  description: z.string().nullable().optional(),
  name: Name.nullable().optional(),
})

/**
 * A VPC subnet represents a logical grouping for instances that allows network traffic between them, within a IPv4 subnetwork or optionall an IPv6 subnetwork.
 */
export const VpcSubnet = z.object({
  description: z.string(),
  id: z.string().uuid(),
  ipv4Block: Ipv4Net,
  ipv6Block: Ipv6Net,
  name: Name,
  timeCreated: DateType,
  timeModified: DateType,
  vpcId: z.string().uuid(),
})

/**
 * Create-time parameters for a {@link VpcSubnet}
 */
export const VpcSubnetCreate = z.object({
  description: z.string(),
  ipv4Block: Ipv4Net,
  ipv6Block: Ipv6Net.nullable().optional(),
  name: Name,
})

/**
 * A single page of results
 */
export const VpcSubnetResultsPage = z.object({
  items: VpcSubnet.array(),
  nextPage: z.string().nullable().optional(),
})

/**
 * Updateable properties of a {@link VpcSubnet}
 */
export const VpcSubnetUpdate = z.object({
  description: z.string().nullable().optional(),
  name: Name.nullable().optional(),
})

/**
 * Updateable properties of a {@link Vpc}
 */
export const VpcUpdate = z.object({
  description: z.string().nullable().optional(),
  dnsName: Name.nullable().optional(),
  name: Name.nullable().optional(),
})

/**
 * Supported set of sort modes for scanning by name or id
 */
export const NameOrIdSortMode = z.enum([
  'name_ascending',
  'name_descending',
  'id_ascending',
])

/**
 * Supported set of sort modes for scanning by name only
 *
 * Currently, we only support scanning in ascending order.
 */
export const NameSortMode = z.enum(['name_ascending'])

export const DiskMetricName = z.enum([
  'activated',
  'flush',
  'read',
  'read_bytes',
  'write',
  'write_bytes',
])

/**
 * Supported set of sort modes for scanning by id only.
 *
 * Currently, we only support scanning in ascending order.
 */
export const IdSortMode = z.enum(['id_ascending'])

export const SystemMetricName = z.enum([
  'virtual_disk_space_provisioned',
  'cpus_provisioned',
  'ram_provisioned',
])

export const DiskViewByIdParams = z.object({
  id: z.string().uuid(),
})
export type DiskViewByIdParams = z.infer<typeof DiskViewByIdParams>

export const ImageViewByIdParams = z.object({
  id: z.string().uuid(),
})
export type ImageViewByIdParams = z.infer<typeof ImageViewByIdParams>

export const InstanceViewByIdParams = z.object({
  id: z.string().uuid(),
})
export type InstanceViewByIdParams = z.infer<typeof InstanceViewByIdParams>

export const InstanceNetworkInterfaceViewByIdParams = z.object({
  id: z.string().uuid(),
})
export type InstanceNetworkInterfaceViewByIdParams = z.infer<
  typeof InstanceNetworkInterfaceViewByIdParams
>

export const OrganizationViewByIdParams = z.object({
  id: z.string().uuid(),
})
export type OrganizationViewByIdParams = z.infer<typeof OrganizationViewByIdParams>

export const ProjectViewByIdParams = z.object({
  id: z.string().uuid(),
})
export type ProjectViewByIdParams = z.infer<typeof ProjectViewByIdParams>

export const SnapshotViewByIdParams = z.object({
  id: z.string().uuid(),
})
export type SnapshotViewByIdParams = z.infer<typeof SnapshotViewByIdParams>

export const VpcRouterRouteViewByIdParams = z.object({
  id: z.string().uuid(),
})
export type VpcRouterRouteViewByIdParams = z.infer<typeof VpcRouterRouteViewByIdParams>

export const VpcRouterViewByIdParams = z.object({
  id: z.string().uuid(),
})
export type VpcRouterViewByIdParams = z.infer<typeof VpcRouterViewByIdParams>

export const VpcSubnetViewByIdParams = z.object({
  id: z.string().uuid(),
})
export type VpcSubnetViewByIdParams = z.infer<typeof VpcSubnetViewByIdParams>

export const VpcViewByIdParams = z.object({
  id: z.string().uuid(),
})
export type VpcViewByIdParams = z.infer<typeof VpcViewByIdParams>

export const DeviceAuthRequestParams = z.object({})
export type DeviceAuthRequestParams = z.infer<typeof DeviceAuthRequestParams>

export const DeviceAuthConfirmParams = z.object({})
export type DeviceAuthConfirmParams = z.infer<typeof DeviceAuthConfirmParams>

export const DeviceAccessTokenParams = z.object({})
export type DeviceAccessTokenParams = z.infer<typeof DeviceAccessTokenParams>

export const LoginSpoofParams = z.object({})
export type LoginSpoofParams = z.infer<typeof LoginSpoofParams>

export const LoginSamlBeginParams = z.object({
  providerName: Name,
  siloName: Name,
})
export type LoginSamlBeginParams = z.infer<typeof LoginSamlBeginParams>

export const LoginSamlParams = z.object({
  providerName: Name,
  siloName: Name,
})
export type LoginSamlParams = z.infer<typeof LoginSamlParams>

export const LogoutParams = z.object({})
export type LogoutParams = z.infer<typeof LogoutParams>

export const OrganizationListParams = z.object({
  limit: z.number().min(1).max(4294967295).nullable().optional(),
  pageToken: z.string().nullable().optional(),
  sortBy: NameOrIdSortMode.optional(),
})
export type OrganizationListParams = z.infer<typeof OrganizationListParams>

export const OrganizationCreateParams = z.object({})
export type OrganizationCreateParams = z.infer<typeof OrganizationCreateParams>

export const OrganizationViewParams = z.object({
  orgName: Name,
})
export type OrganizationViewParams = z.infer<typeof OrganizationViewParams>

export const OrganizationUpdateParams = z.object({
  orgName: Name,
})
export type OrganizationUpdateParams = z.infer<typeof OrganizationUpdateParams>

export const OrganizationDeleteParams = z.object({
  orgName: Name,
})
export type OrganizationDeleteParams = z.infer<typeof OrganizationDeleteParams>

export const OrganizationPolicyViewParams = z.object({
  orgName: Name,
})
export type OrganizationPolicyViewParams = z.infer<typeof OrganizationPolicyViewParams>

export const OrganizationPolicyUpdateParams = z.object({
  orgName: Name,
})
export type OrganizationPolicyUpdateParams = z.infer<typeof OrganizationPolicyUpdateParams>

export const ProjectListParams = z.object({
  limit: z.number().min(1).max(4294967295).nullable().optional(),
  pageToken: z.string().nullable().optional(),
  sortBy: NameOrIdSortMode.optional(),
  orgName: Name,
})
export type ProjectListParams = z.infer<typeof ProjectListParams>

export const ProjectCreateParams = z.object({
  orgName: Name,
})
export type ProjectCreateParams = z.infer<typeof ProjectCreateParams>

export const ProjectViewParams = z.object({
  orgName: Name,
  projectName: Name,
})
export type ProjectViewParams = z.infer<typeof ProjectViewParams>

export const ProjectUpdateParams = z.object({
  orgName: Name,
  projectName: Name,
})
export type ProjectUpdateParams = z.infer<typeof ProjectUpdateParams>

export const ProjectDeleteParams = z.object({
  orgName: Name,
  projectName: Name,
})
export type ProjectDeleteParams = z.infer<typeof ProjectDeleteParams>

export const DiskListParams = z.object({
  limit: z.number().min(1).max(4294967295).nullable().optional(),
  pageToken: z.string().nullable().optional(),
  sortBy: NameSortMode.optional(),
  orgName: Name,
  projectName: Name,
})
export type DiskListParams = z.infer<typeof DiskListParams>

export const DiskCreateParams = z.object({
  orgName: Name,
  projectName: Name,
})
export type DiskCreateParams = z.infer<typeof DiskCreateParams>

export const DiskViewParams = z.object({
  diskName: Name,
  orgName: Name,
  projectName: Name,
})
export type DiskViewParams = z.infer<typeof DiskViewParams>

export const DiskDeleteParams = z.object({
  diskName: Name,
  orgName: Name,
  projectName: Name,
})
export type DiskDeleteParams = z.infer<typeof DiskDeleteParams>

export const DiskMetricsListParams = z.object({
  diskName: Name,
  metricName: DiskMetricName,
  orgName: Name,
  projectName: Name,
  endTime: DateType.optional(),
  limit: z.number().min(1).max(4294967295).nullable().optional(),
  pageToken: z.string().nullable().optional(),
  startTime: DateType.optional(),
})
export type DiskMetricsListParams = z.infer<typeof DiskMetricsListParams>

export const ImageListParams = z.object({
  limit: z.number().min(1).max(4294967295).nullable().optional(),
  pageToken: z.string().nullable().optional(),
  sortBy: NameSortMode.optional(),
  orgName: Name,
  projectName: Name,
})
export type ImageListParams = z.infer<typeof ImageListParams>

export const ImageCreateParams = z.object({
  orgName: Name,
  projectName: Name,
})
export type ImageCreateParams = z.infer<typeof ImageCreateParams>

export const ImageViewParams = z.object({
  imageName: Name,
  orgName: Name,
  projectName: Name,
})
export type ImageViewParams = z.infer<typeof ImageViewParams>

export const ImageDeleteParams = z.object({
  imageName: Name,
  orgName: Name,
  projectName: Name,
})
export type ImageDeleteParams = z.infer<typeof ImageDeleteParams>

export const InstanceListParams = z.object({
  limit: z.number().min(1).max(4294967295).nullable().optional(),
  pageToken: z.string().nullable().optional(),
  sortBy: NameSortMode.optional(),
  orgName: Name,
  projectName: Name,
})
export type InstanceListParams = z.infer<typeof InstanceListParams>

export const InstanceCreateParams = z.object({
  orgName: Name,
  projectName: Name,
})
export type InstanceCreateParams = z.infer<typeof InstanceCreateParams>

export const InstanceViewParams = z.object({
  instanceName: Name,
  orgName: Name,
  projectName: Name,
})
export type InstanceViewParams = z.infer<typeof InstanceViewParams>

export const InstanceDeleteParams = z.object({
  instanceName: Name,
  orgName: Name,
  projectName: Name,
})
export type InstanceDeleteParams = z.infer<typeof InstanceDeleteParams>

export const InstanceDiskListParams = z.object({
  limit: z.number().min(1).max(4294967295).nullable().optional(),
  pageToken: z.string().nullable().optional(),
  sortBy: NameSortMode.optional(),
  instanceName: Name,
  orgName: Name,
  projectName: Name,
})
export type InstanceDiskListParams = z.infer<typeof InstanceDiskListParams>

export const InstanceDiskAttachParams = z.object({
  instanceName: Name,
  orgName: Name,
  projectName: Name,
})
export type InstanceDiskAttachParams = z.infer<typeof InstanceDiskAttachParams>

export const InstanceDiskDetachParams = z.object({
  instanceName: Name,
  orgName: Name,
  projectName: Name,
})
export type InstanceDiskDetachParams = z.infer<typeof InstanceDiskDetachParams>

export const InstanceExternalIpListParams = z.object({
  instanceName: Name,
  orgName: Name,
  projectName: Name,
})
export type InstanceExternalIpListParams = z.infer<typeof InstanceExternalIpListParams>

export const InstanceMigrateParams = z.object({
  instanceName: Name,
  orgName: Name,
  projectName: Name,
})
export type InstanceMigrateParams = z.infer<typeof InstanceMigrateParams>

export const InstanceNetworkInterfaceListParams = z.object({
  limit: z.number().min(1).max(4294967295).nullable().optional(),
  pageToken: z.string().nullable().optional(),
  sortBy: NameSortMode.optional(),
  instanceName: Name,
  orgName: Name,
  projectName: Name,
})
export type InstanceNetworkInterfaceListParams = z.infer<
  typeof InstanceNetworkInterfaceListParams
>

export const InstanceNetworkInterfaceCreateParams = z.object({
  instanceName: Name,
  orgName: Name,
  projectName: Name,
})
export type InstanceNetworkInterfaceCreateParams = z.infer<
  typeof InstanceNetworkInterfaceCreateParams
>

export const InstanceNetworkInterfaceViewParams = z.object({
  instanceName: Name,
  interfaceName: Name,
  orgName: Name,
  projectName: Name,
})
export type InstanceNetworkInterfaceViewParams = z.infer<
  typeof InstanceNetworkInterfaceViewParams
>

export const InstanceNetworkInterfaceUpdateParams = z.object({
  instanceName: Name,
  interfaceName: Name,
  orgName: Name,
  projectName: Name,
})
export type InstanceNetworkInterfaceUpdateParams = z.infer<
  typeof InstanceNetworkInterfaceUpdateParams
>

export const InstanceNetworkInterfaceDeleteParams = z.object({
  instanceName: Name,
  interfaceName: Name,
  orgName: Name,
  projectName: Name,
})
export type InstanceNetworkInterfaceDeleteParams = z.infer<
  typeof InstanceNetworkInterfaceDeleteParams
>

export const InstanceRebootParams = z.object({
  instanceName: Name,
  orgName: Name,
  projectName: Name,
})
export type InstanceRebootParams = z.infer<typeof InstanceRebootParams>

export const InstanceSerialConsoleParams = z.object({
  instanceName: Name,
  orgName: Name,
  projectName: Name,
  fromStart: z.number().min(0).nullable().optional(),
  maxBytes: z.number().min(0).nullable().optional(),
  mostRecent: z.number().min(0).nullable().optional(),
})
export type InstanceSerialConsoleParams = z.infer<typeof InstanceSerialConsoleParams>

export const InstanceStartParams = z.object({
  instanceName: Name,
  orgName: Name,
  projectName: Name,
})
export type InstanceStartParams = z.infer<typeof InstanceStartParams>

export const InstanceStopParams = z.object({
  instanceName: Name,
  orgName: Name,
  projectName: Name,
})
export type InstanceStopParams = z.infer<typeof InstanceStopParams>

export const ProjectPolicyViewParams = z.object({
  orgName: Name,
  projectName: Name,
})
export type ProjectPolicyViewParams = z.infer<typeof ProjectPolicyViewParams>

export const ProjectPolicyUpdateParams = z.object({
  orgName: Name,
  projectName: Name,
})
export type ProjectPolicyUpdateParams = z.infer<typeof ProjectPolicyUpdateParams>

export const SnapshotListParams = z.object({
  limit: z.number().min(1).max(4294967295).nullable().optional(),
  pageToken: z.string().nullable().optional(),
  sortBy: NameSortMode.optional(),
  orgName: Name,
  projectName: Name,
})
export type SnapshotListParams = z.infer<typeof SnapshotListParams>

export const SnapshotCreateParams = z.object({
  orgName: Name,
  projectName: Name,
})
export type SnapshotCreateParams = z.infer<typeof SnapshotCreateParams>

export const SnapshotViewParams = z.object({
  orgName: Name,
  projectName: Name,
  snapshotName: Name,
})
export type SnapshotViewParams = z.infer<typeof SnapshotViewParams>

export const SnapshotDeleteParams = z.object({
  orgName: Name,
  projectName: Name,
  snapshotName: Name,
})
export type SnapshotDeleteParams = z.infer<typeof SnapshotDeleteParams>

export const VpcListParams = z.object({
  limit: z.number().min(1).max(4294967295).nullable().optional(),
  pageToken: z.string().nullable().optional(),
  sortBy: NameSortMode.optional(),
  orgName: Name,
  projectName: Name,
})
export type VpcListParams = z.infer<typeof VpcListParams>

export const VpcCreateParams = z.object({
  orgName: Name,
  projectName: Name,
})
export type VpcCreateParams = z.infer<typeof VpcCreateParams>

export const VpcViewParams = z.object({
  orgName: Name,
  projectName: Name,
  vpcName: Name,
})
export type VpcViewParams = z.infer<typeof VpcViewParams>

export const VpcUpdateParams = z.object({
  orgName: Name,
  projectName: Name,
  vpcName: Name,
})
export type VpcUpdateParams = z.infer<typeof VpcUpdateParams>

export const VpcDeleteParams = z.object({
  orgName: Name,
  projectName: Name,
  vpcName: Name,
})
export type VpcDeleteParams = z.infer<typeof VpcDeleteParams>

export const VpcFirewallRulesViewParams = z.object({
  orgName: Name,
  projectName: Name,
  vpcName: Name,
})
export type VpcFirewallRulesViewParams = z.infer<typeof VpcFirewallRulesViewParams>

export const VpcFirewallRulesUpdateParams = z.object({
  orgName: Name,
  projectName: Name,
  vpcName: Name,
})
export type VpcFirewallRulesUpdateParams = z.infer<typeof VpcFirewallRulesUpdateParams>

export const VpcRouterListParams = z.object({
  limit: z.number().min(1).max(4294967295).nullable().optional(),
  pageToken: z.string().nullable().optional(),
  sortBy: NameSortMode.optional(),
  orgName: Name,
  projectName: Name,
  vpcName: Name,
})
export type VpcRouterListParams = z.infer<typeof VpcRouterListParams>

export const VpcRouterCreateParams = z.object({
  orgName: Name,
  projectName: Name,
  vpcName: Name,
})
export type VpcRouterCreateParams = z.infer<typeof VpcRouterCreateParams>

export const VpcRouterViewParams = z.object({
  orgName: Name,
  projectName: Name,
  routerName: Name,
  vpcName: Name,
})
export type VpcRouterViewParams = z.infer<typeof VpcRouterViewParams>

export const VpcRouterUpdateParams = z.object({
  orgName: Name,
  projectName: Name,
  routerName: Name,
  vpcName: Name,
})
export type VpcRouterUpdateParams = z.infer<typeof VpcRouterUpdateParams>

export const VpcRouterDeleteParams = z.object({
  orgName: Name,
  projectName: Name,
  routerName: Name,
  vpcName: Name,
})
export type VpcRouterDeleteParams = z.infer<typeof VpcRouterDeleteParams>

export const VpcRouterRouteListParams = z.object({
  limit: z.number().min(1).max(4294967295).nullable().optional(),
  pageToken: z.string().nullable().optional(),
  sortBy: NameSortMode.optional(),
  orgName: Name,
  projectName: Name,
  routerName: Name,
  vpcName: Name,
})
export type VpcRouterRouteListParams = z.infer<typeof VpcRouterRouteListParams>

export const VpcRouterRouteCreateParams = z.object({
  orgName: Name,
  projectName: Name,
  routerName: Name,
  vpcName: Name,
})
export type VpcRouterRouteCreateParams = z.infer<typeof VpcRouterRouteCreateParams>

export const VpcRouterRouteViewParams = z.object({
  orgName: Name,
  projectName: Name,
  routeName: Name,
  routerName: Name,
  vpcName: Name,
})
export type VpcRouterRouteViewParams = z.infer<typeof VpcRouterRouteViewParams>

export const VpcRouterRouteUpdateParams = z.object({
  orgName: Name,
  projectName: Name,
  routeName: Name,
  routerName: Name,
  vpcName: Name,
})
export type VpcRouterRouteUpdateParams = z.infer<typeof VpcRouterRouteUpdateParams>

export const VpcRouterRouteDeleteParams = z.object({
  orgName: Name,
  projectName: Name,
  routeName: Name,
  routerName: Name,
  vpcName: Name,
})
export type VpcRouterRouteDeleteParams = z.infer<typeof VpcRouterRouteDeleteParams>

export const VpcSubnetListParams = z.object({
  limit: z.number().min(1).max(4294967295).nullable().optional(),
  pageToken: z.string().nullable().optional(),
  sortBy: NameSortMode.optional(),
  orgName: Name,
  projectName: Name,
  vpcName: Name,
})
export type VpcSubnetListParams = z.infer<typeof VpcSubnetListParams>

export const VpcSubnetCreateParams = z.object({
  orgName: Name,
  projectName: Name,
  vpcName: Name,
})
export type VpcSubnetCreateParams = z.infer<typeof VpcSubnetCreateParams>

export const VpcSubnetViewParams = z.object({
  orgName: Name,
  projectName: Name,
  subnetName: Name,
  vpcName: Name,
})
export type VpcSubnetViewParams = z.infer<typeof VpcSubnetViewParams>

export const VpcSubnetUpdateParams = z.object({
  orgName: Name,
  projectName: Name,
  subnetName: Name,
  vpcName: Name,
})
export type VpcSubnetUpdateParams = z.infer<typeof VpcSubnetUpdateParams>

export const VpcSubnetDeleteParams = z.object({
  orgName: Name,
  projectName: Name,
  subnetName: Name,
  vpcName: Name,
})
export type VpcSubnetDeleteParams = z.infer<typeof VpcSubnetDeleteParams>

export const VpcSubnetListNetworkInterfacesParams = z.object({
  limit: z.number().min(1).max(4294967295).nullable().optional(),
  pageToken: z.string().nullable().optional(),
  sortBy: NameSortMode.optional(),
  orgName: Name,
  projectName: Name,
  subnetName: Name,
  vpcName: Name,
})
export type VpcSubnetListNetworkInterfacesParams = z.infer<
  typeof VpcSubnetListNetworkInterfacesParams
>

export const PolicyViewParams = z.object({})
export type PolicyViewParams = z.infer<typeof PolicyViewParams>

export const PolicyUpdateParams = z.object({})
export type PolicyUpdateParams = z.infer<typeof PolicyUpdateParams>

export const RoleListParams = z.object({
  limit: z.number().min(1).max(4294967295).nullable().optional(),
  pageToken: z.string().nullable().optional(),
})
export type RoleListParams = z.infer<typeof RoleListParams>

export const RoleViewParams = z.object({
  roleName: z.string(),
})
export type RoleViewParams = z.infer<typeof RoleViewParams>

export const SessionMeParams = z.object({})
export type SessionMeParams = z.infer<typeof SessionMeParams>

export const SessionSshkeyListParams = z.object({
  limit: z.number().min(1).max(4294967295).nullable().optional(),
  pageToken: z.string().nullable().optional(),
  sortBy: NameSortMode.optional(),
})
export type SessionSshkeyListParams = z.infer<typeof SessionSshkeyListParams>

export const SessionSshkeyCreateParams = z.object({})
export type SessionSshkeyCreateParams = z.infer<typeof SessionSshkeyCreateParams>

export const SessionSshkeyViewParams = z.object({
  sshKeyName: Name,
})
export type SessionSshkeyViewParams = z.infer<typeof SessionSshkeyViewParams>

export const SessionSshkeyDeleteParams = z.object({
  sshKeyName: Name,
})
export type SessionSshkeyDeleteParams = z.infer<typeof SessionSshkeyDeleteParams>

export const SystemImageViewByIdParams = z.object({
  id: z.string().uuid(),
})
export type SystemImageViewByIdParams = z.infer<typeof SystemImageViewByIdParams>

export const IpPoolViewByIdParams = z.object({
  id: z.string().uuid(),
})
export type IpPoolViewByIdParams = z.infer<typeof IpPoolViewByIdParams>

export const SiloViewByIdParams = z.object({
  id: z.string().uuid(),
})
export type SiloViewByIdParams = z.infer<typeof SiloViewByIdParams>

export const RackListParams = z.object({
  limit: z.number().min(1).max(4294967295).nullable().optional(),
  pageToken: z.string().nullable().optional(),
  sortBy: IdSortMode.optional(),
})
export type RackListParams = z.infer<typeof RackListParams>

export const RackViewParams = z.object({
  rackId: z.string().uuid(),
})
export type RackViewParams = z.infer<typeof RackViewParams>

export const SledListParams = z.object({
  limit: z.number().min(1).max(4294967295).nullable().optional(),
  pageToken: z.string().nullable().optional(),
  sortBy: IdSortMode.optional(),
})
export type SledListParams = z.infer<typeof SledListParams>

export const SledViewParams = z.object({
  sledId: z.string().uuid(),
})
export type SledViewParams = z.infer<typeof SledViewParams>

export const SystemImageListParams = z.object({
  limit: z.number().min(1).max(4294967295).nullable().optional(),
  pageToken: z.string().nullable().optional(),
  sortBy: NameSortMode.optional(),
})
export type SystemImageListParams = z.infer<typeof SystemImageListParams>

export const SystemImageCreateParams = z.object({})
export type SystemImageCreateParams = z.infer<typeof SystemImageCreateParams>

export const SystemImageViewParams = z.object({
  imageName: Name,
})
export type SystemImageViewParams = z.infer<typeof SystemImageViewParams>

export const SystemImageDeleteParams = z.object({
  imageName: Name,
})
export type SystemImageDeleteParams = z.infer<typeof SystemImageDeleteParams>

export const IpPoolListParams = z.object({
  limit: z.number().min(1).max(4294967295).nullable().optional(),
  pageToken: z.string().nullable().optional(),
  sortBy: NameOrIdSortMode.optional(),
})
export type IpPoolListParams = z.infer<typeof IpPoolListParams>

export const IpPoolCreateParams = z.object({})
export type IpPoolCreateParams = z.infer<typeof IpPoolCreateParams>

export const IpPoolViewParams = z.object({
  poolName: Name,
})
export type IpPoolViewParams = z.infer<typeof IpPoolViewParams>

export const IpPoolUpdateParams = z.object({
  poolName: Name,
})
export type IpPoolUpdateParams = z.infer<typeof IpPoolUpdateParams>

export const IpPoolDeleteParams = z.object({
  poolName: Name,
})
export type IpPoolDeleteParams = z.infer<typeof IpPoolDeleteParams>

export const IpPoolRangeListParams = z.object({
  poolName: Name,
  limit: z.number().min(1).max(4294967295).nullable().optional(),
  pageToken: z.string().nullable().optional(),
})
export type IpPoolRangeListParams = z.infer<typeof IpPoolRangeListParams>

export const IpPoolRangeAddParams = z.object({
  poolName: Name,
})
export type IpPoolRangeAddParams = z.infer<typeof IpPoolRangeAddParams>

export const IpPoolRangeRemoveParams = z.object({
  poolName: Name,
})
export type IpPoolRangeRemoveParams = z.infer<typeof IpPoolRangeRemoveParams>

export const IpPoolServiceViewParams = z.object({
  rackId: z.string().uuid(),
})
export type IpPoolServiceViewParams = z.infer<typeof IpPoolServiceViewParams>

export const IpPoolServiceRangeListParams = z.object({
  rackId: z.string().uuid(),
  limit: z.number().min(1).max(4294967295).nullable().optional(),
  pageToken: z.string().nullable().optional(),
})
export type IpPoolServiceRangeListParams = z.infer<typeof IpPoolServiceRangeListParams>

export const IpPoolServiceRangeAddParams = z.object({
  rackId: z.string().uuid(),
})
export type IpPoolServiceRangeAddParams = z.infer<typeof IpPoolServiceRangeAddParams>

export const IpPoolServiceRangeRemoveParams = z.object({
  rackId: z.string().uuid(),
})
export type IpPoolServiceRangeRemoveParams = z.infer<typeof IpPoolServiceRangeRemoveParams>

export const SystemMetricParams = z.object({
  metricName: SystemMetricName,
  endTime: DateType.optional(),
  id: z.string().uuid().optional(),
  limit: z.number().min(1).max(4294967295).nullable().optional(),
  pageToken: z.string().nullable().optional(),
  startTime: DateType.optional(),
})
export type SystemMetricParams = z.infer<typeof SystemMetricParams>

export const SystemPolicyViewParams = z.object({})
export type SystemPolicyViewParams = z.infer<typeof SystemPolicyViewParams>

export const SystemPolicyUpdateParams = z.object({})
export type SystemPolicyUpdateParams = z.infer<typeof SystemPolicyUpdateParams>

export const SagaListParams = z.object({
  limit: z.number().min(1).max(4294967295).nullable().optional(),
  pageToken: z.string().nullable().optional(),
  sortBy: IdSortMode.optional(),
})
export type SagaListParams = z.infer<typeof SagaListParams>

export const SagaViewParams = z.object({
  sagaId: z.string().uuid(),
})
export type SagaViewParams = z.infer<typeof SagaViewParams>

export const SiloListParams = z.object({
  limit: z.number().min(1).max(4294967295).nullable().optional(),
  pageToken: z.string().nullable().optional(),
  sortBy: NameOrIdSortMode.optional(),
})
export type SiloListParams = z.infer<typeof SiloListParams>

export const SiloCreateParams = z.object({})
export type SiloCreateParams = z.infer<typeof SiloCreateParams>

export const SiloViewParams = z.object({
  siloName: Name,
})
export type SiloViewParams = z.infer<typeof SiloViewParams>

export const SiloDeleteParams = z.object({
  siloName: Name,
})
export type SiloDeleteParams = z.infer<typeof SiloDeleteParams>

export const SiloIdentityProviderListParams = z.object({
  siloName: Name,
  limit: z.number().min(1).max(4294967295).nullable().optional(),
  pageToken: z.string().nullable().optional(),
  sortBy: NameSortMode.optional(),
})
export type SiloIdentityProviderListParams = z.infer<typeof SiloIdentityProviderListParams>

export const SamlIdentityProviderCreateParams = z.object({
  siloName: Name,
})
export type SamlIdentityProviderCreateParams = z.infer<
  typeof SamlIdentityProviderCreateParams
>

export const SamlIdentityProviderViewParams = z.object({
  providerName: Name,
  siloName: Name,
})
export type SamlIdentityProviderViewParams = z.infer<typeof SamlIdentityProviderViewParams>

export const SiloPolicyViewParams = z.object({
  siloName: Name,
})
export type SiloPolicyViewParams = z.infer<typeof SiloPolicyViewParams>

export const SiloPolicyUpdateParams = z.object({
  siloName: Name,
})
export type SiloPolicyUpdateParams = z.infer<typeof SiloPolicyUpdateParams>

export const UpdatesRefreshParams = z.object({})
export type UpdatesRefreshParams = z.infer<typeof UpdatesRefreshParams>

export const SystemUserListParams = z.object({
  limit: z.number().min(1).max(4294967295).nullable().optional(),
  pageToken: z.string().nullable().optional(),
  sortBy: NameSortMode.optional(),
})
export type SystemUserListParams = z.infer<typeof SystemUserListParams>

export const SystemUserViewParams = z.object({
  userName: Name,
})
export type SystemUserViewParams = z.infer<typeof SystemUserViewParams>

export const TimeseriesSchemaGetParams = z.object({
  limit: z.number().min(1).max(4294967295).nullable().optional(),
  pageToken: z.string().nullable().optional(),
})
export type TimeseriesSchemaGetParams = z.infer<typeof TimeseriesSchemaGetParams>

export const UserListParams = z.object({
  limit: z.number().min(1).max(4294967295).nullable().optional(),
  pageToken: z.string().nullable().optional(),
  sortBy: IdSortMode.optional(),
})
export type UserListParams = z.infer<typeof UserListParams>
