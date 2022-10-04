/* eslint-disable */
import { ZodType, z } from 'zod'

import type { RequestParams } from './http-client'
import { HttpClient } from './http-client'

const DateType = z.preprocess((arg) => {
  if (typeof arg == 'string' || arg instanceof Date) return new Date(arg)
}, z.date())
type DateType = z.infer<typeof DateType>
const IntEnum = <T extends readonly number[]>(values: T) =>
  z.number().refine((v) => values.includes(v)) as ZodType<T[number]>

export type {
  ApiConfig,
  ApiError,
  ApiResult,
  ClientError,
  ErrorBody,
  ErrorResult,
} from './http-client'

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

export type BinRangedouble = z.infer<typeof BinRangedouble>

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

export type BinRangeint64 = z.infer<typeof BinRangeint64>

/**
 * Type storing bin edges and a count of samples within it.
 */
export const Bindouble = z.object({ count: z.number().min(0), range: BinRangedouble })
export type Bindouble = z.infer<typeof Bindouble>

/**
 * Type storing bin edges and a count of samples within it.
 */
export const Binint64 = z.object({ count: z.number().min(0), range: BinRangeint64 })
export type Binint64 = z.infer<typeof Binint64>

/**
 * disk block size in bytes
 */
export const BlockSize = IntEnum([512, 2048, 4096] as const)
export type BlockSize = z.infer<typeof BlockSize>

/**
 * A count of bytes, typically used either for memory or storage capacity
 *
 * The maximum supported byte count is `i64::MAX`.  This makes it somewhat inconvenient to define constructors: a u32 constructor can be infallible, but an i64 constructor can fail (if the value is negative) and a u64 constructor can fail (if the value is larger than i64::MAX).  We provide all of these for consumers' convenience.
 */
export const ByteCount = z.number().min(0)
export type ByteCount = z.infer<typeof ByteCount>

/**
 * A cumulative or counter data type.
 */
export const Cumulativedouble = z.object({ startTime: DateType, value: z.number() })
export type Cumulativedouble = z.infer<typeof Cumulativedouble>

/**
 * A cumulative or counter data type.
 */
export const Cumulativeint64 = z.object({ startTime: DateType, value: z.number() })
export type Cumulativeint64 = z.infer<typeof Cumulativeint64>

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
export type Histogramint64 = z.infer<typeof Histogramint64>

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
export type Histogramdouble = z.infer<typeof Histogramdouble>

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

export type Datum = z.infer<typeof Datum>

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
export type DatumType = z.infer<typeof DatumType>

export const DerEncodedKeyPair = z.object({
  privateKey: z.string(),
  publicCert: z.string(),
})
export type DerEncodedKeyPair = z.infer<typeof DerEncodedKeyPair>

export const DeviceAccessTokenRequest = z.object({
  clientId: z.string().uuid(),
  deviceCode: z.string(),
  grantType: z.string(),
})
export type DeviceAccessTokenRequest = z.infer<typeof DeviceAccessTokenRequest>

export const DeviceAuthRequest = z.object({ clientId: z.string().uuid() })
export type DeviceAuthRequest = z.infer<typeof DeviceAuthRequest>

export const DeviceAuthVerify = z.object({ userCode: z.string() })
export type DeviceAuthVerify = z.infer<typeof DeviceAuthVerify>

export const Digest = z.object({ type: z.enum(['sha256']), value: z.string() })

export type Digest = z.infer<typeof Digest>

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
export type Name = z.infer<typeof Name>

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

export type DiskState = z.infer<typeof DiskState>

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
export type Disk = z.infer<typeof Disk>

/**
 * Different sources for a disk
 */
export const DiskSource = z.union([
  z.object({ blockSize: BlockSize, type: z.enum(['blank']) }),
  z.object({ snapshotId: z.string().uuid(), type: z.enum(['snapshot']) }),
  z.object({ imageId: z.string().uuid(), type: z.enum(['image']) }),
  z.object({ imageId: z.string().uuid(), type: z.enum(['global_image']) }),
])

export type DiskSource = z.infer<typeof DiskSource>

/**
 * Create-time parameters for a {@link Disk}
 */
export const DiskCreate = z.object({
  description: z.string(),
  diskSource: DiskSource,
  name: Name,
  size: ByteCount,
})
export type DiskCreate = z.infer<typeof DiskCreate>

/**
 * Parameters for the {@link Disk} to be attached or detached to an instance
 */
export const DiskIdentifier = z.object({ name: Name })
export type DiskIdentifier = z.infer<typeof DiskIdentifier>

/**
 * A single page of results
 */
export const DiskResultsPage = z.object({
  items: Disk.array(),
  nextPage: z.string().nullable().optional(),
})
export type DiskResultsPage = z.infer<typeof DiskResultsPage>

/**
 * OS image distribution
 */
export const Distribution = z.object({ name: Name, version: z.string() })
export type Distribution = z.infer<typeof Distribution>

/**
 * The kind of an external IP address for an instance
 */
export const IpKind = z.enum(['ephemeral', 'floating'])
export type IpKind = z.infer<typeof IpKind>

export const ExternalIp = z.object({ ip: z.string(), kind: IpKind })
export type ExternalIp = z.infer<typeof ExternalIp>

/**
 * Parameters for creating an external IP address for instances.
 */
export const ExternalIpCreate = z.object({
  poolName: Name.nullable().optional(),
  type: z.enum(['ephemeral']),
})

export type ExternalIpCreate = z.infer<typeof ExternalIpCreate>

/**
 * A single page of results
 */
export const ExternalIpResultsPage = z.object({
  items: ExternalIp.array(),
  nextPage: z.string().nullable().optional(),
})
export type ExternalIpResultsPage = z.infer<typeof ExternalIpResultsPage>

/**
 * The source from which a field is derived, the target or metric.
 */
export const FieldSource = z.enum(['target', 'metric'])
export type FieldSource = z.infer<typeof FieldSource>

/**
 * The `FieldType` identifies the data type of a target or metric field.
 */
export const FieldType = z.enum(['string', 'i64', 'ip_addr', 'uuid', 'bool'])
export type FieldType = z.infer<typeof FieldType>

/**
 * The name and type information for a field of a timeseries schema.
 */
export const FieldSchema = z.object({
  name: z.string(),
  source: FieldSource,
  ty: FieldType,
})
export type FieldSchema = z.infer<typeof FieldSchema>

export const FleetRole = z.enum(['admin', 'collaborator', 'viewer'])
export type FleetRole = z.infer<typeof FleetRole>

/**
 * Describes what kind of identity is described by an id
 */
export const IdentityType = z.enum(['silo_user', 'silo_group'])
export type IdentityType = z.infer<typeof IdentityType>

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
export type FleetRoleRoleAssignment = z.infer<typeof FleetRoleRoleAssignment>

/**
 * Client view of a `Policy`, which describes how this resource may be accessed
 *
 * Note that the Policy only describes access granted explicitly for this resource.  The policies of parent resources can also cause a user to have access to this resource.
 */
export const FleetRolePolicy = z.object({
  roleAssignments: FleetRoleRoleAssignment.array(),
})
export type FleetRolePolicy = z.infer<typeof FleetRolePolicy>

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
export type GlobalImage = z.infer<typeof GlobalImage>

/**
 * The source of the underlying image.
 */
export const ImageSource = z.union([
  z.object({ type: z.enum(['url']), url: z.string() }),
  z.object({ id: z.string().uuid(), type: z.enum(['snapshot']) }),
  z.object({ type: z.enum(['you_can_boot_anything_as_long_as_its_alpine']) }),
])

export type ImageSource = z.infer<typeof ImageSource>

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
export type GlobalImageCreate = z.infer<typeof GlobalImageCreate>

/**
 * A single page of results
 */
export const GlobalImageResultsPage = z.object({
  items: GlobalImage.array(),
  nextPage: z.string().nullable().optional(),
})
export type GlobalImageResultsPage = z.infer<typeof GlobalImageResultsPage>

export const IdentityProviderType = z.enum(['saml'])
export type IdentityProviderType = z.infer<typeof IdentityProviderType>

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
export type IdentityProvider = z.infer<typeof IdentityProvider>

/**
 * A single page of results
 */
export const IdentityProviderResultsPage = z.object({
  items: IdentityProvider.array(),
  nextPage: z.string().nullable().optional(),
})
export type IdentityProviderResultsPage = z.infer<typeof IdentityProviderResultsPage>

export const IdpMetadataSource = z.union([
  z.object({ type: z.enum(['url']), url: z.string() }),
  z.object({ data: z.string(), type: z.enum(['base64_encoded_xml']) }),
])

export type IdpMetadataSource = z.infer<typeof IdpMetadataSource>

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
export type Image = z.infer<typeof Image>

/**
 * Create-time parameters for an {@link Image}
 */
export const ImageCreate = z.object({
  blockSize: BlockSize,
  description: z.string(),
  name: Name,
  source: ImageSource,
})
export type ImageCreate = z.infer<typeof ImageCreate>

/**
 * A single page of results
 */
export const ImageResultsPage = z.object({
  items: Image.array(),
  nextPage: z.string().nullable().optional(),
})
export type ImageResultsPage = z.infer<typeof ImageResultsPage>

/**
 * The number of CPUs in an Instance
 */
export const InstanceCpuCount = z.number().min(0).max(65535)
export type InstanceCpuCount = z.infer<typeof InstanceCpuCount>

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
export type InstanceState = z.infer<typeof InstanceState>

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
export type Instance = z.infer<typeof Instance>

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

export type InstanceDiskAttachment = z.infer<typeof InstanceDiskAttachment>

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
export type NetworkInterfaceCreate = z.infer<typeof NetworkInterfaceCreate>

/**
 * Describes an attachment of a `NetworkInterface` to an `Instance`, at the time the instance is created.
 */
export const InstanceNetworkInterfaceAttachment = z.union([
  z.object({ params: NetworkInterfaceCreate.array(), type: z.enum(['create']) }),
  z.object({ type: z.enum(['default']) }),
  z.object({ type: z.enum(['none']) }),
])

export type InstanceNetworkInterfaceAttachment = z.infer<
  typeof InstanceNetworkInterfaceAttachment
>

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
export type InstanceCreate = z.infer<typeof InstanceCreate>

/**
 * Migration parameters for an {@link Instance}
 */
export const InstanceMigrate = z.object({ dstSledId: z.string().uuid() })
export type InstanceMigrate = z.infer<typeof InstanceMigrate>

/**
 * A single page of results
 */
export const InstanceResultsPage = z.object({
  items: Instance.array(),
  nextPage: z.string().nullable().optional(),
})
export type InstanceResultsPage = z.infer<typeof InstanceResultsPage>

/**
 * Contents of an Instance's serial console buffer.
 */
export const InstanceSerialConsoleData = z.object({
  data: z.number().min(0).max(255).array(),
  lastByteOffset: z.number().min(0),
})
export type InstanceSerialConsoleData = z.infer<typeof InstanceSerialConsoleData>

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
export type Ipv4Net = z.infer<typeof Ipv4Net>

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
export type Ipv6Net = z.infer<typeof Ipv6Net>

export const IpNet = z.union([Ipv4Net, Ipv6Net])

export type IpNet = z.infer<typeof IpNet>

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
export type IpPool = z.infer<typeof IpPool>

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
export type IpPoolCreate = z.infer<typeof IpPoolCreate>

/**
 * A non-decreasing IPv4 address range, inclusive of both ends.
 *
 * The first address must be less than or equal to the last address.
 */
export const Ipv4Range = z.object({ first: z.string(), last: z.string() })
export type Ipv4Range = z.infer<typeof Ipv4Range>

/**
 * A non-decreasing IPv6 address range, inclusive of both ends.
 *
 * The first address must be less than or equal to the last address.
 */
export const Ipv6Range = z.object({ first: z.string(), last: z.string() })
export type Ipv6Range = z.infer<typeof Ipv6Range>

export const IpRange = z.union([Ipv4Range, Ipv6Range])

export type IpRange = z.infer<typeof IpRange>

export const IpPoolRange = z.object({
  id: z.string().uuid(),
  range: IpRange,
  timeCreated: DateType,
})
export type IpPoolRange = z.infer<typeof IpPoolRange>

/**
 * A single page of results
 */
export const IpPoolRangeResultsPage = z.object({
  items: IpPoolRange.array(),
  nextPage: z.string().nullable().optional(),
})
export type IpPoolRangeResultsPage = z.infer<typeof IpPoolRangeResultsPage>

/**
 * A single page of results
 */
export const IpPoolResultsPage = z.object({
  items: IpPool.array(),
  nextPage: z.string().nullable().optional(),
})
export type IpPoolResultsPage = z.infer<typeof IpPoolResultsPage>

/**
 * Parameters for updating an IP Pool
 */
export const IpPoolUpdate = z.object({
  description: z.string().nullable().optional(),
  name: Name.nullable().optional(),
})
export type IpPoolUpdate = z.infer<typeof IpPoolUpdate>

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
export type L4PortRange = z.infer<typeof L4PortRange>

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
export type MacAddr = z.infer<typeof MacAddr>

/**
 * A `Measurement` is a timestamped datum from a single metric
 */
export const Measurement = z.object({ datum: Datum, timestamp: DateType })
export type Measurement = z.infer<typeof Measurement>

/**
 * A single page of results
 */
export const MeasurementResultsPage = z.object({
  items: Measurement.array(),
  nextPage: z.string().nullable().optional(),
})
export type MeasurementResultsPage = z.infer<typeof MeasurementResultsPage>

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
export type NetworkInterface = z.infer<typeof NetworkInterface>

/**
 * A single page of results
 */
export const NetworkInterfaceResultsPage = z.object({
  items: NetworkInterface.array(),
  nextPage: z.string().nullable().optional(),
})
export type NetworkInterfaceResultsPage = z.infer<typeof NetworkInterfaceResultsPage>

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
export type NetworkInterfaceUpdate = z.infer<typeof NetworkInterfaceUpdate>

/**
 * Unique name for a saga `Node`
 *
 * Each node requires a string name that's unique within its DAG.  The name is used to identify its output.  Nodes that depend on a given node (either directly or indirectly) can access the node's output using its name.
 */
export const NodeName = z.string()
export type NodeName = z.infer<typeof NodeName>

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
export type Organization = z.infer<typeof Organization>

/**
 * Create-time parameters for an {@link Organization}
 */
export const OrganizationCreate = z.object({ description: z.string(), name: Name })
export type OrganizationCreate = z.infer<typeof OrganizationCreate>

/**
 * A single page of results
 */
export const OrganizationResultsPage = z.object({
  items: Organization.array(),
  nextPage: z.string().nullable().optional(),
})
export type OrganizationResultsPage = z.infer<typeof OrganizationResultsPage>

export const OrganizationRole = z.enum(['admin', 'collaborator', 'viewer'])
export type OrganizationRole = z.infer<typeof OrganizationRole>

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
export type OrganizationRoleRoleAssignment = z.infer<typeof OrganizationRoleRoleAssignment>

/**
 * Client view of a `Policy`, which describes how this resource may be accessed
 *
 * Note that the Policy only describes access granted explicitly for this resource.  The policies of parent resources can also cause a user to have access to this resource.
 */
export const OrganizationRolePolicy = z.object({
  roleAssignments: OrganizationRoleRoleAssignment.array(),
})
export type OrganizationRolePolicy = z.infer<typeof OrganizationRolePolicy>

/**
 * Updateable properties of an {@link Organization}
 */
export const OrganizationUpdate = z.object({
  description: z.string().nullable().optional(),
  name: Name.nullable().optional(),
})
export type OrganizationUpdate = z.infer<typeof OrganizationUpdate>

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
export type Project = z.infer<typeof Project>

/**
 * Create-time parameters for a {@link Project}
 */
export const ProjectCreate = z.object({ description: z.string(), name: Name })
export type ProjectCreate = z.infer<typeof ProjectCreate>

/**
 * A single page of results
 */
export const ProjectResultsPage = z.object({
  items: Project.array(),
  nextPage: z.string().nullable().optional(),
})
export type ProjectResultsPage = z.infer<typeof ProjectResultsPage>

export const ProjectRole = z.enum(['admin', 'collaborator', 'viewer'])
export type ProjectRole = z.infer<typeof ProjectRole>

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
export type ProjectRoleRoleAssignment = z.infer<typeof ProjectRoleRoleAssignment>

/**
 * Client view of a `Policy`, which describes how this resource may be accessed
 *
 * Note that the Policy only describes access granted explicitly for this resource.  The policies of parent resources can also cause a user to have access to this resource.
 */
export const ProjectRolePolicy = z.object({
  roleAssignments: ProjectRoleRoleAssignment.array(),
})
export type ProjectRolePolicy = z.infer<typeof ProjectRolePolicy>

/**
 * Updateable properties of a {@link Project}
 */
export const ProjectUpdate = z.object({
  description: z.string().nullable().optional(),
  name: Name.nullable().optional(),
})
export type ProjectUpdate = z.infer<typeof ProjectUpdate>

/**
 * Client view of an {@link Rack}
 */
export const Rack = z.object({
  id: z.string().uuid(),
  timeCreated: DateType,
  timeModified: DateType,
})
export type Rack = z.infer<typeof Rack>

/**
 * A single page of results
 */
export const RackResultsPage = z.object({
  items: Rack.array(),
  nextPage: z.string().nullable().optional(),
})
export type RackResultsPage = z.infer<typeof RackResultsPage>

/**
 * A name for a built-in role
 *
 * Role names consist of two string components separated by dot (".").
 */
export const RoleName = z
  .string()
  .max(63)
  .regex(/[a-z-]+\.[a-z-]+/)
export type RoleName = z.infer<typeof RoleName>

/**
 * Client view of a {@link Role}
 */
export const Role = z.object({ description: z.string(), name: RoleName })
export type Role = z.infer<typeof Role>

/**
 * A single page of results
 */
export const RoleResultsPage = z.object({
  items: Role.array(),
  nextPage: z.string().nullable().optional(),
})
export type RoleResultsPage = z.infer<typeof RoleResultsPage>

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

export type RouteDestination = z.infer<typeof RouteDestination>

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

export type RouteTarget = z.infer<typeof RouteTarget>

/**
 * The classification of a {@link RouterRoute} as defined by the system. The kind determines certain attributes such as if the route is modifiable and describes how or where the route was created.
 *
 * See [RFD-21](https://rfd.shared.oxide.computer/rfd/0021#concept-router) for more context
 */
export const RouterRouteKind = z.enum(['default', 'vpc_subnet', 'vpc_peering', 'custom'])
export type RouterRouteKind = z.infer<typeof RouterRouteKind>

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
export type RouterRoute = z.infer<typeof RouterRoute>

/**
 * Create-time parameters for a {@link RouterRoute}
 */
export const RouterRouteCreateParams = z.object({
  description: z.string(),
  destination: RouteDestination,
  name: Name,
  target: RouteTarget,
})
export type RouterRouteCreateParams = z.infer<typeof RouterRouteCreateParams>

/**
 * A single page of results
 */
export const RouterRouteResultsPage = z.object({
  items: RouterRoute.array(),
  nextPage: z.string().nullable().optional(),
})
export type RouterRouteResultsPage = z.infer<typeof RouterRouteResultsPage>

/**
 * Updateable properties of a {@link RouterRoute}
 */
export const RouterRouteUpdateParams = z.object({
  description: z.string().nullable().optional(),
  destination: RouteDestination,
  name: Name.nullable().optional(),
  target: RouteTarget,
})
export type RouterRouteUpdateParams = z.infer<typeof RouterRouteUpdateParams>

export const SagaErrorInfo = z.union([
  z.object({ error: z.enum(['action_failed']), sourceError: z.object({}).optional() }),
  z.object({ error: z.enum(['deserialize_failed']), message: z.string() }),
  z.object({ error: z.enum(['injected_error']) }),
  z.object({ error: z.enum(['serialize_failed']), message: z.string() }),
  z.object({ error: z.enum(['subsaga_create_failed']), message: z.string() }),
])

export type SagaErrorInfo = z.infer<typeof SagaErrorInfo>

export const SagaState = z.union([
  z.object({ state: z.enum(['running']) }),
  z.object({ state: z.enum(['succeeded']) }),
  z.object({
    errorInfo: SagaErrorInfo,
    errorNodeName: NodeName,
    state: z.enum(['failed']),
  }),
])

export type SagaState = z.infer<typeof SagaState>

export const Saga = z.object({ id: z.string().uuid(), state: SagaState })
export type Saga = z.infer<typeof Saga>

/**
 * A single page of results
 */
export const SagaResultsPage = z.object({
  items: Saga.array(),
  nextPage: z.string().nullable().optional(),
})
export type SagaResultsPage = z.infer<typeof SagaResultsPage>

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
export type SamlIdentityProvider = z.infer<typeof SamlIdentityProvider>

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
export type SamlIdentityProviderCreate = z.infer<typeof SamlIdentityProviderCreate>

/**
 * How users will be provisioned in a silo during authentication.
 */
export const UserProvisionType = z.enum(['fixed', 'jit'])
export type UserProvisionType = z.infer<typeof UserProvisionType>

/**
 * Client view of a ['Silo']
 */
export const Silo = z.object({
  description: z.string(),
  discoverable: z.boolean(),
  id: z.string().uuid(),
  name: Name,
  timeCreated: DateType,
  timeModified: DateType,
  userProvisionType: UserProvisionType,
})
export type Silo = z.infer<typeof Silo>

/**
 * Create-time parameters for a {@link Silo}
 */
export const SiloCreate = z.object({
  adminGroupName: z.string().nullable().optional(),
  description: z.string(),
  discoverable: z.boolean(),
  name: Name,
  userProvisionType: UserProvisionType,
})
export type SiloCreate = z.infer<typeof SiloCreate>

/**
 * A single page of results
 */
export const SiloResultsPage = z.object({
  items: Silo.array(),
  nextPage: z.string().nullable().optional(),
})
export type SiloResultsPage = z.infer<typeof SiloResultsPage>

export const SiloRole = z.enum(['admin', 'collaborator', 'viewer'])
export type SiloRole = z.infer<typeof SiloRole>

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
export type SiloRoleRoleAssignment = z.infer<typeof SiloRoleRoleAssignment>

/**
 * Client view of a `Policy`, which describes how this resource may be accessed
 *
 * Note that the Policy only describes access granted explicitly for this resource.  The policies of parent resources can also cause a user to have access to this resource.
 */
export const SiloRolePolicy = z.object({ roleAssignments: SiloRoleRoleAssignment.array() })
export type SiloRolePolicy = z.infer<typeof SiloRolePolicy>

/**
 * Client view of an {@link Sled}
 */
export const Sled = z.object({
  id: z.string().uuid(),
  serviceAddress: z.string(),
  timeCreated: DateType,
  timeModified: DateType,
})
export type Sled = z.infer<typeof Sled>

/**
 * A single page of results
 */
export const SledResultsPage = z.object({
  items: Sled.array(),
  nextPage: z.string().nullable().optional(),
})
export type SledResultsPage = z.infer<typeof SledResultsPage>

export const SnapshotState = z.enum(['creating', 'ready', 'faulted', 'destroyed'])
export type SnapshotState = z.infer<typeof SnapshotState>

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
export type Snapshot = z.infer<typeof Snapshot>

/**
 * Create-time parameters for a {@link Snapshot}
 */
export const SnapshotCreate = z.object({ description: z.string(), disk: Name, name: Name })
export type SnapshotCreate = z.infer<typeof SnapshotCreate>

/**
 * A single page of results
 */
export const SnapshotResultsPage = z.object({
  items: Snapshot.array(),
  nextPage: z.string().nullable().optional(),
})
export type SnapshotResultsPage = z.infer<typeof SnapshotResultsPage>

export const SpoofLoginBody = z.object({ username: z.string() })
export type SpoofLoginBody = z.infer<typeof SpoofLoginBody>

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
export type SshKey = z.infer<typeof SshKey>

/**
 * Create-time parameters for an {@link SshKey}
 */
export const SshKeyCreate = z.object({
  description: z.string(),
  name: Name,
  publicKey: z.string(),
})
export type SshKeyCreate = z.infer<typeof SshKeyCreate>

/**
 * A single page of results
 */
export const SshKeyResultsPage = z.object({
  items: SshKey.array(),
  nextPage: z.string().nullable().optional(),
})
export type SshKeyResultsPage = z.infer<typeof SshKeyResultsPage>

/**
 * The name of a timeseries
 *
 * Names are constructed by concatenating the target and metric names with ':'. Target and metric names must be lowercase alphanumeric characters with '_' separating words.
 */
export const TimeseriesName = z
  .string()
  .regex(/(([a-z]+[a-z0-9]*)(_([a-z0-9]+))*):(([a-z]+[a-z0-9]*)(_([a-z0-9]+))*)/)
export type TimeseriesName = z.infer<typeof TimeseriesName>

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
export type TimeseriesSchema = z.infer<typeof TimeseriesSchema>

/**
 * A single page of results
 */
export const TimeseriesSchemaResultsPage = z.object({
  items: TimeseriesSchema.array(),
  nextPage: z.string().nullable().optional(),
})
export type TimeseriesSchemaResultsPage = z.infer<typeof TimeseriesSchemaResultsPage>

/**
 * Client view of a {@link User}
 */
export const User = z.object({ displayName: z.string(), id: z.string().uuid() })
export type User = z.infer<typeof User>

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
export type UserBuiltin = z.infer<typeof UserBuiltin>

/**
 * A single page of results
 */
export const UserBuiltinResultsPage = z.object({
  items: UserBuiltin.array(),
  nextPage: z.string().nullable().optional(),
})
export type UserBuiltinResultsPage = z.infer<typeof UserBuiltinResultsPage>

/**
 * A single page of results
 */
export const UserResultsPage = z.object({
  items: User.array(),
  nextPage: z.string().nullable().optional(),
})
export type UserResultsPage = z.infer<typeof UserResultsPage>

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
export type Vpc = z.infer<typeof Vpc>

/**
 * Create-time parameters for a {@link Vpc}
 */
export const VpcCreate = z.object({
  description: z.string(),
  dnsName: Name,
  ipv6Prefix: Ipv6Net.nullable().optional(),
  name: Name,
})
export type VpcCreate = z.infer<typeof VpcCreate>

export const VpcFirewallRuleAction = z.enum(['allow', 'deny'])
export type VpcFirewallRuleAction = z.infer<typeof VpcFirewallRuleAction>

export const VpcFirewallRuleDirection = z.enum(['inbound', 'outbound'])
export type VpcFirewallRuleDirection = z.infer<typeof VpcFirewallRuleDirection>

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

export type VpcFirewallRuleHostFilter = z.infer<typeof VpcFirewallRuleHostFilter>

/**
 * The protocols that may be specified in a firewall rule's filter
 */
export const VpcFirewallRuleProtocol = z.enum(['TCP', 'UDP', 'ICMP'])
export type VpcFirewallRuleProtocol = z.infer<typeof VpcFirewallRuleProtocol>

/**
 * Filter for a firewall rule. A given packet must match every field that is present for the rule to apply to it. A packet matches a field if any entry in that field matches the packet.
 */
export const VpcFirewallRuleFilter = z.object({
  hosts: VpcFirewallRuleHostFilter.array().nullable().optional(),
  ports: L4PortRange.array().nullable().optional(),
  protocols: VpcFirewallRuleProtocol.array().nullable().optional(),
})
export type VpcFirewallRuleFilter = z.infer<typeof VpcFirewallRuleFilter>

export const VpcFirewallRuleStatus = z.enum(['disabled', 'enabled'])
export type VpcFirewallRuleStatus = z.infer<typeof VpcFirewallRuleStatus>

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

export type VpcFirewallRuleTarget = z.infer<typeof VpcFirewallRuleTarget>

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
export type VpcFirewallRule = z.infer<typeof VpcFirewallRule>

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
export type VpcFirewallRuleUpdate = z.infer<typeof VpcFirewallRuleUpdate>

/**
 * Updateable properties of a `Vpc`'s firewall Note that VpcFirewallRules are implicitly created along with a Vpc, so there is no explicit creation.
 */
export const VpcFirewallRuleUpdateParams = z.object({
  rules: VpcFirewallRuleUpdate.array(),
})
export type VpcFirewallRuleUpdateParams = z.infer<typeof VpcFirewallRuleUpdateParams>

/**
 * Collection of a Vpc's firewall rules
 */
export const VpcFirewallRules = z.object({ rules: VpcFirewallRule.array() })
export type VpcFirewallRules = z.infer<typeof VpcFirewallRules>

/**
 * A single page of results
 */
export const VpcResultsPage = z.object({
  items: Vpc.array(),
  nextPage: z.string().nullable().optional(),
})
export type VpcResultsPage = z.infer<typeof VpcResultsPage>

export const VpcRouterKind = z.enum(['system', 'custom'])
export type VpcRouterKind = z.infer<typeof VpcRouterKind>

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
export type VpcRouter = z.infer<typeof VpcRouter>

/**
 * Create-time parameters for a {@link VpcRouter}
 */
export const VpcRouterCreate = z.object({ description: z.string(), name: Name })
export type VpcRouterCreate = z.infer<typeof VpcRouterCreate>

/**
 * A single page of results
 */
export const VpcRouterResultsPage = z.object({
  items: VpcRouter.array(),
  nextPage: z.string().nullable().optional(),
})
export type VpcRouterResultsPage = z.infer<typeof VpcRouterResultsPage>

/**
 * Updateable properties of a {@link VpcRouter}
 */
export const VpcRouterUpdate = z.object({
  description: z.string().nullable().optional(),
  name: Name.nullable().optional(),
})
export type VpcRouterUpdate = z.infer<typeof VpcRouterUpdate>

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
export type VpcSubnet = z.infer<typeof VpcSubnet>

/**
 * Create-time parameters for a {@link VpcSubnet}
 */
export const VpcSubnetCreate = z.object({
  description: z.string(),
  ipv4Block: Ipv4Net,
  ipv6Block: Ipv6Net.nullable().optional(),
  name: Name,
})
export type VpcSubnetCreate = z.infer<typeof VpcSubnetCreate>

/**
 * A single page of results
 */
export const VpcSubnetResultsPage = z.object({
  items: VpcSubnet.array(),
  nextPage: z.string().nullable().optional(),
})
export type VpcSubnetResultsPage = z.infer<typeof VpcSubnetResultsPage>

/**
 * Updateable properties of a {@link VpcSubnet}
 */
export const VpcSubnetUpdate = z.object({
  description: z.string().nullable().optional(),
  name: Name.nullable().optional(),
})
export type VpcSubnetUpdate = z.infer<typeof VpcSubnetUpdate>

/**
 * Updateable properties of a {@link Vpc}
 */
export const VpcUpdate = z.object({
  description: z.string().nullable().optional(),
  dnsName: Name.nullable().optional(),
  name: Name.nullable().optional(),
})
export type VpcUpdate = z.infer<typeof VpcUpdate>

/**
 * Supported set of sort modes for scanning by name or id
 */
export const NameOrIdSortMode = z.enum([
  'name_ascending',
  'name_descending',
  'id_ascending',
])
export type NameOrIdSortMode = z.infer<typeof NameOrIdSortMode>

/**
 * Supported set of sort modes for scanning by name only
 *
 * Currently, we only support scanning in ascending order.
 */
export const NameSortMode = z.enum(['name_ascending'])
export type NameSortMode = z.infer<typeof NameSortMode>

export const DiskMetricName = z.enum([
  'activated',
  'flush',
  'read',
  'read_bytes',
  'write',
  'write_bytes',
])
export type DiskMetricName = z.infer<typeof DiskMetricName>

/**
 * Supported set of sort modes for scanning by id only.
 *
 * Currently, we only support scanning in ascending order.
 */
export const IdSortMode = z.enum(['id_ascending'])
export type IdSortMode = z.infer<typeof IdSortMode>

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

export const SpoofLoginParams = z.object({})
export type SpoofLoginParams = z.infer<typeof SpoofLoginParams>

export const LoginParams = z.object({
  providerName: Name,
  siloName: Name,
})
export type LoginParams = z.infer<typeof LoginParams>

export const ConsumeCredentialsParams = z.object({
  providerName: Name,
  siloName: Name,
})
export type ConsumeCredentialsParams = z.infer<typeof ConsumeCredentialsParams>

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

export const SiloPolicyViewParams = z.object({
  siloName: Name,
})
export type SiloPolicyViewParams = z.infer<typeof SiloPolicyViewParams>

export const SiloPolicyUpdateParams = z.object({
  siloName: Name,
})
export type SiloPolicyUpdateParams = z.infer<typeof SiloPolicyUpdateParams>

export const SiloIdentityProviderCreateParams = z.object({
  siloName: Name,
})
export type SiloIdentityProviderCreateParams = z.infer<
  typeof SiloIdentityProviderCreateParams
>

export const SiloIdentityProviderViewParams = z.object({
  providerName: Name,
  siloName: Name,
})
export type SiloIdentityProviderViewParams = z.infer<typeof SiloIdentityProviderViewParams>

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

export type ApiViewByIdMethods = Pick<
  InstanceType<typeof Api>['methods'],
  | 'diskViewById'
  | 'imageViewById'
  | 'instanceViewById'
  | 'instanceNetworkInterfaceViewById'
  | 'organizationViewById'
  | 'projectViewById'
  | 'snapshotViewById'
  | 'vpcRouterRouteViewById'
  | 'vpcRouterViewById'
  | 'vpcSubnetViewById'
  | 'vpcViewById'
  | 'systemImageViewById'
  | 'ipPoolViewById'
  | 'siloViewById'
>

export type ApiListMethods = Pick<
  InstanceType<typeof Api>['methods'],
  | 'organizationList'
  | 'projectList'
  | 'diskList'
  | 'diskMetricsList'
  | 'imageList'
  | 'instanceList'
  | 'instanceDiskList'
  | 'instanceExternalIpList'
  | 'instanceNetworkInterfaceList'
  | 'snapshotList'
  | 'vpcList'
  | 'vpcRouterList'
  | 'vpcRouterRouteList'
  | 'vpcSubnetList'
  | 'roleList'
  | 'sessionSshkeyList'
  | 'rackList'
  | 'sledList'
  | 'systemImageList'
  | 'ipPoolList'
  | 'ipPoolRangeList'
  | 'ipPoolServiceRangeList'
  | 'sagaList'
  | 'siloList'
  | 'siloIdentityProviderList'
  | 'systemUserList'
  | 'userList'
>

export class Api extends HttpClient {
  methods = {
    /**
     * Fetch a disk by id
     */
    diskViewById: ({ id }: DiskViewByIdParams, params: RequestParams = {}) =>
      this.request<Disk>({
        path: `/by-id/disks/${id}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Fetch an image by id
     */
    imageViewById: ({ id }: ImageViewByIdParams, params: RequestParams = {}) =>
      this.request<Image>({
        path: `/by-id/images/${id}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Fetch an instance by id
     */
    instanceViewById: ({ id }: InstanceViewByIdParams, params: RequestParams = {}) =>
      this.request<Instance>({
        path: `/by-id/instances/${id}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Fetch a network interface by id
     */
    instanceNetworkInterfaceViewById: (
      { id }: InstanceNetworkInterfaceViewByIdParams,
      params: RequestParams = {}
    ) =>
      this.request<NetworkInterface>({
        path: `/by-id/network-interfaces/${id}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Fetch an organization by id
     */
    organizationViewById: (
      { id }: OrganizationViewByIdParams,
      params: RequestParams = {}
    ) =>
      this.request<Organization>({
        path: `/by-id/organizations/${id}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Fetch a project by id
     */
    projectViewById: ({ id }: ProjectViewByIdParams, params: RequestParams = {}) =>
      this.request<Project>({
        path: `/by-id/projects/${id}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Fetch a snapshot by id
     */
    snapshotViewById: ({ id }: SnapshotViewByIdParams, params: RequestParams = {}) =>
      this.request<Snapshot>({
        path: `/by-id/snapshots/${id}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Fetch a route by id
     */
    vpcRouterRouteViewById: (
      { id }: VpcRouterRouteViewByIdParams,
      params: RequestParams = {}
    ) =>
      this.request<RouterRoute>({
        path: `/by-id/vpc-router-routes/${id}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Get a router by id
     */
    vpcRouterViewById: ({ id }: VpcRouterViewByIdParams, params: RequestParams = {}) =>
      this.request<VpcRouter>({
        path: `/by-id/vpc-routers/${id}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Fetch a subnet by id
     */
    vpcSubnetViewById: ({ id }: VpcSubnetViewByIdParams, params: RequestParams = {}) =>
      this.request<VpcSubnet>({
        path: `/by-id/vpc-subnets/${id}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Fetch a VPC
     */
    vpcViewById: ({ id }: VpcViewByIdParams, params: RequestParams = {}) =>
      this.request<Vpc>({
        path: `/by-id/vpcs/${id}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Start an OAuth 2.0 Device Authorization Grant
     */
    deviceAuthRequest: (query: DeviceAuthRequestParams, params: RequestParams = {}) =>
      this.request<void>({
        path: `/device/auth`,
        method: 'POST',
        ...params,
      }),

    /**
     * Confirm an OAuth 2.0 Device Authorization Grant
     */
    deviceAuthConfirm: (
      query: DeviceAuthConfirmParams,
      body: DeviceAuthVerify,
      params: RequestParams = {}
    ) =>
      this.request<void>({
        path: `/device/confirm`,
        method: 'POST',
        body,
        ...params,
      }),

    /**
     * Request a device access token
     */
    deviceAccessToken: (query: DeviceAccessTokenParams, params: RequestParams = {}) =>
      this.request<void>({
        path: `/device/token`,
        method: 'POST',
        ...params,
      }),

    spoofLogin: (
      query: SpoofLoginParams,
      body: SpoofLoginBody,
      params: RequestParams = {}
    ) =>
      this.request<void>({
        path: `/login`,
        method: 'POST',
        body,
        ...params,
      }),

    /**
     * Prompt user login
     */
    login: ({ providerName, siloName }: LoginParams, params: RequestParams = {}) =>
      this.request<void>({
        path: `/login/${siloName}/${providerName}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Authenticate a user
     */
    consumeCredentials: (
      { providerName, siloName }: ConsumeCredentialsParams,
      params: RequestParams = {}
    ) =>
      this.request<void>({
        path: `/login/${siloName}/${providerName}`,
        method: 'POST',
        ...params,
      }),

    logout: (query: LogoutParams, params: RequestParams = {}) =>
      this.request<void>({
        path: `/logout`,
        method: 'POST',
        ...params,
      }),

    /**
     * List organizations
     */
    organizationList: (query: OrganizationListParams, params: RequestParams = {}) =>
      this.request<OrganizationResultsPage>({
        path: `/organizations`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * Create an organization
     */
    organizationCreate: (
      query: OrganizationCreateParams,
      body: OrganizationCreate,
      params: RequestParams = {}
    ) =>
      this.request<Organization>({
        path: `/organizations`,
        method: 'POST',
        body,
        ...params,
      }),

    /**
     * Fetch an organization
     */
    organizationView: ({ orgName }: OrganizationViewParams, params: RequestParams = {}) =>
      this.request<Organization>({
        path: `/organizations/${orgName}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Update an organization
     */
    organizationUpdate: (
      { orgName }: OrganizationUpdateParams,
      body: OrganizationUpdate,
      params: RequestParams = {}
    ) =>
      this.request<Organization>({
        path: `/organizations/${orgName}`,
        method: 'PUT',
        body,
        ...params,
      }),

    /**
     * Delete an organization
     */
    organizationDelete: (
      { orgName }: OrganizationDeleteParams,
      params: RequestParams = {}
    ) =>
      this.request<void>({
        path: `/organizations/${orgName}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * Fetch an organization's IAM policy
     */
    organizationPolicyView: (
      { orgName }: OrganizationPolicyViewParams,
      params: RequestParams = {}
    ) =>
      this.request<OrganizationRolePolicy>({
        path: `/organizations/${orgName}/policy`,
        method: 'GET',
        ...params,
      }),

    /**
     * Update an organization's IAM policy
     */
    organizationPolicyUpdate: (
      { orgName }: OrganizationPolicyUpdateParams,
      body: OrganizationRolePolicy,
      params: RequestParams = {}
    ) =>
      this.request<OrganizationRolePolicy>({
        path: `/organizations/${orgName}/policy`,
        method: 'PUT',
        body,
        ...params,
      }),

    /**
     * List projects
     */
    projectList: ({ orgName, ...query }: ProjectListParams, params: RequestParams = {}) =>
      this.request<ProjectResultsPage>({
        path: `/organizations/${orgName}/projects`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * Create a project
     */
    projectCreate: (
      { orgName }: ProjectCreateParams,
      body: ProjectCreate,
      params: RequestParams = {}
    ) =>
      this.request<Project>({
        path: `/organizations/${orgName}/projects`,
        method: 'POST',
        body,
        ...params,
      }),

    /**
     * Fetch a project
     */
    projectView: (
      { orgName, projectName }: ProjectViewParams,
      params: RequestParams = {}
    ) =>
      this.request<Project>({
        path: `/organizations/${orgName}/projects/${projectName}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Update a project
     */
    projectUpdate: (
      { orgName, projectName }: ProjectUpdateParams,
      body: ProjectUpdate,
      params: RequestParams = {}
    ) =>
      this.request<Project>({
        path: `/organizations/${orgName}/projects/${projectName}`,
        method: 'PUT',
        body,
        ...params,
      }),

    /**
     * Delete a project
     */
    projectDelete: (
      { orgName, projectName }: ProjectDeleteParams,
      params: RequestParams = {}
    ) =>
      this.request<void>({
        path: `/organizations/${orgName}/projects/${projectName}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * List disks
     */
    diskList: (
      { orgName, projectName, ...query }: DiskListParams,
      params: RequestParams = {}
    ) =>
      this.request<DiskResultsPage>({
        path: `/organizations/${orgName}/projects/${projectName}/disks`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * Create a disk
     */
    diskCreate: (
      { orgName, projectName }: DiskCreateParams,
      body: DiskCreate,
      params: RequestParams = {}
    ) =>
      this.request<Disk>({
        path: `/organizations/${orgName}/projects/${projectName}/disks`,
        method: 'POST',
        body,
        ...params,
      }),

    /**
     * Fetch a disk
     */
    diskView: (
      { diskName, orgName, projectName }: DiskViewParams,
      params: RequestParams = {}
    ) =>
      this.request<Disk>({
        path: `/organizations/${orgName}/projects/${projectName}/disks/${diskName}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Delete a disk
     */
    diskDelete: (
      { diskName, orgName, projectName }: DiskDeleteParams,
      params: RequestParams = {}
    ) =>
      this.request<void>({
        path: `/organizations/${orgName}/projects/${projectName}/disks/${diskName}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * Fetch disk metrics
     */
    diskMetricsList: (
      { diskName, metricName, orgName, projectName, ...query }: DiskMetricsListParams,
      params: RequestParams = {}
    ) =>
      this.request<MeasurementResultsPage>({
        path: `/organizations/${orgName}/projects/${projectName}/disks/${diskName}/metrics/${metricName}`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * List images
     */
    imageList: (
      { orgName, projectName, ...query }: ImageListParams,
      params: RequestParams = {}
    ) =>
      this.request<ImageResultsPage>({
        path: `/organizations/${orgName}/projects/${projectName}/images`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * Create an image
     */
    imageCreate: (
      { orgName, projectName }: ImageCreateParams,
      body: ImageCreate,
      params: RequestParams = {}
    ) =>
      this.request<Image>({
        path: `/organizations/${orgName}/projects/${projectName}/images`,
        method: 'POST',
        body,
        ...params,
      }),

    /**
     * Fetch an image
     */
    imageView: (
      { imageName, orgName, projectName }: ImageViewParams,
      params: RequestParams = {}
    ) =>
      this.request<Image>({
        path: `/organizations/${orgName}/projects/${projectName}/images/${imageName}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Delete an image
     */
    imageDelete: (
      { imageName, orgName, projectName }: ImageDeleteParams,
      params: RequestParams = {}
    ) =>
      this.request<void>({
        path: `/organizations/${orgName}/projects/${projectName}/images/${imageName}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * List instances
     */
    instanceList: (
      { orgName, projectName, ...query }: InstanceListParams,
      params: RequestParams = {}
    ) =>
      this.request<InstanceResultsPage>({
        path: `/organizations/${orgName}/projects/${projectName}/instances`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * Create an instance
     */
    instanceCreate: (
      { orgName, projectName }: InstanceCreateParams,
      body: InstanceCreate,
      params: RequestParams = {}
    ) =>
      this.request<Instance>({
        path: `/organizations/${orgName}/projects/${projectName}/instances`,
        method: 'POST',
        body,
        ...params,
      }),

    /**
     * Fetch an instance
     */
    instanceView: (
      { instanceName, orgName, projectName }: InstanceViewParams,
      params: RequestParams = {}
    ) =>
      this.request<Instance>({
        path: `/organizations/${orgName}/projects/${projectName}/instances/${instanceName}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Delete an instance
     */
    instanceDelete: (
      { instanceName, orgName, projectName }: InstanceDeleteParams,
      params: RequestParams = {}
    ) =>
      this.request<void>({
        path: `/organizations/${orgName}/projects/${projectName}/instances/${instanceName}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * List an instance's disks
     */
    instanceDiskList: (
      { instanceName, orgName, projectName, ...query }: InstanceDiskListParams,
      params: RequestParams = {}
    ) =>
      this.request<DiskResultsPage>({
        path: `/organizations/${orgName}/projects/${projectName}/instances/${instanceName}/disks`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * Attach a disk to an instance
     */
    instanceDiskAttach: (
      { instanceName, orgName, projectName }: InstanceDiskAttachParams,
      body: DiskIdentifier,
      params: RequestParams = {}
    ) =>
      this.request<Disk>({
        path: `/organizations/${orgName}/projects/${projectName}/instances/${instanceName}/disks/attach`,
        method: 'POST',
        body,
        ...params,
      }),

    /**
     * Detach a disk from an instance
     */
    instanceDiskDetach: (
      { instanceName, orgName, projectName }: InstanceDiskDetachParams,
      body: DiskIdentifier,
      params: RequestParams = {}
    ) =>
      this.request<Disk>({
        path: `/organizations/${orgName}/projects/${projectName}/instances/${instanceName}/disks/detach`,
        method: 'POST',
        body,
        ...params,
      }),

    /**
     * List external IP addresses
     */
    instanceExternalIpList: (
      { instanceName, orgName, projectName }: InstanceExternalIpListParams,
      params: RequestParams = {}
    ) =>
      this.request<ExternalIpResultsPage>({
        path: `/organizations/${orgName}/projects/${projectName}/instances/${instanceName}/external-ips`,
        method: 'GET',
        ...params,
      }),

    /**
     * Migrate an instance
     */
    instanceMigrate: (
      { instanceName, orgName, projectName }: InstanceMigrateParams,
      body: InstanceMigrate,
      params: RequestParams = {}
    ) =>
      this.request<Instance>({
        path: `/organizations/${orgName}/projects/${projectName}/instances/${instanceName}/migrate`,
        method: 'POST',
        body,
        ...params,
      }),

    /**
     * List network interfaces
     */
    instanceNetworkInterfaceList: (
      { instanceName, orgName, projectName, ...query }: InstanceNetworkInterfaceListParams,
      params: RequestParams = {}
    ) =>
      this.request<NetworkInterfaceResultsPage>({
        path: `/organizations/${orgName}/projects/${projectName}/instances/${instanceName}/network-interfaces`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * Create a network interface
     */
    instanceNetworkInterfaceCreate: (
      { instanceName, orgName, projectName }: InstanceNetworkInterfaceCreateParams,
      body: NetworkInterfaceCreate,
      params: RequestParams = {}
    ) =>
      this.request<NetworkInterface>({
        path: `/organizations/${orgName}/projects/${projectName}/instances/${instanceName}/network-interfaces`,
        method: 'POST',
        body,
        ...params,
      }),

    /**
     * Fetch a network interface
     */
    instanceNetworkInterfaceView: (
      {
        instanceName,
        interfaceName,
        orgName,
        projectName,
      }: InstanceNetworkInterfaceViewParams,
      params: RequestParams = {}
    ) =>
      this.request<NetworkInterface>({
        path: `/organizations/${orgName}/projects/${projectName}/instances/${instanceName}/network-interfaces/${interfaceName}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Update a network interface
     */
    instanceNetworkInterfaceUpdate: (
      {
        instanceName,
        interfaceName,
        orgName,
        projectName,
      }: InstanceNetworkInterfaceUpdateParams,
      body: NetworkInterfaceUpdate,
      params: RequestParams = {}
    ) =>
      this.request<NetworkInterface>({
        path: `/organizations/${orgName}/projects/${projectName}/instances/${instanceName}/network-interfaces/${interfaceName}`,
        method: 'PUT',
        body,
        ...params,
      }),

    /**
     * Delete a network interface
     */
    instanceNetworkInterfaceDelete: (
      {
        instanceName,
        interfaceName,
        orgName,
        projectName,
      }: InstanceNetworkInterfaceDeleteParams,
      params: RequestParams = {}
    ) =>
      this.request<void>({
        path: `/organizations/${orgName}/projects/${projectName}/instances/${instanceName}/network-interfaces/${interfaceName}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * Reboot an instance
     */
    instanceReboot: (
      { instanceName, orgName, projectName }: InstanceRebootParams,
      params: RequestParams = {}
    ) =>
      this.request<Instance>({
        path: `/organizations/${orgName}/projects/${projectName}/instances/${instanceName}/reboot`,
        method: 'POST',
        ...params,
      }),

    /**
     * Fetch an instance's serial console
     */
    instanceSerialConsole: (
      { instanceName, orgName, projectName, ...query }: InstanceSerialConsoleParams,
      params: RequestParams = {}
    ) =>
      this.request<InstanceSerialConsoleData>({
        path: `/organizations/${orgName}/projects/${projectName}/instances/${instanceName}/serial-console`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * Boot an instance
     */
    instanceStart: (
      { instanceName, orgName, projectName }: InstanceStartParams,
      params: RequestParams = {}
    ) =>
      this.request<Instance>({
        path: `/organizations/${orgName}/projects/${projectName}/instances/${instanceName}/start`,
        method: 'POST',
        ...params,
      }),

    /**
     * Halt an instance
     */
    instanceStop: (
      { instanceName, orgName, projectName }: InstanceStopParams,
      params: RequestParams = {}
    ) =>
      this.request<Instance>({
        path: `/organizations/${orgName}/projects/${projectName}/instances/${instanceName}/stop`,
        method: 'POST',
        ...params,
      }),

    /**
     * Fetch a project's IAM policy
     */
    projectPolicyView: (
      { orgName, projectName }: ProjectPolicyViewParams,
      params: RequestParams = {}
    ) =>
      this.request<ProjectRolePolicy>({
        path: `/organizations/${orgName}/projects/${projectName}/policy`,
        method: 'GET',
        ...params,
      }),

    /**
     * Update a project's IAM policy
     */
    projectPolicyUpdate: (
      { orgName, projectName }: ProjectPolicyUpdateParams,
      body: ProjectRolePolicy,
      params: RequestParams = {}
    ) =>
      this.request<ProjectRolePolicy>({
        path: `/organizations/${orgName}/projects/${projectName}/policy`,
        method: 'PUT',
        body,
        ...params,
      }),

    /**
     * List snapshots
     */
    snapshotList: (
      { orgName, projectName, ...query }: SnapshotListParams,
      params: RequestParams = {}
    ) =>
      this.request<SnapshotResultsPage>({
        path: `/organizations/${orgName}/projects/${projectName}/snapshots`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * Create a snapshot
     */
    snapshotCreate: (
      { orgName, projectName }: SnapshotCreateParams,
      body: SnapshotCreate,
      params: RequestParams = {}
    ) =>
      this.request<Snapshot>({
        path: `/organizations/${orgName}/projects/${projectName}/snapshots`,
        method: 'POST',
        body,
        ...params,
      }),

    /**
     * Fetch a snapshot
     */
    snapshotView: (
      { orgName, projectName, snapshotName }: SnapshotViewParams,
      params: RequestParams = {}
    ) =>
      this.request<Snapshot>({
        path: `/organizations/${orgName}/projects/${projectName}/snapshots/${snapshotName}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Delete a snapshot
     */
    snapshotDelete: (
      { orgName, projectName, snapshotName }: SnapshotDeleteParams,
      params: RequestParams = {}
    ) =>
      this.request<void>({
        path: `/organizations/${orgName}/projects/${projectName}/snapshots/${snapshotName}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * List VPCs
     */
    vpcList: (
      { orgName, projectName, ...query }: VpcListParams,
      params: RequestParams = {}
    ) =>
      this.request<VpcResultsPage>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * Create a VPC
     */
    vpcCreate: (
      { orgName, projectName }: VpcCreateParams,
      body: VpcCreate,
      params: RequestParams = {}
    ) =>
      this.request<Vpc>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs`,
        method: 'POST',
        body,
        ...params,
      }),

    /**
     * Fetch a VPC
     */
    vpcView: (
      { orgName, projectName, vpcName }: VpcViewParams,
      params: RequestParams = {}
    ) =>
      this.request<Vpc>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Update a VPC
     */
    vpcUpdate: (
      { orgName, projectName, vpcName }: VpcUpdateParams,
      body: VpcUpdate,
      params: RequestParams = {}
    ) =>
      this.request<Vpc>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}`,
        method: 'PUT',
        body,
        ...params,
      }),

    /**
     * Delete a VPC
     */
    vpcDelete: (
      { orgName, projectName, vpcName }: VpcDeleteParams,
      params: RequestParams = {}
    ) =>
      this.request<void>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * List firewall rules
     */
    vpcFirewallRulesView: (
      { orgName, projectName, vpcName }: VpcFirewallRulesViewParams,
      params: RequestParams = {}
    ) =>
      this.request<VpcFirewallRules>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/firewall/rules`,
        method: 'GET',
        ...params,
      }),

    /**
     * Replace firewall rules
     */
    vpcFirewallRulesUpdate: (
      { orgName, projectName, vpcName }: VpcFirewallRulesUpdateParams,
      body: VpcFirewallRuleUpdateParams,
      params: RequestParams = {}
    ) =>
      this.request<VpcFirewallRules>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/firewall/rules`,
        method: 'PUT',
        body,
        ...params,
      }),

    /**
     * List routers
     */
    vpcRouterList: (
      { orgName, projectName, vpcName, ...query }: VpcRouterListParams,
      params: RequestParams = {}
    ) =>
      this.request<VpcRouterResultsPage>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/routers`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * Create a router
     */
    vpcRouterCreate: (
      { orgName, projectName, vpcName }: VpcRouterCreateParams,
      body: VpcRouterCreate,
      params: RequestParams = {}
    ) =>
      this.request<VpcRouter>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/routers`,
        method: 'POST',
        body,
        ...params,
      }),

    /**
     * Get a router
     */
    vpcRouterView: (
      { orgName, projectName, routerName, vpcName }: VpcRouterViewParams,
      params: RequestParams = {}
    ) =>
      this.request<VpcRouter>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/routers/${routerName}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Update a router
     */
    vpcRouterUpdate: (
      { orgName, projectName, routerName, vpcName }: VpcRouterUpdateParams,
      body: VpcRouterUpdate,
      params: RequestParams = {}
    ) =>
      this.request<VpcRouter>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/routers/${routerName}`,
        method: 'PUT',
        body,
        ...params,
      }),

    /**
     * Delete a router
     */
    vpcRouterDelete: (
      { orgName, projectName, routerName, vpcName }: VpcRouterDeleteParams,
      params: RequestParams = {}
    ) =>
      this.request<void>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/routers/${routerName}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * List routes
     */
    vpcRouterRouteList: (
      { orgName, projectName, routerName, vpcName, ...query }: VpcRouterRouteListParams,
      params: RequestParams = {}
    ) =>
      this.request<RouterRouteResultsPage>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/routers/${routerName}/routes`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * Create a router
     */
    vpcRouterRouteCreate: (
      { orgName, projectName, routerName, vpcName }: VpcRouterRouteCreateParams,
      body: RouterRouteCreateParams,
      params: RequestParams = {}
    ) =>
      this.request<RouterRoute>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/routers/${routerName}/routes`,
        method: 'POST',
        body,
        ...params,
      }),

    /**
     * Fetch a route
     */
    vpcRouterRouteView: (
      { orgName, projectName, routeName, routerName, vpcName }: VpcRouterRouteViewParams,
      params: RequestParams = {}
    ) =>
      this.request<RouterRoute>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/routers/${routerName}/routes/${routeName}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Update a route
     */
    vpcRouterRouteUpdate: (
      { orgName, projectName, routeName, routerName, vpcName }: VpcRouterRouteUpdateParams,
      body: RouterRouteUpdateParams,
      params: RequestParams = {}
    ) =>
      this.request<RouterRoute>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/routers/${routerName}/routes/${routeName}`,
        method: 'PUT',
        body,
        ...params,
      }),

    /**
     * Delete a route
     */
    vpcRouterRouteDelete: (
      { orgName, projectName, routeName, routerName, vpcName }: VpcRouterRouteDeleteParams,
      params: RequestParams = {}
    ) =>
      this.request<void>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/routers/${routerName}/routes/${routeName}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * List subnets
     */
    vpcSubnetList: (
      { orgName, projectName, vpcName, ...query }: VpcSubnetListParams,
      params: RequestParams = {}
    ) =>
      this.request<VpcSubnetResultsPage>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/subnets`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * Create a subnet
     */
    vpcSubnetCreate: (
      { orgName, projectName, vpcName }: VpcSubnetCreateParams,
      body: VpcSubnetCreate,
      params: RequestParams = {}
    ) =>
      this.request<VpcSubnet>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/subnets`,
        method: 'POST',
        body,
        ...params,
      }),

    /**
     * Fetch a subnet
     */
    vpcSubnetView: (
      { orgName, projectName, subnetName, vpcName }: VpcSubnetViewParams,
      params: RequestParams = {}
    ) =>
      this.request<VpcSubnet>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/subnets/${subnetName}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Update a subnet
     */
    vpcSubnetUpdate: (
      { orgName, projectName, subnetName, vpcName }: VpcSubnetUpdateParams,
      body: VpcSubnetUpdate,
      params: RequestParams = {}
    ) =>
      this.request<VpcSubnet>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/subnets/${subnetName}`,
        method: 'PUT',
        body,
        ...params,
      }),

    /**
     * Delete a subnet
     */
    vpcSubnetDelete: (
      { orgName, projectName, subnetName, vpcName }: VpcSubnetDeleteParams,
      params: RequestParams = {}
    ) =>
      this.request<void>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/subnets/${subnetName}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * List network interfaces
     */
    vpcSubnetListNetworkInterfaces: (
      {
        orgName,
        projectName,
        subnetName,
        vpcName,
        ...query
      }: VpcSubnetListNetworkInterfacesParams,
      params: RequestParams = {}
    ) =>
      this.request<NetworkInterfaceResultsPage>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/subnets/${subnetName}/network-interfaces`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * Fetch the current silo's IAM policy
     */
    policyView: (query: PolicyViewParams, params: RequestParams = {}) =>
      this.request<SiloRolePolicy>({
        path: `/policy`,
        method: 'GET',
        ...params,
      }),

    /**
     * Update the current silo's IAM policy
     */
    policyUpdate: (
      query: PolicyUpdateParams,
      body: SiloRolePolicy,
      params: RequestParams = {}
    ) =>
      this.request<SiloRolePolicy>({
        path: `/policy`,
        method: 'PUT',
        body,
        ...params,
      }),

    /**
     * List built-in roles
     */
    roleList: (query: RoleListParams, params: RequestParams = {}) =>
      this.request<RoleResultsPage>({
        path: `/roles`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * Fetch a built-in role
     */
    roleView: ({ roleName }: RoleViewParams, params: RequestParams = {}) =>
      this.request<Role>({
        path: `/roles/${roleName}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Fetch the user associated with the current session
     */
    sessionMe: (query: SessionMeParams, params: RequestParams = {}) =>
      this.request<User>({
        path: `/session/me`,
        method: 'GET',
        ...params,
      }),

    /**
     * List SSH public keys
     */
    sessionSshkeyList: (query: SessionSshkeyListParams, params: RequestParams = {}) =>
      this.request<SshKeyResultsPage>({
        path: `/session/me/sshkeys`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * Create an SSH public key
     */
    sessionSshkeyCreate: (
      query: SessionSshkeyCreateParams,
      body: SshKeyCreate,
      params: RequestParams = {}
    ) =>
      this.request<SshKey>({
        path: `/session/me/sshkeys`,
        method: 'POST',
        body,
        ...params,
      }),

    /**
     * Fetch an SSH public key
     */
    sessionSshkeyView: (
      { sshKeyName }: SessionSshkeyViewParams,
      params: RequestParams = {}
    ) =>
      this.request<SshKey>({
        path: `/session/me/sshkeys/${sshKeyName}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Delete an SSH public key
     */
    sessionSshkeyDelete: (
      { sshKeyName }: SessionSshkeyDeleteParams,
      params: RequestParams = {}
    ) =>
      this.request<void>({
        path: `/session/me/sshkeys/${sshKeyName}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * Fetch a system-wide image by id
     */
    systemImageViewById: ({ id }: SystemImageViewByIdParams, params: RequestParams = {}) =>
      this.request<GlobalImage>({
        path: `/system/by-id/images/${id}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Fetch an IP pool by id
     */
    ipPoolViewById: ({ id }: IpPoolViewByIdParams, params: RequestParams = {}) =>
      this.request<IpPool>({
        path: `/system/by-id/ip-pools/${id}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Fetch a silo by id
     */
    siloViewById: ({ id }: SiloViewByIdParams, params: RequestParams = {}) =>
      this.request<Silo>({
        path: `/system/by-id/silos/${id}`,
        method: 'GET',
        ...params,
      }),

    /**
     * List racks
     */
    rackList: (query: RackListParams, params: RequestParams = {}) =>
      this.request<RackResultsPage>({
        path: `/system/hardware/racks`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * Fetch a rack
     */
    rackView: ({ rackId }: RackViewParams, params: RequestParams = {}) =>
      this.request<Rack>({
        path: `/system/hardware/racks/${rackId}`,
        method: 'GET',
        ...params,
      }),

    /**
     * List sleds
     */
    sledList: (query: SledListParams, params: RequestParams = {}) =>
      this.request<SledResultsPage>({
        path: `/system/hardware/sleds`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * Fetch a sled
     */
    sledView: ({ sledId }: SledViewParams, params: RequestParams = {}) =>
      this.request<Sled>({
        path: `/system/hardware/sleds/${sledId}`,
        method: 'GET',
        ...params,
      }),

    /**
     * List system-wide images
     */
    systemImageList: (query: SystemImageListParams, params: RequestParams = {}) =>
      this.request<GlobalImageResultsPage>({
        path: `/system/images`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * Create a system-wide image
     */
    systemImageCreate: (
      query: SystemImageCreateParams,
      body: GlobalImageCreate,
      params: RequestParams = {}
    ) =>
      this.request<GlobalImage>({
        path: `/system/images`,
        method: 'POST',
        body,
        ...params,
      }),

    /**
     * Fetch a system-wide image
     */
    systemImageView: ({ imageName }: SystemImageViewParams, params: RequestParams = {}) =>
      this.request<GlobalImage>({
        path: `/system/images/${imageName}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Delete a system-wide image
     */
    systemImageDelete: (
      { imageName }: SystemImageDeleteParams,
      params: RequestParams = {}
    ) =>
      this.request<void>({
        path: `/system/images/${imageName}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * List IP pools
     */
    ipPoolList: (query: IpPoolListParams, params: RequestParams = {}) =>
      this.request<IpPoolResultsPage>({
        path: `/system/ip-pools`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * Create an IP pool
     */
    ipPoolCreate: (
      query: IpPoolCreateParams,
      body: IpPoolCreate,
      params: RequestParams = {}
    ) =>
      this.request<IpPool>({
        path: `/system/ip-pools`,
        method: 'POST',
        body,
        ...params,
      }),

    /**
     * Fetch an IP pool
     */
    ipPoolView: ({ poolName }: IpPoolViewParams, params: RequestParams = {}) =>
      this.request<IpPool>({
        path: `/system/ip-pools/${poolName}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Update an IP Pool
     */
    ipPoolUpdate: (
      { poolName }: IpPoolUpdateParams,
      body: IpPoolUpdate,
      params: RequestParams = {}
    ) =>
      this.request<IpPool>({
        path: `/system/ip-pools/${poolName}`,
        method: 'PUT',
        body,
        ...params,
      }),

    /**
     * Delete an IP Pool
     */
    ipPoolDelete: ({ poolName }: IpPoolDeleteParams, params: RequestParams = {}) =>
      this.request<void>({
        path: `/system/ip-pools/${poolName}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * List ranges for an IP pool
     */
    ipPoolRangeList: (
      { poolName, ...query }: IpPoolRangeListParams,
      params: RequestParams = {}
    ) =>
      this.request<IpPoolRangeResultsPage>({
        path: `/system/ip-pools/${poolName}/ranges`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * Add a range to an IP pool
     */
    ipPoolRangeAdd: (
      { poolName }: IpPoolRangeAddParams,
      body: IpRange,
      params: RequestParams = {}
    ) =>
      this.request<IpPoolRange>({
        path: `/system/ip-pools/${poolName}/ranges/add`,
        method: 'POST',
        body,
        ...params,
      }),

    /**
     * Remove a range from an IP pool
     */
    ipPoolRangeRemove: (
      { poolName }: IpPoolRangeRemoveParams,
      body: IpRange,
      params: RequestParams = {}
    ) =>
      this.request<void>({
        path: `/system/ip-pools/${poolName}/ranges/remove`,
        method: 'POST',
        body,
        ...params,
      }),

    /**
     * Fetch an IP pool used for Oxide services.
     */
    ipPoolServiceView: ({ rackId }: IpPoolServiceViewParams, params: RequestParams = {}) =>
      this.request<IpPool>({
        path: `/system/ip-pools-service/${rackId}`,
        method: 'GET',
        ...params,
      }),

    /**
     * List ranges for an IP pool used for Oxide services.
     */
    ipPoolServiceRangeList: (
      { rackId, ...query }: IpPoolServiceRangeListParams,
      params: RequestParams = {}
    ) =>
      this.request<IpPoolRangeResultsPage>({
        path: `/system/ip-pools-service/${rackId}/ranges`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * Add a range to an IP pool used for Oxide services.
     */
    ipPoolServiceRangeAdd: (
      { rackId }: IpPoolServiceRangeAddParams,
      body: IpRange,
      params: RequestParams = {}
    ) =>
      this.request<IpPoolRange>({
        path: `/system/ip-pools-service/${rackId}/ranges/add`,
        method: 'POST',
        body,
        ...params,
      }),

    /**
     * Remove a range from an IP pool used for Oxide services.
     */
    ipPoolServiceRangeRemove: (
      { rackId }: IpPoolServiceRangeRemoveParams,
      body: IpRange,
      params: RequestParams = {}
    ) =>
      this.request<void>({
        path: `/system/ip-pools-service/${rackId}/ranges/remove`,
        method: 'POST',
        body,
        ...params,
      }),

    /**
     * Fetch the top-level IAM policy
     */
    systemPolicyView: (query: SystemPolicyViewParams, params: RequestParams = {}) =>
      this.request<FleetRolePolicy>({
        path: `/system/policy`,
        method: 'GET',
        ...params,
      }),

    /**
     * Update the top-level IAM policy
     */
    systemPolicyUpdate: (
      query: SystemPolicyUpdateParams,
      body: FleetRolePolicy,
      params: RequestParams = {}
    ) =>
      this.request<FleetRolePolicy>({
        path: `/system/policy`,
        method: 'PUT',
        body,
        ...params,
      }),

    /**
     * List sagas
     */
    sagaList: (query: SagaListParams, params: RequestParams = {}) =>
      this.request<SagaResultsPage>({
        path: `/system/sagas`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * Fetch a saga
     */
    sagaView: ({ sagaId }: SagaViewParams, params: RequestParams = {}) =>
      this.request<Saga>({
        path: `/system/sagas/${sagaId}`,
        method: 'GET',
        ...params,
      }),

    /**
     * List silos
     */
    siloList: (query: SiloListParams, params: RequestParams = {}) =>
      this.request<SiloResultsPage>({
        path: `/system/silos`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * Create a silo
     */
    siloCreate: (query: SiloCreateParams, body: SiloCreate, params: RequestParams = {}) =>
      this.request<Silo>({
        path: `/system/silos`,
        method: 'POST',
        body,
        ...params,
      }),

    /**
     * Fetch a silo
     */
    siloView: ({ siloName }: SiloViewParams, params: RequestParams = {}) =>
      this.request<Silo>({
        path: `/system/silos/${siloName}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Delete a silo
     */
    siloDelete: ({ siloName }: SiloDeleteParams, params: RequestParams = {}) =>
      this.request<void>({
        path: `/system/silos/${siloName}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * List a silo's IDPs
     */
    siloIdentityProviderList: (
      { siloName, ...query }: SiloIdentityProviderListParams,
      params: RequestParams = {}
    ) =>
      this.request<IdentityProviderResultsPage>({
        path: `/system/silos/${siloName}/identity-providers`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * Fetch a silo's IAM policy
     */
    siloPolicyView: ({ siloName }: SiloPolicyViewParams, params: RequestParams = {}) =>
      this.request<SiloRolePolicy>({
        path: `/system/silos/${siloName}/policy`,
        method: 'GET',
        ...params,
      }),

    /**
     * Update a silo's IAM policy
     */
    siloPolicyUpdate: (
      { siloName }: SiloPolicyUpdateParams,
      body: SiloRolePolicy,
      params: RequestParams = {}
    ) =>
      this.request<SiloRolePolicy>({
        path: `/system/silos/${siloName}/policy`,
        method: 'PUT',
        body,
        ...params,
      }),

    /**
     * Create a SAML IDP
     */
    siloIdentityProviderCreate: (
      { siloName }: SiloIdentityProviderCreateParams,
      body: SamlIdentityProviderCreate,
      params: RequestParams = {}
    ) =>
      this.request<SamlIdentityProvider>({
        path: `/system/silos/${siloName}/saml-identity-providers`,
        method: 'POST',
        body,
        ...params,
      }),

    /**
     * Fetch a SAML IDP
     */
    siloIdentityProviderView: (
      { providerName, siloName }: SiloIdentityProviderViewParams,
      params: RequestParams = {}
    ) =>
      this.request<SamlIdentityProvider>({
        path: `/system/silos/${siloName}/saml-identity-providers/${providerName}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Refresh update data
     */
    updatesRefresh: (query: UpdatesRefreshParams, params: RequestParams = {}) =>
      this.request<void>({
        path: `/system/updates/refresh`,
        method: 'POST',
        ...params,
      }),

    /**
     * List built-in users
     */
    systemUserList: (query: SystemUserListParams, params: RequestParams = {}) =>
      this.request<UserBuiltinResultsPage>({
        path: `/system/user`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * Fetch a built-in user
     */
    systemUserView: ({ userName }: SystemUserViewParams, params: RequestParams = {}) =>
      this.request<UserBuiltin>({
        path: `/system/user/${userName}`,
        method: 'GET',
        ...params,
      }),

    /**
     * List timeseries schema
     */
    timeseriesSchemaGet: (query: TimeseriesSchemaGetParams, params: RequestParams = {}) =>
      this.request<TimeseriesSchemaResultsPage>({
        path: `/timeseries/schema`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * List users
     */
    userList: (query: UserListParams, params: RequestParams = {}) =>
      this.request<UserResultsPage>({
        path: `/users`,
        method: 'GET',
        query,
        ...params,
      }),
  }
}
