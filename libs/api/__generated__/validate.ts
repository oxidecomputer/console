/* eslint-disable */
import { ZodType, z } from 'zod'

import { processResponseBody, snakeify } from './util'

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
 * A count of bytes, typically used either for memory or storage capacity
 *
 * The maximum supported byte count is `i64::MAX`.  This makes it somewhat inconvenient to define constructors: a u32 constructor can be infallible, but an i64 constructor can fail (if the value is negative) and a u64 constructor can fail (if the value is larger than i64::MAX).  We provide all of these for consumers' convenience.
 */
export const ByteCount = z.preprocess(processResponseBody, z.number().min(0))

/**
 * A cumulative or counter data type.
 */
export const Cumulativedouble = z.preprocess(
  processResponseBody,
  z.object({ startTime: DateType, value: z.number() })
)

/**
 * A cumulative or counter data type.
 */
export const Cumulativeint64 = z.preprocess(
  processResponseBody,
  z.object({ startTime: DateType, value: z.number() })
)

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
export const Histogramint64 = z.preprocess(
  processResponseBody,
  z.object({ bins: Binint64.array(), nSamples: z.number().min(0), startTime: DateType })
)

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
export const Histogramdouble = z.preprocess(
  processResponseBody,
  z.object({ bins: Bindouble.array(), nSamples: z.number().min(0), startTime: DateType })
)

/**
 * A `Datum` is a single sampled data point from a metric.
 */
export const Datum = z.preprocess(
  processResponseBody,
  z.union([
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
)

/**
 * The type of an individual datum of a metric.
 */
export const DatumType = z.preprocess(
  processResponseBody,
  z.enum([
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
 * A name unique within the parent collection
 *
 * Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. Names cannot be a UUID though they may contain a UUID.
 */
export const Name = z.preprocess(
  processResponseBody,
  z
    .string()
    .max(63)
    .regex(
      /^(?![0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$)^[a-z][a-z0-9-]*[a-zA-Z0-9]$/
    )
)

/**
 * State of a Disk (primarily: attached or not)
 */
export const DiskState = z.preprocess(
  processResponseBody,
  z.union([
    z.object({ state: z.enum(['creating']) }),
    z.object({ state: z.enum(['detached']) }),
    z.object({ instance: z.string().uuid(), state: z.enum(['attaching']) }),
    z.object({ instance: z.string().uuid(), state: z.enum(['attached']) }),
    z.object({ instance: z.string().uuid(), state: z.enum(['detaching']) }),
    z.object({ state: z.enum(['destroyed']) }),
    z.object({ state: z.enum(['faulted']) }),
  ])
)

/**
 * Client view of a {@link Disk}
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
    timeCreated: DateType,
    timeModified: DateType,
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
    z.object({ imageId: z.string().uuid(), type: z.enum(['global_image']) }),
  ])
)

/**
 * Create-time parameters for a {@link Disk}
 */
export const DiskCreate = z.preprocess(
  processResponseBody,
  z.object({ description: z.string(), diskSource: DiskSource, name: Name, size: ByteCount })
)

/**
 * TODO-v1: Delete this Parameters for the {@link Disk} to be attached or detached to an instance
 */
export const DiskIdentifier = z.preprocess(processResponseBody, z.object({ name: Name }))

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
 * OS image distribution
 */
export const Distribution = z.preprocess(
  processResponseBody,
  z.object({ name: Name, version: z.string() })
)

/**
 * Error information from a response.
 */
export const Error = z.preprocess(
  processResponseBody,
  z.object({ errorCode: z.string().optional(), message: z.string(), requestId: z.string() })
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
 * The source from which a field is derived, the target or metric.
 */
export const FieldSource = z.preprocess(processResponseBody, z.enum(['target', 'metric']))

/**
 * The `FieldType` identifies the data type of a target or metric field.
 */
export const FieldType = z.preprocess(
  processResponseBody,
  z.enum(['string', 'i64', 'ip_addr', 'uuid', 'bool'])
)

/**
 * The name and type information for a field of a timeseries schema.
 */
export const FieldSchema = z.preprocess(
  processResponseBody,
  z.object({ name: z.string(), source: FieldSource, ty: FieldType })
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
 * Client view of a `Policy`, which describes how this resource may be accessed
 *
 * Note that the Policy only describes access granted explicitly for this resource.  The policies of parent resources can also cause a user to have access to this resource.
 */
export const FleetRolePolicy = z.preprocess(
  processResponseBody,
  z.object({ roleAssignments: FleetRoleRoleAssignment.array() })
)

/**
 * Client view of global Images
 */
export const GlobalImage = z.preprocess(
  processResponseBody,
  z.object({
    blockSize: ByteCount,
    description: z.string(),
    digest: Digest.optional(),
    distribution: z.string(),
    id: z.string().uuid(),
    name: Name,
    size: ByteCount,
    timeCreated: DateType,
    timeModified: DateType,
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
 * Create-time parameters for an {@link GlobalImage}
 */
export const GlobalImageCreate = z.preprocess(
  processResponseBody,
  z.object({
    blockSize: BlockSize,
    description: z.string(),
    distribution: Distribution,
    name: Name,
    source: ImageSource,
  })
)

/**
 * A single page of results
 */
export const GlobalImageResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: GlobalImage.array(), nextPage: z.string().optional() })
)

/**
 * Client view of a {@link Group}
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
 * Client view of an {@link IdentityProvider}
 */
export const IdentityProvider = z.preprocess(
  processResponseBody,
  z.object({
    description: z.string(),
    id: z.string().uuid(),
    name: Name,
    providerType: IdentityProviderType,
    timeCreated: DateType,
    timeModified: DateType,
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
 * Client view of project Images
 */
export const Image = z.preprocess(
  processResponseBody,
  z.object({
    blockSize: ByteCount,
    description: z.string(),
    digest: Digest.optional(),
    id: z.string().uuid(),
    name: Name,
    projectId: z.string().uuid(),
    size: ByteCount,
    timeCreated: DateType,
    timeModified: DateType,
    url: z.string().optional(),
    version: z.string().optional(),
  })
)

/**
 * Create-time parameters for an {@link Image}
 */
export const ImageCreate = z.preprocess(
  processResponseBody,
  z.object({
    blockSize: BlockSize,
    description: z.string(),
    name: Name,
    source: ImageSource,
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
 * Client view of an {@link Instance}
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
    timeCreated: DateType,
    timeModified: DateType,
    timeRunStateUpdated: DateType,
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
 * Create-time parameters for a {@link NetworkInterface}
 */
export const NetworkInterfaceCreate = z.preprocess(
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
 * Describes an attachment of a `NetworkInterface` to an `Instance`, at the time the instance is created.
 */
export const InstanceNetworkInterfaceAttachment = z.preprocess(
  processResponseBody,
  z.union([
    z.object({ params: NetworkInterfaceCreate.array(), type: z.enum(['create']) }),
    z.object({ type: z.enum(['default']) }),
    z.object({ type: z.enum(['none']) }),
  ])
)

/**
 * Create-time parameters for an {@link Instance}
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
    start: z.boolean().default(true).optional(),
    userData: z.string().default('').optional(),
  })
)

/**
 * Migration parameters for an {@link Instance}
 */
export const InstanceMigrate = z.preprocess(
  processResponseBody,
  z.object({ dstSledId: z.string().uuid() })
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
    timeCreated: DateType,
    timeModified: DateType,
  })
)

/**
 * Create-time parameters for an IP Pool.
 *
 * See {@link IpPool}
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
  z.object({ id: z.string().uuid(), range: IpRange, timeCreated: DateType })
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
 * A MAC address
 *
 * A Media Access Control address, in EUI-48 format
 */
export const MacAddr = z.preprocess(
  processResponseBody,
  z
    .string()
    .min(17)
    .max(17)
    .regex(/^([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$/)
)

/**
 * A `Measurement` is a timestamped datum from a single metric
 */
export const Measurement = z.preprocess(
  processResponseBody,
  z.object({ datum: Datum, timestamp: DateType })
)

/**
 * A single page of results
 */
export const MeasurementResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: Measurement.array(), nextPage: z.string().optional() })
)

/**
 * A `NetworkInterface` represents a virtual network interface device.
 */
export const NetworkInterface = z.preprocess(
  processResponseBody,
  z.object({
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
)

/**
 * A single page of results
 */
export const NetworkInterfaceResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: NetworkInterface.array(), nextPage: z.string().optional() })
)

/**
 * Parameters for updating a {@link NetworkInterface}.
 *
 * Note that modifying IP addresses for an interface is not yet supported, a new interface must be created instead.
 */
export const NetworkInterfaceUpdate = z.preprocess(
  processResponseBody,
  z.object({
    description: z.string().optional(),
    name: Name.optional(),
    primary: z.boolean().default(false).optional(),
  })
)

/**
 * Unique name for a saga `Node`
 *
 * Each node requires a string name that's unique within its DAG.  The name is used to identify its output.  Nodes that depend on a given node (either directly or indirectly) can access the node's output using its name.
 */
export const NodeName = z.preprocess(processResponseBody, z.string())

/**
 * Client view of an {@link Organization}
 */
export const Organization = z.preprocess(
  processResponseBody,
  z.object({
    description: z.string(),
    id: z.string().uuid(),
    name: Name,
    timeCreated: DateType,
    timeModified: DateType,
  })
)

/**
 * Create-time parameters for an {@link Organization}
 */
export const OrganizationCreate = z.preprocess(
  processResponseBody,
  z.object({ description: z.string(), name: Name })
)

/**
 * A single page of results
 */
export const OrganizationResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: Organization.array(), nextPage: z.string().optional() })
)

export const OrganizationRole = z.preprocess(
  processResponseBody,
  z.enum(['admin', 'collaborator', 'viewer'])
)

/**
 * Describes the assignment of a particular role on a particular resource to a particular identity (user, group, etc.)
 *
 * The resource is not part of this structure.  Rather, `RoleAssignment`s are put into a `Policy` and that Policy is applied to a particular resource.
 */
export const OrganizationRoleRoleAssignment = z.preprocess(
  processResponseBody,
  z.object({
    identityId: z.string().uuid(),
    identityType: IdentityType,
    roleName: OrganizationRole,
  })
)

/**
 * Client view of a `Policy`, which describes how this resource may be accessed
 *
 * Note that the Policy only describes access granted explicitly for this resource.  The policies of parent resources can also cause a user to have access to this resource.
 */
export const OrganizationRolePolicy = z.preprocess(
  processResponseBody,
  z.object({ roleAssignments: OrganizationRoleRoleAssignment.array() })
)

/**
 * Updateable properties of an {@link Organization}
 */
export const OrganizationUpdate = z.preprocess(
  processResponseBody,
  z.object({ description: z.string().optional(), name: Name.optional() })
)

/**
 * A password used to authenticate a user
 *
 * Passwords may be subject to additional constraints.
 */
export const Password = z.preprocess(processResponseBody, z.string().max(512))

/**
 * Client view of a {@link Project}
 */
export const Project = z.preprocess(
  processResponseBody,
  z.object({
    description: z.string(),
    id: z.string().uuid(),
    name: Name,
    organizationId: z.string().uuid(),
    timeCreated: DateType,
    timeModified: DateType,
  })
)

/**
 * Create-time parameters for a {@link Project}
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
 * Client view of a `Policy`, which describes how this resource may be accessed
 *
 * Note that the Policy only describes access granted explicitly for this resource.  The policies of parent resources can also cause a user to have access to this resource.
 */
export const ProjectRolePolicy = z.preprocess(
  processResponseBody,
  z.object({ roleAssignments: ProjectRoleRoleAssignment.array() })
)

/**
 * Updateable properties of a {@link Project}
 */
export const ProjectUpdate = z.preprocess(
  processResponseBody,
  z.object({ description: z.string().optional(), name: Name.optional() })
)

/**
 * Client view of an {@link Rack}
 */
export const Rack = z.preprocess(
  processResponseBody,
  z.object({ id: z.string().uuid(), timeCreated: DateType, timeModified: DateType })
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
 * Client view of a {@link Role}
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
 * When traffic is to be sent to a destination that is within a given `RouteDestination`, the corresponding {@link RouterRoute} applies, and traffic will be forward to the {@link RouteTarget} for that rule.
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
 * The classification of a {@link RouterRoute} as defined by the system. The kind determines certain attributes such as if the route is modifiable and describes how or where the route was created.
 *
 * See [RFD-21](https://rfd.shared.oxide.computer/rfd/0021#concept-router) for more context
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
    timeCreated: DateType,
    timeModified: DateType,
    vpcRouterId: z.string().uuid(),
  })
)

/**
 * Create-time parameters for a {@link RouterRoute}
 */
export const RouterRouteCreateParams = z.preprocess(
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
 * Updateable properties of a {@link RouterRoute}
 */
export const RouterRouteUpdateParams = z.preprocess(
  processResponseBody,
  z.object({
    description: z.string().optional(),
    destination: RouteDestination,
    name: Name.optional(),
    target: RouteTarget,
  })
)

export const SagaErrorInfo = z.preprocess(
  processResponseBody,
  z.union([
    z.object({ error: z.enum(['action_failed']), sourceError: z.record(z.unknown()) }),
    z.object({ error: z.enum(['deserialize_failed']), message: z.string() }),
    z.object({ error: z.enum(['injected_error']) }),
    z.object({ error: z.enum(['serialize_failed']), message: z.string() }),
    z.object({ error: z.enum(['subsaga_create_failed']), message: z.string() }),
  ])
)

export const SagaState = z.preprocess(
  processResponseBody,
  z.union([
    z.object({ state: z.enum(['running']) }),
    z.object({ state: z.enum(['succeeded']) }),
    z.object({
      errorInfo: SagaErrorInfo,
      errorNodeName: NodeName,
      state: z.enum(['failed']),
    }),
  ])
)

export const Saga = z.preprocess(
  processResponseBody,
  z.object({ id: z.string().uuid(), state: SagaState })
)

/**
 * A single page of results
 */
export const SagaResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: Saga.array(), nextPage: z.string().optional() })
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
    timeCreated: DateType,
    timeModified: DateType,
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
    signingKeypair: DerEncodedKeyPair.optional(),
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
 * Client view of a ['Silo']
 */
export const Silo = z.preprocess(
  processResponseBody,
  z.object({
    description: z.string(),
    discoverable: z.boolean(),
    id: z.string().uuid(),
    identityMode: SiloIdentityMode,
    name: Name,
    timeCreated: DateType,
    timeModified: DateType,
  })
)

/**
 * Create-time parameters for a {@link Silo}
 */
export const SiloCreate = z.preprocess(
  processResponseBody,
  z.object({
    adminGroupName: z.string().optional(),
    description: z.string(),
    discoverable: z.boolean(),
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
 * Client view of a `Policy`, which describes how this resource may be accessed
 *
 * Note that the Policy only describes access granted explicitly for this resource.  The policies of parent resources can also cause a user to have access to this resource.
 */
export const SiloRolePolicy = z.preprocess(
  processResponseBody,
  z.object({ roleAssignments: SiloRoleRoleAssignment.array() })
)

/**
 * Client view of an {@link Sled}
 */
export const Sled = z.preprocess(
  processResponseBody,
  z.object({
    id: z.string().uuid(),
    serviceAddress: z.string(),
    timeCreated: DateType,
    timeModified: DateType,
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
 * Client view of a Snapshot
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
    timeCreated: DateType,
    timeModified: DateType,
  })
)

/**
 * Create-time parameters for a {@link Snapshot}
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
 * Client view of a {@link SshKey}
 */
export const SshKey = z.preprocess(
  processResponseBody,
  z.object({
    description: z.string(),
    id: z.string().uuid(),
    name: Name,
    publicKey: z.string(),
    siloUserId: z.string().uuid(),
    timeCreated: DateType,
    timeModified: DateType,
  })
)

/**
 * Create-time parameters for an {@link SshKey}
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
 * The name of a timeseries
 *
 * Names are constructed by concatenating the target and metric names with ':'. Target and metric names must be lowercase alphanumeric characters with '_' separating words.
 */
export const TimeseriesName = z.preprocess(
  processResponseBody,
  z.string().regex(/(([a-z]+[a-z0-9]*)(_([a-z0-9]+))*):(([a-z]+[a-z0-9]*)(_([a-z0-9]+))*)/)
)

/**
 * The schema for a timeseries.
 *
 * This includes the name of the timeseries, as well as the datum type of its metric and the schema for each field.
 */
export const TimeseriesSchema = z.preprocess(
  processResponseBody,
  z.object({
    created: DateType,
    datumType: DatumType,
    fieldSchema: FieldSchema.array(),
    timeseriesName: TimeseriesName,
  })
)

/**
 * A single page of results
 */
export const TimeseriesSchemaResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: TimeseriesSchema.array(), nextPage: z.string().optional() })
)

/**
 * Client view of a {@link User}
 */
export const User = z.preprocess(
  processResponseBody,
  z.object({ displayName: z.string(), id: z.string().uuid(), siloId: z.string().uuid() })
)

/**
 * Client view of a {@link UserBuiltin}
 */
export const UserBuiltin = z.preprocess(
  processResponseBody,
  z.object({
    description: z.string(),
    id: z.string().uuid(),
    name: Name,
    timeCreated: DateType,
    timeModified: DateType,
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
    .max(63)
    .regex(
      /^(?![0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$)^[a-z][a-z0-9-]*[a-zA-Z0-9]$/
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
 * Create-time parameters for a {@link User}
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
 * Client view of a {@link Vpc}
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
    timeCreated: DateType,
    timeModified: DateType,
  })
)

/**
 * Create-time parameters for a {@link Vpc}
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
 * A `VpcFirewallRuleTarget` is used to specify the set of {@link Instance}s to which a firewall rule applies.
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
    timeCreated: DateType,
    timeModified: DateType,
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
    timeCreated: DateType,
    timeModified: DateType,
    vpcId: z.string().uuid(),
  })
)

/**
 * Create-time parameters for a {@link VpcRouter}
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
 * Updateable properties of a {@link VpcRouter}
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
    timeCreated: DateType,
    timeModified: DateType,
    vpcId: z.string().uuid(),
  })
)

/**
 * Create-time parameters for a {@link VpcSubnet}
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
 * Updateable properties of a {@link VpcSubnet}
 */
export const VpcSubnetUpdate = z.preprocess(
  processResponseBody,
  z.object({ description: z.string().optional(), name: Name.optional() })
)

/**
 * Updateable properties of a {@link Vpc}
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
 * Supported set of sort modes for scanning by id only.
 *
 * Currently, we only support scanning in ascending order.
 */
export const IdSortMode = z.preprocess(processResponseBody, z.enum(['id_ascending']))

/**
 * Supported set of sort modes for scanning by name or id
 */
export const NameOrIdSortMode = z.preprocess(
  processResponseBody,
  z.enum(['name_ascending', 'name_descending', 'id_ascending'])
)

/**
 * Supported set of sort modes for scanning by name only
 *
 * Currently, we only support scanning in ascending order.
 */
export const NameSortMode = z.preprocess(processResponseBody, z.enum(['name_ascending']))

export const DiskMetricName = z.preprocess(
  processResponseBody,
  z.enum(['activated', 'flush', 'read', 'read_bytes', 'write', 'write_bytes'])
)

export const SystemMetricName = z.preprocess(
  processResponseBody,
  z.enum(['virtual_disk_space_provisioned', 'cpus_provisioned', 'ram_provisioned'])
)

export const DiskViewByIdParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      id: z.string().uuid(),
    }),
    query: z.object({}),
  })
)

export const ImageViewByIdParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      id: z.string().uuid(),
    }),
    query: z.object({}),
  })
)

export const InstanceViewByIdParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      id: z.string().uuid(),
    }),
    query: z.object({}),
  })
)

export const InstanceNetworkInterfaceViewByIdParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      id: z.string().uuid(),
    }),
    query: z.object({}),
  })
)

export const OrganizationViewByIdParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      id: z.string().uuid(),
    }),
    query: z.object({}),
  })
)

export const ProjectViewByIdParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      id: z.string().uuid(),
    }),
    query: z.object({}),
  })
)

export const SnapshotViewByIdParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      id: z.string().uuid(),
    }),
    query: z.object({}),
  })
)

export const VpcRouterRouteViewByIdParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      id: z.string().uuid(),
    }),
    query: z.object({}),
  })
)

export const VpcRouterViewByIdParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      id: z.string().uuid(),
    }),
    query: z.object({}),
  })
)

export const VpcSubnetViewByIdParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      id: z.string().uuid(),
    }),
    query: z.object({}),
  })
)

export const VpcViewByIdParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      id: z.string().uuid(),
    }),
    query: z.object({}),
  })
)

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

export const OrganizationListParams = z.preprocess(
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

export const OrganizationCreateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({}),
  })
)

export const OrganizationViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
    }),
    query: z.object({}),
  })
)

export const OrganizationUpdateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
    }),
    query: z.object({}),
  })
)

export const OrganizationDeleteParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
    }),
    query: z.object({}),
  })
)

export const OrganizationPolicyViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
    }),
    query: z.object({}),
  })
)

export const OrganizationPolicyUpdateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
    }),
    query: z.object({}),
  })
)

export const ProjectListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
    }),
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
    path: z.object({
      orgName: Name,
    }),
    query: z.object({}),
  })
)

export const ProjectViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
      projectName: Name,
    }),
    query: z.object({}),
  })
)

export const ProjectUpdateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
      projectName: Name,
    }),
    query: z.object({}),
  })
)

export const ProjectDeleteParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
      projectName: Name,
    }),
    query: z.object({}),
  })
)

export const DiskListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
      projectName: Name,
    }),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      sortBy: NameSortMode.optional(),
    }),
  })
)

export const DiskCreateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
      projectName: Name,
    }),
    query: z.object({}),
  })
)

export const DiskViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      diskName: Name,
      orgName: Name,
      projectName: Name,
    }),
    query: z.object({}),
  })
)

export const DiskDeleteParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      diskName: Name,
      orgName: Name,
      projectName: Name,
    }),
    query: z.object({}),
  })
)

export const DiskMetricsListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      diskName: Name,
      metricName: DiskMetricName,
      orgName: Name,
      projectName: Name,
    }),
    query: z.object({
      endTime: DateType.optional(),
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      startTime: DateType.optional(),
    }),
  })
)

export const ImageListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
      projectName: Name,
    }),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      sortBy: NameSortMode.optional(),
    }),
  })
)

export const ImageCreateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
      projectName: Name,
    }),
    query: z.object({}),
  })
)

export const ImageViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      imageName: Name,
      orgName: Name,
      projectName: Name,
    }),
    query: z.object({}),
  })
)

export const ImageDeleteParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      imageName: Name,
      orgName: Name,
      projectName: Name,
    }),
    query: z.object({}),
  })
)

export const InstanceListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
      projectName: Name,
    }),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      sortBy: NameSortMode.optional(),
    }),
  })
)

export const InstanceCreateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
      projectName: Name,
    }),
    query: z.object({}),
  })
)

export const InstanceViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      instanceName: Name,
      orgName: Name,
      projectName: Name,
    }),
    query: z.object({}),
  })
)

export const InstanceDeleteParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      instanceName: Name,
      orgName: Name,
      projectName: Name,
    }),
    query: z.object({}),
  })
)

export const InstanceDiskListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      instanceName: Name,
      orgName: Name,
      projectName: Name,
    }),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      sortBy: NameSortMode.optional(),
    }),
  })
)

export const InstanceDiskAttachParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      instanceName: Name,
      orgName: Name,
      projectName: Name,
    }),
    query: z.object({}),
  })
)

export const InstanceDiskDetachParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      instanceName: Name,
      orgName: Name,
      projectName: Name,
    }),
    query: z.object({}),
  })
)

export const InstanceExternalIpListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      instanceName: Name,
      orgName: Name,
      projectName: Name,
    }),
    query: z.object({}),
  })
)

export const InstanceMigrateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      instanceName: Name,
      orgName: Name,
      projectName: Name,
    }),
    query: z.object({}),
  })
)

export const InstanceNetworkInterfaceListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      instanceName: Name,
      orgName: Name,
      projectName: Name,
    }),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      sortBy: NameSortMode.optional(),
    }),
  })
)

export const InstanceNetworkInterfaceCreateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      instanceName: Name,
      orgName: Name,
      projectName: Name,
    }),
    query: z.object({}),
  })
)

export const InstanceNetworkInterfaceViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      instanceName: Name,
      interfaceName: Name,
      orgName: Name,
      projectName: Name,
    }),
    query: z.object({}),
  })
)

export const InstanceNetworkInterfaceUpdateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      instanceName: Name,
      interfaceName: Name,
      orgName: Name,
      projectName: Name,
    }),
    query: z.object({}),
  })
)

export const InstanceNetworkInterfaceDeleteParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      instanceName: Name,
      interfaceName: Name,
      orgName: Name,
      projectName: Name,
    }),
    query: z.object({}),
  })
)

export const InstanceRebootParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      instanceName: Name,
      orgName: Name,
      projectName: Name,
    }),
    query: z.object({}),
  })
)

export const InstanceSerialConsoleParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      instanceName: Name,
      orgName: Name,
      projectName: Name,
    }),
    query: z.object({
      fromStart: z.number().min(0).optional(),
      maxBytes: z.number().min(0).optional(),
      mostRecent: z.number().min(0).optional(),
    }),
  })
)

export const InstanceSerialConsoleStreamParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      instanceName: Name,
      orgName: Name,
      projectName: Name,
    }),
    query: z.object({}),
  })
)

export const InstanceStartParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      instanceName: Name,
      orgName: Name,
      projectName: Name,
    }),
    query: z.object({}),
  })
)

export const InstanceStopParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      instanceName: Name,
      orgName: Name,
      projectName: Name,
    }),
    query: z.object({}),
  })
)

export const ProjectPolicyViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
      projectName: Name,
    }),
    query: z.object({}),
  })
)

export const ProjectPolicyUpdateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
      projectName: Name,
    }),
    query: z.object({}),
  })
)

export const SnapshotListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
      projectName: Name,
    }),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      sortBy: NameSortMode.optional(),
    }),
  })
)

export const SnapshotCreateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
      projectName: Name,
    }),
    query: z.object({}),
  })
)

export const SnapshotViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
      projectName: Name,
      snapshotName: Name,
    }),
    query: z.object({}),
  })
)

export const SnapshotDeleteParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
      projectName: Name,
      snapshotName: Name,
    }),
    query: z.object({}),
  })
)

export const VpcListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
      projectName: Name,
    }),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      sortBy: NameSortMode.optional(),
    }),
  })
)

export const VpcCreateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
      projectName: Name,
    }),
    query: z.object({}),
  })
)

export const VpcViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
      projectName: Name,
      vpcName: Name,
    }),
    query: z.object({}),
  })
)

export const VpcUpdateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
      projectName: Name,
      vpcName: Name,
    }),
    query: z.object({}),
  })
)

export const VpcDeleteParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
      projectName: Name,
      vpcName: Name,
    }),
    query: z.object({}),
  })
)

export const VpcFirewallRulesViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
      projectName: Name,
      vpcName: Name,
    }),
    query: z.object({}),
  })
)

export const VpcFirewallRulesUpdateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
      projectName: Name,
      vpcName: Name,
    }),
    query: z.object({}),
  })
)

export const VpcRouterListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
      projectName: Name,
      vpcName: Name,
    }),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      sortBy: NameSortMode.optional(),
    }),
  })
)

export const VpcRouterCreateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
      projectName: Name,
      vpcName: Name,
    }),
    query: z.object({}),
  })
)

export const VpcRouterViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
      projectName: Name,
      routerName: Name,
      vpcName: Name,
    }),
    query: z.object({}),
  })
)

export const VpcRouterUpdateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
      projectName: Name,
      routerName: Name,
      vpcName: Name,
    }),
    query: z.object({}),
  })
)

export const VpcRouterDeleteParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
      projectName: Name,
      routerName: Name,
      vpcName: Name,
    }),
    query: z.object({}),
  })
)

export const VpcRouterRouteListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
      projectName: Name,
      routerName: Name,
      vpcName: Name,
    }),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      sortBy: NameSortMode.optional(),
    }),
  })
)

export const VpcRouterRouteCreateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
      projectName: Name,
      routerName: Name,
      vpcName: Name,
    }),
    query: z.object({}),
  })
)

export const VpcRouterRouteViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
      projectName: Name,
      routeName: Name,
      routerName: Name,
      vpcName: Name,
    }),
    query: z.object({}),
  })
)

export const VpcRouterRouteUpdateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
      projectName: Name,
      routeName: Name,
      routerName: Name,
      vpcName: Name,
    }),
    query: z.object({}),
  })
)

export const VpcRouterRouteDeleteParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
      projectName: Name,
      routeName: Name,
      routerName: Name,
      vpcName: Name,
    }),
    query: z.object({}),
  })
)

export const VpcSubnetListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
      projectName: Name,
      vpcName: Name,
    }),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      sortBy: NameSortMode.optional(),
    }),
  })
)

export const VpcSubnetCreateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
      projectName: Name,
      vpcName: Name,
    }),
    query: z.object({}),
  })
)

export const VpcSubnetViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
      projectName: Name,
      subnetName: Name,
      vpcName: Name,
    }),
    query: z.object({}),
  })
)

export const VpcSubnetUpdateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
      projectName: Name,
      subnetName: Name,
      vpcName: Name,
    }),
    query: z.object({}),
  })
)

export const VpcSubnetDeleteParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
      projectName: Name,
      subnetName: Name,
      vpcName: Name,
    }),
    query: z.object({}),
  })
)

export const VpcSubnetListNetworkInterfacesParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      orgName: Name,
      projectName: Name,
      subnetName: Name,
      vpcName: Name,
    }),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      sortBy: NameSortMode.optional(),
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

export const SessionMeParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({}),
  })
)

export const SessionMeGroupsParams = z.preprocess(
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

export const SessionSshkeyListParams = z.preprocess(
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

export const SessionSshkeyCreateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({}),
  })
)

export const SessionSshkeyViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      sshKeyName: Name,
    }),
    query: z.object({}),
  })
)

export const SessionSshkeyDeleteParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      sshKeyName: Name,
    }),
    query: z.object({}),
  })
)

export const SystemImageViewByIdParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      id: z.string().uuid(),
    }),
    query: z.object({}),
  })
)

export const IpPoolViewByIdParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      id: z.string().uuid(),
    }),
    query: z.object({}),
  })
)

export const SiloViewByIdParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      id: z.string().uuid(),
    }),
    query: z.object({}),
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

export const SystemImageListParams = z.preprocess(
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

export const SystemImageCreateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({}),
  })
)

export const SystemImageViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      imageName: Name,
    }),
    query: z.object({}),
  })
)

export const SystemImageDeleteParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      imageName: Name,
    }),
    query: z.object({}),
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
      poolName: Name,
    }),
    query: z.object({}),
  })
)

export const IpPoolUpdateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      poolName: Name,
    }),
    query: z.object({}),
  })
)

export const IpPoolDeleteParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      poolName: Name,
    }),
    query: z.object({}),
  })
)

export const IpPoolRangeListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      poolName: Name,
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
      poolName: Name,
    }),
    query: z.object({}),
  })
)

export const IpPoolRangeRemoveParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      poolName: Name,
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
      endTime: DateType.optional(),
      id: z.string().uuid().optional(),
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      startTime: DateType.optional(),
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

export const SagaListParams = z.preprocess(
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

export const SagaViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      sagaId: z.string().uuid(),
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
      siloName: Name,
    }),
    query: z.object({}),
  })
)

export const SiloDeleteParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      siloName: Name,
    }),
    query: z.object({}),
  })
)

export const SiloIdentityProviderListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      siloName: Name,
    }),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      sortBy: NameSortMode.optional(),
    }),
  })
)

export const LocalIdpUserCreateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      siloName: Name,
    }),
    query: z.object({}),
  })
)

export const LocalIdpUserDeleteParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      siloName: Name,
      userId: z.string().uuid(),
    }),
    query: z.object({}),
  })
)

export const LocalIdpUserSetPasswordParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      siloName: Name,
      userId: z.string().uuid(),
    }),
    query: z.object({}),
  })
)

export const SamlIdentityProviderCreateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      siloName: Name,
    }),
    query: z.object({}),
  })
)

export const SamlIdentityProviderViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      providerName: Name,
      siloName: Name,
    }),
    query: z.object({}),
  })
)

export const SiloPolicyViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      siloName: Name,
    }),
    query: z.object({}),
  })
)

export const SiloPolicyUpdateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      siloName: Name,
    }),
    query: z.object({}),
  })
)

export const SiloUsersListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      siloName: Name,
    }),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      sortBy: IdSortMode.optional(),
    }),
  })
)

export const SiloUserViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      siloName: Name,
      userId: z.string().uuid(),
    }),
    query: z.object({}),
  })
)

export const UpdatesRefreshParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({}),
  })
)

export const SystemUserListParams = z.preprocess(
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

export const SystemUserViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      userName: Name,
    }),
    query: z.object({}),
  })
)

export const TimeseriesSchemaGetParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
    }),
  })
)

export const UserListParams = z.preprocess(
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

export const DiskListV1Params = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      organization: NameOrId.optional(),
      pageToken: z.string().optional(),
      project: NameOrId.optional(),
      sortBy: NameOrIdSortMode.optional(),
    }),
  })
)

export const DiskCreateV1Params = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      organization: NameOrId.optional(),
      project: NameOrId.optional(),
    }),
  })
)

export const DiskViewV1Params = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      disk: NameOrId,
    }),
    query: z.object({
      organization: NameOrId.optional(),
      project: NameOrId.optional(),
    }),
  })
)

export const DiskDeleteV1Params = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      disk: NameOrId,
    }),
    query: z.object({
      organization: NameOrId.optional(),
      project: NameOrId.optional(),
    }),
  })
)

export const InstanceListV1Params = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      organization: NameOrId.optional(),
      pageToken: z.string().optional(),
      project: NameOrId.optional(),
      sortBy: NameOrIdSortMode.optional(),
    }),
  })
)

export const InstanceCreateV1Params = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      organization: NameOrId.optional(),
      project: NameOrId.optional(),
    }),
  })
)

export const InstanceViewV1Params = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      instance: NameOrId,
    }),
    query: z.object({
      organization: NameOrId.optional(),
      project: NameOrId.optional(),
    }),
  })
)

export const InstanceDeleteV1Params = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      instance: NameOrId,
    }),
    query: z.object({
      organization: NameOrId.optional(),
      project: NameOrId.optional(),
    }),
  })
)

export const InstanceDiskListV1Params = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      instance: NameOrId,
    }),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      organization: NameOrId.optional(),
      pageToken: z.string().optional(),
      project: NameOrId.optional(),
      sortBy: NameOrIdSortMode.optional(),
    }),
  })
)

export const InstanceDiskAttachV1Params = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      instance: NameOrId,
    }),
    query: z.object({
      organization: NameOrId.optional(),
      project: NameOrId.optional(),
    }),
  })
)

export const InstanceDiskDetachV1Params = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      instance: NameOrId,
    }),
    query: z.object({
      organization: NameOrId.optional(),
      project: NameOrId.optional(),
    }),
  })
)

export const InstanceMigrateV1Params = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      instance: NameOrId,
    }),
    query: z.object({
      organization: NameOrId.optional(),
      project: NameOrId.optional(),
    }),
  })
)

export const InstanceRebootV1Params = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      instance: NameOrId,
    }),
    query: z.object({
      organization: NameOrId.optional(),
      project: NameOrId.optional(),
    }),
  })
)

export const InstanceSerialConsoleV1Params = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      instance: NameOrId,
    }),
    query: z.object({
      fromStart: z.number().min(0).optional(),
      maxBytes: z.number().min(0).optional(),
      mostRecent: z.number().min(0).optional(),
      organization: NameOrId.optional(),
      project: NameOrId.optional(),
    }),
  })
)

export const InstanceSerialConsoleStreamV1Params = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      instance: NameOrId,
    }),
    query: z.object({
      organization: NameOrId.optional(),
      project: NameOrId.optional(),
    }),
  })
)

export const InstanceStartV1Params = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      instance: NameOrId,
    }),
    query: z.object({
      organization: NameOrId.optional(),
      project: NameOrId.optional(),
    }),
  })
)

export const InstanceStopV1Params = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      instance: NameOrId,
    }),
    query: z.object({
      organization: NameOrId.optional(),
      project: NameOrId.optional(),
    }),
  })
)

export const OrganizationListV1Params = z.preprocess(
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

export const OrganizationCreateV1Params = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({}),
  })
)

export const OrganizationViewV1Params = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      organization: NameOrId,
    }),
    query: z.object({}),
  })
)

export const OrganizationUpdateV1Params = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      organization: NameOrId,
    }),
    query: z.object({}),
  })
)

export const OrganizationDeleteV1Params = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      organization: NameOrId,
    }),
    query: z.object({}),
  })
)

export const OrganizationPolicyViewV1Params = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      organization: NameOrId,
    }),
    query: z.object({}),
  })
)

export const OrganizationPolicyUpdateV1Params = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      organization: NameOrId,
    }),
    query: z.object({}),
  })
)

export const ProjectListV1Params = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      organization: NameOrId.optional(),
      pageToken: z.string().optional(),
      sortBy: NameOrIdSortMode.optional(),
    }),
  })
)

export const ProjectCreateV1Params = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      organization: NameOrId.optional(),
    }),
  })
)

export const ProjectViewV1Params = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      project: NameOrId,
    }),
    query: z.object({
      organization: NameOrId.optional(),
    }),
  })
)

export const ProjectUpdateV1Params = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      project: NameOrId,
    }),
    query: z.object({
      organization: NameOrId.optional(),
    }),
  })
)

export const ProjectDeleteV1Params = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      project: NameOrId,
    }),
    query: z.object({
      organization: NameOrId.optional(),
    }),
  })
)

export const ProjectPolicyViewV1Params = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      project: NameOrId,
    }),
    query: z.object({
      organization: NameOrId.optional(),
    }),
  })
)

export const ProjectPolicyUpdateV1Params = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      project: NameOrId,
    }),
    query: z.object({
      organization: NameOrId.optional(),
    }),
  })
)
