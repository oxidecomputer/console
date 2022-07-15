/* eslint-disable */

export type BlockSize = number

/**
 * A count of bytes, typically used either for memory or storage capacity
 *
 * The maximum supported byte count is `i64::MAX`.  This makes it somewhat inconvenient to define constructors: a u32 constructor can be infallible, but an i64 constructor can fail (if the value is negative) and a u64 constructor can fail (if the value is larger than i64::MAX).  We provide all of these for consumers' convenience.
 */
export type ByteCount = number

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
  /**
   * request signing private key (base64 encoded der file)
   */
  privateKey: string
  /**
   * request signing public certificate (base64 encoded der file)
   */
  publicCert: string
}

export type DeviceAccessTokenRequest = {
  clientId: string
  deviceCode: string
  grantType: string
}

export type DeviceAuthRequest = {
  clientId: string
}

export type DeviceAuthVerify = {
  userCode: string
}

export type Digest = { type: 'sha256'; value: string }

/**
 * Client view of a {@link Disk}
 */
export type Disk = {
  blockSize: ByteCount
  /**
   * human-readable free-form text about a resource
   */
  description: string
  devicePath: string
  /**
   * unique, immutable, system-controlled identifier for each resource
   */
  id: string
  imageId?: string | null
  /**
   * unique, mutable, user-controlled identifier for each resource
   */
  name: Name
  projectId: string
  size: ByteCount
  snapshotId?: string | null
  state: DiskState
  /**
   * timestamp when this resource was created
   */
  timeCreated: Date
  /**
   * timestamp when this resource was last modified
   */
  timeModified: Date
}

/**
 * Create-time parameters for a {@link Disk}
 */
export type DiskCreate = {
  description: string
  /**
   * initial source for this disk
   */
  diskSource: DiskSource
  name: Name
  /**
   * total size of the Disk in bytes
   */
  size: ByteCount
}

/**
 * Parameters for the {@link Disk} to be attached or detached to an instance
 */
export type DiskIdentifier = {
  name: Name
}

/**
 * A single page of results
 */
export type DiskResultsPage = {
  /**
   * list of items on this page of results
   */
  items: Disk[]
  /**
   * token used to fetch the next page of results (if any)
   */
  nextPage?: string | null
}

/**
 * Different sources for a disk
 */
export type DiskSource =
  | {
      /**
       * size of blocks for this Disk. valid values are: 512, 2048, or 4096
       */
      blockSize: BlockSize
      type: 'blank'
    }
  | { snapshotId: string; type: 'snapshot' }
  | { imageId: string; type: 'image' }
  | { imageId: string; type: 'global_image' }

/**
 * State of a Disk (primarily: attached or not)
 */
export type DiskState =
  | { state: 'creating' }
  | { state: 'detached' }
  | { instance: string; state: 'attaching' }
  | { instance: string; state: 'attached' }
  | { instance: string; state: 'detaching' }
  | { state: 'destroyed' }
  | { state: 'faulted' }

/**
 * OS image distribution
 */
export type Distribution = {
  /**
   * The name of the distribution (e.g. "alpine" or "ubuntu")
   */
  name: Name
  /**
   * The version of the distribution (e.g. "3.10" or "18.04")
   */
  version: string
}

/**
 * Error information from a response.
 */
export type Error = {
  errorCode?: string | null
  message: string
  requestId: string
}

/**
 * The name and type information for a field of a timeseries schema.
 */
export type FieldSchema = {
  name: string
  source: FieldSource
  ty: FieldType
}

/**
 * The source from which a field is derived, the target or metric.
 */
export type FieldSource = 'target' | 'metric'

/**
 * The `FieldType` identifies the data type of a target or metric field.
 */
export type FieldType = 'string' | 'i64' | 'ip_addr' | 'uuid' | 'bool'

export type FleetRole = 'admin' | 'collaborator' | 'viewer'

/**
 * Client view of a `Policy`, which describes how this resource may be accessed
 *
 * Note that the Policy only describes access granted explicitly for this resource.  The policies of parent resources can also cause a user to have access to this resource.
 */
export type FleetRolePolicy = {
  /**
   * Roles directly assigned on this resource
   */
  roleAssignments: FleetRoleRoleAssignment[]
}

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
 * Client view of global Images
 */
export type GlobalImage = {
  /**
   * size of blocks in bytes
   */
  blockSize: ByteCount
  /**
   * human-readable free-form text about a resource
   */
  description: string
  /**
   * Hash of the image contents, if applicable
   */
  digest?: Digest | null
  /**
   * Image distribution
   */
  distribution: string
  /**
   * unique, immutable, system-controlled identifier for each resource
   */
  id: string
  /**
   * unique, mutable, user-controlled identifier for each resource
   */
  name: Name
  /**
   * total size in bytes
   */
  size: ByteCount
  /**
   * timestamp when this resource was created
   */
  timeCreated: Date
  /**
   * timestamp when this resource was last modified
   */
  timeModified: Date
  /**
   * URL source of this image, if any
   */
  url?: string | null
  /**
   * Image version
   */
  version: string
}

/**
 * Create-time parameters for an {@link GlobalImage}
 */
export type GlobalImageCreate = {
  /**
   * block size in bytes
   */
  blockSize: BlockSize
  description: string
  /**
   * OS image distribution
   */
  distribution: Distribution
  name: Name
  /**
   * The source of the image's contents.
   */
  source: ImageSource
}

/**
 * A single page of results
 */
export type GlobalImageResultsPage = {
  /**
   * list of items on this page of results
   */
  items: GlobalImage[]
  /**
   * token used to fetch the next page of results (if any)
   */
  nextPage?: string | null
}

/**
 * Client view of an {@link IdentityProvider}
 */
export type IdentityProvider = {
  /**
   * human-readable free-form text about a resource
   */
  description: string
  /**
   * unique, immutable, system-controlled identifier for each resource
   */
  id: string
  /**
   * unique, mutable, user-controlled identifier for each resource
   */
  name: Name
  /**
   * Identity provider type
   */
  providerType: IdentityProviderType
  /**
   * timestamp when this resource was created
   */
  timeCreated: Date
  /**
   * timestamp when this resource was last modified
   */
  timeModified: Date
}

/**
 * A single page of results
 */
export type IdentityProviderResultsPage = {
  /**
   * list of items on this page of results
   */
  items: IdentityProvider[]
  /**
   * token used to fetch the next page of results (if any)
   */
  nextPage?: string | null
}

export type IdentityProviderType = 'saml'

/**
 * Describes what kind of identity is described by an id
 */
export type IdentityType = 'silo_user'

export type IdpMetadataSource =
  | { type: 'url'; url: string }
  | { data: string; type: 'base64_encoded_xml' }

/**
 * Client view of project Images
 */
export type Image = {
  /**
   * size of blocks in bytes
   */
  blockSize: ByteCount
  /**
   * human-readable free-form text about a resource
   */
  description: string
  /**
   * Hash of the image contents, if applicable
   */
  digest?: Digest | null
  /**
   * unique, immutable, system-controlled identifier for each resource
   */
  id: string
  /**
   * unique, mutable, user-controlled identifier for each resource
   */
  name: Name
  /**
   * The project the disk belongs to
   */
  projectId: string
  /**
   * total size in bytes
   */
  size: ByteCount
  /**
   * timestamp when this resource was created
   */
  timeCreated: Date
  /**
   * timestamp when this resource was last modified
   */
  timeModified: Date
  /**
   * URL source of this image, if any
   */
  url?: string | null
  /**
   * Version of this, if any
   */
  version?: string | null
}

/**
 * Create-time parameters for an {@link Image}
 */
export type ImageCreate = {
  /**
   * block size in bytes
   */
  blockSize: BlockSize
  description: string
  name: Name
  /**
   * The source of the image's contents.
   */
  source: ImageSource
}

/**
 * A single page of results
 */
export type ImageResultsPage = {
  /**
   * list of items on this page of results
   */
  items: Image[]
  /**
   * token used to fetch the next page of results (if any)
   */
  nextPage?: string | null
}

/**
 * The source of the underlying image.
 */
export type ImageSource =
  | { type: 'url'; url: string }
  | { id: string; type: 'snapshot' }
  | { type: 'you_can_boot_anything_as_long_as_its_alpine' }

/**
 * Client view of an {@link Instance}
 */
export type Instance = {
  /**
   * human-readable free-form text about a resource
   */
  description: string
  /**
   * RFC1035-compliant hostname for the Instance.
   */
  hostname: string
  /**
   * unique, immutable, system-controlled identifier for each resource
   */
  id: string
  /**
   * memory allocated for this Instance
   */
  memory: ByteCount
  /**
   * unique, mutable, user-controlled identifier for each resource
   */
  name: Name
  /**
   * number of CPUs allocated for this Instance
   */
  ncpus: InstanceCpuCount
  /**
   * id for the project containing this Instance
   */
  projectId: string
  runState: InstanceState
  /**
   * timestamp when this resource was created
   */
  timeCreated: Date
  /**
   * timestamp when this resource was last modified
   */
  timeModified: Date
  timeRunStateUpdated: Date
}

/**
 * The number of CPUs in an Instance
 */
export type InstanceCpuCount = number

/**
 * Create-time parameters for an {@link Instance}
 */
export type InstanceCreate = {
  description: string
  /**
   * The disks to be created or attached for this instance.
   */
  disks?: InstanceDiskAttachment[] | null
  hostname: string
  memory: ByteCount
  name: Name
  ncpus: InstanceCpuCount
  /**
   * The network interfaces to be created for this instance.
   */
  networkInterfaces?: InstanceNetworkInterfaceAttachment | null
  /**
   * User data for instance initialization systems (such as cloud-init). Must be a Base64-encoded string, as specified in RFC 4648 § 4 (+ and / characters with padding). Maximum 32 KiB unencoded data.
   */
  userData?: string | null
}

/**
 * Describe the instance's disks at creation time
 */
export type InstanceDiskAttachment =
  | {
      description: string
      /**
       * initial source for this disk
       */
      diskSource: DiskSource
      name: Name
      /**
       * total size of the Disk in bytes
       */
      size: ByteCount
      type: 'create'
    }
  | {
      /**
       * A disk name to attach
       */
      name: Name
      type: 'attach'
    }

/**
 * Migration parameters for an {@link Instance}
 */
export type InstanceMigrate = {
  dstSledId: string
}

/**
 * Describes an attachment of a `NetworkInterface` to an `Instance`, at the time the instance is created.
 */
export type InstanceNetworkInterfaceAttachment =
  | { params: NetworkInterfaceCreate[]; type: 'create' }
  | { type: 'default' }
  | { type: 'none' }

/**
 * A single page of results
 */
export type InstanceResultsPage = {
  /**
   * list of items on this page of results
   */
  items: Instance[]
  /**
   * token used to fetch the next page of results (if any)
   */
  nextPage?: string | null
}

/**
 * Contents of an Instance's serial console buffer.
 */
export type InstanceSerialConsoleData = {
  /**
   * The bytes starting from the requested offset up to either the end of the buffer or the request's `max_bytes`. Provided as a u8 array rather than a string, as it may not be UTF-8.
   */
  data: number[]
  /**
   * The absolute offset since boot (suitable for use as `byte_offset` in a subsequent request) of the last byte returned in `data`.
   */
  lastByteOffset: number
}

/**
 * Running state of an Instance (primarily: booted or stopped)
 *
 * This typically reflects whether it's starting, running, stopping, or stopped, but also includes states related to the Instance's lifecycle
 */
export type InstanceState =
  | 'creating'
  | 'starting'
  | 'running'
  | 'stopping'
  | 'stopped'
  | 'rebooting'
  | 'migrating'
  | 'repairing'
  | 'failed'
  | 'destroyed'

export type IpNet = Ipv4Net | Ipv6Net

/**
 * Identity-related metadata that's included in nearly all public API objects
 */
export type IpPool = {
  /**
   * human-readable free-form text about a resource
   */
  description: string
  /**
   * unique, immutable, system-controlled identifier for each resource
   */
  id: string
  /**
   * unique, mutable, user-controlled identifier for each resource
   */
  name: Name
  /**
   * timestamp when this resource was created
   */
  timeCreated: Date
  /**
   * timestamp when this resource was last modified
   */
  timeModified: Date
}

/**
 * Create-time parameters for an IP Pool.
 *
 * See {@link IpPool}
 */
export type IpPoolCreate = {
  description: string
  name: Name
}

export type IpPoolRange = {
  id: string
  range: IpRange
  timeCreated: Date
}

/**
 * A single page of results
 */
export type IpPoolRangeResultsPage = {
  /**
   * list of items on this page of results
   */
  items: IpPoolRange[]
  /**
   * token used to fetch the next page of results (if any)
   */
  nextPage?: string | null
}

/**
 * A single page of results
 */
export type IpPoolResultsPage = {
  /**
   * list of items on this page of results
   */
  items: IpPool[]
  /**
   * token used to fetch the next page of results (if any)
   */
  nextPage?: string | null
}

/**
 * Parameters for updating an IP Pool
 */
export type IpPoolUpdate = {
  description?: string | null
  name?: Name | null
}

export type IpRange = Ipv4Range | Ipv6Range

/**
 * An IPv4 subnet, including prefix and subnet mask
 */
export type Ipv4Net = string

/** Regex pattern for validating Ipv4Net */
export const ipv4NetPattern =
  '^(10.([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]).([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]).([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])/([8-9]|1[0-9]|2[0-9]|3[0-2])|172.(1[6-9]|2[0-9]|3[0-1]).([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]).([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])/(1[2-9]|2[0-9]|3[0-2])|192.168.([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]).([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])/(1[6-9]|2[0-9]|3[0-2]))$'

/**
 * A non-decreasing IPv4 address range, inclusive of both ends.
 *
 * The first address must be less than or equal to the last address.
 */
export type Ipv4Range = {
  first: string
  last: string
}

/**
 * An IPv6 subnet, including prefix and subnet mask
 */
export type Ipv6Net = string

/** Regex pattern for validating Ipv6Net */
export const ipv6NetPattern =
  '^([fF][dD])[0-9a-fA-F]{2}:(([0-9a-fA-F]{1,4}:){6}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,6}:)/(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-6])$'

/**
 * A non-decreasing IPv6 address range, inclusive of both ends.
 *
 * The first address must be less than or equal to the last address.
 */
export type Ipv6Range = {
  first: string
  last: string
}

/**
 * An inclusive-inclusive range of IP ports. The second port may be omitted to represent a single port
 */
export type L4PortRange = string

/** Regex pattern for validating L4PortRange */
export const l4PortRangePattern = '^[0-9]{1,5}(-[0-9]{1,5})?$'

/**
 * A Media Access Control address, in EUI-48 format
 */
export type MacAddr = string

/** Regex pattern for validating MacAddr */
export const macAddrPattern = '^([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$'

/**
 * Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'.
 */
export type Name = string

/** Regex pattern for validating Name */
export const namePattern = '^[a-z](|[a-zA-Z0-9-]*[a-zA-Z0-9])$'

/**
 * A `NetworkInterface` represents a virtual network interface device.
 */
export type NetworkInterface = {
  /**
   * human-readable free-form text about a resource
   */
  description: string
  /**
   * unique, immutable, system-controlled identifier for each resource
   */
  id: string
  /**
   * The Instance to which the interface belongs.
   */
  instanceId: string
  /**
   * The IP address assigned to this interface.
   */
  ip: string
  /**
   * The MAC address assigned to this interface.
   */
  mac: MacAddr
  /**
   * unique, mutable, user-controlled identifier for each resource
   */
  name: Name
  /**
   * True if this interface is the primary for the instance to which it's attached.
   */
  primary: boolean
  /**
   * The subnet to which the interface belongs.
   */
  subnetId: string
  /**
   * timestamp when this resource was created
   */
  timeCreated: Date
  /**
   * timestamp when this resource was last modified
   */
  timeModified: Date
  /**
   * The VPC to which the interface belongs.
   */
  vpcId: string
}

/**
 * Create-time parameters for a {@link NetworkInterface}
 */
export type NetworkInterfaceCreate = {
  description: string
  /**
   * The IP address for the interface. One will be auto-assigned if not provided.
   */
  ip?: string | null
  name: Name
  /**
   * The VPC Subnet in which to create the interface.
   */
  subnetName: Name
  /**
   * The VPC in which to create the interface.
   */
  vpcName: Name
}

/**
 * A single page of results
 */
export type NetworkInterfaceResultsPage = {
  /**
   * list of items on this page of results
   */
  items: NetworkInterface[]
  /**
   * token used to fetch the next page of results (if any)
   */
  nextPage?: string | null
}

/**
 * Parameters for updating a {@link NetworkInterface}.
 *
 * Note that modifying IP addresses for an interface is not yet supported, a new interface must be created instead.
 */
export type NetworkInterfaceUpdate = {
  description?: string | null
  /**
   * Make a secondary interface the instance's primary interface.
   *
   * If applied to a secondary interface, that interface will become the primary on the next reboot of the instance. Note that this may have implications for routing between instances, as the new primary interface will be on a distinct subnet from the previous primary interface.
   *
   * Note that this can only be used to select a new primary interface for an instance. Requests to change the primary interface into a secondary will return an error.
   */
  makePrimary?: boolean | null
  name?: Name | null
}

/**
 * Client view of an {@link Organization}
 */
export type Organization = {
  /**
   * human-readable free-form text about a resource
   */
  description: string
  /**
   * unique, immutable, system-controlled identifier for each resource
   */
  id: string
  /**
   * unique, mutable, user-controlled identifier for each resource
   */
  name: Name
  /**
   * timestamp when this resource was created
   */
  timeCreated: Date
  /**
   * timestamp when this resource was last modified
   */
  timeModified: Date
}

/**
 * Create-time parameters for an {@link Organization}
 */
export type OrganizationCreate = {
  description: string
  name: Name
}

/**
 * A single page of results
 */
export type OrganizationResultsPage = {
  /**
   * list of items on this page of results
   */
  items: Organization[]
  /**
   * token used to fetch the next page of results (if any)
   */
  nextPage?: string | null
}

export type OrganizationRole = 'admin' | 'collaborator' | 'viewer'

/**
 * Client view of a `Policy`, which describes how this resource may be accessed
 *
 * Note that the Policy only describes access granted explicitly for this resource.  The policies of parent resources can also cause a user to have access to this resource.
 */
export type OrganizationRolePolicy = {
  /**
   * Roles directly assigned on this resource
   */
  roleAssignments: OrganizationRoleRoleAssignment[]
}

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
 * Updateable properties of an {@link Organization}
 */
export type OrganizationUpdate = {
  description?: string | null
  name?: Name | null
}

/**
 * Client view of a {@link Project}
 */
export type Project = {
  /**
   * human-readable free-form text about a resource
   */
  description: string
  /**
   * unique, immutable, system-controlled identifier for each resource
   */
  id: string
  /**
   * unique, mutable, user-controlled identifier for each resource
   */
  name: Name
  organizationId: string
  /**
   * timestamp when this resource was created
   */
  timeCreated: Date
  /**
   * timestamp when this resource was last modified
   */
  timeModified: Date
}

/**
 * Create-time parameters for a {@link Project}
 */
export type ProjectCreate = {
  description: string
  name: Name
}

/**
 * A single page of results
 */
export type ProjectResultsPage = {
  /**
   * list of items on this page of results
   */
  items: Project[]
  /**
   * token used to fetch the next page of results (if any)
   */
  nextPage?: string | null
}

export type ProjectRole = 'admin' | 'collaborator' | 'viewer'

/**
 * Client view of a `Policy`, which describes how this resource may be accessed
 *
 * Note that the Policy only describes access granted explicitly for this resource.  The policies of parent resources can also cause a user to have access to this resource.
 */
export type ProjectRolePolicy = {
  /**
   * Roles directly assigned on this resource
   */
  roleAssignments: ProjectRoleRoleAssignment[]
}

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
 * Updateable properties of a {@link Project}
 */
export type ProjectUpdate = {
  description?: string | null
  name?: Name | null
}

/**
 * Client view of an {@link Rack}
 */
export type Rack = {
  /**
   * unique, immutable, system-controlled identifier for each resource
   */
  id: string
  /**
   * timestamp when this resource was created
   */
  timeCreated: Date
  /**
   * timestamp when this resource was last modified
   */
  timeModified: Date
}

/**
 * A single page of results
 */
export type RackResultsPage = {
  /**
   * list of items on this page of results
   */
  items: Rack[]
  /**
   * token used to fetch the next page of results (if any)
   */
  nextPage?: string | null
}

/**
 * Client view of a {@link Role}
 */
export type Role = {
  description: string
  name: RoleName
}

/**
 * Role names consist of two string components separated by dot (".").
 */
export type RoleName = string

/** Regex pattern for validating RoleName */
export const roleNamePattern = '[a-z-]+.[a-z-]+'

/**
 * A single page of results
 */
export type RoleResultsPage = {
  /**
   * list of items on this page of results
   */
  items: Role[]
  /**
   * token used to fetch the next page of results (if any)
   */
  nextPage?: string | null
}

/**
 * A `RouteDestination` is used to match traffic with a routing rule, on the destination of that traffic.
 *
 * When traffic is to be sent to a destination that is within a given `RouteDestination`, the corresponding {@link RouterRoute} applies, and traffic will be forward to the {@link RouteTarget} for that rule.
 */
export type RouteDestination =
  | { type: 'ip'; value: string }
  | { type: 'ip_net'; value: IpNet }
  | { type: 'vpc'; value: Name }
  | { type: 'subnet'; value: Name }

/**
 * A `RouteTarget` describes the possible locations that traffic matching a route destination can be sent.
 */
export type RouteTarget =
  | { type: 'ip'; value: string }
  | { type: 'vpc'; value: Name }
  | { type: 'subnet'; value: Name }
  | { type: 'instance'; value: Name }
  | { type: 'internet_gateway'; value: Name }

/**
 * A route defines a rule that governs where traffic should be sent based on its destination.
 */
export type RouterRoute = {
  /**
   * human-readable free-form text about a resource
   */
  description: string
  destination: RouteDestination
  /**
   * unique, immutable, system-controlled identifier for each resource
   */
  id: string
  /**
   * Describes the kind of router. Set at creation. `read-only`
   */
  kind: RouterRouteKind
  /**
   * unique, mutable, user-controlled identifier for each resource
   */
  name: Name
  target: RouteTarget
  /**
   * timestamp when this resource was created
   */
  timeCreated: Date
  /**
   * timestamp when this resource was last modified
   */
  timeModified: Date
  /**
   * The VPC Router to which the route belongs.
   */
  vpcRouterId: string
}

/**
 * Create-time parameters for a {@link RouterRoute}
 */
export type RouterRouteCreateParams = {
  description: string
  destination: RouteDestination
  name: Name
  target: RouteTarget
}

/**
 * The classification of a {@link RouterRoute} as defined by the system. The kind determines certain attributes such as if the route is modifiable and describes how or where the route was created.
 *
 * See [RFD-21](https://rfd.shared.oxide.computer/rfd/0021#concept-router) for more context
 */
export type RouterRouteKind = 'default' | 'vpc_subnet' | 'vpc_peering' | 'custom'

/**
 * A single page of results
 */
export type RouterRouteResultsPage = {
  /**
   * list of items on this page of results
   */
  items: RouterRoute[]
  /**
   * token used to fetch the next page of results (if any)
   */
  nextPage?: string | null
}

/**
 * Updateable properties of a {@link RouterRoute}
 */
export type RouterRouteUpdateParams = {
  description?: string | null
  destination: RouteDestination
  name?: Name | null
  target: RouteTarget
}

export type Saga = {
  id: string
  state: SagaState
}

export type SagaErrorInfo =
  | { error: 'action_failed'; sourceError: any }
  | { error: 'deserialize_failed'; message: string }
  | { error: 'injected_error' }
  | { error: 'serialize_failed'; message: string }
  | { error: 'subsaga_create_failed'; message: string }

/**
 * A single page of results
 */
export type SagaResultsPage = {
  /**
   * list of items on this page of results
   */
  items: Saga[]
  /**
   * token used to fetch the next page of results (if any)
   */
  nextPage?: string | null
}

export type SagaState =
  | { state: 'running' }
  | { state: 'succeeded' }
  | { errorInfo: SagaErrorInfo; errorNodeName: string; state: 'failed' }

/**
 * Identity-related metadata that's included in nearly all public API objects
 */
export type SamlIdentityProvider = {
  /**
   * service provider endpoint where the response will be sent
   */
  acsUrl: string
  /**
   * human-readable free-form text about a resource
   */
  description: string
  /**
   * unique, immutable, system-controlled identifier for each resource
   */
  id: string
  /**
   * idp's entity id
   */
  idpEntityId: string
  /**
   * unique, mutable, user-controlled identifier for each resource
   */
  name: Name
  /**
   * optional request signing public certificate (base64 encoded der file)
   */
  publicCert?: string | null
  /**
   * service provider endpoint where the idp should send log out requests
   */
  sloUrl: string
  /**
   * sp's client id
   */
  spClientId: string
  /**
   * customer's technical contact for saml configuration
   */
  technicalContactEmail: string
  /**
   * timestamp when this resource was created
   */
  timeCreated: Date
  /**
   * timestamp when this resource was last modified
   */
  timeModified: Date
}

/**
 * Create-time identity-related parameters
 */
export type SamlIdentityProviderCreate = {
  /**
   * service provider endpoint where the response will be sent
   */
  acsUrl: string
  description: string
  /**
   * idp's entity id
   */
  idpEntityId: string
  /**
   * the source of an identity provider metadata descriptor
   */
  idpMetadataSource: IdpMetadataSource
  name: Name
  /**
   * optional request signing key pair
   */
  signingKeypair?: DerEncodedKeyPair | null
  /**
   * service provider endpoint where the idp should send log out requests
   */
  sloUrl: string
  /**
   * sp's client id
   */
  spClientId: string
  /**
   * customer's technical contact for saml configuration
   */
  technicalContactEmail: string
}

/**
 * Client view of a ['Silo']
 */
export type Silo = {
  /**
   * human-readable free-form text about a resource
   */
  description: string
  /**
   * A silo where discoverable is false can be retrieved only by its id - it will not be part of the "list all silos" output.
   */
  discoverable: boolean
  /**
   * unique, immutable, system-controlled identifier for each resource
   */
  id: string
  /**
   * unique, mutable, user-controlled identifier for each resource
   */
  name: Name
  /**
   * timestamp when this resource was created
   */
  timeCreated: Date
  /**
   * timestamp when this resource was last modified
   */
  timeModified: Date
  /**
   * User provision type
   */
  userProvisionType: UserProvisionType
}

/**
 * Create-time parameters for a {@link Silo}
 */
export type SiloCreate = {
  description: string
  discoverable: boolean
  name: Name
  userProvisionType: UserProvisionType
}

/**
 * A single page of results
 */
export type SiloResultsPage = {
  /**
   * list of items on this page of results
   */
  items: Silo[]
  /**
   * token used to fetch the next page of results (if any)
   */
  nextPage?: string | null
}

export type SiloRole = 'admin' | 'collaborator' | 'viewer'

/**
 * Client view of a `Policy`, which describes how this resource may be accessed
 *
 * Note that the Policy only describes access granted explicitly for this resource.  The policies of parent resources can also cause a user to have access to this resource.
 */
export type SiloRolePolicy = {
  /**
   * Roles directly assigned on this resource
   */
  roleAssignments: SiloRoleRoleAssignment[]
}

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
 * Client view of an {@link Sled}
 */
export type Sled = {
  /**
   * unique, immutable, system-controlled identifier for each resource
   */
  id: string
  serviceAddress: string
  /**
   * timestamp when this resource was created
   */
  timeCreated: Date
  /**
   * timestamp when this resource was last modified
   */
  timeModified: Date
}

/**
 * A single page of results
 */
export type SledResultsPage = {
  /**
   * list of items on this page of results
   */
  items: Sled[]
  /**
   * token used to fetch the next page of results (if any)
   */
  nextPage?: string | null
}

/**
 * Client view of a Snapshot
 */
export type Snapshot = {
  /**
   * human-readable free-form text about a resource
   */
  description: string
  diskId: string
  /**
   * unique, immutable, system-controlled identifier for each resource
   */
  id: string
  /**
   * unique, mutable, user-controlled identifier for each resource
   */
  name: Name
  projectId: string
  size: ByteCount
  /**
   * timestamp when this resource was created
   */
  timeCreated: Date
  /**
   * timestamp when this resource was last modified
   */
  timeModified: Date
}

/**
 * Create-time parameters for a {@link Snapshot}
 */
export type SnapshotCreate = {
  description: string
  /**
   * The name of the disk to be snapshotted
   */
  disk: Name
  name: Name
}

/**
 * A single page of results
 */
export type SnapshotResultsPage = {
  /**
   * list of items on this page of results
   */
  items: Snapshot[]
  /**
   * token used to fetch the next page of results (if any)
   */
  nextPage?: string | null
}

export type SpoofLoginBody = {
  username: string
}

/**
 * Client view of a {@link SshKey}
 */
export type SshKey = {
  /**
   * human-readable free-form text about a resource
   */
  description: string
  /**
   * unique, immutable, system-controlled identifier for each resource
   */
  id: string
  /**
   * unique, mutable, user-controlled identifier for each resource
   */
  name: Name
  /**
   * SSH public key, e.g., `"ssh-ed25519 AAAAC3NzaC..."`
   */
  publicKey: string
  /**
   * The user to whom this key belongs
   */
  siloUserId: string
  /**
   * timestamp when this resource was created
   */
  timeCreated: Date
  /**
   * timestamp when this resource was last modified
   */
  timeModified: Date
}

/**
 * Create-time parameters for an {@link SshKey}
 */
export type SshKeyCreate = {
  description: string
  name: Name
  /**
   * SSH public key, e.g., `"ssh-ed25519 AAAAC3NzaC..."`
   */
  publicKey: string
}

/**
 * A single page of results
 */
export type SshKeyResultsPage = {
  /**
   * list of items on this page of results
   */
  items: SshKey[]
  /**
   * token used to fetch the next page of results (if any)
   */
  nextPage?: string | null
}

/**
 * Names are constructed by concatenating the target and metric names with ':'. Target and metric names must be lowercase alphanumeric characters with '_' separating words.
 */
export type TimeseriesName = string

/** Regex pattern for validating TimeseriesName */
export const timeseriesNamePattern =
  '(([a-z]+[a-z0-9]*)(_([a-z0-9]+))*):(([a-z]+[a-z0-9]*)(_([a-z0-9]+))*)'

/**
 * The schema for a timeseries.
 *
 * This includes the name of the timeseries, as well as the datum type of its metric and the schema for each field.
 */
export type TimeseriesSchema = {
  created: string
  datumType: DatumType
  fieldSchema: FieldSchema[]
  timeseriesName: TimeseriesName
}

/**
 * A single page of results
 */
export type TimeseriesSchemaResultsPage = {
  /**
   * list of items on this page of results
   */
  items: TimeseriesSchema[]
  /**
   * token used to fetch the next page of results (if any)
   */
  nextPage?: string | null
}

/**
 * Client view of a {@link User}
 */
export type User = {
  /**
   * Human-readable name that can identify the user
   */
  displayName: string
  id: string
}

/**
 * Client view of a {@link UserBuiltin}
 */
export type UserBuiltin = {
  /**
   * human-readable free-form text about a resource
   */
  description: string
  /**
   * unique, immutable, system-controlled identifier for each resource
   */
  id: string
  /**
   * unique, mutable, user-controlled identifier for each resource
   */
  name: Name
  /**
   * timestamp when this resource was created
   */
  timeCreated: Date
  /**
   * timestamp when this resource was last modified
   */
  timeModified: Date
}

/**
 * A single page of results
 */
export type UserBuiltinResultsPage = {
  /**
   * list of items on this page of results
   */
  items: UserBuiltin[]
  /**
   * token used to fetch the next page of results (if any)
   */
  nextPage?: string | null
}

/**
 * How users will be provisioned in a silo during authentication.
 */
export type UserProvisionType = 'fixed' | 'jit'

/**
 * A single page of results
 */
export type UserResultsPage = {
  /**
   * list of items on this page of results
   */
  items: User[]
  /**
   * token used to fetch the next page of results (if any)
   */
  nextPage?: string | null
}

/**
 * Client view of a {@link Vpc}
 */
export type Vpc = {
  /**
   * human-readable free-form text about a resource
   */
  description: string
  /**
   * The name used for the VPC in DNS.
   */
  dnsName: Name
  /**
   * unique, immutable, system-controlled identifier for each resource
   */
  id: string
  /**
   * The unique local IPv6 address range for subnets in this VPC
   */
  ipv6Prefix: Ipv6Net
  /**
   * unique, mutable, user-controlled identifier for each resource
   */
  name: Name
  /**
   * id for the project containing this VPC
   */
  projectId: string
  /**
   * id for the system router where subnet default routes are registered
   */
  systemRouterId: string
  /**
   * timestamp when this resource was created
   */
  timeCreated: Date
  /**
   * timestamp when this resource was last modified
   */
  timeModified: Date
}

/**
 * Create-time parameters for a {@link Vpc}
 */
export type VpcCreate = {
  description: string
  dnsName: Name
  /**
   * The IPv6 prefix for this VPC.
   *
   * All IPv6 subnets created from this VPC must be taken from this range, which sould be a Unique Local Address in the range `fd00::/48`. The default VPC Subnet will have the first `/64` range from this prefix.
   */
  ipv6Prefix?: Ipv6Net | null
  name: Name
}

/**
 * A single rule in a VPC firewall
 */
export type VpcFirewallRule = {
  /**
   * whether traffic matching the rule should be allowed or dropped
   */
  action: VpcFirewallRuleAction
  /**
   * human-readable free-form text about a resource
   */
  description: string
  /**
   * whether this rule is for incoming or outgoing traffic
   */
  direction: VpcFirewallRuleDirection
  /**
   * reductions on the scope of the rule
   */
  filters: VpcFirewallRuleFilter
  /**
   * unique, immutable, system-controlled identifier for each resource
   */
  id: string
  /**
   * unique, mutable, user-controlled identifier for each resource
   */
  name: Name
  /**
   * the relative priority of this rule
   */
  priority: number
  /**
   * whether this rule is in effect
   */
  status: VpcFirewallRuleStatus
  /**
   * list of sets of instances that the rule applies to
   */
  targets: VpcFirewallRuleTarget[]
  /**
   * timestamp when this resource was created
   */
  timeCreated: Date
  /**
   * timestamp when this resource was last modified
   */
  timeModified: Date
  /**
   * the VPC to which this rule belongs
   */
  vpcId: string
}

export type VpcFirewallRuleAction = 'allow' | 'deny'

export type VpcFirewallRuleDirection = 'inbound' | 'outbound'

/**
 * Filter for a firewall rule. A given packet must match every field that is present for the rule to apply to it. A packet matches a field if any entry in that field matches the packet.
 */
export type VpcFirewallRuleFilter = {
  /**
   * If present, the sources (if incoming) or destinations (if outgoing) this rule applies to.
   */
  hosts?: VpcFirewallRuleHostFilter[] | null
  /**
   * If present, the destination ports this rule applies to.
   */
  ports?: L4PortRange[] | null
  /**
   * If present, the networking protocols this rule applies to.
   */
  protocols?: VpcFirewallRuleProtocol[] | null
}

/**
 * The `VpcFirewallRuleHostFilter` is used to filter traffic on the basis of its source or destination host.
 */
export type VpcFirewallRuleHostFilter =
  | { type: 'vpc'; value: Name }
  | { type: 'subnet'; value: Name }
  | { type: 'instance'; value: Name }
  | { type: 'ip'; value: string }
  | { type: 'ip_net'; value: IpNet }

/**
 * The protocols that may be specified in a firewall rule's filter
 */
export type VpcFirewallRuleProtocol = 'TCP' | 'UDP' | 'ICMP'

export type VpcFirewallRuleStatus = 'disabled' | 'enabled'

/**
 * A `VpcFirewallRuleTarget` is used to specify the set of {@link Instance}s to which a firewall rule applies.
 */
export type VpcFirewallRuleTarget =
  | { type: 'vpc'; value: Name }
  | { type: 'subnet'; value: Name }
  | { type: 'instance'; value: Name }
  | { type: 'ip'; value: string }
  | { type: 'ip_net'; value: IpNet }

/**
 * A single rule in a VPC firewall
 */
export type VpcFirewallRuleUpdate = {
  /**
   * whether traffic matching the rule should be allowed or dropped
   */
  action: VpcFirewallRuleAction
  /**
   * human-readable free-form text about a resource
   */
  description: string
  /**
   * whether this rule is for incoming or outgoing traffic
   */
  direction: VpcFirewallRuleDirection
  /**
   * reductions on the scope of the rule
   */
  filters: VpcFirewallRuleFilter
  /**
   * name of the rule, unique to this VPC
   */
  name: Name
  /**
   * the relative priority of this rule
   */
  priority: number
  /**
   * whether this rule is in effect
   */
  status: VpcFirewallRuleStatus
  /**
   * list of sets of instances that the rule applies to
   */
  targets: VpcFirewallRuleTarget[]
}

/**
 * Updateable properties of a `Vpc`'s firewall Note that VpcFirewallRules are implicitly created along with a Vpc, so there is no explicit creation.
 */
export type VpcFirewallRuleUpdateParams = {
  rules: VpcFirewallRuleUpdate[]
}

/**
 * Collection of a {@link Vpc}'s firewall rules
 */
export type VpcFirewallRules = {
  rules: VpcFirewallRule[]
}

/**
 * A single page of results
 */
export type VpcResultsPage = {
  /**
   * list of items on this page of results
   */
  items: Vpc[]
  /**
   * token used to fetch the next page of results (if any)
   */
  nextPage?: string | null
}

/**
 * A VPC router defines a series of rules that indicate where traffic should be sent depending on its destination.
 */
export type VpcRouter = {
  /**
   * human-readable free-form text about a resource
   */
  description: string
  /**
   * unique, immutable, system-controlled identifier for each resource
   */
  id: string
  kind: VpcRouterKind
  /**
   * unique, mutable, user-controlled identifier for each resource
   */
  name: Name
  /**
   * timestamp when this resource was created
   */
  timeCreated: Date
  /**
   * timestamp when this resource was last modified
   */
  timeModified: Date
  /**
   * The VPC to which the router belongs.
   */
  vpcId: string
}

/**
 * Create-time parameters for a {@link VpcRouter}
 */
export type VpcRouterCreate = {
  description: string
  name: Name
}

export type VpcRouterKind = 'system' | 'custom'

/**
 * A single page of results
 */
export type VpcRouterResultsPage = {
  /**
   * list of items on this page of results
   */
  items: VpcRouter[]
  /**
   * token used to fetch the next page of results (if any)
   */
  nextPage?: string | null
}

/**
 * Updateable properties of a {@link VpcRouter}
 */
export type VpcRouterUpdate = {
  description?: string | null
  name?: Name | null
}

/**
 * A VPC subnet represents a logical grouping for instances that allows network traffic between them, within a IPv4 subnetwork or optionall an IPv6 subnetwork.
 */
export type VpcSubnet = {
  /**
   * human-readable free-form text about a resource
   */
  description: string
  /**
   * unique, immutable, system-controlled identifier for each resource
   */
  id: string
  /**
   * The IPv4 subnet CIDR block.
   */
  ipv4Block: Ipv4Net
  /**
   * The IPv6 subnet CIDR block.
   */
  ipv6Block: Ipv6Net
  /**
   * unique, mutable, user-controlled identifier for each resource
   */
  name: Name
  /**
   * timestamp when this resource was created
   */
  timeCreated: Date
  /**
   * timestamp when this resource was last modified
   */
  timeModified: Date
  /**
   * The VPC to which the subnet belongs.
   */
  vpcId: string
}

/**
 * Create-time parameters for a {@link VpcSubnet}
 */
export type VpcSubnetCreate = {
  description: string
  /**
   * The IPv4 address range for this subnet.
   *
   * It must be allocated from an RFC 1918 private address range, and must not overlap with any other existing subnet in the VPC.
   */
  ipv4Block: Ipv4Net
  /**
   * The IPv6 address range for this subnet.
   *
   * It must be allocated from the RFC 4193 Unique Local Address range, with the prefix equal to the parent VPC's prefix. A random `/64` block will be assigned if one is not provided. It must not overlap with any existing subnet in the VPC.
   */
  ipv6Block?: Ipv6Net | null
  name: Name
}

/**
 * A single page of results
 */
export type VpcSubnetResultsPage = {
  /**
   * list of items on this page of results
   */
  items: VpcSubnet[]
  /**
   * token used to fetch the next page of results (if any)
   */
  nextPage?: string | null
}

/**
 * Updateable properties of a {@link VpcSubnet}
 */
export type VpcSubnetUpdate = {
  description?: string | null
  name?: Name | null
}

/**
 * Updateable properties of a {@link Vpc}
 */
export type VpcUpdate = {
  description?: string | null
  dnsName?: Name | null
  name?: Name | null
}

/**
 * Supported set of sort modes for scanning by id only.
 *
 * Currently, we only support scanning in ascending order.
 */
export type IdSortMode = 'id_ascending'

/**
 * Supported set of sort modes for scanning by name only
 *
 * Currently, we only support scanning in ascending order.
 */
export type NameSortMode = 'name_ascending'

/**
 * Supported set of sort modes for scanning by name or id
 */
export type NameOrIdSortMode = 'name_ascending' | 'name_descending' | 'id_ascending'

export interface DiskViewByIdParams {
  id: string
}

export interface ImageGlobalViewByIdParams {
  id: string
}

export interface ImageViewByIdParams {
  id: string
}

export interface InstanceViewByIdParams {
  id: string
}

export interface InstanceNetworkInterfaceViewByIdParams {
  id: string
}

export interface OrganizationViewByIdParams {
  id: string
}

export interface ProjectViewByIdParams {
  id: string
}

export interface SnapshotViewByIdParams {
  id: string
}

export interface VpcRouterRouteViewByIdParams {
  id: string
}

export interface VpcRouterViewByIdParams {
  id: string
}

export interface VpcSubnetViewByIdParams {
  id: string
}

export interface VpcViewByIdParams {
  id: string
}

export interface DeviceAuthRequestParams {}

export interface DeviceAuthConfirmParams {}

export interface DeviceAccessTokenParams {}

export interface RackListParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: IdSortMode
}

export interface RackViewParams {
  rackId: string
}

export interface SledListParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: IdSortMode
}

export interface SledViewParams {
  sledId: string
}

export interface ImageGlobalListParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: NameSortMode
}

export interface ImageGlobalCreateParams {}

export interface ImageGlobalViewParams {
  imageName: Name
}

export interface ImageGlobalDeleteParams {
  imageName: Name
}

export interface IpPoolListParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: NameOrIdSortMode
}

export interface IpPoolCreateParams {}

export interface IpPoolViewParams {
  poolName: Name
}

export interface IpPoolUpdateParams {
  poolName: Name
}

export interface IpPoolDeleteParams {
  poolName: Name
}

export interface IpPoolRangeListParams {
  poolName: Name
  limit?: number | null
  pageToken?: string | null
}

export interface IpPoolRangeAddParams {
  poolName: Name
}

export interface IpPoolRangeRemoveParams {
  poolName: Name
}

export interface SpoofLoginParams {}

export interface LoginParams {
  providerName: Name
  siloName: Name
}

export interface ConsumeCredentialsParams {
  providerName: Name
  siloName: Name
}

export interface LogoutParams {}

export interface OrganizationListParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: NameOrIdSortMode
}

export interface OrganizationCreateParams {}

export interface OrganizationViewParams {
  orgName: Name
}

export interface OrganizationUpdateParams {
  orgName: Name
}

export interface OrganizationDeleteParams {
  orgName: Name
}

export interface OrganizationPolicyViewParams {
  orgName: Name
}

export interface OrganizationPolicyUpdateParams {
  orgName: Name
}

export interface ProjectListParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: NameOrIdSortMode
  orgName: Name
}

export interface ProjectCreateParams {
  orgName: Name
}

export interface ProjectViewParams {
  orgName: Name
  projectName: Name
}

export interface ProjectUpdateParams {
  orgName: Name
  projectName: Name
}

export interface ProjectDeleteParams {
  orgName: Name
  projectName: Name
}

export interface DiskListParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: NameSortMode
  orgName: Name
  projectName: Name
}

export interface DiskCreateParams {
  orgName: Name
  projectName: Name
}

export interface DiskViewParams {
  diskName: Name
  orgName: Name
  projectName: Name
}

export interface DiskDeleteParams {
  diskName: Name
  orgName: Name
  projectName: Name
}

export interface ImageListParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: NameSortMode
  orgName: Name
  projectName: Name
}

export interface ImageCreateParams {
  orgName: Name
  projectName: Name
}

export interface ImageViewParams {
  imageName: Name
  orgName: Name
  projectName: Name
}

export interface ImageDeleteParams {
  imageName: Name
  orgName: Name
  projectName: Name
}

export interface InstanceListParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: NameSortMode
  orgName: Name
  projectName: Name
}

export interface InstanceCreateParams {
  orgName: Name
  projectName: Name
}

export interface InstanceViewParams {
  instanceName: Name
  orgName: Name
  projectName: Name
}

export interface InstanceDeleteParams {
  instanceName: Name
  orgName: Name
  projectName: Name
}

export interface InstanceDiskListParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: NameSortMode
  instanceName: Name
  orgName: Name
  projectName: Name
}

export interface InstanceDiskAttachParams {
  instanceName: Name
  orgName: Name
  projectName: Name
}

export interface InstanceDiskDetachParams {
  instanceName: Name
  orgName: Name
  projectName: Name
}

export interface InstanceMigrateParams {
  instanceName: Name
  orgName: Name
  projectName: Name
}

export interface InstanceNetworkInterfaceListParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: NameSortMode
  instanceName: Name
  orgName: Name
  projectName: Name
}

export interface InstanceNetworkInterfaceCreateParams {
  instanceName: Name
  orgName: Name
  projectName: Name
}

export interface InstanceNetworkInterfaceViewParams {
  instanceName: Name
  interfaceName: Name
  orgName: Name
  projectName: Name
}

export interface InstanceNetworkInterfaceUpdateParams {
  instanceName: Name
  interfaceName: Name
  orgName: Name
  projectName: Name
}

export interface InstanceNetworkInterfaceDeleteParams {
  instanceName: Name
  interfaceName: Name
  orgName: Name
  projectName: Name
}

export interface InstanceRebootParams {
  instanceName: Name
  orgName: Name
  projectName: Name
}

export interface InstanceSerialConsoleParams {
  instanceName: Name
  orgName: Name
  projectName: Name
  fromStart?: number | null
  maxBytes?: number | null
  mostRecent?: number | null
}

export interface InstanceStartParams {
  instanceName: Name
  orgName: Name
  projectName: Name
}

export interface InstanceStopParams {
  instanceName: Name
  orgName: Name
  projectName: Name
}

export interface ProjectPolicyViewParams {
  orgName: Name
  projectName: Name
}

export interface ProjectPolicyUpdateParams {
  orgName: Name
  projectName: Name
}

export interface SnapshotListParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: NameSortMode
  orgName: Name
  projectName: Name
}

export interface SnapshotCreateParams {
  orgName: Name
  projectName: Name
}

export interface SnapshotViewParams {
  orgName: Name
  projectName: Name
  snapshotName: Name
}

export interface SnapshotDeleteParams {
  orgName: Name
  projectName: Name
  snapshotName: Name
}

export interface VpcListParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: NameSortMode
  orgName: Name
  projectName: Name
}

export interface VpcCreateParams {
  orgName: Name
  projectName: Name
}

export interface VpcViewParams {
  orgName: Name
  projectName: Name
  vpcName: Name
}

export interface VpcUpdateParams {
  orgName: Name
  projectName: Name
  vpcName: Name
}

export interface VpcDeleteParams {
  orgName: Name
  projectName: Name
  vpcName: Name
}

export interface VpcFirewallRulesViewParams {
  orgName: Name
  projectName: Name
  vpcName: Name
}

export interface VpcFirewallRulesUpdateParams {
  orgName: Name
  projectName: Name
  vpcName: Name
}

export interface VpcRouterListParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: NameSortMode
  orgName: Name
  projectName: Name
  vpcName: Name
}

export interface VpcRouterCreateParams {
  orgName: Name
  projectName: Name
  vpcName: Name
}

export interface VpcRouterViewParams {
  orgName: Name
  projectName: Name
  routerName: Name
  vpcName: Name
}

export interface VpcRouterUpdateParams {
  orgName: Name
  projectName: Name
  routerName: Name
  vpcName: Name
}

export interface VpcRouterDeleteParams {
  orgName: Name
  projectName: Name
  routerName: Name
  vpcName: Name
}

export interface VpcRouterRouteListParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: NameSortMode
  orgName: Name
  projectName: Name
  routerName: Name
  vpcName: Name
}

export interface VpcRouterRouteCreateParams {
  orgName: Name
  projectName: Name
  routerName: Name
  vpcName: Name
}

export interface VpcRouterRouteViewParams {
  orgName: Name
  projectName: Name
  routeName: Name
  routerName: Name
  vpcName: Name
}

export interface VpcRouterRouteUpdateParams {
  orgName: Name
  projectName: Name
  routeName: Name
  routerName: Name
  vpcName: Name
}

export interface VpcRouterRouteDeleteParams {
  orgName: Name
  projectName: Name
  routeName: Name
  routerName: Name
  vpcName: Name
}

export interface VpcSubnetListParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: NameSortMode
  orgName: Name
  projectName: Name
  vpcName: Name
}

export interface VpcSubnetCreateParams {
  orgName: Name
  projectName: Name
  vpcName: Name
}

export interface VpcSubnetViewParams {
  orgName: Name
  projectName: Name
  subnetName: Name
  vpcName: Name
}

export interface VpcSubnetUpdateParams {
  orgName: Name
  projectName: Name
  subnetName: Name
  vpcName: Name
}

export interface VpcSubnetDeleteParams {
  orgName: Name
  projectName: Name
  subnetName: Name
  vpcName: Name
}

export interface VpcSubnetListNetworkInterfacesParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: NameSortMode
  orgName: Name
  projectName: Name
  subnetName: Name
  vpcName: Name
}

export interface PolicyViewParams {}

export interface PolicyUpdateParams {}

export interface RoleListParams {
  limit?: number | null
  pageToken?: string | null
}

export interface RoleViewParams {
  roleName: string
}

export interface SagaListParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: IdSortMode
}

export interface SagaViewParams {
  sagaId: string
}

export interface SessionMeParams {}

export interface SessionSshkeyListParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: NameSortMode
}

export interface SessionSshkeyCreateParams {}

export interface SessionSshkeyViewParams {
  sshKeyName: Name
}

export interface SessionSshkeyDeleteParams {
  sshKeyName: Name
}

export interface SiloListParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: NameOrIdSortMode
}

export interface SiloCreateParams {}

export interface SiloViewParams {
  siloName: Name
}

export interface SiloDeleteParams {
  siloName: Name
}

export interface SiloIdentityProviderListParams {
  siloName: Name
  limit?: number | null
  pageToken?: string | null
  sortBy?: NameSortMode
}

export interface SiloPolicyViewParams {
  siloName: Name
}

export interface SiloPolicyUpdateParams {
  siloName: Name
}

export interface SiloIdentityProviderCreateParams {
  siloName: Name
}

export interface SiloIdentityProviderViewParams {
  providerName: Name
  siloName: Name
}

export interface SystemUserListParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: NameSortMode
}

export interface SystemUserViewParams {
  userName: Name
}

export interface TimeseriesSchemaGetParams {
  limit?: number | null
  pageToken?: string | null
}

export interface UpdatesRefreshParams {}

export interface UserListParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: IdSortMode
}

export type ApiViewByIdMethods = Pick<
  InstanceType<typeof Api>['methods'],
  | 'diskViewById'
  | 'imageGlobalViewById'
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
>

export type ApiListMethods = Pick<
  InstanceType<typeof Api>['methods'],
  | 'rackList'
  | 'sledList'
  | 'imageGlobalList'
  | 'ipPoolList'
  | 'ipPoolRangeList'
  | 'organizationList'
  | 'projectList'
  | 'diskList'
  | 'imageList'
  | 'instanceList'
  | 'instanceDiskList'
  | 'instanceNetworkInterfaceList'
  | 'snapshotList'
  | 'vpcList'
  | 'vpcRouterList'
  | 'vpcRouterRouteList'
  | 'vpcSubnetList'
  | 'roleList'
  | 'sagaList'
  | 'sessionSshkeyList'
  | 'siloList'
  | 'siloIdentityProviderList'
  | 'systemUserList'
  | 'userList'
>

const camelToSnake = (s: string) => s.replace(/[A-Z]/g, (l) => '_' + l.toLowerCase())

const snakeToCamel = (s: string) => s.replace(/_./g, (l) => l[1].toUpperCase())

const isObjectOrArray = (o: unknown) =>
  typeof o === 'object' &&
  !(o instanceof Date) &&
  !(o instanceof RegExp) &&
  !(o instanceof Error) &&
  o !== null

/**
 * Recursively map (k, v) pairs using Object.entries
 *
 * Note that value transform function takes both k and v so we can use the key
 * to decide whether to transform the value.
 */
const mapObj =
  (
    kf: (k: string) => string,
    vf: (k: string | undefined, v: unknown) => any = (k, v) => v
  ) =>
  (o: unknown): unknown => {
    if (!isObjectOrArray(o)) return o

    if (Array.isArray(o)) return o.map(mapObj(kf, vf))

    const newObj: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
      newObj[kf(k)] = isObjectOrArray(v) ? mapObj(kf, vf)(v) : vf(k, v)
    }
    return newObj
  }

const parseIfDate = (k: string | undefined, v: any) => {
  if (typeof v === 'string' && k?.startsWith('time_')) {
    const d = new Date(v)
    if (isNaN(d.getTime())) return v
    return d
  }
  return v
}

const snakeify = mapObj(camelToSnake)

const processResponseBody = mapObj(snakeToCamel, parseIfDate)

// credit where due: this is a stripped-down version of the fetch client from
// https://github.com/acacode/swagger-typescript-api

export type QueryParamsType = Record<string | number, any>

export interface FullRequestParams extends Omit<RequestInit, 'body'> {
  /** request path */
  path: string
  /** query params */
  query?: QueryParamsType
  /** request body */
  body?: unknown
  /** base url */
  baseUrl?: string
  /** request cancellation token */
  cancelToken?: CancelToken
}

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>

export interface ApiConfig {
  baseUrl?: string
  baseApiParams?: Omit<RequestParams, 'baseUrl' | 'cancelToken' | 'signal'>
  customFetch?: typeof fetch
}

export type ErrorResponse = Response & {
  data: null
  // Note that this Error is not JS `Error` but rather an Error type generated
  // from the spec. The fact that it has the same name as the global Error type
  // is unfortunate. If the generated error type disappears, this will not fail
  // typechecking here, but any code that depends on this having a certain shape
  // will fail, so it's not that bad, though the error message may be confusing.
  error: Error
}

export type SuccessResponse<Data extends unknown> = Response & {
  data: Data
  error: null
}

export type ApiResponse<Data extends unknown> = SuccessResponse<Data> | ErrorResponse

type CancelToken = Symbol | string | number

const encodeQueryParam = (key: string, value: any) =>
  `${encodeURIComponent(camelToSnake(key))}=${encodeURIComponent(value)}`

const toQueryString = (rawQuery?: QueryParamsType): string =>
  Object.entries(rawQuery || {})
    .filter(([key, value]) => typeof value !== 'undefined')
    .map(([key, value]) =>
      Array.isArray(value)
        ? value.map((item) => encodeQueryParam(key, item)).join('&')
        : encodeQueryParam(key, value)
    )
    .join('&')

export class HttpClient {
  public baseUrl: string = ''
  private abortControllers = new Map<CancelToken, AbortController>()
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams)

  private baseApiParams: RequestParams = {
    credentials: 'same-origin',
    headers: {},
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
  }

  constructor(apiConfig: ApiConfig = {}) {
    Object.assign(this, apiConfig)
  }

  private mergeRequestParams(params: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params,
      headers: {
        ...this.baseApiParams.headers,
        ...params.headers,
      },
    }
  }

  private createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken)
      if (abortController) {
        return abortController.signal
      }
      return void 0
    }

    const abortController = new AbortController()
    this.abortControllers.set(cancelToken, abortController)
    return abortController.signal
  }

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken)

    if (abortController) {
      abortController.abort()
      this.abortControllers.delete(cancelToken)
    }
  }

  public request = async <Data extends unknown>({
    body,
    path,
    query,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<ApiResponse<Data>> => {
    const requestParams = this.mergeRequestParams(params)
    const queryString = query && toQueryString(query)

    let url = baseUrl || this.baseUrl || ''
    url += path
    if (queryString) {
      url += '?' + queryString
    }

    const response = await this.customFetch(url, {
      ...requestParams,
      headers: {
        'Content-Type': 'application/json',
        ...requestParams.headers,
      },
      signal: cancelToken ? this.createAbortSignal(cancelToken) : void 0,
      body: JSON.stringify(snakeify(body)),
    })

    const r = response as ApiResponse<Data>
    r.data = null as unknown as Data
    r.error = null as unknown as Error

    try {
      const data = processResponseBody(await response.json())
      if (r.ok) {
        r.data = data as Data
      } else {
        r.error = data as Error
      }
    } catch (e) {
      r.error = e as Error
    }

    if (cancelToken) {
      this.abortControllers.delete(cancelToken)
    }

    if (!r.ok) throw r
    return r
  }
}

export class Api extends HttpClient {
  methods = {
    /**
     * Get a disk by id
     */
    diskViewById: ({ id }: DiskViewByIdParams, params: RequestParams = {}) =>
      this.request<Disk>({
        path: `/by-id/disks/${id}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Get a global image by id.
     */
    imageGlobalViewById: ({ id }: ImageGlobalViewByIdParams, params: RequestParams = {}) =>
      this.request<GlobalImage>({
        path: `/by-id/global-images/${id}`,
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
     * Get an instance by id.
     */
    instanceViewById: ({ id }: InstanceViewByIdParams, params: RequestParams = {}) =>
      this.request<Instance>({
        path: `/by-id/instances/${id}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Get an instance's network interface by id.
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
     * Get an organization by id
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
     * Get a project by id
     */
    projectViewById: ({ id }: ProjectViewByIdParams, params: RequestParams = {}) =>
      this.request<Project>({
        path: `/by-id/projects/${id}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Get a snapshot by id.
     */
    snapshotViewById: ({ id }: SnapshotViewByIdParams, params: RequestParams = {}) =>
      this.request<Snapshot>({
        path: `/by-id/snapshots/${id}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Get a vpc router route by id
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
     * Get a VPC Router by id
     */
    vpcRouterViewById: ({ id }: VpcRouterViewByIdParams, params: RequestParams = {}) =>
      this.request<VpcRouter>({
        path: `/by-id/vpc-routers/${id}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Get a VPC subnet by id.
     */
    vpcSubnetViewById: ({ id }: VpcSubnetViewByIdParams, params: RequestParams = {}) =>
      this.request<VpcSubnet>({
        path: `/by-id/vpc-subnets/${id}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Get a VPC by id.
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

    /**
     * List racks in the system.
     */
    rackList: (query: RackListParams, params: RequestParams = {}) =>
      this.request<RackResultsPage>({
        path: `/hardware/racks`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * Fetch information about a particular rack.
     */
    rackView: ({ rackId }: RackViewParams, params: RequestParams = {}) =>
      this.request<Rack>({
        path: `/hardware/racks/${rackId}`,
        method: 'GET',
        ...params,
      }),

    /**
     * List sleds in the system.
     */
    sledList: (query: SledListParams, params: RequestParams = {}) =>
      this.request<SledResultsPage>({
        path: `/hardware/sleds`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * Fetch information about a sled in the system.
     */
    sledView: ({ sledId }: SledViewParams, params: RequestParams = {}) =>
      this.request<Sled>({
        path: `/hardware/sleds/${sledId}`,
        method: 'GET',
        ...params,
      }),

    /**
     * List global images.
     */
    imageGlobalList: (query: ImageGlobalListParams, params: RequestParams = {}) =>
      this.request<GlobalImageResultsPage>({
        path: `/images`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * Create a global image.
     */
    imageGlobalCreate: (
      query: ImageGlobalCreateParams,
      body: GlobalImageCreate,
      params: RequestParams = {}
    ) =>
      this.request<GlobalImage>({
        path: `/images`,
        method: 'POST',
        body,
        ...params,
      }),

    /**
     * Get a global image.
     */
    imageGlobalView: ({ imageName }: ImageGlobalViewParams, params: RequestParams = {}) =>
      this.request<GlobalImage>({
        path: `/images/${imageName}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Delete a global image.
     */
    imageGlobalDelete: (
      { imageName }: ImageGlobalDeleteParams,
      params: RequestParams = {}
    ) =>
      this.request<void>({
        path: `/images/${imageName}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * List IP Pools.
     */
    ipPoolList: (query: IpPoolListParams, params: RequestParams = {}) =>
      this.request<IpPoolResultsPage>({
        path: `/ip-pools`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * Create a new IP Pool.
     */
    ipPoolCreate: (
      query: IpPoolCreateParams,
      body: IpPoolCreate,
      params: RequestParams = {}
    ) =>
      this.request<IpPool>({
        path: `/ip-pools`,
        method: 'POST',
        body,
        ...params,
      }),

    /**
     * Fetch a single IP Pool.
     */
    ipPoolView: ({ poolName }: IpPoolViewParams, params: RequestParams = {}) =>
      this.request<IpPool>({
        path: `/ip-pools/${poolName}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Update an IP Pool.
     */
    ipPoolUpdate: (
      { poolName }: IpPoolUpdateParams,
      body: IpPoolUpdate,
      params: RequestParams = {}
    ) =>
      this.request<IpPool>({
        path: `/ip-pools/${poolName}`,
        method: 'PUT',
        body,
        ...params,
      }),

    /**
     * Delete an IP Pool.
     */
    ipPoolDelete: ({ poolName }: IpPoolDeleteParams, params: RequestParams = {}) =>
      this.request<void>({
        path: `/ip-pools/${poolName}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * List the ranges of IP addresses within an existing IP Pool.
     */
    ipPoolRangeList: (
      { poolName, ...query }: IpPoolRangeListParams,
      params: RequestParams = {}
    ) =>
      this.request<IpPoolRangeResultsPage>({
        path: `/ip-pools/${poolName}/ranges`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * Add a new range to an existing IP Pool.
     */
    ipPoolRangeAdd: (
      { poolName }: IpPoolRangeAddParams,
      body: IpRange,
      params: RequestParams = {}
    ) =>
      this.request<IpPoolRange>({
        path: `/ip-pools/${poolName}/ranges/add`,
        method: 'POST',
        body,
        ...params,
      }),

    /**
     * Remove a range from an existing IP Pool.
     */
    ipPoolRangeRemove: (
      { poolName }: IpPoolRangeRemoveParams,
      body: IpRange,
      params: RequestParams = {}
    ) =>
      this.request<void>({
        path: `/ip-pools/${poolName}/ranges/remove`,
        method: 'POST',
        body,
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
     * Ask the user to login to their identity provider
     */
    login: ({ providerName, siloName }: LoginParams, params: RequestParams = {}) =>
      this.request<void>({
        path: `/login/${siloName}/${providerName}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Consume some sort of credentials, and authenticate a user.
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
     * List all organizations.
     */
    organizationList: (query: OrganizationListParams, params: RequestParams = {}) =>
      this.request<OrganizationResultsPage>({
        path: `/organizations`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * Create a new organization.
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
     * Fetch a specific organization
     */
    organizationView: ({ orgName }: OrganizationViewParams, params: RequestParams = {}) =>
      this.request<Organization>({
        path: `/organizations/${orgName}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Update a specific organization.
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
     * Delete a specific organization.
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
     * Fetch the IAM policy for this Organization
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
     * Update the IAM policy for this Organization
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
     * List all projects.
     */
    projectList: ({ orgName, ...query }: ProjectListParams, params: RequestParams = {}) =>
      this.request<ProjectResultsPage>({
        path: `/organizations/${orgName}/projects`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * Create a new project.
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
     * Fetch a specific project
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
     * Update a specific project.
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
     * Delete a specific project.
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
     * List disks in a project.
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
     * Create a disk in a project.
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
     * Get a single disk in a project.
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
     * Delete a disk from a project.
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
     * Get an image
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
     * List instances in a project.
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
     * Create an instance in a project.
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
     * Get an instance in a project.
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
     * Delete an instance from a project.
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
     * List disks attached to this instance.
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
     * Migrate an instance to a different propolis-server, possibly on a different sled.
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
     * List network interfaces attached to this instance.
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
     * Create a network interface for an instance.
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
     * Get an interface attached to an instance.
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
     * Update information about an instance's network interface
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
     * Detach a network interface from an instance.
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
     * Reboot an instance.
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
     * Get contents of an instance's serial console.
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
     * Boot an instance.
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
     * Halt an instance.
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
     * Fetch the IAM policy for this Project
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
     * Update the IAM policy for this Project
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
     * List snapshots in a project.
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
     * Create a snapshot of a disk.
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
     * Get a snapshot in a project.
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
     * Delete a snapshot from a project.
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
     * List VPCs in a project.
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
     * Create a VPC in a project.
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
     * Get a VPC in a project.
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
     * Update a VPC.
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
     * Delete a vpc from a project.
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
     * List firewall rules for a VPC.
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
     * Replace the firewall rules for a VPC
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
     * List VPC Custom and System Routers
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
     * Create a VPC Router
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
     * Get a VPC Router
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
     * Update a VPC Router
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
     * Delete a router from its VPC
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
     * List a Router's routes
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
     * Create a VPC Router
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
     * Get a VPC Router route
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
     * Update a Router route
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
     * Delete a route from its router
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
     * List subnets in a VPC.
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
     * Create a subnet in a VPC.
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
     * Get subnet in a VPC.
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
     * Update a VPC Subnet.
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
     * Delete a subnet from a VPC.
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
     * List network interfaces in a VPC subnet.
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
     * Fetch the top-level IAM policy
     */
    policyView: (query: PolicyViewParams, params: RequestParams = {}) =>
      this.request<FleetRolePolicy>({
        path: `/policy`,
        method: 'GET',
        ...params,
      }),

    /**
     * Update the top-level IAM policy
     */
    policyUpdate: (
      query: PolicyUpdateParams,
      body: FleetRolePolicy,
      params: RequestParams = {}
    ) =>
      this.request<FleetRolePolicy>({
        path: `/policy`,
        method: 'PUT',
        body,
        ...params,
      }),

    /**
     * List the built-in roles
     */
    roleList: (query: RoleListParams, params: RequestParams = {}) =>
      this.request<RoleResultsPage>({
        path: `/roles`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * Fetch a specific built-in role
     */
    roleView: ({ roleName }: RoleViewParams, params: RequestParams = {}) =>
      this.request<Role>({
        path: `/roles/${roleName}`,
        method: 'GET',
        ...params,
      }),

    /**
     * List all sagas (for debugging)
     */
    sagaList: (query: SagaListParams, params: RequestParams = {}) =>
      this.request<SagaResultsPage>({
        path: `/sagas`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * Fetch information about a single saga (for debugging)
     */
    sagaView: ({ sagaId }: SagaViewParams, params: RequestParams = {}) =>
      this.request<Saga>({
        path: `/sagas/${sagaId}`,
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
     * List the current user's SSH public keys
     */
    sessionSshkeyList: (query: SessionSshkeyListParams, params: RequestParams = {}) =>
      this.request<SshKeyResultsPage>({
        path: `/session/me/sshkeys`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * Create a new SSH public key for the current user
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
     * Get (by name) an SSH public key belonging to the current user
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
     * Delete (by name) an SSH public key belonging to the current user
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

    siloList: (query: SiloListParams, params: RequestParams = {}) =>
      this.request<SiloResultsPage>({
        path: `/silos`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * Create a new silo.
     */
    siloCreate: (query: SiloCreateParams, body: SiloCreate, params: RequestParams = {}) =>
      this.request<Silo>({
        path: `/silos`,
        method: 'POST',
        body,
        ...params,
      }),

    /**
     * Fetch a specific silo
     */
    siloView: ({ siloName }: SiloViewParams, params: RequestParams = {}) =>
      this.request<Silo>({
        path: `/silos/${siloName}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Delete a specific silo.
     */
    siloDelete: ({ siloName }: SiloDeleteParams, params: RequestParams = {}) =>
      this.request<void>({
        path: `/silos/${siloName}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * List Silo identity providers
     */
    siloIdentityProviderList: (
      { siloName, ...query }: SiloIdentityProviderListParams,
      params: RequestParams = {}
    ) =>
      this.request<IdentityProviderResultsPage>({
        path: `/silos/${siloName}/identity-providers`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * Fetch the IAM policy for this Silo
     */
    siloPolicyView: ({ siloName }: SiloPolicyViewParams, params: RequestParams = {}) =>
      this.request<SiloRolePolicy>({
        path: `/silos/${siloName}/policy`,
        method: 'GET',
        ...params,
      }),

    /**
     * Update the IAM policy for this Silo
     */
    siloPolicyUpdate: (
      { siloName }: SiloPolicyUpdateParams,
      body: SiloRolePolicy,
      params: RequestParams = {}
    ) =>
      this.request<SiloRolePolicy>({
        path: `/silos/${siloName}/policy`,
        method: 'PUT',
        body,
        ...params,
      }),

    /**
     * Create a new SAML identity provider for a silo.
     */
    siloIdentityProviderCreate: (
      { siloName }: SiloIdentityProviderCreateParams,
      body: SamlIdentityProviderCreate,
      params: RequestParams = {}
    ) =>
      this.request<SamlIdentityProvider>({
        path: `/silos/${siloName}/saml-identity-providers`,
        method: 'POST',
        body,
        ...params,
      }),

    /**
     * GET a silo's SAML identity provider
     */
    siloIdentityProviderView: (
      { providerName, siloName }: SiloIdentityProviderViewParams,
      params: RequestParams = {}
    ) =>
      this.request<SamlIdentityProvider>({
        path: `/silos/${siloName}/saml-identity-providers/${providerName}`,
        method: 'GET',
        ...params,
      }),

    /**
     * List the built-in system users
     */
    systemUserList: (query: SystemUserListParams, params: RequestParams = {}) =>
      this.request<UserBuiltinResultsPage>({
        path: `/system/user`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * Fetch a specific built-in system user
     */
    systemUserView: ({ userName }: SystemUserViewParams, params: RequestParams = {}) =>
      this.request<UserBuiltin>({
        path: `/system/user/${userName}`,
        method: 'GET',
        ...params,
      }),

    /**
     * List all timeseries schema
     */
    timeseriesSchemaGet: (query: TimeseriesSchemaGetParams, params: RequestParams = {}) =>
      this.request<TimeseriesSchemaResultsPage>({
        path: `/timeseries/schema`,
        method: 'GET',
        query,
        ...params,
      }),

    /**
     * Refresh update metadata
     */
    updatesRefresh: (query: UpdatesRefreshParams, params: RequestParams = {}) =>
      this.request<void>({
        path: `/updates/refresh`,
        method: 'POST',
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
