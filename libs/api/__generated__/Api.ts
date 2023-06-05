/* eslint-disable */
import type { RequestParams } from './http-client'
import { HttpClient, toQueryString } from './http-client'

export type { ApiConfig, ApiResult, ErrorBody, ErrorResult } from './http-client'

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
 * A name unique within the parent collection
 *
 * Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. Names cannot be a UUID though they may contain a UUID.
 */
export type Name = string

export type NameOrId = string | Name

/**
 * An address tied to an address lot.
 */
export type Address = {
  /** The address and prefix length of this address. */
  address: IpNet
  /** The address lot this address is drawn from. */
  addressLot: NameOrId
}

/**
 * A set of addresses associated with a port configuration.
 */
export type AddressConfig = {
  /** The set of addresses assigned to the port configuration. */
  addresses: Address[]
}

/**
 * The kind associated with an address lot.
 */
export type AddressLotKind =
  /** Infrastructure address lots are used for network infrastructure like addresses assigned to rack switches. */
  | 'infra'
  /** Pool address lots are used by IP pools. */
  | 'pool'

/**
 * Represents an address lot object, containing the id of the lot that can be used in other API calls.
 */
export type AddressLot = {
  /** human-readable free-form text about a resource */
  description: string
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** Desired use of `AddressLot` */
  kind: AddressLotKind
  /** unique, mutable, user-controlled identifier for each resource */
  name: Name
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
}

/**
 * An address lot block is a part of an address lot and contains a range of addresses. The range is inclusive.
 */
export type AddressLotBlock = {
  /** The first address of the block (inclusive). */
  firstAddress: string
  /** The id of the address lot block. */
  id: string
  /** The last address of the block (inclusive). */
  lastAddress: string
}

/**
 * Parameters for creating an address lot block. Fist and last addresses are inclusive.
 */
export type AddressLotBlockCreate = {
  /** The first address in the lot (inclusive). */
  firstAddress: string
  /** The last address in the lot (inclusive). */
  lastAddress: string
}

/**
 * A single page of results
 */
export type AddressLotBlockResultsPage = {
  /** list of items on this page of results */
  items: AddressLotBlock[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string
}

/**
 * Parameters for creating an address lot.
 */
export type AddressLotCreate = {
  /** The blocks to add along with the new address lot. */
  blocks: AddressLotBlockCreate[]
  description: string
  /** The kind of address lot to create. */
  kind: AddressLotKind
  name: Name
}

/**
 * An address lot and associated blocks resulting from creating an address lot.
 */
export type AddressLotCreateResponse = {
  /** The address lot blocks that were created. */
  blocks: AddressLotBlock[]
  /** The address lot that was created. */
  lot: AddressLot
}

/**
 * A single page of results
 */
export type AddressLotResultsPage = {
  /** list of items on this page of results */
  items: AddressLot[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string
}

/**
 * Properties that uniquely identify an Oxide hardware component
 */
export type Baseboard = { part: string; revision: number; serial: string }

/**
 * A BGP peer configuration for an interface. Includes the set of announcements that will be advertised to the peer identified by `addr`. The `bgp_config` parameter is a reference to global BGP parameters. The `interface_name` indicates what interface the peer should be contacted on.
 */
export type BgpPeerConfig = {
  /** The address of the host to peer with. */
  addr: string
  /** The set of announcements advertised by the peer. */
  bgpAnnounceSet: NameOrId
  /** The global BGP configuration used for establishing a session with this peer. */
  bgpConfig: NameOrId
  /** The name of interface to peer on. This is relative to the port configuration this BGP peer configuration is a part of. For example this value could be phy0 to refer to a primary physical interface. Or it could be vlan47 to refer to a VLAN interface. */
  interfaceName: string
}

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
 * Byte count to express memory or storage capacity.
 */
export type ByteCount = number

/**
 * The service intended to use this certificate.
 */
export type ServiceUsingCertificate = 'external_api'

/**
 * View of a Certificate
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
 * Create-time parameters for a `Certificate`
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
 * Info about the current user
 */
export type CurrentUser = {
  /** Human-readable name that can identify the user */
  displayName: string
  id: string
  /** Uuid of the silo to which this user belongs */
  siloId: string
  /** Name of the silo to which this user belongs. */
  siloName: Name
}

/**
 * Histogram metric
 *
 * A histogram maintains the count of any number of samples, over a set of bins. Bins are specified on construction via their _left_ edges, inclusive. There can't be any "gaps" in the bins, and an additional bin may be added to the left, right, or both so that the bins extend to the entire range of the support.
 *
 * Note that any gaps, unsorted bins, or non-finite values will result in an error.
 */
export type Histogramint64 = { bins: Binint64[]; nSamples: number; startTime: Date }

/**
 * Histogram metric
 *
 * A histogram maintains the count of any number of samples, over a set of bins. Bins are specified on construction via their _left_ edges, inclusive. There can't be any "gaps" in the bins, and an additional bin may be added to the left, right, or both so that the bins extend to the entire range of the support.
 *
 * Note that any gaps, unsorted bins, or non-finite values will result in an error.
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
 * State of a Disk
 */
export type DiskState =
  /** Disk is being initialized */
  | { state: 'creating' }
  /** Disk is ready but detached from any Instance */
  | { state: 'detached' }
  /** Disk is ready to receive blocks from an external source */
  | { state: 'import_ready' }
  /** Disk is importing blocks from a URL */
  | { state: 'importing_from_url' }
  /** Disk is importing blocks from bulk writes */
  | { state: 'importing_from_bulk_writes' }
  /** Disk is being finalized to state Detached */
  | { state: 'finalizing' }
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
 * View of a Disk
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
  /** Create a disk from an image */
  | { imageId: string; type: 'image' }
  /** Create a blank disk that will accept bulk writes or pull blocks from an external source. */
  | { blockSize: BlockSize; type: 'importing_blocks' }

/**
 * Create-time parameters for a `Disk`
 */
export type DiskCreate = {
  description: string
  /** initial source for this disk */
  diskSource: DiskSource
  name: Name
  /** total size of the Disk in bytes */
  size: ByteCount
}

export type DiskPath = {
  /** Name or ID of the disk */
  disk: NameOrId
}

/**
 * A single page of results
 */
export type DiskResultsPage = {
  /** list of items on this page of results */
  items: Disk[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string
}

export type ExpectedDigest = { sha256: string }

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
 * Parameters for finalizing a disk
 */
export type FinalizeDisk = {
  /** If specified a snapshot of the disk will be created with the given name during finalization. If not specified, a snapshot for the disk will _not_ be created. A snapshot can be manually created once the disk transitions into the `Detached` state. */
  snapshotName?: Name
}

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
 * Policy for a particular resource
 *
 * Note that the Policy only describes access granted explicitly for this resource.  The policies of parent resources can also cause a user to have access to this resource.
 */
export type FleetRolePolicy = {
  /** Roles directly assigned on this resource */
  roleAssignments: FleetRoleRoleAssignment[]
}

/**
 * View of a Group
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
 * View of an Identity Provider
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
 * View of an image
 *
 * If `project_id` is present then the image is only visible inside that project. If it's not present then the image is visible to all projects in the silo.
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
  /** The family of the operating system like Debian, Ubuntu, etc. */
  os: string
  /** ID of the parent project if the image is a project image */
  projectId?: string
  /** total size in bytes */
  size: ByteCount
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
  /** URL source of this image, if any */
  url?: string
  /** Version of the operating system */
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
 * Create-time parameters for an `Image`
 */
export type ImageCreate = {
  /** block size in bytes */
  blockSize: BlockSize
  description: string
  name: Name
  /** The family of the operating system (e.g. Debian, Ubuntu, etc.) */
  os: string
  /** The source of the image's contents. */
  source: ImageSource
  /** The version of the operating system (e.g. 18.04, 20.04, etc.) */
  version: string
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
 * Parameters for importing blocks with a bulk write
 */
export type ImportBlocksBulkWrite = { base64EncodedData: string; offset: number }

/**
 * Parameters for importing blocks from a URL to a disk
 */
export type ImportBlocksFromUrl = {
  /** Expected digest of all blocks when importing from a URL */
  expectedDigest?: ExpectedDigest
  /** the source to pull blocks from */
  url: string
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
 * View of an Instance
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
 * Create-time parameters for an `InstanceNetworkInterface`
 */
export type InstanceNetworkInterfaceCreate = {
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
 * Describes an attachment of an `InstanceNetworkInterface` to an `Instance`, at the time the instance is created.
 */
export type InstanceNetworkInterfaceAttachment =
  /** Create one or more `InstanceNetworkInterface`s for the `Instance`.

If more than one interface is provided, then the first will be designated the primary interface for the instance. */
  | { params: InstanceNetworkInterfaceCreate[]; type: 'create' }
  /** The default networking configuration for an instance is to create a single primary interface with an automatically-assigned IP address. The IP will be pulled from the Project's default VPC / VPC Subnet. */
  | { type: 'default' }
  /** No network interfaces at all will be created for the instance. */
  | { type: 'none' }

/**
 * Create-time parameters for an `Instance`
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
 * Migration parameters for an `Instance`
 */
export type InstanceMigrate = { dstSledId: string }

/**
 * A MAC address
 *
 * A Media Access Control address, in EUI-48 format
 */
export type MacAddr = string

/**
 * An `InstanceNetworkInterface` represents a virtual network interface device attached to an instance.
 */
export type InstanceNetworkInterface = {
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
export type InstanceNetworkInterfaceResultsPage = {
  /** list of items on this page of results */
  items: InstanceNetworkInterface[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string
}

/**
 * Parameters for updating an `InstanceNetworkInterface`
 *
 * Note that modifying IP addresses for an interface is not yet supported, a new interface must be created instead.
 */
export type InstanceNetworkInterfaceUpdate = {
  description?: string
  name?: Name
  /** Make a secondary interface the instance's primary interface.

If applied to a secondary interface, that interface will become the primary on the next reboot of the instance. Note that this may have implications for routing between instances, as the new primary interface will be on a distinct subnet from the previous primary interface.

Note that this can only be used to select a new primary interface for an instance. Requests to change the primary interface into a secondary will return an error. */
  primary?: boolean
}

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
 * Create-time parameters for an `IpPool`
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
 * The LLDP configuration associated with a port. LLDP may be either enabled or disabled, if enabled, an LLDP configuration must be provided by name or id.
 */
export type LldpServiceConfig = {
  /** Whether or not LLDP is enabled. */
  enabled: boolean
  /** A reference to the LLDP configuration used. Must not be `None` when `enabled` is `true`. */
  lldpConfig?: NameOrId
}

/**
 * Switch link configuration.
 */
export type LinkConfig = {
  /** The link-layer discovery protocol (LLDP) configuration for the link. */
  lldp: LldpServiceConfig
  /** Maximum transmission unit for the link. */
  mtu: number
}

/**
 * A loopback address is an address that is assigned to a rack switch but is not associated with any particular port.
 */
export type LoopbackAddress = {
  /** The loopback IP address and prefix length. */
  address: IpNet
  /** The address lot block this address came from. */
  addressLotBlockId: string
  /** The id of the loopback address. */
  id: string
  /** The id of the rack where this loopback address is assigned. */
  rackId: string
  /** Switch location where this loopback address is assigned. */
  switchLocation: string
}

/**
 * Parameters for creating a loopback address on a particular rack switch.
 */
export type LoopbackAddressCreate = {
  /** The address to create. */
  address: string
  /** The name or id of the address lot this loopback address will pull an address from. */
  addressLot: NameOrId
  /** The subnet mask to use for the address. */
  mask: number
  /** The containing the switch this loopback address will be configured on. */
  rackId: string
  /** The location of the switch within the rack this loopback address will be configured on. */
  switchLocation: Name
}

/**
 * A single page of results
 */
export type LoopbackAddressResultsPage = {
  /** list of items on this page of results */
  items: LoopbackAddress[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string
}

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
 * A password used to authenticate a user
 *
 * Passwords may be subject to additional constraints.
 */
export type Password = string

export type PhysicalDiskType = 'internal' | 'external'

/**
 * View of a Physical Disk
 *
 * Physical disks reside in a particular sled and are used to store both Instance Disk data as well as internal metadata.
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
 * View of a Project
 */
export type Project = {
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
 * Create-time parameters for a `Project`
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
 * Policy for a particular resource
 *
 * Note that the Policy only describes access granted explicitly for this resource.  The policies of parent resources can also cause a user to have access to this resource.
 */
export type ProjectRolePolicy = {
  /** Roles directly assigned on this resource */
  roleAssignments: ProjectRoleRoleAssignment[]
}

/**
 * Updateable properties of a `Project`
 */
export type ProjectUpdate = { description?: string; name?: Name }

/**
 * View of an Rack
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
 * View of a Role
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
 * A route to a destination network through a gateway address.
 */
export type Route = {
  /** The route destination. */
  dst: IpNet
  /** The route gateway. */
  gw: string
}

/**
 * Route configuration data associated with a switch port configuration.
 */
export type RouteConfig = {
  /** The set of routes assigned to a switch port. */
  routes: Route[]
}

/**
 * A `RouteDestination` is used to match traffic with a routing rule, on the destination of that traffic.
 *
 * When traffic is to be sent to a destination that is within a given `RouteDestination`, the corresponding `RouterRoute` applies, and traffic will be forward to the `RouteTarget` for that rule.
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
 * The kind of a `RouterRoute`
 *
 * The kind determines certain attributes such as if the route is modifiable and describes how or where the route was created.
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
  /** Created by a user; see `RouteTarget`

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
  /** The ID of the VPC Router to which the route belongs */
  vpcRouterId: string
}

/**
 * Create-time parameters for a `RouterRoute`
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
 * Updateable properties of a `RouterRoute`
 */
export type RouterRouteUpdate = {
  description?: string
  destination: RouteDestination
  name?: Name
  target: RouteTarget
}

/**
 * Identity-related metadata that's included in nearly all public API objects
 */
export type SamlIdentityProvider = {
  /** Service provider endpoint where the response will be sent */
  acsUrl: string
  /** human-readable free-form text about a resource */
  description: string
  /** If set, attributes with this name will be considered to denote a user's group membership, where the values will be the group names. */
  groupAttributeName?: string
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** IdP's entity id */
  idpEntityId: string
  /** unique, mutable, user-controlled identifier for each resource */
  name: Name
  /** Optional request signing public certificate (base64 encoded der file) */
  publicCert?: string
  /** Service provider endpoint where the idp should send log out requests */
  sloUrl: string
  /** SP's client id */
  spClientId: string
  /** Customer's technical contact for saml configuration */
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
  /** request signing key pair */
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
 * View of a Silo
 *
 * A Silo is the highest level unit of isolation.
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
 * Create-time parameters for a `Silo`
 */
export type SiloCreate = {
  /** If set, this group will be created during Silo creation and granted the "Silo Admin" role. Identity providers can assert that users belong to this group and those users can log in and further initialize the Silo.

Note that if configuring a SAML based identity provider, group_attribute_name must be set for users to be considered part of a group. See `SamlIdentityProviderCreate` for more information. */
  adminGroupName?: string
  description: string
  discoverable: boolean
  identityMode: SiloIdentityMode
  name: Name
  /** Initial TLS certificates to be used for the new Silo's console and API endpoints.  These should be valid for the Silo's DNS name(s). */
  tlsCertificates: CertificateCreate[]
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
 * Policy for a particular resource
 *
 * Note that the Policy only describes access granted explicitly for this resource.  The policies of parent resources can also cause a user to have access to this resource.
 */
export type SiloRolePolicy = {
  /** Roles directly assigned on this resource */
  roleAssignments: SiloRoleRoleAssignment[]
}

/**
 * An operator's view of a Sled.
 */
export type Sled = {
  baseboard: Baseboard
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** The rack to which this Sled is currently attached */
  rackId: string
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
  /** The number of hardware threads which can execute on this sled */
  usableHardwareThreads: number
  /** Amount of RAM which may be used by the Sled's OS */
  usablePhysicalRam: ByteCount
}

/**
 * An operator's view of an instance running on a given sled
 */
export type SledInstance = {
  activeSledId: string
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  memory: number
  migrationId?: string
  name: Name
  ncpus: number
  projectName: Name
  siloName: Name
  state: InstanceState
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
}

/**
 * A single page of results
 */
export type SledInstanceResultsPage = {
  /** list of items on this page of results */
  items: SledInstance[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string
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
 * View of a Snapshot
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
 * Create-time parameters for a `Snapshot`
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
 * View of an SSH Key
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
 * Create-time parameters for an `SshKey`
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
 * An operator's view of a Switch.
 */
export type Switch = {
  baseboard: Baseboard
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** The rack to which this Switch is currently attached */
  rackId: string
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
}

/**
 * Indicates the kind for a switch interface.
 */
export type SwitchInterfaceKind =
  /** Primary interfaces are associated with physical links. There is exactly one primary interface per physical link. */
  | { type: 'primary' }
  /** VLAN interfaces allow physical interfaces to be multiplexed onto multiple logical links, each distinguished by a 12-bit 802.1Q Ethernet tag. */
  | {
      type: 'vlan'
      /** The virtual network id (VID) that distinguishes this interface and is used for producing and consuming 802.1Q Ethernet tags. This field has a maximum value of 4095 as 802.1Q tags are twelve bits. */
      vid: number
    }
  /** Loopback interfaces are anchors for IP addresses that are not specific to any particular port. */
  | { type: 'loopback' }

/**
 * A layer-3 switch interface configuration. When IPv6 is enabled, a link local address will be created for the interface.
 */
export type SwitchInterfaceConfig = {
  /** What kind of switch interface this configuration represents. */
  kind: SwitchInterfaceKind
  /** Whether or not IPv6 is enabled. */
  v6Enabled: boolean
}

/**
 * A switch port represents a physical external port on a rack switch.
 */
export type SwitchPort = {
  /** The id of the switch port. */
  id: string
  /** The name of this switch port. */
  portName: string
  /** The primary settings group of this switch port. Will be `None` until this switch port is configured. */
  portSettingsId?: string
  /** The rack this switch port belongs to. */
  rackId: string
  /** The switch location of this switch port. */
  switchLocation: string
}

/**
 * An IP address configuration for a port settings object.
 */
export type SwitchPortAddressConfig = {
  /** The IP address and prefix. */
  address: IpNet
  /** The id of the address lot block this address is drawn from. */
  addressLotBlockId: string
  /** The interface name this address belongs to. */
  interfaceName: string
  /** The port settings object this address configuration belongs to. */
  portSettingsId: string
}

/**
 * Parameters for applying settings to switch ports.
 */
export type SwitchPortApplySettings = {
  /** A name or id to use when applying switch port settings. */
  portSettings: NameOrId
}

/**
 * A BGP peer configuration for a port settings object.
 */
export type SwitchPortBgpPeerConfig = {
  /** The address of the peer. */
  addr: string
  /** The id for the set of prefixes announced in this peer configuration. */
  bgpAnnounceSetId: string
  /** The id of the global BGP configuration referenced by this peer configuration. */
  bgpConfigId: string
  /** The interface name used to establish a peer session. */
  interfaceName: string
  /** The port settings object this BGP configuration belongs to. */
  portSettingsId: string
}

/**
 * The link geometry associated with a switch port.
 */
export type SwitchPortGeometry =
  /** The port contains a single QSFP28 link with four lanes. */
  | 'qsfp28x1'
  /** The port contains two QSFP28 links each with two lanes. */
  | 'qsfp28x2'
  /** The port contains four SFP28 links each with one lane. */
  | 'sfp28x4'

/**
 * Physical switch port configuration.
 */
export type SwitchPortConfig = {
  /** Link geometry for the switch port. */
  geometry: SwitchPortGeometry
}

/**
 * A link configuration for a port settings object.
 */
export type SwitchPortLinkConfig = {
  /** The name of this link. */
  linkName: string
  /** The link-layer discovery protocol service configuration id for this link. */
  lldpServiceConfigId: string
  /** The maximum transmission unit for this link. */
  mtu: number
  /** The port settings this link configuration belongs to. */
  portSettingsId: string
}

/**
 * A single page of results
 */
export type SwitchPortResultsPage = {
  /** list of items on this page of results */
  items: SwitchPort[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string
}

/**
 * A route configuration for a port settings object.
 */
export type SwitchPortRouteConfig = {
  /** The route's destination network. */
  dst: IpNet
  /** The route's gateway address. */
  gw: IpNet
  /** The interface name this route configuration is assigned to. */
  interfaceName: string
  /** The port settings object this route configuration belongs to. */
  portSettingsId: string
}

/**
 * A switch port settings identity whose id may be used to view additional details.
 */
export type SwitchPortSettings = {
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
 * Parameters for creating switch port settings. Switch port settings are the central data structure for setting up external networking. Switch port settings include link, interface, route, address and dynamic network protocol configuration.
 */
export type SwitchPortSettingsCreate = {
  /** Addresses indexed by interface name. */
  addresses: {}
  /** BGP peers indexed by interface name. */
  bgpPeers: {}
  description: string
  groups: NameOrId[]
  /** Interfaces indexed by link name. */
  interfaces: {}
  /** Links indexed by phy name. On ports that are not broken out, this is always phy0. On a 2x breakout the options are phy0 and phy1, on 4x phy0-phy3, etc. */
  links: {}
  name: Name
  portConfig: SwitchPortConfig
  /** Routes indexed by interface name. */
  routes: {}
}

/**
 * This structure maps a port settings object to a port settings groups. Port settings objects may inherit settings from groups. This mapping defines the relationship between settings objects and the groups they reference.
 */
export type SwitchPortSettingsGroups = {
  /** The id of a port settings group being referenced by a port settings object. */
  portSettingsGroupId: string
  /** The id of a port settings object referencing a port settings group. */
  portSettingsId: string
}

/**
 * A single page of results
 */
export type SwitchPortSettingsResultsPage = {
  /** list of items on this page of results */
  items: SwitchPortSettings[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string
}

/**
 * A switch port VLAN interface configuration for a port settings object.
 */
export type SwitchVlanInterfaceConfig = {
  /** The switch interface configuration this VLAN interface configuration belongs to. */
  interfaceConfigId: string
  /** The virtual network id (VID) that distinguishes this interface and is used for producing and consuming 802.1Q Ethernet tags. This field has a maximum value of 4095 as 802.1Q tags are twelve bits. */
  vid: number
}

/**
 * This structure contains all port settings information in one place. It's a convenience data structure for getting a complete view of a particular port's settings.
 */
export type SwitchPortSettingsView = {
  /** Layer 3 IP address settings. */
  addresses: SwitchPortAddressConfig[]
  /** BGP peer settings. */
  bgpPeers: SwitchPortBgpPeerConfig[]
  /** Switch port settings included from other switch port settings groups. */
  groups: SwitchPortSettingsGroups[]
  /** Layer 3 interface settings. */
  interfaces: SwitchInterfaceConfig[]
  /** Link-layer discovery protocol (LLDP) settings. */
  linkLldp: LldpServiceConfig[]
  /** Layer 2 link settings. */
  links: SwitchPortLinkConfig[]
  /** Layer 1 physical port settings. */
  port: SwitchPortConfig
  /** IP route settings. */
  routes: SwitchPortRouteConfig[]
  /** The primary switch port settings handle. */
  settings: SwitchPortSettings
  /** Vlan interface settings. */
  vlanInterfaces: SwitchVlanInterfaceConfig[]
}

/**
 * A single page of results
 */
export type SwitchResultsPage = {
  /** list of items on this page of results */
  items: Switch[]
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
 * View of a User
 */
export type User = {
  /** Human-readable name that can identify the user */
  displayName: string
  id: string
  /** Uuid of the silo to which this user belongs */
  siloId: string
}

/**
 * View of a Built-in User
 *
 * A Built-in User is explicitly created as opposed to being derived from an Identify Provider.
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
 * Create-time parameters for a `User`
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
 * View of a VPC
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
 * Create-time parameters for a `Vpc`
 */
export type VpcCreate = {
  description: string
  dnsName: Name
  /** The IPv6 prefix for this VPC

All IPv6 subnets created from this VPC must be taken from this range, which should be a Unique Local Address in the range `fd00::/48`. The default VPC Subnet will have the first `/64` range from this prefix. */
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
 * A `VpcFirewallRuleTarget` is used to specify the set of `Instance`s to which a firewall rule applies.
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
 * Create-time parameters for a `VpcRouter`
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
 * Updateable properties of a `VpcRouter`
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
 * Create-time parameters for a `VpcSubnet`
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
 * Updateable properties of a `VpcSubnet`
 */
export type VpcSubnetUpdate = { description?: string; name?: Name }

/**
 * Updateable properties of a `Vpc`
 */
export type VpcUpdate = { description?: string; dnsName?: Name; name?: Name }

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

export type DiskMetricName =
  | 'activated'
  | 'flush'
  | 'read'
  | 'read_bytes'
  | 'write'
  | 'write_bytes'

/**
 * The order in which the client wants to page through the requested collection
 */
export type PaginationOrder = 'ascending' | 'descending'

/**
 * Supported set of sort modes for scanning by id only.
 *
 * Currently, we only support scanning in ascending order.
 */
export type IdSortMode = 'id_ascending'

export type SystemMetricName =
  | 'virtual_disk_space_provisioned'
  | 'cpus_provisioned'
  | 'ram_provisioned'

/**
 * Supported set of sort modes for scanning by name only
 *
 * Currently, we only support scanning in ascending order.
 */
export type NameSortMode = 'name_ascending'

export interface LoginSamlBeginPathParams {
  providerName: Name
  siloName: Name
}

export interface LoginSamlPathParams {
  providerName: Name
  siloName: Name
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

export interface DiskListQueryParams {
  limit?: number
  pageToken?: string
  project?: NameOrId
  sortBy?: NameOrIdSortMode
}

export interface DiskCreateQueryParams {
  project?: NameOrId
}

export interface DiskViewPathParams {
  disk: NameOrId
}

export interface DiskViewQueryParams {
  project?: NameOrId
}

export interface DiskDeletePathParams {
  disk: NameOrId
}

export interface DiskDeleteQueryParams {
  project?: NameOrId
}

export interface DiskBulkWriteImportPathParams {
  disk: NameOrId
}

export interface DiskBulkWriteImportQueryParams {
  project?: NameOrId
}

export interface DiskBulkWriteImportStartPathParams {
  disk: NameOrId
}

export interface DiskBulkWriteImportStartQueryParams {
  project?: NameOrId
}

export interface DiskBulkWriteImportStopPathParams {
  disk: NameOrId
}

export interface DiskBulkWriteImportStopQueryParams {
  project?: NameOrId
}

export interface DiskFinalizeImportPathParams {
  disk: NameOrId
}

export interface DiskFinalizeImportQueryParams {
  project?: NameOrId
}

export interface DiskImportBlocksFromUrlPathParams {
  disk: NameOrId
}

export interface DiskImportBlocksFromUrlQueryParams {
  project?: NameOrId
}

export interface DiskMetricsListPathParams {
  disk: NameOrId
  metric: DiskMetricName
}

export interface DiskMetricsListQueryParams {
  endTime?: Date
  limit?: number
  order?: PaginationOrder
  pageToken?: string
  startTime?: Date
  project?: NameOrId
}

export interface GroupListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: IdSortMode
}

export interface GroupViewPathParams {
  groupId: string
}

export interface ImageListQueryParams {
  includeSiloImages?: boolean
  limit?: number
  pageToken?: string
  project?: NameOrId
  sortBy?: NameOrIdSortMode
}

export interface ImageCreateQueryParams {
  project?: NameOrId
}

export interface ImageViewPathParams {
  image: NameOrId
}

export interface ImageViewQueryParams {
  project?: NameOrId
}

export interface ImageDeletePathParams {
  image: NameOrId
}

export interface ImageDeleteQueryParams {
  project?: NameOrId
}

export interface ImageDemotePathParams {
  image: NameOrId
}

export interface ImageDemoteQueryParams {
  project?: NameOrId
}

export interface ImagePromotePathParams {
  image: NameOrId
}

export interface ImagePromoteQueryParams {
  project?: NameOrId
}

export interface InstanceListQueryParams {
  limit?: number
  pageToken?: string
  project?: NameOrId
  sortBy?: NameOrIdSortMode
}

export interface InstanceCreateQueryParams {
  project?: NameOrId
}

export interface InstanceViewPathParams {
  instance: NameOrId
}

export interface InstanceViewQueryParams {
  project?: NameOrId
}

export interface InstanceDeletePathParams {
  instance: NameOrId
}

export interface InstanceDeleteQueryParams {
  project?: NameOrId
}

export interface InstanceDiskListPathParams {
  instance: NameOrId
}

export interface InstanceDiskListQueryParams {
  limit?: number
  pageToken?: string
  project?: NameOrId
  sortBy?: NameOrIdSortMode
}

export interface InstanceDiskAttachPathParams {
  instance: NameOrId
}

export interface InstanceDiskAttachQueryParams {
  project?: NameOrId
}

export interface InstanceDiskDetachPathParams {
  instance: NameOrId
}

export interface InstanceDiskDetachQueryParams {
  project?: NameOrId
}

export interface InstanceExternalIpListPathParams {
  instance: NameOrId
}

export interface InstanceExternalIpListQueryParams {
  project?: NameOrId
}

export interface InstanceMigratePathParams {
  instance: NameOrId
}

export interface InstanceMigrateQueryParams {
  project?: NameOrId
}

export interface InstanceRebootPathParams {
  instance: NameOrId
}

export interface InstanceRebootQueryParams {
  project?: NameOrId
}

export interface InstanceSerialConsolePathParams {
  instance: NameOrId
}

export interface InstanceSerialConsoleQueryParams {
  fromStart?: number
  maxBytes?: number
  mostRecent?: number
  project?: NameOrId
}

export interface InstanceSerialConsoleStreamPathParams {
  instance: NameOrId
}

export interface InstanceSerialConsoleStreamQueryParams {
  mostRecent?: number
  project?: NameOrId
}

export interface InstanceStartPathParams {
  instance: NameOrId
}

export interface InstanceStartQueryParams {
  project?: NameOrId
}

export interface InstanceStopPathParams {
  instance: NameOrId
}

export interface InstanceStopQueryParams {
  project?: NameOrId
}

export interface LoginLocalPathParams {
  siloName: Name
}

export interface CurrentUserGroupsQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: IdSortMode
}

export interface CurrentUserSshKeyListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: NameOrIdSortMode
}

export interface CurrentUserSshKeyViewPathParams {
  sshKey: NameOrId
}

export interface CurrentUserSshKeyDeletePathParams {
  sshKey: NameOrId
}

export interface InstanceNetworkInterfaceListQueryParams {
  instance?: NameOrId
  limit?: number
  pageToken?: string
  project?: NameOrId
  sortBy?: NameOrIdSortMode
}

export interface InstanceNetworkInterfaceCreateQueryParams {
  instance?: NameOrId
  project?: NameOrId
}

export interface InstanceNetworkInterfaceViewPathParams {
  interface: NameOrId
}

export interface InstanceNetworkInterfaceViewQueryParams {
  instance?: NameOrId
  project?: NameOrId
}

export interface InstanceNetworkInterfaceUpdatePathParams {
  interface: NameOrId
}

export interface InstanceNetworkInterfaceUpdateQueryParams {
  instance?: NameOrId
  project?: NameOrId
}

export interface InstanceNetworkInterfaceDeletePathParams {
  interface: NameOrId
}

export interface InstanceNetworkInterfaceDeleteQueryParams {
  instance?: NameOrId
  project?: NameOrId
}

export interface ProjectListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: NameOrIdSortMode
}

export interface ProjectViewPathParams {
  project: NameOrId
}

export interface ProjectUpdatePathParams {
  project: NameOrId
}

export interface ProjectDeletePathParams {
  project: NameOrId
}

export interface ProjectPolicyViewPathParams {
  project: NameOrId
}

export interface ProjectPolicyUpdatePathParams {
  project: NameOrId
}

export interface SnapshotListQueryParams {
  limit?: number
  pageToken?: string
  project?: NameOrId
  sortBy?: NameOrIdSortMode
}

export interface SnapshotCreateQueryParams {
  project?: NameOrId
}

export interface SnapshotViewPathParams {
  snapshot: NameOrId
}

export interface SnapshotViewQueryParams {
  project?: NameOrId
}

export interface SnapshotDeletePathParams {
  snapshot: NameOrId
}

export interface SnapshotDeleteQueryParams {
  project?: NameOrId
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

export interface SledInstanceListPathParams {
  sledId: string
}

export interface SledInstanceListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: IdSortMode
}

export interface NetworkingSwitchPortListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: IdSortMode
  switchPortId?: string
}

export interface NetworkingSwitchPortApplySettingsPathParams {
  port: Name
}

export interface NetworkingSwitchPortApplySettingsQueryParams {
  rackId?: string
  switchLocation?: Name
}

export interface NetworkingSwitchPortClearSettingsPathParams {
  port: Name
}

export interface NetworkingSwitchPortClearSettingsQueryParams {
  rackId?: string
  switchLocation?: Name
}

export interface SwitchListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: IdSortMode
}

export interface SwitchViewPathParams {
  switchId: string
}

export interface SiloIdentityProviderListQueryParams {
  limit?: number
  pageToken?: string
  silo?: NameOrId
  sortBy?: NameOrIdSortMode
}

export interface LocalIdpUserCreateQueryParams {
  silo?: NameOrId
}

export interface LocalIdpUserDeletePathParams {
  userId: string
}

export interface LocalIdpUserDeleteQueryParams {
  silo?: NameOrId
}

export interface LocalIdpUserSetPasswordPathParams {
  userId: string
}

export interface LocalIdpUserSetPasswordQueryParams {
  silo?: NameOrId
}

export interface SamlIdentityProviderCreateQueryParams {
  silo?: NameOrId
}

export interface SamlIdentityProviderViewPathParams {
  provider: NameOrId
}

export interface SamlIdentityProviderViewQueryParams {
  silo?: NameOrId
}

export interface IpPoolListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: NameOrIdSortMode
}

export interface IpPoolViewPathParams {
  pool: NameOrId
}

export interface IpPoolUpdatePathParams {
  pool: NameOrId
}

export interface IpPoolDeletePathParams {
  pool: NameOrId
}

export interface IpPoolRangeListPathParams {
  pool: NameOrId
}

export interface IpPoolRangeListQueryParams {
  limit?: number
  pageToken?: string
}

export interface IpPoolRangeAddPathParams {
  pool: NameOrId
}

export interface IpPoolRangeRemovePathParams {
  pool: NameOrId
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
  limit?: number
  order?: PaginationOrder
  pageToken?: string
  startTime?: Date
  id?: string
}

export interface NetworkingAddressLotListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: NameOrIdSortMode
}

export interface NetworkingAddressLotDeletePathParams {
  addressLot: NameOrId
}

export interface NetworkingAddressLotBlockListPathParams {
  addressLot: NameOrId
}

export interface NetworkingAddressLotBlockListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: IdSortMode
}

export interface NetworkingLoopbackAddressListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: IdSortMode
}

export interface NetworkingLoopbackAddressDeletePathParams {
  address: string
  rackId: string
  subnetMask: number
  switchLocation: Name
}

export interface NetworkingSwitchPortSettingsListQueryParams {
  limit?: number
  pageToken?: string
  portSettings?: NameOrId
  sortBy?: NameOrIdSortMode
}

export interface NetworkingSwitchPortSettingsDeleteQueryParams {
  portSettings?: NameOrId
}

export interface NetworkingSwitchPortSettingsViewPathParams {
  port: NameOrId
}

export interface RoleListQueryParams {
  limit?: number
  pageToken?: string
}

export interface RoleViewPathParams {
  roleName: string
}

export interface SiloListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: NameOrIdSortMode
}

export interface SiloViewPathParams {
  silo: NameOrId
}

export interface SiloDeletePathParams {
  silo: NameOrId
}

export interface SiloPolicyViewPathParams {
  silo: NameOrId
}

export interface SiloPolicyUpdatePathParams {
  silo: NameOrId
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

export interface SiloUserListQueryParams {
  limit?: number
  pageToken?: string
  silo?: NameOrId
  sortBy?: IdSortMode
}

export interface SiloUserViewPathParams {
  userId: string
}

export interface SiloUserViewQueryParams {
  silo?: NameOrId
}

export interface UserBuiltinListQueryParams {
  limit?: number
  pageToken?: string
  sortBy?: NameSortMode
}

export interface UserBuiltinViewPathParams {
  user: NameOrId
}

export interface UserListQueryParams {
  group?: string
  limit?: number
  pageToken?: string
  sortBy?: IdSortMode
}

export interface VpcFirewallRulesViewQueryParams {
  project?: NameOrId
  vpc?: NameOrId
}

export interface VpcFirewallRulesUpdateQueryParams {
  project?: NameOrId
  vpc?: NameOrId
}

export interface VpcRouterRouteListQueryParams {
  limit?: number
  pageToken?: string
  project?: NameOrId
  router?: NameOrId
  sortBy?: NameOrIdSortMode
  vpc?: NameOrId
}

export interface VpcRouterRouteCreateQueryParams {
  project?: NameOrId
  router?: NameOrId
  vpc?: NameOrId
}

export interface VpcRouterRouteViewPathParams {
  route: NameOrId
}

export interface VpcRouterRouteViewQueryParams {
  project?: NameOrId
  router?: NameOrId
  vpc?: NameOrId
}

export interface VpcRouterRouteUpdatePathParams {
  route: NameOrId
}

export interface VpcRouterRouteUpdateQueryParams {
  project?: NameOrId
  router?: NameOrId
  vpc?: NameOrId
}

export interface VpcRouterRouteDeletePathParams {
  route: NameOrId
}

export interface VpcRouterRouteDeleteQueryParams {
  project?: NameOrId
  router?: NameOrId
  vpc?: NameOrId
}

export interface VpcRouterListQueryParams {
  limit?: number
  pageToken?: string
  project?: NameOrId
  sortBy?: NameOrIdSortMode
  vpc?: NameOrId
}

export interface VpcRouterCreateQueryParams {
  project?: NameOrId
  vpc?: NameOrId
}

export interface VpcRouterViewPathParams {
  router: NameOrId
}

export interface VpcRouterViewQueryParams {
  project?: NameOrId
  vpc?: NameOrId
}

export interface VpcRouterUpdatePathParams {
  router: NameOrId
}

export interface VpcRouterUpdateQueryParams {
  project?: NameOrId
  vpc?: NameOrId
}

export interface VpcRouterDeletePathParams {
  router: NameOrId
}

export interface VpcRouterDeleteQueryParams {
  project?: NameOrId
  vpc?: NameOrId
}

export interface VpcSubnetListQueryParams {
  limit?: number
  pageToken?: string
  project?: NameOrId
  sortBy?: NameOrIdSortMode
  vpc?: NameOrId
}

export interface VpcSubnetCreateQueryParams {
  project?: NameOrId
  vpc?: NameOrId
}

export interface VpcSubnetViewPathParams {
  subnet: NameOrId
}

export interface VpcSubnetViewQueryParams {
  project?: NameOrId
  vpc?: NameOrId
}

export interface VpcSubnetUpdatePathParams {
  subnet: NameOrId
}

export interface VpcSubnetUpdateQueryParams {
  project?: NameOrId
  vpc?: NameOrId
}

export interface VpcSubnetDeletePathParams {
  subnet: NameOrId
}

export interface VpcSubnetDeleteQueryParams {
  project?: NameOrId
  vpc?: NameOrId
}

export interface VpcSubnetListNetworkInterfacesPathParams {
  subnet: NameOrId
}

export interface VpcSubnetListNetworkInterfacesQueryParams {
  limit?: number
  pageToken?: string
  project?: NameOrId
  sortBy?: NameOrIdSortMode
  vpc?: NameOrId
}

export interface VpcListQueryParams {
  limit?: number
  pageToken?: string
  project?: NameOrId
  sortBy?: NameOrIdSortMode
}

export interface VpcCreateQueryParams {
  project?: NameOrId
}

export interface VpcViewPathParams {
  vpc: NameOrId
}

export interface VpcViewQueryParams {
  project?: NameOrId
}

export interface VpcUpdatePathParams {
  vpc: NameOrId
}

export interface VpcUpdateQueryParams {
  project?: NameOrId
}

export interface VpcDeletePathParams {
  vpc: NameOrId
}

export interface VpcDeleteQueryParams {
  project?: NameOrId
}

export type ApiListMethods = Pick<
  InstanceType<typeof Api>['methods'],
  | 'certificateList'
  | 'diskList'
  | 'diskMetricsList'
  | 'groupList'
  | 'imageList'
  | 'instanceList'
  | 'instanceDiskList'
  | 'instanceExternalIpList'
  | 'currentUserSshKeyList'
  | 'instanceNetworkInterfaceList'
  | 'projectList'
  | 'snapshotList'
  | 'physicalDiskList'
  | 'rackList'
  | 'sledList'
  | 'sledPhysicalDiskList'
  | 'sledInstanceList'
  | 'networkingSwitchPortList'
  | 'switchList'
  | 'siloIdentityProviderList'
  | 'ipPoolList'
  | 'ipPoolRangeList'
  | 'ipPoolServiceRangeList'
  | 'networkingAddressLotList'
  | 'networkingAddressLotBlockList'
  | 'networkingLoopbackAddressList'
  | 'networkingSwitchPortSettingsList'
  | 'roleList'
  | 'siloList'
  | 'systemComponentVersionList'
  | 'updateDeploymentsList'
  | 'systemUpdateList'
  | 'systemUpdateComponentsList'
  | 'siloUserList'
  | 'userBuiltinList'
  | 'userList'
  | 'vpcRouterRouteList'
  | 'vpcRouterList'
  | 'vpcSubnetList'
  | 'vpcList'
>

type EmptyObj = Record<string, never>
export class Api extends HttpClient {
  methods = {
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
    loginSpoof: ({ body }: { body: SpoofLoginBody }, params: RequestParams = {}) => {
      return this.request<void>({
        path: `/login`,
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
     * Authenticate a user via SAML
     */
    loginSaml: ({ path }: { path: LoginSamlPathParams }, params: RequestParams = {}) => {
      return this.request<void>({
        path: `/login/${path.siloName}/saml/${path.providerName}`,
        method: 'POST',
        ...params,
      })
    },
    /**
     * List certificates for external endpoints
     */
    certificateList: (
      { query = {} }: { query?: CertificateListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<CertificateResultsPage>({
        path: `/v1/certificates`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create a new system-wide x.509 certificate
     */
    certificateCreate: (
      { body }: { body: CertificateCreate },
      params: RequestParams = {}
    ) => {
      return this.request<Certificate>({
        path: `/v1/certificates`,
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
        path: `/v1/certificates/${path.certificate}`,
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
        path: `/v1/certificates/${path.certificate}`,
        method: 'DELETE',
        ...params,
      })
    },
    /**
     * List disks
     */
    diskList: (
      { query = {} }: { query?: DiskListQueryParams },
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
    diskCreate: (
      { query = {}, body }: { query?: DiskCreateQueryParams; body: DiskCreate },
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
    diskView: (
      { path, query = {} }: { path: DiskViewPathParams; query?: DiskViewQueryParams },
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
    diskDelete: (
      { path, query = {} }: { path: DiskDeletePathParams; query?: DiskDeleteQueryParams },
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
     * Import blocks into a disk
     */
    diskBulkWriteImport: (
      {
        path,
        query = {},
        body,
      }: {
        path: DiskBulkWriteImportPathParams
        query?: DiskBulkWriteImportQueryParams
        body: ImportBlocksBulkWrite
      },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/disks/${path.disk}/bulk-write`,
        method: 'POST',
        body,
        query,
        ...params,
      })
    },
    /**
     * Start importing blocks into a disk
     */
    diskBulkWriteImportStart: (
      {
        path,
        query = {},
      }: {
        path: DiskBulkWriteImportStartPathParams
        query?: DiskBulkWriteImportStartQueryParams
      },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/disks/${path.disk}/bulk-write-start`,
        method: 'POST',
        query,
        ...params,
      })
    },
    /**
     * Stop importing blocks into a disk
     */
    diskBulkWriteImportStop: (
      {
        path,
        query = {},
      }: {
        path: DiskBulkWriteImportStopPathParams
        query?: DiskBulkWriteImportStopQueryParams
      },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/disks/${path.disk}/bulk-write-stop`,
        method: 'POST',
        query,
        ...params,
      })
    },
    /**
     * Confirm disk block import completion
     */
    diskFinalizeImport: (
      {
        path,
        query = {},
        body,
      }: {
        path: DiskFinalizeImportPathParams
        query?: DiskFinalizeImportQueryParams
        body: FinalizeDisk
      },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/disks/${path.disk}/finalize`,
        method: 'POST',
        body,
        query,
        ...params,
      })
    },
    /**
     * Request to import blocks from URL
     */
    diskImportBlocksFromUrl: (
      {
        path,
        query = {},
        body,
      }: {
        path: DiskImportBlocksFromUrlPathParams
        query?: DiskImportBlocksFromUrlQueryParams
        body: ImportBlocksFromUrl
      },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/disks/${path.disk}/import`,
        method: 'POST',
        body,
        query,
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
        path: `/v1/disks/${path.disk}/metrics/${path.metric}`,
        method: 'GET',
        query,
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
        path: `/v1/groups`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Fetch group
     */
    groupView: ({ path }: { path: GroupViewPathParams }, params: RequestParams = {}) => {
      return this.request<Group>({
        path: `/v1/groups/${path.groupId}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * List images
     */
    imageList: (
      { query = {} }: { query?: ImageListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<ImageResultsPage>({
        path: `/v1/images`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create an image
     */
    imageCreate: (
      { query = {}, body }: { query?: ImageCreateQueryParams; body: ImageCreate },
      params: RequestParams = {}
    ) => {
      return this.request<Image>({
        path: `/v1/images`,
        method: 'POST',
        body,
        query,
        ...params,
      })
    },
    /**
     * Fetch an image
     */
    imageView: (
      { path, query = {} }: { path: ImageViewPathParams; query?: ImageViewQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<Image>({
        path: `/v1/images/${path.image}`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Delete an image
     */
    imageDelete: (
      { path, query = {} }: { path: ImageDeletePathParams; query?: ImageDeleteQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/images/${path.image}`,
        method: 'DELETE',
        query,
        ...params,
      })
    },
    /**
     * Demote a silo image
     */
    imageDemote: (
      { path, query = {} }: { path: ImageDemotePathParams; query?: ImageDemoteQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<Image>({
        path: `/v1/images/${path.image}/demote`,
        method: 'POST',
        query,
        ...params,
      })
    },
    /**
     * Promote a project image
     */
    imagePromote: (
      {
        path,
        query = {},
      }: { path: ImagePromotePathParams; query?: ImagePromoteQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<Image>({
        path: `/v1/images/${path.image}/promote`,
        method: 'POST',
        query,
        ...params,
      })
    },
    /**
     * List instances
     */
    instanceList: (
      { query = {} }: { query?: InstanceListQueryParams },
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
    instanceCreate: (
      { query = {}, body }: { query?: InstanceCreateQueryParams; body: InstanceCreate },
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
    instanceView: (
      {
        path,
        query = {},
      }: { path: InstanceViewPathParams; query?: InstanceViewQueryParams },
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
    instanceDelete: (
      {
        path,
        query = {},
      }: { path: InstanceDeletePathParams; query?: InstanceDeleteQueryParams },
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
    instanceDiskList: (
      {
        path,
        query = {},
      }: { path: InstanceDiskListPathParams; query?: InstanceDiskListQueryParams },
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
    instanceDiskAttach: (
      {
        path,
        query = {},
        body,
      }: {
        path: InstanceDiskAttachPathParams
        query?: InstanceDiskAttachQueryParams
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
    instanceDiskDetach: (
      {
        path,
        query = {},
        body,
      }: {
        path: InstanceDiskDetachPathParams
        query?: InstanceDiskDetachQueryParams
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
     * List external IP addresses
     */
    instanceExternalIpList: (
      {
        path,
        query = {},
      }: {
        path: InstanceExternalIpListPathParams
        query?: InstanceExternalIpListQueryParams
      },
      params: RequestParams = {}
    ) => {
      return this.request<ExternalIpResultsPage>({
        path: `/v1/instances/${path.instance}/external-ips`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Migrate an instance
     */
    instanceMigrate: (
      {
        path,
        query = {},
        body,
      }: {
        path: InstanceMigratePathParams
        query?: InstanceMigrateQueryParams
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
    instanceReboot: (
      {
        path,
        query = {},
      }: { path: InstanceRebootPathParams; query?: InstanceRebootQueryParams },
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
        path: `/v1/instances/${path.instance}/serial-console`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Boot an instance
     */
    instanceStart: (
      {
        path,
        query = {},
      }: { path: InstanceStartPathParams; query?: InstanceStartQueryParams },
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
    instanceStop: (
      {
        path,
        query = {},
      }: { path: InstanceStopPathParams; query?: InstanceStopQueryParams },
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
     * Authenticate a user via username and password
     */
    loginLocal: (
      { path, body }: { path: LoginLocalPathParams; body: UsernamePasswordCredentials },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/login/${path.siloName}/local`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Log user out of web console by deleting session on client and server
     */
    logout: (_: EmptyObj, params: RequestParams = {}) => {
      return this.request<void>({
        path: `/v1/logout`,
        method: 'POST',
        ...params,
      })
    },
    /**
     * Fetch the user associated with the current session
     */
    currentUserView: (_: EmptyObj, params: RequestParams = {}) => {
      return this.request<CurrentUser>({
        path: `/v1/me`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Fetch the silo groups the current user belongs to
     */
    currentUserGroups: (
      { query = {} }: { query?: CurrentUserGroupsQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<GroupResultsPage>({
        path: `/v1/me/groups`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * List SSH public keys
     */
    currentUserSshKeyList: (
      { query = {} }: { query?: CurrentUserSshKeyListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<SshKeyResultsPage>({
        path: `/v1/me/ssh-keys`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create an SSH public key
     */
    currentUserSshKeyCreate: (
      { body }: { body: SshKeyCreate },
      params: RequestParams = {}
    ) => {
      return this.request<SshKey>({
        path: `/v1/me/ssh-keys`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Fetch an SSH public key
     */
    currentUserSshKeyView: (
      { path }: { path: CurrentUserSshKeyViewPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<SshKey>({
        path: `/v1/me/ssh-keys/${path.sshKey}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Delete an SSH public key
     */
    currentUserSshKeyDelete: (
      { path }: { path: CurrentUserSshKeyDeletePathParams },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/me/ssh-keys/${path.sshKey}`,
        method: 'DELETE',
        ...params,
      })
    },
    /**
     * List network interfaces
     */
    instanceNetworkInterfaceList: (
      { query = {} }: { query?: InstanceNetworkInterfaceListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<InstanceNetworkInterfaceResultsPage>({
        path: `/v1/network-interfaces`,
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
        query = {},
        body,
      }: {
        query?: InstanceNetworkInterfaceCreateQueryParams
        body: InstanceNetworkInterfaceCreate
      },
      params: RequestParams = {}
    ) => {
      return this.request<InstanceNetworkInterface>({
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
    instanceNetworkInterfaceView: (
      {
        path,
        query = {},
      }: {
        path: InstanceNetworkInterfaceViewPathParams
        query?: InstanceNetworkInterfaceViewQueryParams
      },
      params: RequestParams = {}
    ) => {
      return this.request<InstanceNetworkInterface>({
        path: `/v1/network-interfaces/${path.interface}`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Update a network interface
     */
    instanceNetworkInterfaceUpdate: (
      {
        path,
        query = {},
        body,
      }: {
        path: InstanceNetworkInterfaceUpdatePathParams
        query?: InstanceNetworkInterfaceUpdateQueryParams
        body: InstanceNetworkInterfaceUpdate
      },
      params: RequestParams = {}
    ) => {
      return this.request<InstanceNetworkInterface>({
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
    instanceNetworkInterfaceDelete: (
      {
        path,
        query = {},
      }: {
        path: InstanceNetworkInterfaceDeletePathParams
        query?: InstanceNetworkInterfaceDeleteQueryParams
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
     * Fetch the current silo's IAM policy
     */
    policyView: (_: EmptyObj, params: RequestParams = {}) => {
      return this.request<SiloRolePolicy>({
        path: `/v1/policy`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Update the current silo's IAM policy
     */
    policyUpdate: ({ body }: { body: SiloRolePolicy }, params: RequestParams = {}) => {
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
    projectList: (
      { query = {} }: { query?: ProjectListQueryParams },
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
    projectCreate: ({ body }: { body: ProjectCreate }, params: RequestParams = {}) => {
      return this.request<Project>({
        path: `/v1/projects`,
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
        path: `/v1/projects/${path.project}`,
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
        path: `/v1/projects/${path.project}`,
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
        path: `/v1/projects/${path.project}`,
        method: 'DELETE',
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
        path: `/v1/projects/${path.project}/policy`,
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
        path: `/v1/projects/${path.project}/policy`,
        method: 'PUT',
        body,
        ...params,
      })
    },
    /**
     * List snapshots
     */
    snapshotList: (
      { query = {} }: { query?: SnapshotListQueryParams },
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
    snapshotCreate: (
      { query = {}, body }: { query?: SnapshotCreateQueryParams; body: SnapshotCreate },
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
    snapshotView: (
      {
        path,
        query = {},
      }: { path: SnapshotViewPathParams; query?: SnapshotViewQueryParams },
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
    snapshotDelete: (
      {
        path,
        query = {},
      }: { path: SnapshotDeletePathParams; query?: SnapshotDeleteQueryParams },
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
     * List physical disks
     */
    physicalDiskList: (
      { query = {} }: { query?: PhysicalDiskListQueryParams },
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
    rackList: (
      { query = {} }: { query?: RackListQueryParams },
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
    rackView: ({ path }: { path: RackViewPathParams }, params: RequestParams = {}) => {
      return this.request<Rack>({
        path: `/v1/system/hardware/racks/${path.rackId}`,
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
        path: `/v1/system/hardware/sleds`,
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
        path: `/v1/system/hardware/sleds/${path.sledId}`,
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
        path: `/v1/system/hardware/sleds/${path.sledId}/disks`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * List instances running on a given sled
     */
    sledInstanceList: (
      {
        path,
        query = {},
      }: { path: SledInstanceListPathParams; query?: SledInstanceListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<SledInstanceResultsPage>({
        path: `/v1/system/hardware/sleds/${path.sledId}/instances`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * List switch ports
     */
    networkingSwitchPortList: (
      { query = {} }: { query?: NetworkingSwitchPortListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<SwitchPortResultsPage>({
        path: `/v1/system/hardware/switch-port`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Apply switch port settings
     */
    networkingSwitchPortApplySettings: (
      {
        path,
        query = {},
        body,
      }: {
        path: NetworkingSwitchPortApplySettingsPathParams
        query?: NetworkingSwitchPortApplySettingsQueryParams
        body: SwitchPortApplySettings
      },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/system/hardware/switch-port/${path.port}/settings`,
        method: 'POST',
        body,
        query,
        ...params,
      })
    },
    /**
     * Clear switch port settings
     */
    networkingSwitchPortClearSettings: (
      {
        path,
        query = {},
      }: {
        path: NetworkingSwitchPortClearSettingsPathParams
        query?: NetworkingSwitchPortClearSettingsQueryParams
      },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/system/hardware/switch-port/${path.port}/settings`,
        method: 'DELETE',
        query,
        ...params,
      })
    },
    /**
     * List switches
     */
    switchList: (
      { query = {} }: { query?: SwitchListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<SwitchResultsPage>({
        path: `/v1/system/hardware/switches`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Fetch a switch
     */
    switchView: ({ path }: { path: SwitchViewPathParams }, params: RequestParams = {}) => {
      return this.request<Switch>({
        path: `/v1/system/hardware/switches/${path.switchId}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * List a silo's IdP's name
     */
    siloIdentityProviderList: (
      { query = {} }: { query?: SiloIdentityProviderListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<IdentityProviderResultsPage>({
        path: `/v1/system/identity-providers`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create a user
     */
    localIdpUserCreate: (
      { query = {}, body }: { query?: LocalIdpUserCreateQueryParams; body: UserCreate },
      params: RequestParams = {}
    ) => {
      return this.request<User>({
        path: `/v1/system/identity-providers/local/users`,
        method: 'POST',
        body,
        query,
        ...params,
      })
    },
    /**
     * Delete a user
     */
    localIdpUserDelete: (
      {
        path,
        query = {},
      }: { path: LocalIdpUserDeletePathParams; query?: LocalIdpUserDeleteQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/system/identity-providers/local/users/${path.userId}`,
        method: 'DELETE',
        query,
        ...params,
      })
    },
    /**
     * Set or invalidate a user's password
     */
    localIdpUserSetPassword: (
      {
        path,
        query = {},
        body,
      }: {
        path: LocalIdpUserSetPasswordPathParams
        query?: LocalIdpUserSetPasswordQueryParams
        body: UserPassword
      },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/system/identity-providers/local/users/${path.userId}/set-password`,
        method: 'POST',
        body,
        query,
        ...params,
      })
    },
    /**
     * Create a SAML IdP
     */
    samlIdentityProviderCreate: (
      {
        query = {},
        body,
      }: {
        query?: SamlIdentityProviderCreateQueryParams
        body: SamlIdentityProviderCreate
      },
      params: RequestParams = {}
    ) => {
      return this.request<SamlIdentityProvider>({
        path: `/v1/system/identity-providers/saml`,
        method: 'POST',
        body,
        query,
        ...params,
      })
    },
    /**
     * Fetch a SAML IdP
     */
    samlIdentityProviderView: (
      {
        path,
        query = {},
      }: {
        path: SamlIdentityProviderViewPathParams
        query?: SamlIdentityProviderViewQueryParams
      },
      params: RequestParams = {}
    ) => {
      return this.request<SamlIdentityProvider>({
        path: `/v1/system/identity-providers/saml/${path.provider}`,
        method: 'GET',
        query,
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
        path: `/v1/system/ip-pools`,
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
        path: `/v1/system/ip-pools`,
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
        path: `/v1/system/ip-pools/${path.pool}`,
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
        path: `/v1/system/ip-pools/${path.pool}`,
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
        path: `/v1/system/ip-pools/${path.pool}`,
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
        path: `/v1/system/ip-pools/${path.pool}/ranges`,
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
        path: `/v1/system/ip-pools/${path.pool}/ranges/add`,
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
        path: `/v1/system/ip-pools/${path.pool}/ranges/remove`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Fetch the IP pool used for Oxide services
     */
    ipPoolServiceView: (_: EmptyObj, params: RequestParams = {}) => {
      return this.request<IpPool>({
        path: `/v1/system/ip-pools-service`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * List ranges for the IP pool used for Oxide services
     */
    ipPoolServiceRangeList: (
      { query = {} }: { query?: IpPoolServiceRangeListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<IpPoolRangeResultsPage>({
        path: `/v1/system/ip-pools-service/ranges`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Add a range to an IP pool used for Oxide services
     */
    ipPoolServiceRangeAdd: ({ body }: { body: IpRange }, params: RequestParams = {}) => {
      return this.request<IpPoolRange>({
        path: `/v1/system/ip-pools-service/ranges/add`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Remove a range from an IP pool used for Oxide services
     */
    ipPoolServiceRangeRemove: ({ body }: { body: IpRange }, params: RequestParams = {}) => {
      return this.request<void>({
        path: `/v1/system/ip-pools-service/ranges/remove`,
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
        path: `/v1/system/metrics/${path.metricName}`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * List address lots
     */
    networkingAddressLotList: (
      { query = {} }: { query?: NetworkingAddressLotListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<AddressLotResultsPage>({
        path: `/v1/system/networking/address-lot`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create an address lot
     */
    networkingAddressLotCreate: (
      { body }: { body: AddressLotCreate },
      params: RequestParams = {}
    ) => {
      return this.request<AddressLotCreateResponse>({
        path: `/v1/system/networking/address-lot`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Delete an address lot
     */
    networkingAddressLotDelete: (
      { path }: { path: NetworkingAddressLotDeletePathParams },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/system/networking/address-lot/${path.addressLot}`,
        method: 'DELETE',
        ...params,
      })
    },
    /**
     * List the blocks in an address lot
     */
    networkingAddressLotBlockList: (
      {
        path,
        query = {},
      }: {
        path: NetworkingAddressLotBlockListPathParams
        query?: NetworkingAddressLotBlockListQueryParams
      },
      params: RequestParams = {}
    ) => {
      return this.request<AddressLotBlockResultsPage>({
        path: `/v1/system/networking/address-lot/${path.addressLot}/blocks`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Get loopback addresses, optionally filtering by id
     */
    networkingLoopbackAddressList: (
      { query = {} }: { query?: NetworkingLoopbackAddressListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<LoopbackAddressResultsPage>({
        path: `/v1/system/networking/loopback-address`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create a loopback address
     */
    networkingLoopbackAddressCreate: (
      { body }: { body: LoopbackAddressCreate },
      params: RequestParams = {}
    ) => {
      return this.request<LoopbackAddress>({
        path: `/v1/system/networking/loopback-address`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Delete a loopback address
     */
    networkingLoopbackAddressDelete: (
      { path }: { path: NetworkingLoopbackAddressDeletePathParams },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/system/networking/loopback-address/${path.rackId}/${path.switchLocation}/${path.address}/${path.subnetMask}`,
        method: 'DELETE',
        ...params,
      })
    },
    /**
     * List switch port settings
     */
    networkingSwitchPortSettingsList: (
      { query = {} }: { query?: NetworkingSwitchPortSettingsListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<SwitchPortSettingsResultsPage>({
        path: `/v1/system/networking/switch-port-settings`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create switch port settings
     */
    networkingSwitchPortSettingsCreate: (
      { body }: { body: SwitchPortSettingsCreate },
      params: RequestParams = {}
    ) => {
      return this.request<SwitchPortSettingsView>({
        path: `/v1/system/networking/switch-port-settings`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Delete switch port settings
     */
    networkingSwitchPortSettingsDelete: (
      { query = {} }: { query?: NetworkingSwitchPortSettingsDeleteQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/system/networking/switch-port-settings`,
        method: 'DELETE',
        query,
        ...params,
      })
    },
    /**
     * Get information about a switch port
     */
    networkingSwitchPortSettingsView: (
      { path }: { path: NetworkingSwitchPortSettingsViewPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<SwitchPortSettingsView>({
        path: `/v1/system/networking/switch-port-settings/${path.port}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Fetch the top-level IAM policy
     */
    systemPolicyView: (_: EmptyObj, params: RequestParams = {}) => {
      return this.request<FleetRolePolicy>({
        path: `/v1/system/policy`,
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
        path: `/v1/system/policy`,
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
        path: `/v1/system/roles`,
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
        path: `/v1/system/roles/${path.roleName}`,
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
        path: `/v1/system/silos`,
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
        path: `/v1/system/silos`,
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
        path: `/v1/system/silos/${path.silo}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Delete a silo
     */
    siloDelete: ({ path }: { path: SiloDeletePathParams }, params: RequestParams = {}) => {
      return this.request<void>({
        path: `/v1/system/silos/${path.silo}`,
        method: 'DELETE',
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
        path: `/v1/system/silos/${path.silo}/policy`,
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
        path: `/v1/system/silos/${path.silo}/policy`,
        method: 'PUT',
        body,
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
     * List users in a silo
     */
    siloUserList: (
      { query = {} }: { query?: SiloUserListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<UserResultsPage>({
        path: `/v1/system/users`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Fetch a user
     */
    siloUserView: (
      {
        path,
        query = {},
      }: { path: SiloUserViewPathParams; query?: SiloUserViewQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<User>({
        path: `/v1/system/users/${path.userId}`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * List built-in users
     */
    userBuiltinList: (
      { query = {} }: { query?: UserBuiltinListQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<UserBuiltinResultsPage>({
        path: `/v1/system/users-builtin`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Fetch a built-in user
     */
    userBuiltinView: (
      { path }: { path: UserBuiltinViewPathParams },
      params: RequestParams = {}
    ) => {
      return this.request<UserBuiltin>({
        path: `/v1/system/users-builtin/${path.user}`,
        method: 'GET',
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
        path: `/v1/users`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * List firewall rules
     */
    vpcFirewallRulesView: (
      { query = {} }: { query?: VpcFirewallRulesViewQueryParams },
      params: RequestParams = {}
    ) => {
      return this.request<VpcFirewallRules>({
        path: `/v1/vpc-firewall-rules`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Replace firewall rules
     */
    vpcFirewallRulesUpdate: (
      {
        query = {},
        body,
      }: { query?: VpcFirewallRulesUpdateQueryParams; body: VpcFirewallRuleUpdateParams },
      params: RequestParams = {}
    ) => {
      return this.request<VpcFirewallRules>({
        path: `/v1/vpc-firewall-rules`,
        method: 'PUT',
        body,
        query,
        ...params,
      })
    },
    /**
     * List routes
     */
    vpcRouterRouteList: (
      { query = {} }: { query?: VpcRouterRouteListQueryParams },
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
    vpcRouterRouteCreate: (
      {
        query = {},
        body,
      }: { query?: VpcRouterRouteCreateQueryParams; body: RouterRouteCreate },
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
    vpcRouterRouteView: (
      {
        path,
        query = {},
      }: { path: VpcRouterRouteViewPathParams; query?: VpcRouterRouteViewQueryParams },
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
    vpcRouterRouteUpdate: (
      {
        path,
        query = {},
        body,
      }: {
        path: VpcRouterRouteUpdatePathParams
        query?: VpcRouterRouteUpdateQueryParams
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
    vpcRouterRouteDelete: (
      {
        path,
        query = {},
      }: { path: VpcRouterRouteDeletePathParams; query?: VpcRouterRouteDeleteQueryParams },
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
    vpcRouterList: (
      { query = {} }: { query?: VpcRouterListQueryParams },
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
    vpcRouterCreate: (
      { query = {}, body }: { query?: VpcRouterCreateQueryParams; body: VpcRouterCreate },
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
     * Fetch a router
     */
    vpcRouterView: (
      {
        path,
        query = {},
      }: { path: VpcRouterViewPathParams; query?: VpcRouterViewQueryParams },
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
    vpcRouterUpdate: (
      {
        path,
        query = {},
        body,
      }: {
        path: VpcRouterUpdatePathParams
        query?: VpcRouterUpdateQueryParams
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
    vpcRouterDelete: (
      {
        path,
        query = {},
      }: { path: VpcRouterDeletePathParams; query?: VpcRouterDeleteQueryParams },
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
     * List subnets
     */
    vpcSubnetList: (
      { query = {} }: { query?: VpcSubnetListQueryParams },
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
    vpcSubnetCreate: (
      { query = {}, body }: { query?: VpcSubnetCreateQueryParams; body: VpcSubnetCreate },
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
    vpcSubnetView: (
      {
        path,
        query = {},
      }: { path: VpcSubnetViewPathParams; query?: VpcSubnetViewQueryParams },
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
    vpcSubnetUpdate: (
      {
        path,
        query = {},
        body,
      }: {
        path: VpcSubnetUpdatePathParams
        query?: VpcSubnetUpdateQueryParams
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
    vpcSubnetDelete: (
      {
        path,
        query = {},
      }: { path: VpcSubnetDeletePathParams; query?: VpcSubnetDeleteQueryParams },
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
      return this.request<InstanceNetworkInterfaceResultsPage>({
        path: `/v1/vpc-subnets/${path.subnet}/network-interfaces`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * List VPCs
     */
    vpcList: (
      { query = {} }: { query?: VpcListQueryParams },
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
    vpcCreate: (
      { query = {}, body }: { query?: VpcCreateQueryParams; body: VpcCreate },
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
    vpcView: (
      { path, query = {} }: { path: VpcViewPathParams; query?: VpcViewQueryParams },
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
    vpcUpdate: (
      {
        path,
        query = {},
        body,
      }: { path: VpcUpdatePathParams; query?: VpcUpdateQueryParams; body: VpcUpdate },
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
    vpcDelete: (
      { path, query = {} }: { path: VpcDeletePathParams; query?: VpcDeleteQueryParams },
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
  ws = {
    /**
     * Stream an instance's serial console
     */
    instanceSerialConsoleStream: ({
      host,
      secure = true,
      path,
      query = {},
    }: {
      host: string
      secure?: boolean
      path: InstanceSerialConsoleStreamPathParams
      query?: InstanceSerialConsoleStreamQueryParams
    }) => {
      const protocol = secure ? 'wss:' : 'ws:'
      const route = `/v1/instances/${path.instance}/serial-console/stream`
      return new WebSocket(protocol + '//' + host + route + toQueryString(query))
    },
  }
}
