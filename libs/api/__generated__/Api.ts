/* eslint-disable */
import type { RequestParams } from './http-client'
import { HttpClient } from './http-client'

export type {
  ApiConfig,
  ApiError,
  ApiResult,
  ClientError,
  ErrorBody,
  ErrorResult,
} from './http-client'

/**
 * Describes properties that should uniquely identify a Gimlet.
 */
export type Baseboard = { part: string; revision: number; serial: string }

/**
 * A type storing a range over `T`.
 *
 * This type supports ranges similar to the `RangeTo`, `Range` and `RangeFrom` types in the standard library. Those cover `(..end)`, `(start..end)`, and `(start..)` respectively.
 */
export type BinRangedouble =
  /** A range unbounded below and exclusively above, `..end`. */
  | { end: number; type: 'range_to' }
  /** A range bounded inclusively below and exclusively above, `start..end`. */
  | { end: number; start: number; type: 'range' }
  /** A range bounded inclusively below and unbounded above, `start..`. */
  | { start: number; type: 'range_from' }

/**
 * A type storing a range over `T`.
 *
 * This type supports ranges similar to the `RangeTo`, `Range` and `RangeFrom` types in the standard library. Those cover `(..end)`, `(start..end)`, and `(start..)` respectively.
 */
export type BinRangeint64 =
  /** A range unbounded below and exclusively above, `..end`. */
  | { end: number; type: 'range_to' }
  /** A range bounded inclusively below and exclusively above, `start..end`. */
  | { end: number; start: number; type: 'range' }
  /** A range bounded inclusively below and unbounded above, `start..`. */
  | { start: number; type: 'range_from' }

/**
 * Type storing bin edges and a count of samples within it.
 */
export type Bindouble = {
  /** The total count of samples in this bin. */
  count: number
  /** The range of the support covered by this bin. */
  range: BinRangedouble
}

/**
 * Type storing bin edges and a count of samples within it.
 */
export type Binint64 = {
  /** The total count of samples in this bin. */
  count: number
  /** The range of the support covered by this bin. */
  range: BinRangeint64
}

/**
 * disk block size in bytes
 */
export type BlockSize = 512 | 2048 | 4096

/**
 * A count of bytes, typically used either for memory or storage capacity
 *
 * The maximum supported byte count is `i64::MAX`.  This makes it somewhat inconvenient to define constructors: a u32 constructor can be infallible, but an i64 constructor can fail (if the value is negative) and a u64 constructor can fail (if the value is larger than i64::MAX).  We provide all of these for consumers' convenience.
 */
export type ByteCount = number

/**
 * A name unique within the parent collection
 *
 * Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. Names cannot be a UUID though they may contain a UUID.
 */
export type Name = string

/**
 * The service intended to use this certificate.
 */
export type ServiceUsingCertificate = 'external_api'

/**
 * Client view of a {@link Certificate}
 */
export type Certificate = {
  /** human-readable free-form text about a resource */
  description: string
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** unique, mutable, user-controlled identifier for each resource */
  name: Name
  service: ServiceUsingCertificate
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
}

/**
 * Create-time parameters for a {@link Certificate}
 */
export type CertificateCreate = {
  /** PEM file containing public certificate chain */
  cert: number[]
  description: string
  /** PEM file containing private key */
  key: number[]
  name: Name
  /** The service using this certificate */
  service: ServiceUsingCertificate
}

/**
 * A single page of results
 */
export type CertificateResultsPage = {
  /** list of items on this page of results */
  items: Certificate[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string
}

export type UpdateableComponentType =
  | 'bootloader_for_rot'
  | 'bootloader_for_sp'
  | 'bootloader_for_host_proc'
  | 'hubris_for_psc_rot'
  | 'hubris_for_psc_sp'
  | 'hubris_for_sidecar_rot'
  | 'hubris_for_sidecar_sp'
  | 'hubris_for_gimlet_rot'
  | 'hubris_for_gimlet_sp'
  | 'helios_host_phase1'
  | 'helios_host_phase2'
  | 'host_omicron'

export type SemverVersion = string

/**
 * Identity-related metadata that's included in "asset" public API objects (which generally have no name or description)
 */
export type ComponentUpdate = {
  componentType: UpdateableComponentType
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
  version: SemverVersion
}

/**
 * A single page of results
 */
export type ComponentUpdateResultsPage = {
  /** list of items on this page of results */
  items: ComponentUpdate[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string
}

/**
 * A cumulative or counter data type.
 */
export type Cumulativedouble = { startTime: Date; value: number }

/**
 * A cumulative or counter data type.
 */
export type Cumulativeint64 = { startTime: Date; value: number }

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
export type Histogramint64 = { bins: Binint64[]; nSamples: number; startTime: Date }

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
export type Histogramdouble = { bins: Bindouble[]; nSamples: number; startTime: Date }

/**
 * A `Datum` is a single sampled data point from a metric.
 */
export type Datum =
  | { datum: boolean; type: 'bool' }
  | { datum: number; type: 'i64' }
  | { datum: number; type: 'f64' }
  | { datum: string; type: 'string' }
  | { datum: number[]; type: 'bytes' }
  | { datum: Cumulativeint64; type: 'cumulative_i64' }
  | { datum: Cumulativedouble; type: 'cumulative_f64' }
  | { datum: Histogramint64; type: 'histogram_i64' }
  | { datum: Histogramdouble; type: 'histogram_f64' }

/**
 * The type of an individual datum of a metric.
 */
export type DatumType =
  | 'bool'
  | 'i64'
  | 'f64'
  | 'string'
  | 'bytes'
  | 'cumulative_i64'
  | 'cumulative_f64'
  | 'histogram_i64'
  | 'histogram_f64'

export type DerEncodedKeyPair = {
  /** request signing private key (base64 encoded der file) */
  privateKey: string
  /** request signing public certificate (base64 encoded der file) */
  publicCert: string
}

export type DeviceAccessTokenRequest = {
  clientId: string
  deviceCode: string
  grantType: string
}

export type DeviceAuthRequest = { clientId: string }

export type DeviceAuthVerify = { userCode: string }

export type Digest = { type: 'sha256'; value: string }

/**
 * State of a Disk (primarily: attached or not)
 */
export type DiskState =
  /** Disk is being initialized */
  | { state: 'creating' }
  /** Disk is ready but detached from any Instance */
  | { state: 'detached' }
  /** Disk is undergoing maintenance */
  | { state: 'maintenance' }
  /** Disk is being attached to the given Instance */
  | { instance: string; state: 'attaching' }
  /** Disk is attached to the given Instance */
  | { instance: string; state: 'attached' }
  /** Disk is being detached from the given Instance */
  | { instance: string; state: 'detaching' }
  /** Disk has been destroyed */
  | { state: 'destroyed' }
  /** Disk is unavailable */
  | { state: 'faulted' }

/**
 * Client view of a {@link Disk}
 */
export type Disk = {
  blockSize: ByteCount
  /** human-readable free-form text about a resource */
  description: string
  devicePath: string
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  imageId?: string
  /** unique, mutable, user-controlled identifier for each resource */
  name: Name
  projectId: string
  size: ByteCount
  snapshotId?: string
  state: DiskState
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
}

/**
 * Different sources for a disk
 */
export type DiskSource =
  /** Create a blank disk */
  | {
      /** size of blocks for this Disk. valid values are: 512, 2048, or 4096 */
      blockSize: BlockSize
      type: 'blank'
    }
  /** Create a disk from a disk snapshot */
  | { snapshotId: string; type: 'snapshot' }
  /** Create a disk from a project image */
  | { imageId: string; type: 'image' }
  /** Create a disk from a global image */
  | { imageId: string; type: 'global_image' }

/**
 * Create-time parameters for a {@link Disk}
 */
export type DiskCreate = {
  description: string
  /** initial source for this disk */
  diskSource: DiskSource
  name: Name
  /** total size of the Disk in bytes */
  size: ByteCount
}

/**
 * TODO-v1: Delete this Parameters for the {@link Disk} to be attached or detached to an instance
 */
export type DiskIdentifier = { name: Name }

export type NameOrId = string | Name

export type DiskPath = { disk: NameOrId }

/**
 * A single page of results
 */
export type DiskResultsPage = {
  /** list of items on this page of results */
  items: Disk[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string
}

/**
 * OS image distribution
 */
export type Distribution = {
  /** The name of the distribution (e.g. "alpine" or "ubuntu") */
  name: Name
  /** The version of the distribution (e.g. "3.10" or "18.04") */
  version: string
}

/**
 * The kind of an external IP address for an instance
 */
export type IpKind = 'ephemeral' | 'floating'

export type ExternalIp = { ip: string; kind: IpKind }

/**
 * Parameters for creating an external IP address for instances.
 */
export type ExternalIpCreate = { poolName?: Name; type: 'ephemeral' }

/**
 * A single page of results
 */
export type ExternalIpResultsPage = {
  /** list of items on this page of results */
  items: ExternalIp[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string
}

/**
 * The source from which a field is derived, the target or metric.
 */
export type FieldSource = 'target' | 'metric'

/**
 * The `FieldType` identifies the data type of a target or metric field.
 */
export type FieldType = 'string' | 'i64' | 'ip_addr' | 'uuid' | 'bool'

/**
 * The name and type information for a field of a timeseries schema.
 */
export type FieldSchema = { name: string; source: FieldSource; ty: FieldType }

export type FleetRole = 'admin' | 'collaborator' | 'viewer'

/**
 * Describes what kind of identity is described by an id
 */
export type IdentityType = 'silo_user' | 'silo_group'

/**
 * Describes the assignment of a particular role on a particular resource to a particular identity (user, group, etc.)
 *
 * The resource is not part of this structure.  Rather, `RoleAssignment`s are put into a `Policy` and that Policy is applied to a particular resource.
 */
export type FleetRoleRoleAssignment = {
  identityId: string
  identityType: IdentityType
  roleName: FleetRole
}

/**
 * Client view of a `Policy`, which describes how this resource may be accessed
 *
 * Note that the Policy only describes access granted explicitly for this resource.  The policies of parent resources can also cause a user to have access to this resource.
 */
export type FleetRolePolicy = {
  /** Roles directly assigned on this resource */
  roleAssignments: FleetRoleRoleAssignment[]
}

/**
 * Client view of global Images
 */
export type GlobalImage = {
  /** size of blocks in bytes */
  blockSize: ByteCount
  /** human-readable free-form text about a resource */
  description: string
  /** Hash of the image contents, if applicable */
  digest?: Digest
  /** Image distribution */
  distribution: string
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** unique, mutable, user-controlled identifier for each resource */
  name: Name
  /** total size in bytes */
  size: ByteCount
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
  /** URL source of this image, if any */
  url?: string
  /** Image version */
  version: string
}

/**
 * The source of the underlying image.
 */
export type ImageSource =
  | { type: 'url'; url: string }
  | { id: string; type: 'snapshot' }
  /** Boot the Alpine ISO that ships with the Propolis zone. Intended for development purposes only. */
  | { type: 'you_can_boot_anything_as_long_as_its_alpine' }

/**
 * Create-time parameters for an {@link GlobalImage}
 */
export type GlobalImageCreate = {
  /** block size in bytes */
  blockSize: BlockSize
  description: string
  /** OS image distribution */
  distribution: Distribution
  name: Name
  /** The source of the image's contents. */
  source: ImageSource
}

/**
 * A single page of results
 */
export type GlobalImageResultsPage = {
  /** list of items on this page of results */
  items: GlobalImage[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string
}

/**
 * Client view of a {@link Group}
 */
export type Group = {
  /** Human-readable name that can identify the group */
  displayName: string
  id: string
  /** Uuid of the silo to which this group belongs */
  siloId: string
}

/**
 * A single page of results
 */
export type GroupResultsPage = {
  /** list of items on this page of results */
  items: Group[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string
}

export type IdentityProviderType = 'saml'

/**
 * Client view of an {@link IdentityProvider}
 */
export type IdentityProvider = {
  /** human-readable free-form text about a resource */
  description: string
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** unique, mutable, user-controlled identifier for each resource */
  name: Name
  /** Identity provider type */
  providerType: IdentityProviderType
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
}

/**
 * A single page of results
 */
export type IdentityProviderResultsPage = {
  /** list of items on this page of results */
  items: IdentityProvider[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string
}

export type IdpMetadataSource =
  | { type: 'url'; url: string }
  | { data: string; type: 'base64_encoded_xml' }

/**
 * Client view of project Images
 */
export type Image = {
  /** size of blocks in bytes */
  blockSize: ByteCount
  /** human-readable free-form text about a resource */
  description: string
  /** Hash of the image contents, if applicable */
  digest?: Digest
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** unique, mutable, user-controlled identifier for each resource */
  name: Name
  /** The project the disk belongs to */
  projectId: string
  /** total size in bytes */
  size: ByteCount
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
  /** URL source of this image, if any */
  url?: string
  /** Version of this, if any */
  version?: string
}

/**
 * Create-time parameters for an {@link Image}
 */
export type ImageCreate = {
  /** block size in bytes */
  blockSize: BlockSize
  description: string
  name: Name
  /** The source of the image's contents. */
  source: ImageSource
}

/**
 * A single page of results
 */
export type ImageResultsPage = {
  /** list of items on this page of results */
  items: Image[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string
}

/**
 * The number of CPUs in an Instance
 */
export type InstanceCpuCount = number

/**
 * Running state of an Instance (primarily: booted or stopped)
 *
 * This typically reflects whether it's starting, running, stopping, or stopped, but also includes states related to the Instance's lifecycle
 */
export type InstanceState =
  /** The instance is being created. */
  | 'creating'
  /** The instance is currently starting up. */
  | 'starting'
  /** The instance is currently running. */
  | 'running'
  /** The instance has been requested to stop and a transition to "Stopped" is imminent. */
  | 'stopping'
  /** The instance is currently stopped. */
  | 'stopped'
  /** The instance is in the process of rebooting - it will remain in the "rebooting" state until the VM is starting once more. */
  | 'rebooting'
  /** The instance is in the process of migrating - it will remain in the "migrating" state until the migration process is complete and the destination propolis is ready to continue execution. */
  | 'migrating'
  /** The instance is attempting to recover from a failure. */
  | 'repairing'
  /** The instance has encountered a failure. */
  | 'failed'
  /** The instance has been deleted. */
  | 'destroyed'

/**
 * Client view of an {@link Instance}
 */
export type Instance = {
  /** human-readable free-form text about a resource */
  description: string
  /** RFC1035-compliant hostname for the Instance. */
  hostname: string
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** memory allocated for this Instance */
  memory: ByteCount
  /** unique, mutable, user-controlled identifier for each resource */
  name: Name
  /** number of CPUs allocated for this Instance */
  ncpus: InstanceCpuCount
  /** id for the project containing this Instance */
  projectId: string
  runState: InstanceState
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
  timeRunStateUpdated: Date
}

/**
 * Describe the instance's disks at creation time
 */
export type InstanceDiskAttachment =
  /** During instance creation, create and attach disks */
  | {
      description: string
      /** initial source for this disk */
      diskSource: DiskSource
      name: Name
      /** total size of the Disk in bytes */
      size: ByteCount
      type: 'create'
    }
  /** During instance creation, attach this disk */
  | {
      /** A disk name to attach */
      name: Name
      type: 'attach'
    }

/**
 * Create-time parameters for a {@link NetworkInterface}
 */
export type NetworkInterfaceCreate = {
  description: string
  /** The IP address for the interface. One will be auto-assigned if not provided. */
  ip?: string
  name: Name
  /** The VPC Subnet in which to create the interface. */
  subnetName: Name
  /** The VPC in which to create the interface. */
  vpcName: Name
}

/**
 * Describes an attachment of a `NetworkInterface` to an `Instance`, at the time the instance is created.
 */
export type InstanceNetworkInterfaceAttachment =
  /** Create one or more `NetworkInterface`s for the `Instance`.

If more than one interface is provided, then the first will be designated the primary interface for the instance. */
  | { params: NetworkInterfaceCreate[]; type: 'create' }
  /** The default networking configuration for an instance is to create a single primary interface with an automatically-assigned IP address. The IP will be pulled from the Project's default VPC / VPC Subnet. */
  | { type: 'default' }
  /** No network interfaces at all will be created for the instance. */
  | { type: 'none' }

/**
 * Create-time parameters for an {@link Instance}
 */
export type InstanceCreate = {
  description: string
  /** The disks to be created or attached for this instance. */
  disks?: InstanceDiskAttachment[]
  /** The external IP addresses provided to this instance.

By default, all instances have outbound connectivity, but no inbound connectivity. These external addresses can be used to provide a fixed, known IP address for making inbound connections to the instance. */
  externalIps?: ExternalIpCreate[]
  hostname: string
  memory: ByteCount
  name: Name
  ncpus: InstanceCpuCount
  /** The network interfaces to be created for this instance. */
  networkInterfaces?: InstanceNetworkInterfaceAttachment
  /** Should this instance be started upon creation; true by default. */
  start?: boolean
  /** User data for instance initialization systems (such as cloud-init). Must be a Base64-encoded string, as specified in RFC 4648 § 4 (+ and / characters with padding). Maximum 32 KiB unencoded data. */
  userData?: string
}

/**
 * Migration parameters for an {@link Instance}
 */
export type InstanceMigrate = { dstSledId: string }

/**
 * A single page of results
 */
export type InstanceResultsPage = {
  /** list of items on this page of results */
  items: Instance[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string
}

/**
 * Contents of an Instance's serial console buffer.
 */
export type InstanceSerialConsoleData = {
  /** The bytes starting from the requested offset up to either the end of the buffer or the request's `max_bytes`. Provided as a u8 array rather than a string, as it may not be UTF-8. */
  data: number[]
  /** The absolute offset since boot (suitable for use as `byte_offset` in a subsequent request) of the last byte returned in `data`. */
  lastByteOffset: number
}

/**
 * An IPv4 subnet
 *
 * An IPv4 subnet, including prefix and subnet mask
 */
export type Ipv4Net = string

/**
 * An IPv6 subnet
 *
 * An IPv6 subnet, including prefix and subnet mask
 */
export type Ipv6Net = string

export type IpNet = Ipv4Net | Ipv6Net

/**
 * Identity-related metadata that's included in nearly all public API objects
 */
export type IpPool = {
  /** human-readable free-form text about a resource */
  description: string
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** unique, mutable, user-controlled identifier for each resource */
  name: Name
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
}

/**
 * Create-time parameters for an IP Pool.
 *
 * See {@link IpPool}
 */
export type IpPoolCreate = { description: string; name: Name }

/**
 * A non-decreasing IPv4 address range, inclusive of both ends.
 *
 * The first address must be less than or equal to the last address.
 */
export type Ipv4Range = { first: string; last: string }

/**
 * A non-decreasing IPv6 address range, inclusive of both ends.
 *
 * The first address must be less than or equal to the last address.
 */
export type Ipv6Range = { first: string; last: string }

export type IpRange = Ipv4Range | Ipv6Range

export type IpPoolRange = { id: string; range: IpRange; timeCreated: Date }

/**
 * A single page of results
 */
export type IpPoolRangeResultsPage = {
  /** list of items on this page of results */
  items: IpPoolRange[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string
}

/**
 * A single page of results
 */
export type IpPoolResultsPage = {
  /** list of items on this page of results */
  items: IpPool[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string
}

/**
 * Parameters for updating an IP Pool
 */
export type IpPoolUpdate = { description?: string; name?: Name }

/**
 * A range of IP ports
 *
 * An inclusive-inclusive range of IP ports. The second port may be omitted to represent a single port
 */
export type L4PortRange = string

/**
 * A MAC address
 *
 * A Media Access Control address, in EUI-48 format
 */
export type MacAddr = string

/**
 * A `Measurement` is a timestamped datum from a single metric
 */
export type Measurement = { datum: Datum; timestamp: Date }

/**
 * A single page of results
 */
export type MeasurementResultsPage = {
  /** list of items on this page of results */
  items: Measurement[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string
}

/**
 * A `NetworkInterface` represents a virtual network interface device.
 */
export type NetworkInterface = {
  /** human-readable free-form text about a resource */
  description: string
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** The Instance to which the interface belongs. */
  instanceId: string
  /** The IP address assigned to this interface. */
  ip: string
  /** The MAC address assigned to this interface. */
  mac: MacAddr
  /** unique, mutable, user-controlled identifier for each resource */
  name: Name
  /** True if this interface is the primary for the instance to which it's attached. */
  primary: boolean
  /** The subnet to which the interface belongs. */
  subnetId: string
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
  /** The VPC to which the interface belongs. */
  vpcId: string
}

/**
 * A single page of results
 */
export type NetworkInterfaceResultsPage = {
  /** list of items on this page of results */
  items: NetworkInterface[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string
}

/**
 * Parameters for updating a {@link NetworkInterface}.
 *
 * Note that modifying IP addresses for an interface is not yet supported, a new interface must be created instead.
 */
export type NetworkInterfaceUpdate = {
  description?: string
  name?: Name
  /** Make a secondary interface the instance's primary interface.

If applied to a secondary interface, that interface will become the primary on the next reboot of the instance. Note that this may have implications for routing between instances, as the new primary interface will be on a distinct subnet from the previous primary interface.

Note that this can only be used to select a new primary interface for an instance. Requests to change the primary interface into a secondary will return an error. */
  primary?: boolean
}

/**
 * Unique name for a saga `Node`
 *
 * Each node requires a string name that's unique within its DAG.  The name is used to identify its output.  Nodes that depend on a given node (either directly or indirectly) can access the node's output using its name.
 */
export type NodeName = string

/**
 * Client view of an {@link Organization}
 */
export type Organization = {
  /** human-readable free-form text about a resource */
  description: string
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** unique, mutable, user-controlled identifier for each resource */
  name: Name
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
}

/**
 * Create-time parameters for an {@link Organization}
 */
export type OrganizationCreate = { description: string; name: Name }

/**
 * A single page of results
 */
export type OrganizationResultsPage = {
  /** list of items on this page of results */
  items: Organization[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string
}

export type OrganizationRole = 'admin' | 'collaborator' | 'viewer'

/**
 * Describes the assignment of a particular role on a particular resource to a particular identity (user, group, etc.)
 *
 * The resource is not part of this structure.  Rather, `RoleAssignment`s are put into a `Policy` and that Policy is applied to a particular resource.
 */
export type OrganizationRoleRoleAssignment = {
  identityId: string
  identityType: IdentityType
  roleName: OrganizationRole
}

/**
 * Client view of a `Policy`, which describes how this resource may be accessed
 *
 * Note that the Policy only describes access granted explicitly for this resource.  The policies of parent resources can also cause a user to have access to this resource.
 */
export type OrganizationRolePolicy = {
  /** Roles directly assigned on this resource */
  roleAssignments: OrganizationRoleRoleAssignment[]
}

/**
 * Updateable properties of an {@link Organization}
 */
export type OrganizationUpdate = { description?: string; name?: Name }

/**
 * A password used to authenticate a user
 *
 * Passwords may be subject to additional constraints.
 */
export type Password = string

export type PhysicalDiskType = 'internal' | 'external'

/**
 * Client view of a {@link PhysicalDisk}
 */
export type PhysicalDisk = {
  diskType: PhysicalDiskType
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  model: string
  serial: string
  /** The sled to which this disk is attached, if any. */
  sledId?: string
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
  vendor: string
}

/**
 * A single page of results
 */
export type PhysicalDiskResultsPage = {
  /** list of items on this page of results */
  items: PhysicalDisk[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string
}

/**
 * Client view of a {@link Project}
 */
export type Project = {
  /** human-readable free-form text about a resource */
  description: string
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** unique, mutable, user-controlled identifier for each resource */
  name: Name
  organizationId: string
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
}

/**
 * Create-time parameters for a {@link Project}
 */
export type ProjectCreate = { description: string; name: Name }

/**
 * A single page of results
 */
export type ProjectResultsPage = {
  /** list of items on this page of results */
  items: Project[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string
}

export type ProjectRole = 'admin' | 'collaborator' | 'viewer'

/**
 * Describes the assignment of a particular role on a particular resource to a particular identity (user, group, etc.)
 *
 * The resource is not part of this structure.  Rather, `RoleAssignment`s are put into a `Policy` and that Policy is applied to a particular resource.
 */
export type ProjectRoleRoleAssignment = {
  identityId: string
  identityType: IdentityType
  roleName: ProjectRole
}

/**
 * Client view of a `Policy`, which describes how this resource may be accessed
 *
 * Note that the Policy only describes access granted explicitly for this resource.  The policies of parent resources can also cause a user to have access to this resource.
 */
export type ProjectRolePolicy = {
  /** Roles directly assigned on this resource */
  roleAssignments: ProjectRoleRoleAssignment[]
}

/**
 * Updateable properties of a {@link Project}
 */
export type ProjectUpdate = { description?: string; name?: Name }

/**
 * Client view of an {@link Rack}
 */
export type Rack = {
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
}

/**
 * A single page of results
 */
export type RackResultsPage = {
  /** list of items on this page of results */
  items: Rack[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string
}

/**
 * A name for a built-in role
 *
 * Role names consist of two string components separated by dot (".").
 */
export type RoleName = string

/**
 * Client view of a {@link Role}
 */
export type Role = { description: string; name: RoleName }

/**
 * A single page of results
 */
export type RoleResultsPage = {
  /** list of items on this page of results */
  items: Role[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string
}

/**
 * A `RouteDestination` is used to match traffic with a routing rule, on the destination of that traffic.
 *
 * When traffic is to be sent to a destination that is within a given `RouteDestination`, the corresponding {@link RouterRoute} applies, and traffic will be forward to the {@link RouteTarget} for that rule.
 */
export type RouteDestination =
  /** Route applies to traffic destined for a specific IP address */
  | { type: 'ip'; value: string }
  /** Route applies to traffic destined for a specific IP subnet */
  | { type: 'ip_net'; value: IpNet }
  /** Route applies to traffic destined for the given VPC. */
  | { type: 'vpc'; value: Name }
  /** Route applies to traffic */
  | { type: 'subnet'; value: Name }

/**
 * A `RouteTarget` describes the possible locations that traffic matching a route destination can be sent.
 */
export type RouteTarget =
  /** Forward traffic to a particular IP address. */
  | { type: 'ip'; value: string }
  /** Forward traffic to a VPC */
  | { type: 'vpc'; value: Name }
  /** Forward traffic to a VPC Subnet */
  | { type: 'subnet'; value: Name }
  /** Forward traffic to a specific instance */
  | { type: 'instance'; value: Name }
  /** Forward traffic to an internet gateway */
  | { type: 'internet_gateway'; value: Name }

/**
 * The classification of a {@link RouterRoute} as defined by the system. The kind determines certain attributes such as if the route is modifiable and describes how or where the route was created.
 *
 * See [RFD-21](https://rfd.shared.oxide.computer/rfd/0021#concept-router) for more context
 */
export type RouterRouteKind =
  /** Determines the default destination of traffic, such as whether it goes to the internet or not.

`Destination: An Internet Gateway` `Modifiable: true` */
  | 'default'
  /** Automatically added for each VPC Subnet in the VPC

`Destination: A VPC Subnet` `Modifiable: false` */
  | 'vpc_subnet'
  /** Automatically added when VPC peering is established

`Destination: A different VPC` `Modifiable: false` */
  | 'vpc_peering'
  /** Created by a user See [`RouteTarget`]

`Destination: User defined` `Modifiable: true` */
  | 'custom'

/**
 * A route defines a rule that governs where traffic should be sent based on its destination.
 */
export type RouterRoute = {
  /** human-readable free-form text about a resource */
  description: string
  destination: RouteDestination
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** Describes the kind of router. Set at creation. `read-only` */
  kind: RouterRouteKind
  /** unique, mutable, user-controlled identifier for each resource */
  name: Name
  target: RouteTarget
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
  /** The VPC Router to which the route belongs. */
  vpcRouterId: string
}

/**
 * Create-time parameters for a `omicron_common::api::external::RouterRoute`
 */
export type RouterRouteCreate = {
  description: string
  destination: RouteDestination
  name: Name
  target: RouteTarget
}

/**
 * A single page of results
 */
export type RouterRouteResultsPage = {
  /** list of items on this page of results */
  items: RouterRoute[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string
}

/**
 * Updateable properties of a `omicron_common::api::external::RouterRoute`
 */
export type RouterRouteUpdate = {
  description?: string
  destination: RouteDestination
  name?: Name
  target: RouteTarget
}

export type SagaErrorInfo =
  | { error: 'action_failed'; sourceError: Record<string, unknown> }
  | { error: 'deserialize_failed'; message: string }
  | { error: 'injected_error' }
  | { error: 'serialize_failed'; message: string }
  | { error: 'subsaga_create_failed'; message: string }

export type SagaState =
  | { state: 'running' }
  | { state: 'succeeded' }
  | { errorInfo: SagaErrorInfo; errorNodeName: NodeName; state: 'failed' }

export type Saga = { id: string; state: SagaState }

/**
 * A single page of results
 */
export type SagaResultsPage = {
  /** list of items on this page of results */
  items: Saga[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string
}

/**
 * Identity-related metadata that's included in nearly all public API objects
 */
export type SamlIdentityProvider = {
  /** service provider endpoint where the response will be sent */
  acsUrl: string
  /** human-readable free-form text about a resource */
  description: string
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** idp's entity id */
  idpEntityId: string
  /** unique, mutable, user-controlled identifier for each resource */
  name: Name
  /** optional request signing public certificate (base64 encoded der file) */
  publicCert?: string
  /** service provider endpoint where the idp should send log out requests */
  sloUrl: string
  /** sp's client id */
  spClientId: string
  /** customer's technical contact for saml configuration */
  technicalContactEmail: string
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
}

/**
 * Create-time identity-related parameters
 */
export type SamlIdentityProviderCreate = {
  /** service provider endpoint where the response will be sent */
  acsUrl: string
  description: string
  /** If set, SAML attributes with this name will be considered to denote a user's group membership, where the attribute value(s) should be a comma-separated list of group names. */
  groupAttributeName?: string
  /** idp's entity id */
  idpEntityId: string
  /** the source of an identity provider metadata descriptor */
  idpMetadataSource: IdpMetadataSource
  name: Name
  /** optional request signing key pair */
  signingKeypair?: DerEncodedKeyPair
  /** service provider endpoint where the idp should send log out requests */
  sloUrl: string
  /** sp's client id */
  spClientId: string
  /** customer's technical contact for saml configuration */
  technicalContactEmail: string
}

/**
 * Describes how identities are managed and users are authenticated in this Silo
 */
export type SiloIdentityMode =
  /** Users are authenticated with SAML using an external authentication provider.  The system updates information about users and groups only during successful authentication (i.e,. "JIT provisioning" of users and groups). */
  | 'saml_jit'
  /** The system is the source of truth about users.  There is no linkage to an external authentication provider or identity provider. */
  | 'local_only'

/**
 * Client view of a ['Silo']
 */
export type Silo = {
  /** human-readable free-form text about a resource */
  description: string
  /** A silo where discoverable is false can be retrieved only by its id - it will not be part of the "list all silos" output. */
  discoverable: boolean
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** How users and groups are managed in this Silo */
  identityMode: SiloIdentityMode
  /** unique, mutable, user-controlled identifier for each resource */
  name: Name
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
}

/**
 * Create-time parameters for a {@link Silo}
 */
export type SiloCreate = {
  /** If set, this group will be created during Silo creation and granted the "Silo Admin" role. Identity providers can assert that users belong to this group and those users can log in and further initialize the Silo.

Note that if configuring a SAML based identity provider, group_attribute_name must be set for users to be considered part of a group. See [`SamlIdentityProviderCreate`] for more information. */
  adminGroupName?: string
  description: string
  discoverable: boolean
  identityMode: SiloIdentityMode
  name: Name
}

/**
 * A single page of results
 */
export type SiloResultsPage = {
  /** list of items on this page of results */
  items: Silo[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string
}

export type SiloRole = 'admin' | 'collaborator' | 'viewer'

/**
 * Describes the assignment of a particular role on a particular resource to a particular identity (user, group, etc.)
 *
 * The resource is not part of this structure.  Rather, `RoleAssignment`s are put into a `Policy` and that Policy is applied to a particular resource.
 */
export type SiloRoleRoleAssignment = {
  identityId: string
  identityType: IdentityType
  roleName: SiloRole
}

/**
 * Client view of a `Policy`, which describes how this resource may be accessed
 *
 * Note that the Policy only describes access granted explicitly for this resource.  The policies of parent resources can also cause a user to have access to this resource.
 */
export type SiloRolePolicy = {
  /** Roles directly assigned on this resource */
  roleAssignments: SiloRoleRoleAssignment[]
}

/**
 * Client view of a {@link Sled}
 */
export type Sled = {
  baseboard: Baseboard
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  rackId: string
  serviceAddress: string
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
}

/**
 * A single page of results
 */
export type SledResultsPage = {
  /** list of items on this page of results */
  items: Sled[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string
}

export type SnapshotState = 'creating' | 'ready' | 'faulted' | 'destroyed'

/**
 * Client view of a Snapshot
 */
export type Snapshot = {
  /** human-readable free-form text about a resource */
  description: string
  diskId: string
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** unique, mutable, user-controlled identifier for each resource */
  name: Name
  projectId: string
  size: ByteCount
  state: SnapshotState
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
}

/**
 * Create-time parameters for a {@link Snapshot}
 */
export type SnapshotCreate = {
  description: string
  /** The name of the disk to be snapshotted */
  disk: Name
  name: Name
}

/**
 * A single page of results
 */
export type SnapshotResultsPage = {
  /** list of items on this page of results */
  items: Snapshot[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string
}

export type SpoofLoginBody = { username: string }

/**
 * Client view of a {@link SshKey}
 */
export type SshKey = {
  /** human-readable free-form text about a resource */
  description: string
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** unique, mutable, user-controlled identifier for each resource */
  name: Name
  /** SSH public key, e.g., `"ssh-ed25519 AAAAC3NzaC..."` */
  publicKey: string
  /** The user to whom this key belongs */
  siloUserId: string
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
}

/**
 * Create-time parameters for an {@link SshKey}
 */
export type SshKeyCreate = {
  description: string
  name: Name
  /** SSH public key, e.g., `"ssh-ed25519 AAAAC3NzaC..."` */
  publicKey: string
}

/**
 * A single page of results
 */
export type SshKeyResultsPage = {
  /** list of items on this page of results */
  items: SshKey[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string
}

/**
 * Identity-related metadata that's included in "asset" public API objects (which generally have no name or description)
 */
export type SystemUpdate = {
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
  version: SemverVersion
}

/**
 * A single page of results
 */
export type SystemUpdateResultsPage = {
  /** list of items on this page of results */
  items: SystemUpdate[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string
}

export type SystemUpdateStart = { version: SemverVersion }

export type UpdateStatus = { status: 'updating' } | { status: 'steady' }

export type VersionRange = { high: SemverVersion; low: SemverVersion }

export type SystemVersion = { status: UpdateStatus; versionRange: VersionRange }

/**
 * The name of a timeseries
 *
 * Names are constructed by concatenating the target and metric names with ':'. Target and metric names must be lowercase alphanumeric characters with '_' separating words.
 */
export type TimeseriesName = string

/**
 * The schema for a timeseries.
 *
 * This includes the name of the timeseries, as well as the datum type of its metric and the schema for each field.
 */
export type TimeseriesSchema = {
  created: Date
  datumType: DatumType
  fieldSchema: FieldSchema[]
  timeseriesName: TimeseriesName
}

/**
 * A single page of results
 */
export type TimeseriesSchemaResultsPage = {
  /** list of items on this page of results */
  items: TimeseriesSchema[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string
}

/**
 * Identity-related metadata that's included in "asset" public API objects (which generally have no name or description)
 */
export type UpdateDeployment = {
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  status: UpdateStatus
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
  version: SemverVersion
}

/**
 * A single page of results
 */
export type UpdateDeploymentResultsPage = {
  /** list of items on this page of results */
  items: UpdateDeployment[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string
}

/**
 * Identity-related metadata that's included in "asset" public API objects (which generally have no name or description)
 */
export type UpdateableComponent = {
  componentType: UpdateableComponentType
  deviceId: string
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  status: UpdateStatus
  systemVersion: SemverVersion
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
  version: SemverVersion
}

/**
 * A single page of results
 */
export type UpdateableComponentResultsPage = {
  /** list of items on this page of results */
  items: UpdateableComponent[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string
}

/**
 * Client view of a {@link User}
 */
export type User = {
  /** Human-readable name that can identify the user */
  displayName: string
  id: string
  /** Uuid of the silo to which this user belongs */
  siloId: string
}

/**
 * Client view of a {@link UserBuiltin}
 */
export type UserBuiltin = {
  /** human-readable free-form text about a resource */
  description: string
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** unique, mutable, user-controlled identifier for each resource */
  name: Name
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
}

/**
 * A single page of results
 */
export type UserBuiltinResultsPage = {
  /** list of items on this page of results */
  items: UserBuiltin[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string
}

/**
 * A name unique within the parent collection
 *
 * Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. Names cannot be a UUID though they may contain a UUID.
 */
export type UserId = string

/**
 * Parameters for setting a user's password
 */
export type UserPassword =
  /** Sets the user's password to the provided value */
  | { details: Password; userPasswordValue: 'password' }
  /** Invalidates any current password (disabling password authentication) */
  | { userPasswordValue: 'invalid_password' }

/**
 * Create-time parameters for a {@link User}
 */
export type UserCreate = {
  /** username used to log in */
  externalId: UserId
  /** password used to log in */
  password: UserPassword
}

/**
 * A single page of results
 */
export type UserResultsPage = {
  /** list of items on this page of results */
  items: User[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string
}

/**
 * Credentials for local user login
 */
export type UsernamePasswordCredentials = { password: Password; username: UserId }

/**
 * Client view of a {@link Vpc}
 */
export type Vpc = {
  /** human-readable free-form text about a resource */
  description: string
  /** The name used for the VPC in DNS. */
  dnsName: Name
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** The unique local IPv6 address range for subnets in this VPC */
  ipv6Prefix: Ipv6Net
  /** unique, mutable, user-controlled identifier for each resource */
  name: Name
  /** id for the project containing this VPC */
  projectId: string
  /** id for the system router where subnet default routes are registered */
  systemRouterId: string
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
}

/**
 * Create-time parameters for a {@link Vpc}
 */
export type VpcCreate = {
  description: string
  dnsName: Name
  /** The IPv6 prefix for this VPC.

All IPv6 subnets created from this VPC must be taken from this range, which sould be a Unique Local Address in the range `fd00::/48`. The default VPC Subnet will have the first `/64` range from this prefix. */
  ipv6Prefix?: Ipv6Net
  name: Name
}

export type VpcFirewallRuleAction = 'allow' | 'deny'

export type VpcFirewallRuleDirection = 'inbound' | 'outbound'

/**
 * The `VpcFirewallRuleHostFilter` is used to filter traffic on the basis of its source or destination host.
 */
export type VpcFirewallRuleHostFilter =
  /** The rule applies to traffic from/to all instances in the VPC */
  | { type: 'vpc'; value: Name }
  /** The rule applies to traffic from/to all instances in the VPC Subnet */
  | { type: 'subnet'; value: Name }
  /** The rule applies to traffic from/to this specific instance */
  | { type: 'instance'; value: Name }
  /** The rule applies to traffic from/to a specific IP address */
  | { type: 'ip'; value: string }
  /** The rule applies to traffic from/to a specific IP subnet */
  | { type: 'ip_net'; value: IpNet }

/**
 * The protocols that may be specified in a firewall rule's filter
 */
export type VpcFirewallRuleProtocol = 'TCP' | 'UDP' | 'ICMP'

/**
 * Filter for a firewall rule. A given packet must match every field that is present for the rule to apply to it. A packet matches a field if any entry in that field matches the packet.
 */
export type VpcFirewallRuleFilter = {
  /** If present, the sources (if incoming) or destinations (if outgoing) this rule applies to. */
  hosts?: VpcFirewallRuleHostFilter[]
  /** If present, the destination ports this rule applies to. */
  ports?: L4PortRange[]
  /** If present, the networking protocols this rule applies to. */
  protocols?: VpcFirewallRuleProtocol[]
}

export type VpcFirewallRuleStatus = 'disabled' | 'enabled'

/**
 * A `VpcFirewallRuleTarget` is used to specify the set of {@link Instance}s to which a firewall rule applies.
 */
export type VpcFirewallRuleTarget =
  /** The rule applies to all instances in the VPC */
  | { type: 'vpc'; value: Name }
  /** The rule applies to all instances in the VPC Subnet */
  | { type: 'subnet'; value: Name }
  /** The rule applies to this specific instance */
  | { type: 'instance'; value: Name }
  /** The rule applies to a specific IP address */
  | { type: 'ip'; value: string }
  /** The rule applies to a specific IP subnet */
  | { type: 'ip_net'; value: IpNet }

/**
 * A single rule in a VPC firewall
 */
export type VpcFirewallRule = {
  /** whether traffic matching the rule should be allowed or dropped */
  action: VpcFirewallRuleAction
  /** human-readable free-form text about a resource */
  description: string
  /** whether this rule is for incoming or outgoing traffic */
  direction: VpcFirewallRuleDirection
  /** reductions on the scope of the rule */
  filters: VpcFirewallRuleFilter
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** unique, mutable, user-controlled identifier for each resource */
  name: Name
  /** the relative priority of this rule */
  priority: number
  /** whether this rule is in effect */
  status: VpcFirewallRuleStatus
  /** list of sets of instances that the rule applies to */
  targets: VpcFirewallRuleTarget[]
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
  /** the VPC to which this rule belongs */
  vpcId: string
}

/**
 * A single rule in a VPC firewall
 */
export type VpcFirewallRuleUpdate = {
  /** whether traffic matching the rule should be allowed or dropped */
  action: VpcFirewallRuleAction
  /** human-readable free-form text about a resource */
  description: string
  /** whether this rule is for incoming or outgoing traffic */
  direction: VpcFirewallRuleDirection
  /** reductions on the scope of the rule */
  filters: VpcFirewallRuleFilter
  /** name of the rule, unique to this VPC */
  name: Name
  /** the relative priority of this rule */
  priority: number
  /** whether this rule is in effect */
  status: VpcFirewallRuleStatus
  /** list of sets of instances that the rule applies to */
  targets: VpcFirewallRuleTarget[]
}

/**
 * Updateable properties of a `Vpc`'s firewall Note that VpcFirewallRules are implicitly created along with a Vpc, so there is no explicit creation.
 */
export type VpcFirewallRuleUpdateParams = { rules: VpcFirewallRuleUpdate[] }

/**
 * Collection of a Vpc's firewall rules
 */
export type VpcFirewallRules = { rules: VpcFirewallRule[] }

/**
 * A single page of results
 */
export type VpcResultsPage = {
  /** list of items on this page of results */
  items: Vpc[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string
}

export type VpcRouterKind = 'system' | 'custom'

/**
 * A VPC router defines a series of rules that indicate where traffic should be sent depending on its destination.
 */
export type VpcRouter = {
  /** human-readable free-form text about a resource */
  description: string
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  kind: VpcRouterKind
  /** unique, mutable, user-controlled identifier for each resource */
  name: Name
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
  /** The VPC to which the router belongs. */
  vpcId: string
}

/**
 * Create-time parameters for a {@link VpcRouter}
 */
export type VpcRouterCreate = { description: string; name: Name }

/**
 * A single page of results
 */
export type VpcRouterResultsPage = {
  /** list of items on this page of results */
  items: VpcRouter[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string
}

/**
 * Updateable properties of a {@link VpcRouter}
 */
export type VpcRouterUpdate = { description?: string; name?: Name }

/**
 * A VPC subnet represents a logical grouping for instances that allows network traffic between them, within a IPv4 subnetwork or optionall an IPv6 subnetwork.
 */
export type VpcSubnet = {
  /** human-readable free-form text about a resource */
  description: string
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** The IPv4 subnet CIDR block. */
  ipv4Block: Ipv4Net
  /** The IPv6 subnet CIDR block. */
  ipv6Block: Ipv6Net
  /** unique, mutable, user-controlled identifier for each resource */
  name: Name
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
  /** The VPC to which the subnet belongs. */
  vpcId: string
}

/**
 * Create-time parameters for a {@link VpcSubnet}
 */
export type VpcSubnetCreate = {
  description: string
  /** The IPv4 address range for this subnet.

It must be allocated from an RFC 1918 private address range, and must not overlap with any other existing subnet in the VPC. */
  ipv4Block: Ipv4Net
  /** The IPv6 address range for this subnet.

It must be allocated from the RFC 4193 Unique Local Address range, with the prefix equal to the parent VPC's prefix. A random `/64` block will be assigned if one is not provided. It must not overlap with any existing subnet in the VPC. */
  ipv6Block?: Ipv6Net
  name: Name
}

/**
 * A single page of results
 */
export type VpcSubnetResultsPage = {
  /** list of items on this page of results */
  items: VpcSubnet[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string
}

/**
 * Updateable properties of a {@link VpcSubnet}
 */
export type VpcSubnetUpdate = { description?: string; name?: Name }

/**
 * Updateable properties of a {@link Vpc}
 */
export type VpcUpdate = { description?: string; dnsName?: Name; name?: Name }

/**
 * Supported set of sort modes for scanning by id only.
 *
 * Currently, we only support scanning in ascending order.
 */
export type IdSortMode = 'id_ascending'

/**
 * Supported set of sort modes for scanning by name or id
 */
export type NameOrIdSortMode =
  /** sort in increasing order of "name" */
  | 'name_ascending'
  /** sort in decreasing order of "name" */
  | 'name_descending'
  /** sort in increasing order of "id" */
  | 'id_ascending'

/**
 * Supported set of sort modes for scanning by name only
 *
 * Currently, we only support scanning in ascending order.
 */
export type NameSortMode = 'name_ascending'

export type DiskMetricName =
  | 'activated'
  | 'flush'
  | 'read'
  | 'read_bytes'
  | 'write'
  | 'write_bytes'

export type SystemMetricName =
  | 'virtual_disk_space_provisioned'
  | 'cpus_provisioned'
  | 'ram_provisioned'

export interface DiskViewByIdPathParams {
  id: string
}

export interface ImageViewByIdPathParams {
  id: string
}

export interface InstanceViewByIdPathParams {
  id: string
}

export interface InstanceNetworkInterfaceViewByIdPathParams {
  id: string
}

export interface OrganizationViewByIdPathParams {
  id: string
}

export interface ProjectViewByIdPathParams {
  id: string
}

export interface SnapshotViewByIdPathParams {
  id: string
}

export interface VpcRouterRouteViewByIdPathParams {
  id: string
}

export interface VpcRouterViewByIdPathParams {
  id: string
}

export interface VpcSubnetViewByIdPathParams {
  id: string
}

export interface VpcViewByIdPathParams {
  id: string
}

export interface GroupListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: IdSortMode
}

export interface LoginLocalPathParams {
  siloName: Name
}

export interface LoginSamlBeginPathParams {
  providerName: Name
  siloName: Name
}

export interface LoginSamlPathParams {
  providerName: Name
  siloName: Name
}

export interface OrganizationListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: NameOrIdSortMode
}

export interface OrganizationViewPathParams {
  orgName: Name
}

export interface OrganizationUpdatePathParams {
  orgName: Name
}

export interface OrganizationDeletePathParams {
  orgName: Name
}

export interface OrganizationPolicyViewPathParams {
  orgName: Name
}

export interface OrganizationPolicyUpdatePathParams {
  orgName: Name
}

export interface ProjectListPathParams {
  orgName: Name
}

export interface ProjectListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: NameOrIdSortMode
}

export interface ProjectCreatePathParams {
  orgName: Name
}

export interface ProjectViewPathParams {
  orgName: Name
  projectName: Name
}

export interface ProjectUpdatePathParams {
  orgName: Name
  projectName: Name
}

export interface ProjectDeletePathParams {
  orgName: Name
  projectName: Name
}

export interface DiskListPathParams {
  orgName: Name
  projectName: Name
}

export interface DiskListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: NameSortMode
}

export interface DiskCreatePathParams {
  orgName: Name
  projectName: Name
}

export interface DiskViewPathParams {
  diskName: Name
  orgName: Name
  projectName: Name
}

export interface DiskDeletePathParams {
  diskName: Name
  orgName: Name
  projectName: Name
}

export interface DiskMetricsListPathParams {
  diskName: Name
  metricName: DiskMetricName
  orgName: Name
  projectName: Name
}

export interface DiskMetricsListQueryParams {
  endTime?: Date
  limit?: number
  pageToken?: string
  startTime?: Date
}

export interface ImageListPathParams {
  orgName: Name
  projectName: Name
}

export interface ImageListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: NameSortMode
}

export interface ImageCreatePathParams {
  orgName: Name
  projectName: Name
}

export interface ImageViewPathParams {
  imageName: Name
  orgName: Name
  projectName: Name
}

export interface ImageDeletePathParams {
  imageName: Name
  orgName: Name
  projectName: Name
}

export interface InstanceListPathParams {
  orgName: Name
  projectName: Name
}

export interface InstanceListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: NameSortMode
}

export interface InstanceCreatePathParams {
  orgName: Name
  projectName: Name
}

export interface InstanceViewPathParams {
  instanceName: Name
  orgName: Name
  projectName: Name
}

export interface InstanceDeletePathParams {
  instanceName: Name
  orgName: Name
  projectName: Name
}

export interface InstanceDiskListPathParams {
  instanceName: Name
  orgName: Name
  projectName: Name
}

export interface InstanceDiskListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: NameSortMode
}

export interface InstanceDiskAttachPathParams {
  instanceName: Name
  orgName: Name
  projectName: Name
}

export interface InstanceDiskDetachPathParams {
  instanceName: Name
  orgName: Name
  projectName: Name
}

export interface InstanceExternalIpListPathParams {
  instanceName: Name
  orgName: Name
  projectName: Name
}

export interface InstanceMigratePathParams {
  instanceName: Name
  orgName: Name
  projectName: Name
}

export interface InstanceNetworkInterfaceListPathParams {
  instanceName: Name
  orgName: Name
  projectName: Name
}

export interface InstanceNetworkInterfaceListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: NameSortMode
}

export interface InstanceNetworkInterfaceCreatePathParams {
  instanceName: Name
  orgName: Name
  projectName: Name
}

export interface InstanceNetworkInterfaceViewPathParams {
  instanceName: Name
  interfaceName: Name
  orgName: Name
  projectName: Name
}

export interface InstanceNetworkInterfaceUpdatePathParams {
  instanceName: Name
  interfaceName: Name
  orgName: Name
  projectName: Name
}

export interface InstanceNetworkInterfaceDeletePathParams {
  instanceName: Name
  interfaceName: Name
  orgName: Name
  projectName: Name
}

export interface InstanceRebootPathParams {
  instanceName: Name
  orgName: Name
  projectName: Name
}

export interface InstanceSerialConsolePathParams {
  instanceName: Name
  orgName: Name
  projectName: Name
}

export interface InstanceSerialConsoleQueryParams {
  fromStart?: number
  maxBytes?: number
  mostRecent?: number
}

export interface InstanceSerialConsoleStreamPathParams {
  instanceName: Name
  orgName: Name
  projectName: Name
}

export interface InstanceStartPathParams {
  instanceName: Name
  orgName: Name
  projectName: Name
}

export interface InstanceStopPathParams {
  instanceName: Name
  orgName: Name
  projectName: Name
}

export interface ProjectPolicyViewPathParams {
  orgName: Name
  projectName: Name
}

export interface ProjectPolicyUpdatePathParams {
  orgName: Name
  projectName: Name
}

export interface SnapshotListPathParams {
  orgName: Name
  projectName: Name
}

export interface SnapshotListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: NameSortMode
}

export interface SnapshotCreatePathParams {
  orgName: Name
  projectName: Name
}

export interface SnapshotViewPathParams {
  orgName: Name
  projectName: Name
  snapshotName: Name
}

export interface SnapshotDeletePathParams {
  orgName: Name
  projectName: Name
  snapshotName: Name
}

export interface VpcListPathParams {
  orgName: Name
  projectName: Name
}

export interface VpcListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: NameSortMode
}

export interface VpcCreatePathParams {
  orgName: Name
  projectName: Name
}

export interface VpcViewPathParams {
  orgName: Name
  projectName: Name
  vpcName: Name
}

export interface VpcUpdatePathParams {
  orgName: Name
  projectName: Name
  vpcName: Name
}

export interface VpcDeletePathParams {
  orgName: Name
  projectName: Name
  vpcName: Name
}

export interface VpcFirewallRulesViewPathParams {
  orgName: Name
  projectName: Name
  vpcName: Name
}

export interface VpcFirewallRulesUpdatePathParams {
  orgName: Name
  projectName: Name
  vpcName: Name
}

export interface VpcRouterListPathParams {
  orgName: Name
  projectName: Name
  vpcName: Name
}

export interface VpcRouterListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: NameSortMode
}

export interface VpcRouterCreatePathParams {
  orgName: Name
  projectName: Name
  vpcName: Name
}

export interface VpcRouterViewPathParams {
  orgName: Name
  projectName: Name
  routerName: Name
  vpcName: Name
}

export interface VpcRouterUpdatePathParams {
  orgName: Name
  projectName: Name
  routerName: Name
  vpcName: Name
}

export interface VpcRouterDeletePathParams {
  orgName: Name
  projectName: Name
  routerName: Name
  vpcName: Name
}

export interface VpcRouterRouteListPathParams {
  orgName: Name
  projectName: Name
  routerName: Name
  vpcName: Name
}

export interface VpcRouterRouteListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: NameSortMode
}

export interface VpcRouterRouteCreatePathParams {
  orgName: Name
  projectName: Name
  routerName: Name
  vpcName: Name
}

export interface VpcRouterRouteViewPathParams {
  orgName: Name
  projectName: Name
  routeName: Name
  routerName: Name
  vpcName: Name
}

export interface VpcRouterRouteUpdatePathParams {
  orgName: Name
  projectName: Name
  routeName: Name
  routerName: Name
  vpcName: Name
}

export interface VpcRouterRouteDeletePathParams {
  orgName: Name
  projectName: Name
  routeName: Name
  routerName: Name
  vpcName: Name
}

export interface VpcSubnetListPathParams {
  orgName: Name
  projectName: Name
  vpcName: Name
}

export interface VpcSubnetListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: NameSortMode
}

export interface VpcSubnetCreatePathParams {
  orgName: Name
  projectName: Name
  vpcName: Name
}

export interface VpcSubnetViewPathParams {
  orgName: Name
  projectName: Name
  subnetName: Name
  vpcName: Name
}

export interface VpcSubnetUpdatePathParams {
  orgName: Name
  projectName: Name
  subnetName: Name
  vpcName: Name
}

export interface VpcSubnetDeletePathParams {
  orgName: Name
  projectName: Name
  subnetName: Name
  vpcName: Name
}

export interface VpcSubnetListNetworkInterfacesPathParams {
  orgName: Name
  projectName: Name
  subnetName: Name
  vpcName: Name
}

export interface VpcSubnetListNetworkInterfacesQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: NameSortMode
}

export interface RoleListQueryParams {
  limit?: number
  pageToken?: string
}

export interface RoleViewPathParams {
  roleName: string
}

export interface SessionMeGroupsQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: IdSortMode
}

export interface SessionSshkeyListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: NameSortMode
}

export interface SessionSshkeyViewPathParams {
  sshKeyName: Name
}

export interface SessionSshkeyDeletePathParams {
  sshKeyName: Name
}

export interface SystemImageViewByIdPathParams {
  id: string
}

export interface IpPoolViewByIdPathParams {
  id: string
}

export interface SiloViewByIdPathParams {
  id: string
}

export interface CertificateListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: NameOrIdSortMode
}

export interface CertificateViewPathParams {
  certificate: NameOrId
}

export interface CertificateDeletePathParams {
  certificate: NameOrId
}

export interface PhysicalDiskListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: IdSortMode
}

export interface RackListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: IdSortMode
}

export interface RackViewPathParams {
  rackId: string
}

export interface SledListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: IdSortMode
}

export interface SledViewPathParams {
  sledId: string
}

export interface SledPhysicalDiskListPathParams {
  sledId: string
}

export interface SledPhysicalDiskListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: IdSortMode
}

export interface SystemImageListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: NameSortMode
}

export interface SystemImageViewPathParams {
  imageName: Name
}

export interface SystemImageDeletePathParams {
  imageName: Name
}

export interface IpPoolListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: NameOrIdSortMode
}

export interface IpPoolViewPathParams {
  poolName: Name
}

export interface IpPoolUpdatePathParams {
  poolName: Name
}

export interface IpPoolDeletePathParams {
  poolName: Name
}

export interface IpPoolRangeListPathParams {
  poolName: Name
}

export interface IpPoolRangeListQueryParams {
  limit?: number
  pageToken?: string
}

export interface IpPoolRangeAddPathParams {
  poolName: Name
}

export interface IpPoolRangeRemovePathParams {
  poolName: Name
}

export interface IpPoolServiceRangeListQueryParams {
  limit?: number
  pageToken?: string
}

export interface SystemMetricPathParams {
  metricName: SystemMetricName
}

export interface SystemMetricQueryParams {
  endTime?: Date
  id?: string
  limit?: number
  pageToken?: string
  startTime?: Date
}

export interface SagaListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: IdSortMode
}

export interface SagaViewPathParams {
  sagaId: string
}

export interface SiloListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: NameOrIdSortMode
}

export interface SiloViewPathParams {
  siloName: Name
}

export interface SiloDeletePathParams {
  siloName: Name
}

export interface SiloIdentityProviderListPathParams {
  siloName: Name
}

export interface SiloIdentityProviderListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: NameSortMode
}

export interface LocalIdpUserCreatePathParams {
  siloName: Name
}

export interface LocalIdpUserDeletePathParams {
  siloName: Name
  userId: string
}

export interface LocalIdpUserSetPasswordPathParams {
  siloName: Name
  userId: string
}

export interface SamlIdentityProviderCreatePathParams {
  siloName: Name
}

export interface SamlIdentityProviderViewPathParams {
  providerName: Name
  siloName: Name
}

export interface SiloPolicyViewPathParams {
  siloName: Name
}

export interface SiloPolicyUpdatePathParams {
  siloName: Name
}

export interface SiloUsersListPathParams {
  siloName: Name
}

export interface SiloUsersListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: IdSortMode
}

export interface SiloUserViewPathParams {
  siloName: Name
  userId: string
}

export interface SystemUserListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: NameSortMode
}

export interface SystemUserViewPathParams {
  userName: Name
}

export interface TimeseriesSchemaGetQueryParams {
  limit?: number
  pageToken?: string
}

export interface UserListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: IdSortMode
}

export interface DiskListV1QueryParams {
  limit?: number
  organization?: NameOrId
  pageToken?: string
  project?: NameOrId
  sortBy?: NameOrIdSortMode
}

export interface DiskCreateV1QueryParams {
  organization?: NameOrId
  project?: NameOrId
}

export interface DiskViewV1PathParams {
  disk: NameOrId
}

export interface DiskViewV1QueryParams {
  organization?: NameOrId
  project?: NameOrId
}

export interface DiskDeleteV1PathParams {
  disk: NameOrId
}

export interface DiskDeleteV1QueryParams {
  organization?: NameOrId
  project?: NameOrId
}

export interface InstanceListV1QueryParams {
  limit?: number
  organization?: NameOrId
  pageToken?: string
  project?: NameOrId
  sortBy?: NameOrIdSortMode
}

export interface InstanceCreateV1QueryParams {
  organization?: NameOrId
  project?: NameOrId
}

export interface InstanceViewV1PathParams {
  instance: NameOrId
}

export interface InstanceViewV1QueryParams {
  organization?: NameOrId
  project?: NameOrId
}

export interface InstanceDeleteV1PathParams {
  instance: NameOrId
}

export interface InstanceDeleteV1QueryParams {
  organization?: NameOrId
  project?: NameOrId
}

export interface InstanceDiskListV1PathParams {
  instance: NameOrId
}

export interface InstanceDiskListV1QueryParams {
  limit?: number
  organization?: NameOrId
  pageToken?: string
  project?: NameOrId
  sortBy?: NameOrIdSortMode
}

export interface InstanceDiskAttachV1PathParams {
  instance: NameOrId
}

export interface InstanceDiskAttachV1QueryParams {
  organization?: NameOrId
  project?: NameOrId
}

export interface InstanceDiskDetachV1PathParams {
  instance: NameOrId
}

export interface InstanceDiskDetachV1QueryParams {
  organization?: NameOrId
  project?: NameOrId
}

export interface InstanceMigrateV1PathParams {
  instance: NameOrId
}

export interface InstanceMigrateV1QueryParams {
  organization?: NameOrId
  project?: NameOrId
}

export interface InstanceRebootV1PathParams {
  instance: NameOrId
}

export interface InstanceRebootV1QueryParams {
  organization?: NameOrId
  project?: NameOrId
}

export interface InstanceSerialConsoleV1PathParams {
  instance: NameOrId
}

export interface InstanceSerialConsoleV1QueryParams {
  fromStart?: number
  maxBytes?: number
  mostRecent?: number
  organization?: NameOrId
  project?: NameOrId
}

export interface InstanceSerialConsoleStreamV1PathParams {
  instance: NameOrId
}

export interface InstanceSerialConsoleStreamV1QueryParams {
  organization?: NameOrId
  project?: NameOrId
}

export interface InstanceStartV1PathParams {
  instance: NameOrId
}

export interface InstanceStartV1QueryParams {
  organization?: NameOrId
  project?: NameOrId
}

export interface InstanceStopV1PathParams {
  instance: NameOrId
}

export interface InstanceStopV1QueryParams {
  organization?: NameOrId
  project?: NameOrId
}

export interface InstanceNetworkInterfaceListV1QueryParams {
  instance?: NameOrId
  limit?: number
  organization?: NameOrId
  pageToken?: string
  project?: NameOrId
  sortBy?: NameOrIdSortMode
}

export interface InstanceNetworkInterfaceCreateV1QueryParams {
  instance?: NameOrId
  organization?: NameOrId
  project?: NameOrId
}

export interface InstanceNetworkInterfaceViewV1PathParams {
  interface: NameOrId
}

export interface InstanceNetworkInterfaceViewV1QueryParams {
  instance?: NameOrId
  organization?: NameOrId
  project?: NameOrId
}

export interface InstanceNetworkInterfaceUpdateV1PathParams {
  interface: NameOrId
}

export interface InstanceNetworkInterfaceUpdateV1QueryParams {
  instance?: NameOrId
  organization?: NameOrId
  project?: NameOrId
}

export interface InstanceNetworkInterfaceDeleteV1PathParams {
  interface: NameOrId
}

export interface InstanceNetworkInterfaceDeleteV1QueryParams {
  instance?: NameOrId
  organization?: NameOrId
  project?: NameOrId
}

export interface OrganizationListV1QueryParams {
  limit?: number
  pageToken?: string
  sortBy?: NameOrIdSortMode
}

export interface OrganizationViewV1PathParams {
  organization: NameOrId
}

export interface OrganizationUpdateV1PathParams {
  organization: NameOrId
}

export interface OrganizationDeleteV1PathParams {
  organization: NameOrId
}

export interface OrganizationPolicyViewV1PathParams {
  organization: NameOrId
}

export interface OrganizationPolicyUpdateV1PathParams {
  organization: NameOrId
}

export interface ProjectListV1QueryParams {
  limit?: number
  organization?: NameOrId
  pageToken?: string
  sortBy?: NameOrIdSortMode
}

export interface ProjectCreateV1QueryParams {
  organization?: NameOrId
}

export interface ProjectViewV1PathParams {
  project: NameOrId
}

export interface ProjectViewV1QueryParams {
  organization?: NameOrId
}

export interface ProjectUpdateV1PathParams {
  project: NameOrId
}

export interface ProjectUpdateV1QueryParams {
  organization?: NameOrId
}

export interface ProjectDeleteV1PathParams {
  project: NameOrId
}

export interface ProjectDeleteV1QueryParams {
  organization?: NameOrId
}

export interface ProjectPolicyViewV1PathParams {
  project: NameOrId
}

export interface ProjectPolicyViewV1QueryParams {
  organization?: NameOrId
}

export interface ProjectPolicyUpdateV1PathParams {
  project: NameOrId
}

export interface ProjectPolicyUpdateV1QueryParams {
  organization?: NameOrId
}

export interface SnapshotListV1QueryParams {
  limit?: number
  organization?: NameOrId
  pageToken?: string
  project?: NameOrId
  sortBy?: NameOrIdSortMode
}

export interface SnapshotCreateV1QueryParams {
  organization?: NameOrId
  project?: NameOrId
}

export interface SnapshotViewV1PathParams {
  snapshot: NameOrId
}

export interface SnapshotViewV1QueryParams {
  organization?: NameOrId
  project?: NameOrId
}

export interface SnapshotDeleteV1PathParams {
  snapshot: NameOrId
}

export interface SnapshotDeleteV1QueryParams {
  organization?: NameOrId
  project?: NameOrId
}

export interface CertificateListV1QueryParams {
  limit?: number
  pageToken?: string
  sortBy?: NameOrIdSortMode
}

export interface CertificateViewV1PathParams {
  certificate: NameOrId
}

export interface CertificateDeleteV1PathParams {
  certificate: NameOrId
}

export interface PhysicalDiskListV1QueryParams {
  limit?: number
  pageToken?: string
  sortBy?: IdSortMode
}

export interface RackListV1QueryParams {
  limit?: number
  pageToken?: string
  sortBy?: IdSortMode
}

export interface RackViewV1PathParams {
  rackId: string
}

export interface SledListV1QueryParams {
  limit?: number
  pageToken?: string
  sortBy?: IdSortMode
}

export interface SledViewV1PathParams {
  sledId: string
}

export interface SledPhysicalDiskListV1PathParams {
  sledId: string
}

export interface SledPhysicalDiskListV1QueryParams {
  limit?: number
  pageToken?: string
  sortBy?: IdSortMode
}

export interface SagaListV1QueryParams {
  limit?: number
  pageToken?: string
  sortBy?: IdSortMode
}

export interface SagaViewV1PathParams {
  sagaId: string
}

export interface SystemComponentVersionListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: IdSortMode
}

export interface UpdateDeploymentsListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: IdSortMode
}

export interface UpdateDeploymentViewPathParams {
  id: string
}

export interface SystemUpdateListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: IdSortMode
}

export interface SystemUpdateViewPathParams {
  version: SemverVersion
}

export interface SystemUpdateComponentsListPathParams {
  version: SemverVersion
}

export interface VpcRouterRouteListV1QueryParams {
  limit?: number
  organization?: NameOrId
  pageToken?: string
  project?: NameOrId
  router?: NameOrId
  sortBy?: NameOrIdSortMode
  vpc?: NameOrId
}

export interface VpcRouterRouteCreateV1QueryParams {
  organization?: NameOrId
  project?: NameOrId
  router?: NameOrId
  vpc?: NameOrId
}

export interface VpcRouterRouteViewV1PathParams {
  route: NameOrId
}

export interface VpcRouterRouteViewV1QueryParams {
  organization?: NameOrId
  project?: NameOrId
  router?: NameOrId
  vpc?: NameOrId
}

export interface VpcRouterRouteUpdateV1PathParams {
  route: NameOrId
}

export interface VpcRouterRouteUpdateV1QueryParams {
  organization?: NameOrId
  project?: NameOrId
  router?: NameOrId
  vpc?: NameOrId
}

export interface VpcRouterRouteDeleteV1PathParams {
  route: NameOrId
}

export interface VpcRouterRouteDeleteV1QueryParams {
  organization?: NameOrId
  project?: NameOrId
  router?: NameOrId
  vpc?: NameOrId
}

export interface VpcRouterListV1QueryParams {
  limit?: number
  organization?: NameOrId
  pageToken?: string
  project?: NameOrId
  sortBy?: NameOrIdSortMode
  vpc?: NameOrId
}

export interface VpcRouterCreateV1QueryParams {
  organization?: NameOrId
  project?: NameOrId
  vpc?: NameOrId
}

export interface VpcRouterViewV1PathParams {
  router: NameOrId
}

export interface VpcRouterViewV1QueryParams {
  organization?: NameOrId
  project?: NameOrId
  vpc?: NameOrId
}

export interface VpcRouterUpdateV1PathParams {
  router: NameOrId
}

export interface VpcRouterUpdateV1QueryParams {
  organization?: NameOrId
  project?: NameOrId
  vpc?: NameOrId
}

export interface VpcRouterDeleteV1PathParams {
  router: NameOrId
}

export interface VpcRouterDeleteV1QueryParams {
  organization?: NameOrId
  project?: NameOrId
  vpc?: NameOrId
}

export interface VpcSubnetListV1QueryParams {
  limit?: number
  organization?: NameOrId
  pageToken?: string
  project?: NameOrId
  sortBy?: NameOrIdSortMode
  vpc?: NameOrId
}

export interface VpcSubnetCreateV1QueryParams {
  organization?: NameOrId
  project?: NameOrId
  vpc?: NameOrId
}

export interface VpcSubnetViewV1PathParams {
  subnet: NameOrId
}

export interface VpcSubnetViewV1QueryParams {
  organization?: NameOrId
  project?: NameOrId
  vpc?: NameOrId
}

export interface VpcSubnetUpdateV1PathParams {
  subnet: NameOrId
}

export interface VpcSubnetUpdateV1QueryParams {
  organization?: NameOrId
  project?: NameOrId
  vpc?: NameOrId
}

export interface VpcSubnetDeleteV1PathParams {
  subnet: NameOrId
}

export interface VpcSubnetDeleteV1QueryParams {
  organization?: NameOrId
  project?: NameOrId
  vpc?: NameOrId
}

export interface VpcListV1QueryParams {
  limit?: number
  organization?: NameOrId
  pageToken?: string
  project?: NameOrId
  sortBy?: NameOrIdSortMode
}

export interface VpcCreateV1QueryParams {
  organization?: NameOrId
  project?: NameOrId
}

export interface VpcViewV1PathParams {
  vpc: NameOrId
}

export interface VpcViewV1QueryParams {
  organization?: NameOrId
  project?: NameOrId
}

export interface VpcUpdateV1PathParams {
  vpc: NameOrId
}

export interface VpcUpdateV1QueryParams {
  organization?: NameOrId
  project?: NameOrId
}

export interface VpcDeleteV1PathParams {
  vpc: NameOrId
}

export interface VpcDeleteV1QueryParams {
  organization?: NameOrId
  project?: NameOrId
}

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
  | 'groupList'
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
  | 'certificateList'
  | 'physicalDiskList'
  | 'rackList'
  | 'sledList'
  | 'sledPhysicalDiskList'
  | 'systemImageList'
  | 'ipPoolList'
  | 'ipPoolRangeList'
  | 'ipPoolServiceRangeList'
  | 'sagaList'
  | 'siloList'
  | 'siloIdentityProviderList'
  | 'siloUsersList'
  | 'systemUserList'
  | 'userList'
  | 'diskListV1'
  | 'instanceListV1'
  | 'instanceDiskListV1'
  | 'instanceNetworkInterfaceListV1'
  | 'organizationListV1'
  | 'projectListV1'
  | 'snapshotListV1'
  | 'certificateListV1'
  | 'physicalDiskListV1'
  | 'rackListV1'
  | 'sledListV1'
  | 'sledPhysicalDiskListV1'
  | 'sagaListV1'
  | 'systemComponentVersionList'
  | 'updateDeploymentsList'
  | 'systemUpdateList'
  | 'systemUpdateComponentsList'
  | 'vpcRouterRouteListV1'
  | 'vpcRouterListV1'
  | 'vpcSubnetListV1'
  | 'vpcListV1'
>

type EmptyObj = Record<string, never>
export class Api extends HttpClient {
  methods = {
    /**
     * Fetch a disk by id
     */
    diskViewById: (
      { path }: { path: DiskViewByIdPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<Disk>({
        path: `/by-id/disks/${path.id}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Fetch an image by id
     */
    imageViewById: (
      { path }: { path: ImageViewByIdPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<Image>({
        path: `/by-id/images/${path.id}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Fetch an instance by id
     */
    instanceViewById: (
      { path }: { path: InstanceViewByIdPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<Instance>({
        path: `/by-id/instances/${path.id}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Fetch a network interface by id
     */
    instanceNetworkInterfaceViewById: (
      { path }: { path: InstanceNetworkInterfaceViewByIdPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<NetworkInterface>({
        path: `/by-id/network-interfaces/${path.id}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Fetch an organization by id
     */
    organizationViewById: (
      { path }: { path: OrganizationViewByIdPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<Organization>({
        path: `/by-id/organizations/${path.id}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Fetch a project by id
     */
    projectViewById: (
      { path }: { path: ProjectViewByIdPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<Project>({
        path: `/by-id/projects/${path.id}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Fetch a snapshot by id
     */
    snapshotViewById: (
      { path }: { path: SnapshotViewByIdPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<Snapshot>({
        path: `/by-id/snapshots/${path.id}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Fetch a route by id
     */
    vpcRouterRouteViewById: (
      { path }: { path: VpcRouterRouteViewByIdPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<RouterRoute>({
        path: `/by-id/vpc-router-routes/${path.id}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Get a router by id
     */
    vpcRouterViewById: (
      { path }: { path: VpcRouterViewByIdPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<VpcRouter>({
        path: `/by-id/vpc-routers/${path.id}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Fetch a subnet by id
     */
    vpcSubnetViewById: (
      { path }: { path: VpcSubnetViewByIdPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<VpcSubnet>({
        path: `/by-id/vpc-subnets/${path.id}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Fetch a VPC
     */
    vpcViewById: (
      { path }: { path: VpcViewByIdPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<Vpc>({
        path: `/by-id/vpcs/${path.id}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Start an OAuth 2.0 Device Authorization Grant
     */
    deviceAuthRequest: (_: EmptyObj, params: RequestParams = {}) => {
      return this.request<void>({
        path: `/device/auth`,
        method: 'POST',
        ...params,
      })
    },
    /**
     * Confirm an OAuth 2.0 Device Authorization Grant
     */
    deviceAuthConfirm: (
      { body }: { body: DeviceAuthVerify },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/device/confirm`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Request a device access token
     */
    deviceAccessToken: (_: EmptyObj, params: RequestParams = {}) => {
      return this.request<void>({
        path: `/device/token`,
        method: 'POST',
        ...params,
      })
    },
    /**
     * List groups
     */
    groupList: (
      { query = {} }: { query?: GroupListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<GroupResultsPage>({
        path: `/groups`,
        method: 'GET',
        query,
        ...params,
      })
    },
    loginSpoof: ({ body }: { body: SpoofLoginBody }, params: RequestParams = {}) => {
      return this.request<void>({
        path: `/login`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Authenticate a user (i.e., log in) via username and password
     */
    loginLocal: (
      { path, body }: { path: LoginLocalPathParams; body: UsernamePasswordCredentials },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/login/${path.siloName}/local`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Prompt user login
     */
    loginSamlBegin: (
      { path }: { path: LoginSamlBeginPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/login/${path.siloName}/saml/${path.providerName}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Authenticate a user (i.e., log in) via SAML
     */
    loginSaml: ({ path }: { path: LoginSamlPathParams }, params: RequestParams = {}) => {
      return this.request<void>({
        path: `/login/${path.siloName}/saml/${path.providerName}`,
        method: 'POST',
        ...params,
      })
    },
    logout: (_: EmptyObj, params: RequestParams = {}) => {
      return this.request<void>({
        path: `/logout`,
        method: 'POST',
        ...params,
      })
    },
    /**
     * List organizations
     */
    organizationList: (
      { query = {} }: { query?: OrganizationListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<OrganizationResultsPage>({
        path: `/organizations`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create an organization
     */
    organizationCreate: (
      { body }: { body: OrganizationCreate },
      params: RequestParams = {}
    ) => {
      return this.request<Organization>({
        path: `/organizations`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Fetch an organization
     */
    organizationView: (
      { path }: { path: OrganizationViewPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<Organization>({
        path: `/organizations/${path.orgName}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Update an organization
     */
    organizationUpdate: (
      { path, body }: { path: OrganizationUpdatePathParams; body: OrganizationUpdate },
      params: RequestParams = {}
    ) => {
      return this.request<Organization>({
        path: `/organizations/${path.orgName}`,
        method: 'PUT',
        body,
        ...params,
      })
    },
    /**
     * Delete an organization
     */
    organizationDelete: (
      { path }: { path: OrganizationDeletePathParams },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/organizations/${path.orgName}`,
        method: 'DELETE',
        ...params,
      })
    },
    /**
     * Fetch an organization's IAM policy
     */
    organizationPolicyView: (
      { path }: { path: OrganizationPolicyViewPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<OrganizationRolePolicy>({
        path: `/organizations/${path.orgName}/policy`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Update an organization's IAM policy
     */
    organizationPolicyUpdate: (
      {
        path,
        body,
      }: { path: OrganizationPolicyUpdatePathParams; body: OrganizationRolePolicy },
      params: RequestParams = {}
    ) => {
      return this.request<OrganizationRolePolicy>({
        path: `/organizations/${path.orgName}/policy`,
        method: 'PUT',
        body,
        ...params,
      })
    },
    /**
     * List projects
     */
    projectList: (
      { path, query = {} }: { path: ProjectListPathParams; query?: ProjectListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<ProjectResultsPage>({
        path: `/organizations/${path.orgName}/projects`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create a project
     */
    projectCreate: (
      { path, body }: { path: ProjectCreatePathParams; body: ProjectCreate },
      params: RequestParams = {}
    ) => {
      return this.request<Project>({
        path: `/organizations/${path.orgName}/projects`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Fetch a project
     */
    projectView: (
      { path }: { path: ProjectViewPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<Project>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Update a project
     */
    projectUpdate: (
      { path, body }: { path: ProjectUpdatePathParams; body: ProjectUpdate },
      params: RequestParams = {}
    ) => {
      return this.request<Project>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}`,
        method: 'PUT',
        body,
        ...params,
      })
    },
    /**
     * Delete a project
     */
    projectDelete: (
      { path }: { path: ProjectDeletePathParams },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}`,
        method: 'DELETE',
        ...params,
      })
    },
    /**
     * List disks
     */
    diskList: (
      { path, query = {} }: { path: DiskListPathParams; query?: DiskListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<DiskResultsPage>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/disks`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Use `POST /v1/disks` instead
     */
    diskCreate: (
      { path, body }: { path: DiskCreatePathParams; body: DiskCreate },
      params: RequestParams = {}
    ) => {
      return this.request<Disk>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/disks`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Fetch a disk
     */
    diskView: ({ path }: { path: DiskViewPathParams }, params: RequestParams = {}) => {
      return this.request<Disk>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/disks/${path.diskName}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Use `DELETE /v1/disks/{disk}` instead
     */
    diskDelete: ({ path }: { path: DiskDeletePathParams }, params: RequestParams = {}) => {
      return this.request<void>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/disks/${path.diskName}`,
        method: 'DELETE',
        ...params,
      })
    },
    /**
     * Fetch disk metrics
     */
    diskMetricsList: (
      {
        path,
        query = {},
      }: { path: DiskMetricsListPathParams; query?: DiskMetricsListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<MeasurementResultsPage>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/disks/${path.diskName}/metrics/${path.metricName}`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * List images
     */
    imageList: (
      { path, query = {} }: { path: ImageListPathParams; query?: ImageListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<ImageResultsPage>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/images`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create an image
     */
    imageCreate: (
      { path, body }: { path: ImageCreatePathParams; body: ImageCreate },
      params: RequestParams = {}
    ) => {
      return this.request<Image>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/images`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Fetch an image
     */
    imageView: ({ path }: { path: ImageViewPathParams }, params: RequestParams = {}) => {
      return this.request<Image>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/images/${path.imageName}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Delete an image
     */
    imageDelete: (
      { path }: { path: ImageDeletePathParams },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/images/${path.imageName}`,
        method: 'DELETE',
        ...params,
      })
    },
    /**
     * List instances
     */
    instanceList: (
      {
        path,
        query = {},
      }: { path: InstanceListPathParams; query?: InstanceListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<InstanceResultsPage>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/instances`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create an instance
     */
    instanceCreate: (
      { path, body }: { path: InstanceCreatePathParams; body: InstanceCreate },
      params: RequestParams = {}
    ) => {
      return this.request<Instance>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/instances`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Fetch an instance
     */
    instanceView: (
      { path }: { path: InstanceViewPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<Instance>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/instances/${path.instanceName}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Delete an instance
     */
    instanceDelete: (
      { path }: { path: InstanceDeletePathParams },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/instances/${path.instanceName}`,
        method: 'DELETE',
        ...params,
      })
    },
    /**
     * List an instance's disks
     */
    instanceDiskList: (
      {
        path,
        query = {},
      }: { path: InstanceDiskListPathParams; query?: InstanceDiskListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<DiskResultsPage>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/instances/${path.instanceName}/disks`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Attach a disk to an instance
     */
    instanceDiskAttach: (
      { path, body }: { path: InstanceDiskAttachPathParams; body: DiskIdentifier },
      params: RequestParams = {}
    ) => {
      return this.request<Disk>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/instances/${path.instanceName}/disks/attach`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Detach a disk from an instance
     */
    instanceDiskDetach: (
      { path, body }: { path: InstanceDiskDetachPathParams; body: DiskIdentifier },
      params: RequestParams = {}
    ) => {
      return this.request<Disk>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/instances/${path.instanceName}/disks/detach`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * List external IP addresses
     */
    instanceExternalIpList: (
      { path }: { path: InstanceExternalIpListPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<ExternalIpResultsPage>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/instances/${path.instanceName}/external-ips`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Migrate an instance
     */
    instanceMigrate: (
      { path, body }: { path: InstanceMigratePathParams; body: InstanceMigrate },
      params: RequestParams = {}
    ) => {
      return this.request<Instance>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/instances/${path.instanceName}/migrate`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * List network interfaces
     */
    instanceNetworkInterfaceList: (
      {
        path,
        query = {},
      }: {
        path: InstanceNetworkInterfaceListPathParams
        query?: InstanceNetworkInterfaceListQueryParams
      },
      params: RequestParams = {}
    ) => {
      return this.request<NetworkInterfaceResultsPage>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/instances/${path.instanceName}/network-interfaces`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create a network interface
     */
    instanceNetworkInterfaceCreate: (
      {
        path,
        body,
      }: { path: InstanceNetworkInterfaceCreatePathParams; body: NetworkInterfaceCreate },
      params: RequestParams = {}
    ) => {
      return this.request<NetworkInterface>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/instances/${path.instanceName}/network-interfaces`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Fetch a network interface
     */
    instanceNetworkInterfaceView: (
      { path }: { path: InstanceNetworkInterfaceViewPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<NetworkInterface>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/instances/${path.instanceName}/network-interfaces/${path.interfaceName}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Update a network interface
     */
    instanceNetworkInterfaceUpdate: (
      {
        path,
        body,
      }: { path: InstanceNetworkInterfaceUpdatePathParams; body: NetworkInterfaceUpdate },
      params: RequestParams = {}
    ) => {
      return this.request<NetworkInterface>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/instances/${path.instanceName}/network-interfaces/${path.interfaceName}`,
        method: 'PUT',
        body,
        ...params,
      })
    },
    /**
     * Delete a network interface
     */
    instanceNetworkInterfaceDelete: (
      { path }: { path: InstanceNetworkInterfaceDeletePathParams },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/instances/${path.instanceName}/network-interfaces/${path.interfaceName}`,
        method: 'DELETE',
        ...params,
      })
    },
    /**
     * Reboot an instance
     */
    instanceReboot: (
      { path }: { path: InstanceRebootPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<Instance>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/instances/${path.instanceName}/reboot`,
        method: 'POST',
        ...params,
      })
    },
    /**
     * Fetch an instance's serial console
     */
    instanceSerialConsole: (
      {
        path,
        query = {},
      }: {
        path: InstanceSerialConsolePathParams
        query?: InstanceSerialConsoleQueryParams
      },
      params: RequestParams = {}
    ) => {
      return this.request<InstanceSerialConsoleData>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/instances/${path.instanceName}/serial-console`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Connect to an instance's serial console
     */
    instanceSerialConsoleStream: (
      { path }: { path: InstanceSerialConsoleStreamPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/instances/${path.instanceName}/serial-console/stream`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Boot an instance
     */
    instanceStart: (
      { path }: { path: InstanceStartPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<Instance>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/instances/${path.instanceName}/start`,
        method: 'POST',
        ...params,
      })
    },
    /**
     * Halt an instance
     */
    instanceStop: (
      { path }: { path: InstanceStopPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<Instance>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/instances/${path.instanceName}/stop`,
        method: 'POST',
        ...params,
      })
    },
    /**
     * Fetch a project's IAM policy
     */
    projectPolicyView: (
      { path }: { path: ProjectPolicyViewPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<ProjectRolePolicy>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/policy`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Update a project's IAM policy
     */
    projectPolicyUpdate: (
      { path, body }: { path: ProjectPolicyUpdatePathParams; body: ProjectRolePolicy },
      params: RequestParams = {}
    ) => {
      return this.request<ProjectRolePolicy>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/policy`,
        method: 'PUT',
        body,
        ...params,
      })
    },
    /**
     * List snapshots
     */
    snapshotList: (
      {
        path,
        query = {},
      }: { path: SnapshotListPathParams; query?: SnapshotListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<SnapshotResultsPage>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/snapshots`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create a snapshot
     */
    snapshotCreate: (
      { path, body }: { path: SnapshotCreatePathParams; body: SnapshotCreate },
      params: RequestParams = {}
    ) => {
      return this.request<Snapshot>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/snapshots`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Fetch a snapshot
     */
    snapshotView: (
      { path }: { path: SnapshotViewPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<Snapshot>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/snapshots/${path.snapshotName}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Delete a snapshot
     */
    snapshotDelete: (
      { path }: { path: SnapshotDeletePathParams },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/snapshots/${path.snapshotName}`,
        method: 'DELETE',
        ...params,
      })
    },
    /**
     * List VPCs
     */
    vpcList: (
      { path, query = {} }: { path: VpcListPathParams; query?: VpcListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<VpcResultsPage>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/vpcs`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create a VPC
     */
    vpcCreate: (
      { path, body }: { path: VpcCreatePathParams; body: VpcCreate },
      params: RequestParams = {}
    ) => {
      return this.request<Vpc>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/vpcs`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Fetch a VPC
     */
    vpcView: ({ path }: { path: VpcViewPathParams }, params: RequestParams = {}) => {
      return this.request<Vpc>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/vpcs/${path.vpcName}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Update a VPC
     */
    vpcUpdate: (
      { path, body }: { path: VpcUpdatePathParams; body: VpcUpdate },
      params: RequestParams = {}
    ) => {
      return this.request<Vpc>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/vpcs/${path.vpcName}`,
        method: 'PUT',
        body,
        ...params,
      })
    },
    /**
     * Delete a VPC
     */
    vpcDelete: ({ path }: { path: VpcDeletePathParams }, params: RequestParams = {}) => {
      return this.request<void>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/vpcs/${path.vpcName}`,
        method: 'DELETE',
        ...params,
      })
    },
    /**
     * List firewall rules
     */
    vpcFirewallRulesView: (
      { path }: { path: VpcFirewallRulesViewPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<VpcFirewallRules>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/vpcs/${path.vpcName}/firewall/rules`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Replace firewall rules
     */
    vpcFirewallRulesUpdate: (
      {
        path,
        body,
      }: { path: VpcFirewallRulesUpdatePathParams; body: VpcFirewallRuleUpdateParams },
      params: RequestParams = {}
    ) => {
      return this.request<VpcFirewallRules>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/vpcs/${path.vpcName}/firewall/rules`,
        method: 'PUT',
        body,
        ...params,
      })
    },
    /**
     * List routers
     */
    vpcRouterList: (
      {
        path,
        query = {},
      }: { path: VpcRouterListPathParams; query?: VpcRouterListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<VpcRouterResultsPage>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/vpcs/${path.vpcName}/routers`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create a router
     */
    vpcRouterCreate: (
      { path, body }: { path: VpcRouterCreatePathParams; body: VpcRouterCreate },
      params: RequestParams = {}
    ) => {
      return this.request<VpcRouter>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/vpcs/${path.vpcName}/routers`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Get a router
     */
    vpcRouterView: (
      { path }: { path: VpcRouterViewPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<VpcRouter>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/vpcs/${path.vpcName}/routers/${path.routerName}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Update a router
     */
    vpcRouterUpdate: (
      { path, body }: { path: VpcRouterUpdatePathParams; body: VpcRouterUpdate },
      params: RequestParams = {}
    ) => {
      return this.request<VpcRouter>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/vpcs/${path.vpcName}/routers/${path.routerName}`,
        method: 'PUT',
        body,
        ...params,
      })
    },
    /**
     * Delete a router
     */
    vpcRouterDelete: (
      { path }: { path: VpcRouterDeletePathParams },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/vpcs/${path.vpcName}/routers/${path.routerName}`,
        method: 'DELETE',
        ...params,
      })
    },
    /**
     * List routes
     */
    vpcRouterRouteList: (
      {
        path,
        query = {},
      }: { path: VpcRouterRouteListPathParams; query?: VpcRouterRouteListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<RouterRouteResultsPage>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/vpcs/${path.vpcName}/routers/${path.routerName}/routes`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create a router
     */
    vpcRouterRouteCreate: (
      { path, body }: { path: VpcRouterRouteCreatePathParams; body: RouterRouteCreate },
      params: RequestParams = {}
    ) => {
      return this.request<RouterRoute>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/vpcs/${path.vpcName}/routers/${path.routerName}/routes`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Fetch a route
     */
    vpcRouterRouteView: (
      { path }: { path: VpcRouterRouteViewPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<RouterRoute>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/vpcs/${path.vpcName}/routers/${path.routerName}/routes/${path.routeName}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Update a route
     */
    vpcRouterRouteUpdate: (
      { path, body }: { path: VpcRouterRouteUpdatePathParams; body: RouterRouteUpdate },
      params: RequestParams = {}
    ) => {
      return this.request<RouterRoute>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/vpcs/${path.vpcName}/routers/${path.routerName}/routes/${path.routeName}`,
        method: 'PUT',
        body,
        ...params,
      })
    },
    /**
     * Delete a route
     */
    vpcRouterRouteDelete: (
      { path }: { path: VpcRouterRouteDeletePathParams },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/vpcs/${path.vpcName}/routers/${path.routerName}/routes/${path.routeName}`,
        method: 'DELETE',
        ...params,
      })
    },
    /**
     * List subnets
     */
    vpcSubnetList: (
      {
        path,
        query = {},
      }: { path: VpcSubnetListPathParams; query?: VpcSubnetListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<VpcSubnetResultsPage>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/vpcs/${path.vpcName}/subnets`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create a subnet
     */
    vpcSubnetCreate: (
      { path, body }: { path: VpcSubnetCreatePathParams; body: VpcSubnetCreate },
      params: RequestParams = {}
    ) => {
      return this.request<VpcSubnet>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/vpcs/${path.vpcName}/subnets`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Fetch a subnet
     */
    vpcSubnetView: (
      { path }: { path: VpcSubnetViewPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<VpcSubnet>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/vpcs/${path.vpcName}/subnets/${path.subnetName}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Update a subnet
     */
    vpcSubnetUpdate: (
      { path, body }: { path: VpcSubnetUpdatePathParams; body: VpcSubnetUpdate },
      params: RequestParams = {}
    ) => {
      return this.request<VpcSubnet>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/vpcs/${path.vpcName}/subnets/${path.subnetName}`,
        method: 'PUT',
        body,
        ...params,
      })
    },
    /**
     * Delete a subnet
     */
    vpcSubnetDelete: (
      { path }: { path: VpcSubnetDeletePathParams },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/vpcs/${path.vpcName}/subnets/${path.subnetName}`,
        method: 'DELETE',
        ...params,
      })
    },
    /**
     * List network interfaces
     */
    vpcSubnetListNetworkInterfaces: (
      {
        path,
        query = {},
      }: {
        path: VpcSubnetListNetworkInterfacesPathParams
        query?: VpcSubnetListNetworkInterfacesQueryParams
      },
      params: RequestParams = {}
    ) => {
      return this.request<NetworkInterfaceResultsPage>({
        path: `/organizations/${path.orgName}/projects/${path.projectName}/vpcs/${path.vpcName}/subnets/${path.subnetName}/network-interfaces`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Fetch the current silo's IAM policy
     */
    policyView: (_: EmptyObj, params: RequestParams = {}) => {
      return this.request<SiloRolePolicy>({
        path: `/policy`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Update the current silo's IAM policy
     */
    policyUpdate: ({ body }: { body: SiloRolePolicy }, params: RequestParams = {}) => {
      return this.request<SiloRolePolicy>({
        path: `/policy`,
        method: 'PUT',
        body,
        ...params,
      })
    },
    /**
     * List built-in roles
     */
    roleList: (
      { query = {} }: { query?: RoleListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<RoleResultsPage>({
        path: `/roles`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Fetch a built-in role
     */
    roleView: ({ path }: { path: RoleViewPathParams }, params: RequestParams = {}) => {
      return this.request<Role>({
        path: `/roles/${path.roleName}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Fetch the user associated with the current session
     */
    sessionMe: (_: EmptyObj, params: RequestParams = {}) => {
      return this.request<User>({
        path: `/session/me`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Fetch the silo groups the current user belongs to
     */
    sessionMeGroups: (
      { query = {} }: { query?: SessionMeGroupsQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<GroupResultsPage>({
        path: `/session/me/groups`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * List SSH public keys
     */
    sessionSshkeyList: (
      { query = {} }: { query?: SessionSshkeyListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<SshKeyResultsPage>({
        path: `/session/me/sshkeys`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create an SSH public key
     */
    sessionSshkeyCreate: ({ body }: { body: SshKeyCreate }, params: RequestParams = {}) => {
      return this.request<SshKey>({
        path: `/session/me/sshkeys`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Fetch an SSH public key
     */
    sessionSshkeyView: (
      { path }: { path: SessionSshkeyViewPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<SshKey>({
        path: `/session/me/sshkeys/${path.sshKeyName}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Delete an SSH public key
     */
    sessionSshkeyDelete: (
      { path }: { path: SessionSshkeyDeletePathParams },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/session/me/sshkeys/${path.sshKeyName}`,
        method: 'DELETE',
        ...params,
      })
    },
    /**
     * Fetch a system-wide image by id
     */
    systemImageViewById: (
      { path }: { path: SystemImageViewByIdPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<GlobalImage>({
        path: `/system/by-id/images/${path.id}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Fetch an IP pool by id
     */
    ipPoolViewById: (
      { path }: { path: IpPoolViewByIdPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<IpPool>({
        path: `/system/by-id/ip-pools/${path.id}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Fetch a silo by id
     */
    siloViewById: (
      { path }: { path: SiloViewByIdPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<Silo>({
        path: `/system/by-id/silos/${path.id}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * List system-wide certificates
     */
    certificateList: (
      { query = {} }: { query?: CertificateListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<CertificateResultsPage>({
        path: `/system/certificates`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create a new system-wide x.509 certificate.
     */
    certificateCreate: (
      { body }: { body: CertificateCreate },
      params: RequestParams = {}
    ) => {
      return this.request<Certificate>({
        path: `/system/certificates`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Fetch a certificate
     */
    certificateView: (
      { path }: { path: CertificateViewPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<Certificate>({
        path: `/system/certificates/${path.certificate}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Delete a certificate
     */
    certificateDelete: (
      { path }: { path: CertificateDeletePathParams },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/system/certificates/${path.certificate}`,
        method: 'DELETE',
        ...params,
      })
    },
    /**
     * List physical disks
     */
    physicalDiskList: (
      { query = {} }: { query?: PhysicalDiskListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<PhysicalDiskResultsPage>({
        path: `/system/hardware/disks`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * List racks
     */
    rackList: (
      { query = {} }: { query?: RackListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<RackResultsPage>({
        path: `/system/hardware/racks`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Fetch a rack
     */
    rackView: ({ path }: { path: RackViewPathParams }, params: RequestParams = {}) => {
      return this.request<Rack>({
        path: `/system/hardware/racks/${path.rackId}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * List sleds
     */
    sledList: (
      { query = {} }: { query?: SledListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<SledResultsPage>({
        path: `/system/hardware/sleds`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Fetch a sled
     */
    sledView: ({ path }: { path: SledViewPathParams }, params: RequestParams = {}) => {
      return this.request<Sled>({
        path: `/system/hardware/sleds/${path.sledId}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * List physical disks attached to sleds
     */
    sledPhysicalDiskList: (
      {
        path,
        query = {},
      }: { path: SledPhysicalDiskListPathParams; query?: SledPhysicalDiskListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<PhysicalDiskResultsPage>({
        path: `/system/hardware/sleds/${path.sledId}/disks`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * List system-wide images
     */
    systemImageList: (
      { query = {} }: { query?: SystemImageListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<GlobalImageResultsPage>({
        path: `/system/images`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create a system-wide image
     */
    systemImageCreate: (
      { body }: { body: GlobalImageCreate },
      params: RequestParams = {}
    ) => {
      return this.request<GlobalImage>({
        path: `/system/images`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Fetch a system-wide image
     */
    systemImageView: (
      { path }: { path: SystemImageViewPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<GlobalImage>({
        path: `/system/images/${path.imageName}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Delete a system-wide image
     */
    systemImageDelete: (
      { path }: { path: SystemImageDeletePathParams },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/system/images/${path.imageName}`,
        method: 'DELETE',
        ...params,
      })
    },
    /**
     * List IP pools
     */
    ipPoolList: (
      { query = {} }: { query?: IpPoolListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<IpPoolResultsPage>({
        path: `/system/ip-pools`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create an IP pool
     */
    ipPoolCreate: ({ body }: { body: IpPoolCreate }, params: RequestParams = {}) => {
      return this.request<IpPool>({
        path: `/system/ip-pools`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Fetch an IP pool
     */
    ipPoolView: ({ path }: { path: IpPoolViewPathParams }, params: RequestParams = {}) => {
      return this.request<IpPool>({
        path: `/system/ip-pools/${path.poolName}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Update an IP Pool
     */
    ipPoolUpdate: (
      { path, body }: { path: IpPoolUpdatePathParams; body: IpPoolUpdate },
      params: RequestParams = {}
    ) => {
      return this.request<IpPool>({
        path: `/system/ip-pools/${path.poolName}`,
        method: 'PUT',
        body,
        ...params,
      })
    },
    /**
     * Delete an IP Pool
     */
    ipPoolDelete: (
      { path }: { path: IpPoolDeletePathParams },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/system/ip-pools/${path.poolName}`,
        method: 'DELETE',
        ...params,
      })
    },
    /**
     * List ranges for an IP pool
     */
    ipPoolRangeList: (
      {
        path,
        query = {},
      }: { path: IpPoolRangeListPathParams; query?: IpPoolRangeListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<IpPoolRangeResultsPage>({
        path: `/system/ip-pools/${path.poolName}/ranges`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Add a range to an IP pool
     */
    ipPoolRangeAdd: (
      { path, body }: { path: IpPoolRangeAddPathParams; body: IpRange },
      params: RequestParams = {}
    ) => {
      return this.request<IpPoolRange>({
        path: `/system/ip-pools/${path.poolName}/ranges/add`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Remove a range from an IP pool
     */
    ipPoolRangeRemove: (
      { path, body }: { path: IpPoolRangeRemovePathParams; body: IpRange },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/system/ip-pools/${path.poolName}/ranges/remove`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Fetch the IP pool used for Oxide services.
     */
    ipPoolServiceView: (_: EmptyObj, params: RequestParams = {}) => {
      return this.request<IpPool>({
        path: `/system/ip-pools-service`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * List ranges for the IP pool used for Oxide services.
     */
    ipPoolServiceRangeList: (
      { query = {} }: { query?: IpPoolServiceRangeListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<IpPoolRangeResultsPage>({
        path: `/system/ip-pools-service/ranges`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Add a range to an IP pool used for Oxide services.
     */
    ipPoolServiceRangeAdd: ({ body }: { body: IpRange }, params: RequestParams = {}) => {
      return this.request<IpPoolRange>({
        path: `/system/ip-pools-service/ranges/add`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Remove a range from an IP pool used for Oxide services.
     */
    ipPoolServiceRangeRemove: ({ body }: { body: IpRange }, params: RequestParams = {}) => {
      return this.request<void>({
        path: `/system/ip-pools-service/ranges/remove`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Access metrics data
     */
    systemMetric: (
      {
        path,
        query = {},
      }: { path: SystemMetricPathParams; query?: SystemMetricQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<MeasurementResultsPage>({
        path: `/system/metrics/${path.metricName}`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Fetch the top-level IAM policy
     */
    systemPolicyView: (_: EmptyObj, params: RequestParams = {}) => {
      return this.request<FleetRolePolicy>({
        path: `/system/policy`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Update the top-level IAM policy
     */
    systemPolicyUpdate: (
      { body }: { body: FleetRolePolicy },
      params: RequestParams = {}
    ) => {
      return this.request<FleetRolePolicy>({
        path: `/system/policy`,
        method: 'PUT',
        body,
        ...params,
      })
    },
    /**
     * List sagas
     */
    sagaList: (
      { query = {} }: { query?: SagaListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<SagaResultsPage>({
        path: `/system/sagas`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Fetch a saga
     */
    sagaView: ({ path }: { path: SagaViewPathParams }, params: RequestParams = {}) => {
      return this.request<Saga>({
        path: `/system/sagas/${path.sagaId}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * List silos
     */
    siloList: (
      { query = {} }: { query?: SiloListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<SiloResultsPage>({
        path: `/system/silos`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create a silo
     */
    siloCreate: ({ body }: { body: SiloCreate }, params: RequestParams = {}) => {
      return this.request<Silo>({
        path: `/system/silos`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Fetch a silo
     */
    siloView: ({ path }: { path: SiloViewPathParams }, params: RequestParams = {}) => {
      return this.request<Silo>({
        path: `/system/silos/${path.siloName}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Delete a silo
     */
    siloDelete: ({ path }: { path: SiloDeletePathParams }, params: RequestParams = {}) => {
      return this.request<void>({
        path: `/system/silos/${path.siloName}`,
        method: 'DELETE',
        ...params,
      })
    },
    /**
     * List a silo's IDPs
     */
    siloIdentityProviderList: (
      {
        path,
        query = {},
      }: {
        path: SiloIdentityProviderListPathParams
        query?: SiloIdentityProviderListQueryParams
      },
      params: RequestParams = {}
    ) => {
      return this.request<IdentityProviderResultsPage>({
        path: `/system/silos/${path.siloName}/identity-providers`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create a user
     */
    localIdpUserCreate: (
      { path, body }: { path: LocalIdpUserCreatePathParams; body: UserCreate },
      params: RequestParams = {}
    ) => {
      return this.request<User>({
        path: `/system/silos/${path.siloName}/identity-providers/local/users`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Delete a user
     */
    localIdpUserDelete: (
      { path }: { path: LocalIdpUserDeletePathParams },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/system/silos/${path.siloName}/identity-providers/local/users/${path.userId}`,
        method: 'DELETE',
        ...params,
      })
    },
    /**
     * Set or invalidate a user's password
     */
    localIdpUserSetPassword: (
      { path, body }: { path: LocalIdpUserSetPasswordPathParams; body: UserPassword },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/system/silos/${path.siloName}/identity-providers/local/users/${path.userId}/set-password`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Create a SAML IDP
     */
    samlIdentityProviderCreate: (
      {
        path,
        body,
      }: { path: SamlIdentityProviderCreatePathParams; body: SamlIdentityProviderCreate },
      params: RequestParams = {}
    ) => {
      return this.request<SamlIdentityProvider>({
        path: `/system/silos/${path.siloName}/identity-providers/saml`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Fetch a SAML IDP
     */
    samlIdentityProviderView: (
      { path }: { path: SamlIdentityProviderViewPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<SamlIdentityProvider>({
        path: `/system/silos/${path.siloName}/identity-providers/saml/${path.providerName}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Fetch a silo's IAM policy
     */
    siloPolicyView: (
      { path }: { path: SiloPolicyViewPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<SiloRolePolicy>({
        path: `/system/silos/${path.siloName}/policy`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Update a silo's IAM policy
     */
    siloPolicyUpdate: (
      { path, body }: { path: SiloPolicyUpdatePathParams; body: SiloRolePolicy },
      params: RequestParams = {}
    ) => {
      return this.request<SiloRolePolicy>({
        path: `/system/silos/${path.siloName}/policy`,
        method: 'PUT',
        body,
        ...params,
      })
    },
    /**
     * List users in a silo
     */
    siloUsersList: (
      {
        path,
        query = {},
      }: { path: SiloUsersListPathParams; query?: SiloUsersListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<UserResultsPage>({
        path: `/system/silos/${path.siloName}/users/all`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Fetch a user
     */
    siloUserView: (
      { path }: { path: SiloUserViewPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<User>({
        path: `/system/silos/${path.siloName}/users/id/${path.userId}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * List built-in users
     */
    systemUserList: (
      { query = {} }: { query?: SystemUserListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<UserBuiltinResultsPage>({
        path: `/system/user`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Fetch a built-in user
     */
    systemUserView: (
      { path }: { path: SystemUserViewPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<UserBuiltin>({
        path: `/system/user/${path.userName}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * List timeseries schema
     */
    timeseriesSchemaGet: (
      { query = {} }: { query?: TimeseriesSchemaGetQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<TimeseriesSchemaResultsPage>({
        path: `/timeseries/schema`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * List users
     */
    userList: (
      { query = {} }: { query?: UserListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<UserResultsPage>({
        path: `/users`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * List disks
     */
    diskListV1: (
      { query = {} }: { query?: DiskListV1QueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<DiskResultsPage>({
        path: `/v1/disks`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create a disk
     */
    diskCreateV1: (
      { query = {}, body }: { query?: DiskCreateV1QueryParams; body: DiskCreate },
      params: RequestParams = {}
    ) => {
      return this.request<Disk>({
        path: `/v1/disks`,
        method: 'POST',
        body,
        query,
        ...params,
      })
    },
    /**
     * Fetch a disk
     */
    diskViewV1: (
      { path, query = {} }: { path: DiskViewV1PathParams; query?: DiskViewV1QueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<Disk>({
        path: `/v1/disks/${path.disk}`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Delete a disk
     */
    diskDeleteV1: (
      {
        path,
        query = {},
      }: { path: DiskDeleteV1PathParams; query?: DiskDeleteV1QueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/disks/${path.disk}`,
        method: 'DELETE',
        query,
        ...params,
      })
    },
    /**
     * List instances
     */
    instanceListV1: (
      { query = {} }: { query?: InstanceListV1QueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<InstanceResultsPage>({
        path: `/v1/instances`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create an instance
     */
    instanceCreateV1: (
      { query = {}, body }: { query?: InstanceCreateV1QueryParams; body: InstanceCreate },
      params: RequestParams = {}
    ) => {
      return this.request<Instance>({
        path: `/v1/instances`,
        method: 'POST',
        body,
        query,
        ...params,
      })
    },
    /**
     * Fetch an instance
     */
    instanceViewV1: (
      {
        path,
        query = {},
      }: { path: InstanceViewV1PathParams; query?: InstanceViewV1QueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<Instance>({
        path: `/v1/instances/${path.instance}`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Delete an instance
     */
    instanceDeleteV1: (
      {
        path,
        query = {},
      }: { path: InstanceDeleteV1PathParams; query?: InstanceDeleteV1QueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/instances/${path.instance}`,
        method: 'DELETE',
        query,
        ...params,
      })
    },
    /**
     * List an instance's disks
     */
    instanceDiskListV1: (
      {
        path,
        query = {},
      }: { path: InstanceDiskListV1PathParams; query?: InstanceDiskListV1QueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<DiskResultsPage>({
        path: `/v1/instances/${path.instance}/disks`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Attach a disk to an instance
     */
    instanceDiskAttachV1: (
      {
        path,
        query = {},
        body,
      }: {
        path: InstanceDiskAttachV1PathParams
        query?: InstanceDiskAttachV1QueryParams
        body: DiskPath
      },
      params: RequestParams = {}
    ) => {
      return this.request<Disk>({
        path: `/v1/instances/${path.instance}/disks/attach`,
        method: 'POST',
        body,
        query,
        ...params,
      })
    },
    /**
     * Detach a disk from an instance
     */
    instanceDiskDetachV1: (
      {
        path,
        query = {},
        body,
      }: {
        path: InstanceDiskDetachV1PathParams
        query?: InstanceDiskDetachV1QueryParams
        body: DiskPath
      },
      params: RequestParams = {}
    ) => {
      return this.request<Disk>({
        path: `/v1/instances/${path.instance}/disks/detach`,
        method: 'POST',
        body,
        query,
        ...params,
      })
    },
    /**
     * Migrate an instance
     */
    instanceMigrateV1: (
      {
        path,
        query = {},
        body,
      }: {
        path: InstanceMigrateV1PathParams
        query?: InstanceMigrateV1QueryParams
        body: InstanceMigrate
      },
      params: RequestParams = {}
    ) => {
      return this.request<Instance>({
        path: `/v1/instances/${path.instance}/migrate`,
        method: 'POST',
        body,
        query,
        ...params,
      })
    },
    /**
     * Reboot an instance
     */
    instanceRebootV1: (
      {
        path,
        query = {},
      }: { path: InstanceRebootV1PathParams; query?: InstanceRebootV1QueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<Instance>({
        path: `/v1/instances/${path.instance}/reboot`,
        method: 'POST',
        query,
        ...params,
      })
    },
    /**
     * Fetch an instance's serial console
     */
    instanceSerialConsoleV1: (
      {
        path,
        query = {},
      }: {
        path: InstanceSerialConsoleV1PathParams
        query?: InstanceSerialConsoleV1QueryParams
      },
      params: RequestParams = {}
    ) => {
      return this.request<InstanceSerialConsoleData>({
        path: `/v1/instances/${path.instance}/serial-console`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Stream an instance's serial console
     */
    instanceSerialConsoleStreamV1: (
      {
        path,
        query = {},
      }: {
        path: InstanceSerialConsoleStreamV1PathParams
        query?: InstanceSerialConsoleStreamV1QueryParams
      },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/instances/${path.instance}/serial-console/stream`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Boot an instance
     */
    instanceStartV1: (
      {
        path,
        query = {},
      }: { path: InstanceStartV1PathParams; query?: InstanceStartV1QueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<Instance>({
        path: `/v1/instances/${path.instance}/start`,
        method: 'POST',
        query,
        ...params,
      })
    },
    /**
     * Stop an instance
     */
    instanceStopV1: (
      {
        path,
        query = {},
      }: { path: InstanceStopV1PathParams; query?: InstanceStopV1QueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<Instance>({
        path: `/v1/instances/${path.instance}/stop`,
        method: 'POST',
        query,
        ...params,
      })
    },
    /**
     * List network interfaces
     */
    instanceNetworkInterfaceListV1: (
      { query = {} }: { query?: InstanceNetworkInterfaceListV1QueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<NetworkInterfaceResultsPage>({
        path: `/v1/network-interfaces`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create a network interface
     */
    instanceNetworkInterfaceCreateV1: (
      {
        query = {},
        body,
      }: {
        query?: InstanceNetworkInterfaceCreateV1QueryParams
        body: NetworkInterfaceCreate
      },
      params: RequestParams = {}
    ) => {
      return this.request<NetworkInterface>({
        path: `/v1/network-interfaces`,
        method: 'POST',
        body,
        query,
        ...params,
      })
    },
    /**
     * Fetch a network interface
     */
    instanceNetworkInterfaceViewV1: (
      {
        path,
        query = {},
      }: {
        path: InstanceNetworkInterfaceViewV1PathParams
        query?: InstanceNetworkInterfaceViewV1QueryParams
      },
      params: RequestParams = {}
    ) => {
      return this.request<NetworkInterface>({
        path: `/v1/network-interfaces/${path.interface}`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Update a network interface
     */
    instanceNetworkInterfaceUpdateV1: (
      {
        path,
        query = {},
        body,
      }: {
        path: InstanceNetworkInterfaceUpdateV1PathParams
        query?: InstanceNetworkInterfaceUpdateV1QueryParams
        body: NetworkInterfaceUpdate
      },
      params: RequestParams = {}
    ) => {
      return this.request<NetworkInterface>({
        path: `/v1/network-interfaces/${path.interface}`,
        method: 'PUT',
        body,
        query,
        ...params,
      })
    },
    /**
     * Delete a network interface
     */
    instanceNetworkInterfaceDeleteV1: (
      {
        path,
        query = {},
      }: {
        path: InstanceNetworkInterfaceDeleteV1PathParams
        query?: InstanceNetworkInterfaceDeleteV1QueryParams
      },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/network-interfaces/${path.interface}`,
        method: 'DELETE',
        query,
        ...params,
      })
    },
    /**
     * List organizations
     */
    organizationListV1: (
      { query = {} }: { query?: OrganizationListV1QueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<OrganizationResultsPage>({
        path: `/v1/organizations`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create an organization
     */
    organizationCreateV1: (
      { body }: { body: OrganizationCreate },
      params: RequestParams = {}
    ) => {
      return this.request<Organization>({
        path: `/v1/organizations`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Fetch an organization
     */
    organizationViewV1: (
      { path }: { path: OrganizationViewV1PathParams },
      params: RequestParams = {}
    ) => {
      return this.request<Organization>({
        path: `/v1/organizations/${path.organization}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Update an organization
     */
    organizationUpdateV1: (
      { path, body }: { path: OrganizationUpdateV1PathParams; body: OrganizationUpdate },
      params: RequestParams = {}
    ) => {
      return this.request<Organization>({
        path: `/v1/organizations/${path.organization}`,
        method: 'PUT',
        body,
        ...params,
      })
    },
    /**
     * Delete an organization
     */
    organizationDeleteV1: (
      { path }: { path: OrganizationDeleteV1PathParams },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/organizations/${path.organization}`,
        method: 'DELETE',
        ...params,
      })
    },
    /**
     * Fetch an organization's IAM policy
     */
    organizationPolicyViewV1: (
      { path }: { path: OrganizationPolicyViewV1PathParams },
      params: RequestParams = {}
    ) => {
      return this.request<OrganizationRolePolicy>({
        path: `/v1/organizations/${path.organization}/policy`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Update an organization's IAM policy
     */
    organizationPolicyUpdateV1: (
      {
        path,
        body,
      }: { path: OrganizationPolicyUpdateV1PathParams; body: OrganizationRolePolicy },
      params: RequestParams = {}
    ) => {
      return this.request<OrganizationRolePolicy>({
        path: `/v1/organizations/${path.organization}/policy`,
        method: 'PUT',
        body,
        ...params,
      })
    },
    /**
     * Fetch the current silo's IAM policy
     */
    policyViewV1: (_: EmptyObj, params: RequestParams = {}) => {
      return this.request<SiloRolePolicy>({
        path: `/v1/policy`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Update the current silo's IAM policy
     */
    policyUpdateV1: ({ body }: { body: SiloRolePolicy }, params: RequestParams = {}) => {
      return this.request<SiloRolePolicy>({
        path: `/v1/policy`,
        method: 'PUT',
        body,
        ...params,
      })
    },
    /**
     * List projects
     */
    projectListV1: (
      { query = {} }: { query?: ProjectListV1QueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<ProjectResultsPage>({
        path: `/v1/projects`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create a project
     */
    projectCreateV1: (
      { query = {}, body }: { query?: ProjectCreateV1QueryParams; body: ProjectCreate },
      params: RequestParams = {}
    ) => {
      return this.request<Project>({
        path: `/v1/projects`,
        method: 'POST',
        body,
        query,
        ...params,
      })
    },
    /**
     * Fetch a project
     */
    projectViewV1: (
      {
        path,
        query = {},
      }: { path: ProjectViewV1PathParams; query?: ProjectViewV1QueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<Project>({
        path: `/v1/projects/${path.project}`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Update a project
     */
    projectUpdateV1: (
      {
        path,
        query = {},
        body,
      }: {
        path: ProjectUpdateV1PathParams
        query?: ProjectUpdateV1QueryParams
        body: ProjectUpdate
      },
      params: RequestParams = {}
    ) => {
      return this.request<Project>({
        path: `/v1/projects/${path.project}`,
        method: 'PUT',
        body,
        query,
        ...params,
      })
    },
    /**
     * Delete a project
     */
    projectDeleteV1: (
      {
        path,
        query = {},
      }: { path: ProjectDeleteV1PathParams; query?: ProjectDeleteV1QueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/projects/${path.project}`,
        method: 'DELETE',
        query,
        ...params,
      })
    },
    /**
     * Fetch a project's IAM policy
     */
    projectPolicyViewV1: (
      {
        path,
        query = {},
      }: { path: ProjectPolicyViewV1PathParams; query?: ProjectPolicyViewV1QueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<ProjectRolePolicy>({
        path: `/v1/projects/${path.project}/policy`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Update a project's IAM policy
     */
    projectPolicyUpdateV1: (
      {
        path,
        query = {},
        body,
      }: {
        path: ProjectPolicyUpdateV1PathParams
        query?: ProjectPolicyUpdateV1QueryParams
        body: ProjectRolePolicy
      },
      params: RequestParams = {}
    ) => {
      return this.request<ProjectRolePolicy>({
        path: `/v1/projects/${path.project}/policy`,
        method: 'PUT',
        body,
        query,
        ...params,
      })
    },
    /**
     * List snapshots
     */
    snapshotListV1: (
      { query = {} }: { query?: SnapshotListV1QueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<SnapshotResultsPage>({
        path: `/v1/snapshots`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create a snapshot
     */
    snapshotCreateV1: (
      { query = {}, body }: { query?: SnapshotCreateV1QueryParams; body: SnapshotCreate },
      params: RequestParams = {}
    ) => {
      return this.request<Snapshot>({
        path: `/v1/snapshots`,
        method: 'POST',
        body,
        query,
        ...params,
      })
    },
    /**
     * Fetch a snapshot
     */
    snapshotViewV1: (
      {
        path,
        query = {},
      }: { path: SnapshotViewV1PathParams; query?: SnapshotViewV1QueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<Snapshot>({
        path: `/v1/snapshots/${path.snapshot}`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Delete a snapshot
     */
    snapshotDeleteV1: (
      {
        path,
        query = {},
      }: { path: SnapshotDeleteV1PathParams; query?: SnapshotDeleteV1QueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/snapshots/${path.snapshot}`,
        method: 'DELETE',
        query,
        ...params,
      })
    },
    /**
     * List system-wide certificates
     */
    certificateListV1: (
      { query = {} }: { query?: CertificateListV1QueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<CertificateResultsPage>({
        path: `/v1/system/certificates`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create a new system-wide x.509 certificate.
     */
    certificateCreateV1: (
      { body }: { body: CertificateCreate },
      params: RequestParams = {}
    ) => {
      return this.request<Certificate>({
        path: `/v1/system/certificates`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Fetch a certificate
     */
    certificateViewV1: (
      { path }: { path: CertificateViewV1PathParams },
      params: RequestParams = {}
    ) => {
      return this.request<Certificate>({
        path: `/v1/system/certificates/${path.certificate}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Delete a certificate
     */
    certificateDeleteV1: (
      { path }: { path: CertificateDeleteV1PathParams },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/system/certificates/${path.certificate}`,
        method: 'DELETE',
        ...params,
      })
    },
    /**
     * List physical disks
     */
    physicalDiskListV1: (
      { query = {} }: { query?: PhysicalDiskListV1QueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<PhysicalDiskResultsPage>({
        path: `/v1/system/hardware/disks`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * List racks
     */
    rackListV1: (
      { query = {} }: { query?: RackListV1QueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<RackResultsPage>({
        path: `/v1/system/hardware/racks`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Fetch a rack
     */
    rackViewV1: ({ path }: { path: RackViewV1PathParams }, params: RequestParams = {}) => {
      return this.request<Rack>({
        path: `/v1/system/hardware/racks/${path.rackId}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * List sleds
     */
    sledListV1: (
      { query = {} }: { query?: SledListV1QueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<SledResultsPage>({
        path: `/v1/system/hardware/sleds`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Fetch a sled
     */
    sledViewV1: ({ path }: { path: SledViewV1PathParams }, params: RequestParams = {}) => {
      return this.request<Sled>({
        path: `/v1/system/hardware/sleds/${path.sledId}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * List physical disks attached to sleds
     */
    sledPhysicalDiskListV1: (
      {
        path,
        query = {},
      }: {
        path: SledPhysicalDiskListV1PathParams
        query?: SledPhysicalDiskListV1QueryParams
      },
      params: RequestParams = {}
    ) => {
      return this.request<PhysicalDiskResultsPage>({
        path: `/v1/system/hardware/sleds/${path.sledId}/disks`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Fetch the top-level IAM policy
     */
    systemPolicyViewV1: (_: EmptyObj, params: RequestParams = {}) => {
      return this.request<FleetRolePolicy>({
        path: `/v1/system/policy`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Update the top-level IAM policy
     */
    systemPolicyUpdateV1: (
      { body }: { body: FleetRolePolicy },
      params: RequestParams = {}
    ) => {
      return this.request<FleetRolePolicy>({
        path: `/v1/system/policy`,
        method: 'PUT',
        body,
        ...params,
      })
    },
    /**
     * List sagas
     */
    sagaListV1: (
      { query = {} }: { query?: SagaListV1QueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<SagaResultsPage>({
        path: `/v1/system/sagas`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Fetch a saga
     */
    sagaViewV1: ({ path }: { path: SagaViewV1PathParams }, params: RequestParams = {}) => {
      return this.request<Saga>({
        path: `/v1/system/sagas/${path.sagaId}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * View version and update status of component tree
     */
    systemComponentVersionList: (
      { query = {} }: { query?: SystemComponentVersionListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<UpdateableComponentResultsPage>({
        path: `/v1/system/update/components`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * List all update deployments
     */
    updateDeploymentsList: (
      { query = {} }: { query?: UpdateDeploymentsListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<UpdateDeploymentResultsPage>({
        path: `/v1/system/update/deployments`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Fetch a system update deployment
     */
    updateDeploymentView: (
      { path }: { path: UpdateDeploymentViewPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<UpdateDeployment>({
        path: `/v1/system/update/deployments/${path.id}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Refresh update data
     */
    systemUpdateRefresh: (_: EmptyObj, params: RequestParams = {}) => {
      return this.request<void>({
        path: `/v1/system/update/refresh`,
        method: 'POST',
        ...params,
      })
    },
    /**
     * Start system update
     */
    systemUpdateStart: (
      { body }: { body: SystemUpdateStart },
      params: RequestParams = {}
    ) => {
      return this.request<UpdateDeployment>({
        path: `/v1/system/update/start`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Stop system update
     */
    systemUpdateStop: (_: EmptyObj, params: RequestParams = {}) => {
      return this.request<void>({
        path: `/v1/system/update/stop`,
        method: 'POST',
        ...params,
      })
    },
    /**
     * List all updates
     */
    systemUpdateList: (
      { query = {} }: { query?: SystemUpdateListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<SystemUpdateResultsPage>({
        path: `/v1/system/update/updates`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * View system update
     */
    systemUpdateView: (
      { path }: { path: SystemUpdateViewPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<SystemUpdate>({
        path: `/v1/system/update/updates/${path.version}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * View system update component tree
     */
    systemUpdateComponentsList: (
      { path }: { path: SystemUpdateComponentsListPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<ComponentUpdateResultsPage>({
        path: `/v1/system/update/updates/${path.version}/components`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * View system version and update status
     */
    systemVersion: (_: EmptyObj, params: RequestParams = {}) => {
      return this.request<SystemVersion>({
        path: `/v1/system/update/version`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * List the routes associated with a router in a particular VPC.
     */
    vpcRouterRouteListV1: (
      { query = {} }: { query?: VpcRouterRouteListV1QueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<RouterRouteResultsPage>({
        path: `/v1/vpc-router-routes`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create a router
     */
    vpcRouterRouteCreateV1: (
      {
        query = {},
        body,
      }: { query?: VpcRouterRouteCreateV1QueryParams; body: RouterRouteCreate },
      params: RequestParams = {}
    ) => {
      return this.request<RouterRoute>({
        path: `/v1/vpc-router-routes`,
        method: 'POST',
        body,
        query,
        ...params,
      })
    },
    /**
     * Fetch a route
     */
    vpcRouterRouteViewV1: (
      {
        path,
        query = {},
      }: { path: VpcRouterRouteViewV1PathParams; query?: VpcRouterRouteViewV1QueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<RouterRoute>({
        path: `/v1/vpc-router-routes/${path.route}`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Update a route
     */
    vpcRouterRouteUpdateV1: (
      {
        path,
        query = {},
        body,
      }: {
        path: VpcRouterRouteUpdateV1PathParams
        query?: VpcRouterRouteUpdateV1QueryParams
        body: RouterRouteUpdate
      },
      params: RequestParams = {}
    ) => {
      return this.request<RouterRoute>({
        path: `/v1/vpc-router-routes/${path.route}`,
        method: 'PUT',
        body,
        query,
        ...params,
      })
    },
    /**
     * Delete a route
     */
    vpcRouterRouteDeleteV1: (
      {
        path,
        query = {},
      }: {
        path: VpcRouterRouteDeleteV1PathParams
        query?: VpcRouterRouteDeleteV1QueryParams
      },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/vpc-router-routes/${path.route}`,
        method: 'DELETE',
        query,
        ...params,
      })
    },
    /**
     * List routers
     */
    vpcRouterListV1: (
      { query = {} }: { query?: VpcRouterListV1QueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<VpcRouterResultsPage>({
        path: `/v1/vpc-routers`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create a VPC router
     */
    vpcRouterCreateV1: (
      { query = {}, body }: { query?: VpcRouterCreateV1QueryParams; body: VpcRouterCreate },
      params: RequestParams = {}
    ) => {
      return this.request<VpcRouter>({
        path: `/v1/vpc-routers`,
        method: 'POST',
        body,
        query,
        ...params,
      })
    },
    /**
     * Get a router
     */
    vpcRouterViewV1: (
      {
        path,
        query = {},
      }: { path: VpcRouterViewV1PathParams; query?: VpcRouterViewV1QueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<VpcRouter>({
        path: `/v1/vpc-routers/${path.router}`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Update a router
     */
    vpcRouterUpdateV1: (
      {
        path,
        query = {},
        body,
      }: {
        path: VpcRouterUpdateV1PathParams
        query?: VpcRouterUpdateV1QueryParams
        body: VpcRouterUpdate
      },
      params: RequestParams = {}
    ) => {
      return this.request<VpcRouter>({
        path: `/v1/vpc-routers/${path.router}`,
        method: 'PUT',
        body,
        query,
        ...params,
      })
    },
    /**
     * Delete a router
     */
    vpcRouterDeleteV1: (
      {
        path,
        query = {},
      }: { path: VpcRouterDeleteV1PathParams; query?: VpcRouterDeleteV1QueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/vpc-routers/${path.router}`,
        method: 'DELETE',
        query,
        ...params,
      })
    },
    /**
     * Fetch a subnet
     */
    vpcSubnetListV1: (
      { query = {} }: { query?: VpcSubnetListV1QueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<VpcSubnetResultsPage>({
        path: `/v1/vpc-subnets`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create a subnet
     */
    vpcSubnetCreateV1: (
      { query = {}, body }: { query?: VpcSubnetCreateV1QueryParams; body: VpcSubnetCreate },
      params: RequestParams = {}
    ) => {
      return this.request<VpcSubnet>({
        path: `/v1/vpc-subnets`,
        method: 'POST',
        body,
        query,
        ...params,
      })
    },
    /**
     * Fetch a subnet
     */
    vpcSubnetViewV1: (
      {
        path,
        query = {},
      }: { path: VpcSubnetViewV1PathParams; query?: VpcSubnetViewV1QueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<VpcSubnet>({
        path: `/v1/vpc-subnets/${path.subnet}`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Update a subnet
     */
    vpcSubnetUpdateV1: (
      {
        path,
        query = {},
        body,
      }: {
        path: VpcSubnetUpdateV1PathParams
        query?: VpcSubnetUpdateV1QueryParams
        body: VpcSubnetUpdate
      },
      params: RequestParams = {}
    ) => {
      return this.request<VpcSubnet>({
        path: `/v1/vpc-subnets/${path.subnet}`,
        method: 'PUT',
        body,
        query,
        ...params,
      })
    },
    /**
     * Delete a subnet
     */
    vpcSubnetDeleteV1: (
      {
        path,
        query = {},
      }: { path: VpcSubnetDeleteV1PathParams; query?: VpcSubnetDeleteV1QueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/vpc-subnets/${path.subnet}`,
        method: 'DELETE',
        query,
        ...params,
      })
    },
    /**
     * List VPCs
     */
    vpcListV1: (
      { query = {} }: { query?: VpcListV1QueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<VpcResultsPage>({
        path: `/v1/vpcs`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create a VPC
     */
    vpcCreateV1: (
      { query = {}, body }: { query?: VpcCreateV1QueryParams; body: VpcCreate },
      params: RequestParams = {}
    ) => {
      return this.request<Vpc>({
        path: `/v1/vpcs`,
        method: 'POST',
        body,
        query,
        ...params,
      })
    },
    /**
     * Fetch a VPC
     */
    vpcViewV1: (
      { path, query = {} }: { path: VpcViewV1PathParams; query?: VpcViewV1QueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<Vpc>({
        path: `/v1/vpcs/${path.vpc}`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Update a VPC
     */
    vpcUpdateV1: (
      {
        path,
        query = {},
        body,
      }: { path: VpcUpdateV1PathParams; query?: VpcUpdateV1QueryParams; body: VpcUpdate },
      params: RequestParams = {}
    ) => {
      return this.request<Vpc>({
        path: `/v1/vpcs/${path.vpc}`,
        method: 'PUT',
        body,
        query,
        ...params,
      })
    },
    /**
     * Delete a VPC
     */
    vpcDeleteV1: (
      { path, query = {} }: { path: VpcDeleteV1PathParams; query?: VpcDeleteV1QueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/vpcs/${path.vpc}`,
        method: 'DELETE',
        query,
        ...params,
      })
    },
  }
}
