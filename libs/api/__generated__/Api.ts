/* eslint-disable */

/**
 * A count of bytes, typically used either for memory or storage capacity
 *
 * The maximum supported byte count is [`i64::MAX`].  This makes it somewhat inconvenient to define constructors: a u32 constructor can be infallible, but an i64 constructor can fail (if the value is negative) and a u64 constructor can fail (if the value is larger than i64::MAX).  We provide all of these for consumers' convenience.
 */
export type ByteCount = number

/**
 * The type of an individual datum of a metric.
 */
export type DatumType =
  | 'Bool'
  | 'I64'
  | 'F64'
  | 'String'
  | 'Bytes'
  | 'CumulativeI64'
  | 'CumulativeF64'
  | 'HistogramI64'
  | 'HistogramF64'

/**
 * Client view of an [`Disk`]
 */
export type Disk = {
  /**
   * human-readable free-form text about a resource
   */
  description: string
  devicePath: string
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
 * Create-time parameters for a [`Disk`](omicron_common::api::external::Disk)
 */
export type DiskCreate = {
  description: string
  name: Name
  /**
   * size of the Disk
   */
  size: ByteCount
  /**
   * id for snapshot from which the Disk should be created, if any
   */
  snapshotId?: string | null
}

/**
 * Parameters for the [`Disk`](omicron_common::api::external::Disk) to be attached or detached to an instance
 */
export type DiskIdentifier = {
  disk: Name
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
export type FieldSource = 'Target' | 'Metric'

/**
 * The `FieldType` identifies the data type of a target or metric field.
 */
export type FieldType = 'String' | 'I64' | 'IpAddr' | 'Uuid' | 'Bool'

/**
 * Client view of an [`Instance`]
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
 * Create-time parameters for an [`Instance`](omicron_common::api::external::Instance)
 */
export type InstanceCreate = {
  description: string
  hostname: string
  memory: ByteCount
  name: Name
  ncpus: InstanceCpuCount
}

/**
 * Migration parameters for an [`Instance`](omicron_common::api::external::Instance)
 */
export type InstanceMigrate = {
  dstSledUuid: string
}

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

/**
 * An IPv4 subnet, including prefix and subnet mask
 */
export type Ipv4Net = string

/** Regex pattern for validating Ipv4Net */
export const ipv4NetPattern =
  '^(10.(25[0-5]|[1-2][0-4][0-9]|[1-9][0-9]|[0-9].){2}(25[0-5]|[1-2][0-4][0-9]|[1-9][0-9]|[0-9])/(1[0-9]|2[0-8]|[8-9]))$^(172.16.(25[0-5]|[1-2][0-4][0-9]|[1-9][0-9]|[0-9]).(25[0-5]|[1-2][0-4][0-9]|[1-9][0-9]|[0-9])/(1[2-9]|2[0-8]))$^(192.168.(25[0-5]|[1-2][0-4][0-9]|[1-9][0-9]|[0-9]).(25[0-5]|[1-2][0-4][0-9]|[1-9][0-9]|[0-9])/(1[6-9]|2[0-8]))$'

/**
 * An IPv6 subnet, including prefix and subnet mask
 */
export type Ipv6Net = string

/** Regex pattern for validating Ipv6Net */
export const ipv6NetPattern =
  '^(fd|FD)[0-9a-fA-F]{2}:((([0-9a-fA-F]{1,4}:){6}[0-9a-fA-F]{1,4})|(([0-9a-fA-F]{1,4}:){1,6}:))/(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-6])$'

/**
 * An inclusive-inclusive range of IP ports. The second port may be omitted to represent a single port
 */
export type L4PortRange = string

/** Regex pattern for validating L4PortRange */
export const l4PortRangePattern = '^[0-9]{1,5}(-[0-9]{1,5})?$'

export type LoginParams = {
  username: string
}

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
export const namePattern = '[a-z](|[a-zA-Z0-9-]*[a-zA-Z0-9])'

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
 * Client view of an [`Organization`]
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
 * Create-time parameters for an [`Organization`](crate::external_api::views::Organization)
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

/**
 * Updateable properties of an [`Organization`](crate::external_api::views::Organization)
 */
export type OrganizationUpdate = {
  description?: string | null
  name?: Name | null
}

/**
 * Client view of a [`Project`]
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
 * Create-time parameters for a [`Project`](crate::external_api::views::Project)
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

/**
 * Updateable properties of a [`Project`](crate::external_api::views::Project)
 */
export type ProjectUpdate = {
  description?: string | null
  name?: Name | null
}

/**
 * Client view of an [`Rack`]
 */
export type Rack = {
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
 * Client view of a [`Role`]
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
 * A subset of [`NetworkTarget`], `RouteDestination` specifies the kind of network traffic that will be matched to be forwarded to the [`RouteTarget`].
 */
export type RouteDestination =
  | { type: 'ip'; value: string }
  | { type: 'vpc'; value: Name }
  | { type: 'subnet'; value: Name }

/**
 * A subset of [`NetworkTarget`], `RouteTarget` specifies all possible targets that a route can forward to.
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
  /**
   * The VPC Router to which the route belongs.
   */
  routerId: string
  target: RouteTarget
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
 * Create-time parameters for a [`RouterRoute`]
 */
export type RouterRouteCreateParams = {
  description: string
  destination: RouteDestination
  name: Name
  target: RouteTarget
}

/**
 * The classification of a [`RouterRoute`] as defined by the system. The kind determines certain attributes such as if the route is modifiable and describes how or where the route was created.
 *
 * See [RFD-21](https://rfd.shared.oxide.computer/rfd/0021#concept-router) for more context
 */
export type RouterRouteKind =
  | 'default'
  | 'vpc_subnet'
  | 'vpc_peering'
  | 'custom'

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
 * Updateable properties of a [`RouterRoute`]
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
 * Client view of currently authed user.
 */
export type SessionUser = {
  id: string
}

/**
 * Client view of an [`Sled`]
 */
export type Sled = {
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
 * Client view of a [`User`]
 */
export type User = {
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
 * Client view of a [`Vpc`]
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
 * Create-time parameters for a [`Vpc`](crate::external_api::views::Vpc)
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
 * A subset of [`NetworkTarget`], `VpcFirewallRuleHostFilter` specifies all possible targets that a route can forward to.
 */
export type VpcFirewallRuleHostFilter =
  | { type: 'vpc'; value: Name }
  | { type: 'subnet'; value: Name }
  | { type: 'instance'; value: Name }
  | { type: 'ip'; value: string }
  | { type: 'internet_gateway'; value: Name }

/**
 * The protocols that may be specified in a firewall rule's filter
 */
export type VpcFirewallRuleProtocol = 'TCP' | 'UDP' | 'ICMP'

export type VpcFirewallRuleStatus = 'disabled' | 'enabled'

/**
 * A subset of [`NetworkTarget`], `VpcFirewallRuleTarget` specifies all possible targets that a firewall rule can be attached to.
 */
export type VpcFirewallRuleTarget =
  | { type: 'vpc'; value: Name }
  | { type: 'subnet'; value: Name }
  | { type: 'instance'; value: Name }

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
 * Collection of a [`Vpc`]'s firewall rules
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
 * Create-time parameters for a [`VpcRouter`](omicron_common::api::external::VpcRouter)
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
 * Updateable properties of a [`VpcRouter`](omicron_common::api::external::VpcRouter)
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
 * Create-time parameters for a [`VpcSubnet`](crate::external_api::views::VpcSubnet)
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
 * Updateable properties of a [`VpcSubnet`](crate::external_api::views::VpcSubnet)
 */
export type VpcSubnetUpdate = {
  description?: string | null
  ipv4Block?: Ipv4Net | null
  ipv6Block?: Ipv6Net | null
  name?: Name | null
}

/**
 * Updateable properties of a [`Vpc`](crate::external_api::views::Vpc)
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
export type IdSortMode = 'id-ascending'

/**
 * Supported set of sort modes for scanning by name or id
 */
export type NameOrIdSortMode =
  | 'name-ascending'
  | 'name-descending'
  | 'id-ascending'

/**
 * Supported set of sort modes for scanning by name only
 *
 * Currently, we only support scanning in ascending order.
 */
export type NameSortMode = 'name-ascending'

export interface HardwareRacksGetParams {
  limit?: number | null

  pageToken?: string | null

  sortBy?: IdSortMode
}

export interface HardwareRacksGetRackParams {
  rackId: string
}

export interface HardwareSledsGetParams {
  limit?: number | null

  pageToken?: string | null

  sortBy?: IdSortMode
}

export interface HardwareSledsGetSledParams {
  sledId: string
}

export interface SpoofLoginParams {}

export interface LogoutParams {}

export interface OrganizationsGetParams {
  limit?: number | null

  pageToken?: string | null

  sortBy?: NameOrIdSortMode
}

export interface OrganizationsPostParams {}

export interface OrganizationsGetOrganizationParams {
  orgName: Name
}

export interface OrganizationsPutOrganizationParams {
  orgName: Name
}

export interface OrganizationsDeleteOrganizationParams {
  orgName: Name
}

export interface OrganizationProjectsGetParams {
  limit?: number | null

  pageToken?: string | null

  sortBy?: NameOrIdSortMode

  orgName: Name
}

export interface OrganizationProjectsPostParams {
  orgName: Name
}

export interface OrganizationProjectsGetProjectParams {
  orgName: Name

  projectName: Name
}

export interface OrganizationProjectsPutProjectParams {
  orgName: Name

  projectName: Name
}

export interface OrganizationProjectsDeleteProjectParams {
  orgName: Name

  projectName: Name
}

export interface ProjectDisksGetParams {
  limit?: number | null

  pageToken?: string | null

  sortBy?: NameSortMode

  orgName: Name

  projectName: Name
}

export interface ProjectDisksPostParams {
  orgName: Name

  projectName: Name
}

export interface ProjectDisksGetDiskParams {
  diskName: Name

  orgName: Name

  projectName: Name
}

export interface ProjectDisksDeleteDiskParams {
  diskName: Name

  orgName: Name

  projectName: Name
}

export interface ProjectInstancesGetParams {
  limit?: number | null

  pageToken?: string | null

  sortBy?: NameSortMode

  orgName: Name

  projectName: Name
}

export interface ProjectInstancesPostParams {
  orgName: Name

  projectName: Name
}

export interface ProjectInstancesGetInstanceParams {
  instanceName: Name

  orgName: Name

  projectName: Name
}

export interface ProjectInstancesDeleteInstanceParams {
  instanceName: Name

  orgName: Name

  projectName: Name
}

export interface InstanceDisksGetParams {
  limit?: number | null

  pageToken?: string | null

  sortBy?: NameSortMode

  instanceName: Name

  orgName: Name

  projectName: Name
}

export interface InstanceDisksAttachParams {
  instanceName: Name

  orgName: Name

  projectName: Name
}

export interface InstanceDisksDetachParams {
  instanceName: Name

  orgName: Name

  projectName: Name
}

export interface ProjectInstancesMigrateInstanceParams {
  instanceName: Name

  orgName: Name

  projectName: Name
}

export interface ProjectInstancesInstanceRebootParams {
  instanceName: Name

  orgName: Name

  projectName: Name
}

export interface ProjectInstancesInstanceStartParams {
  instanceName: Name

  orgName: Name

  projectName: Name
}

export interface ProjectInstancesInstanceStopParams {
  instanceName: Name

  orgName: Name

  projectName: Name
}

export interface ProjectVpcsGetParams {
  limit?: number | null

  pageToken?: string | null

  sortBy?: NameSortMode

  orgName: Name

  projectName: Name
}

export interface ProjectVpcsPostParams {
  orgName: Name

  projectName: Name
}

export interface ProjectVpcsGetVpcParams {
  orgName: Name

  projectName: Name

  vpcName: Name
}

export interface ProjectVpcsPutVpcParams {
  orgName: Name

  projectName: Name

  vpcName: Name
}

export interface ProjectVpcsDeleteVpcParams {
  orgName: Name

  projectName: Name

  vpcName: Name
}

export interface VpcFirewallRulesGetParams {
  orgName: Name

  projectName: Name

  vpcName: Name
}

export interface VpcFirewallRulesPutParams {
  orgName: Name

  projectName: Name

  vpcName: Name
}

export interface VpcRoutersGetParams {
  limit?: number | null

  pageToken?: string | null

  sortBy?: NameSortMode

  orgName: Name

  projectName: Name

  vpcName: Name
}

export interface VpcRoutersPostParams {
  orgName: Name

  projectName: Name

  vpcName: Name
}

export interface VpcRoutersGetRouterParams {
  orgName: Name

  projectName: Name

  routerName: Name

  vpcName: Name
}

export interface VpcRoutersPutRouterParams {
  orgName: Name

  projectName: Name

  routerName: Name

  vpcName: Name
}

export interface VpcRoutersDeleteRouterParams {
  orgName: Name

  projectName: Name

  routerName: Name

  vpcName: Name
}

export interface RoutersRoutesGetParams {
  limit?: number | null

  pageToken?: string | null

  sortBy?: NameSortMode

  orgName: Name

  projectName: Name

  routerName: Name

  vpcName: Name
}

export interface RoutersRoutesPostParams {
  orgName: Name

  projectName: Name

  routerName: Name

  vpcName: Name
}

export interface RoutersRoutesGetRouteParams {
  orgName: Name

  projectName: Name

  routeName: Name

  routerName: Name

  vpcName: Name
}

export interface RoutersRoutesPutRouteParams {
  orgName: Name

  projectName: Name

  routeName: Name

  routerName: Name

  vpcName: Name
}

export interface RoutersRoutesDeleteRouteParams {
  orgName: Name

  projectName: Name

  routeName: Name

  routerName: Name

  vpcName: Name
}

export interface VpcSubnetsGetParams {
  limit?: number | null

  pageToken?: string | null

  sortBy?: NameSortMode

  orgName: Name

  projectName: Name

  vpcName: Name
}

export interface VpcSubnetsPostParams {
  orgName: Name

  projectName: Name

  vpcName: Name
}

export interface VpcSubnetsGetSubnetParams {
  orgName: Name

  projectName: Name

  subnetName: Name

  vpcName: Name
}

export interface VpcSubnetsPutSubnetParams {
  orgName: Name

  projectName: Name

  subnetName: Name

  vpcName: Name
}

export interface VpcSubnetsDeleteSubnetParams {
  orgName: Name

  projectName: Name

  subnetName: Name

  vpcName: Name
}

export interface SubnetsIpsGetParams {
  limit?: number | null

  pageToken?: string | null

  sortBy?: NameSortMode

  orgName: Name

  projectName: Name

  subnetName: Name

  vpcName: Name
}

export interface RolesGetParams {
  limit?: number | null

  pageToken?: string | null
}

export interface RolesGetRoleParams {
  roleName: string
}

export interface SagasGetParams {
  limit?: number | null

  pageToken?: string | null

  sortBy?: IdSortMode
}

export interface SagasGetSagaParams {
  sagaId: string
}

export interface SessionMeParams {}

export interface TimeseriesSchemaGetParams {
  limit?: number | null

  pageToken?: string | null
}

export interface UpdatesRefreshParams {}

export interface UsersGetParams {
  limit?: number | null

  pageToken?: string | null

  sortBy?: NameSortMode
}

export interface UsersGetUserParams {
  userName: Name
}

const camelToSnake = (s: string) =>
  s.replace(/[A-Z]/g, (l) => '_' + l.toLowerCase())

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

export type RequestParams = Omit<
  FullRequestParams,
  'body' | 'method' | 'query' | 'path'
>

export interface ApiConfig {
  baseUrl?: string
  baseApiParams?: Omit<RequestParams, 'baseUrl' | 'cancelToken' | 'signal'>
  customFetch?: typeof fetch
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D
  error: E
}

type CancelToken = Symbol | string | number

const encodeQueryParam = (key: string, value: any) =>
  `${encodeURIComponent(key)}=${encodeURIComponent(value)}`

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
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams)

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

  private createAbortSignal = (
    cancelToken: CancelToken
  ): AbortSignal | undefined => {
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

  public request = async <T = any, E = any>({
    body,
    path,
    query,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const requestParams = this.mergeRequestParams(params)
    const queryString = query && toQueryString(query)

    let url = baseUrl || this.baseUrl || ''
    url += path
    if (queryString) {
      url += '?' + queryString
    }

    return this.customFetch(url, {
      ...requestParams,
      headers: {
        'Content-Type': 'application/json',
        ...requestParams.headers,
      },
      signal: cancelToken ? this.createAbortSignal(cancelToken) : void 0,
      body: JSON.stringify(snakeify(body)),
    }).then(async (response) => {
      const r = response as HttpResponse<T, E>
      r.data = null as unknown as T
      r.error = null as unknown as E

      await response
        .json()
        .then(processResponseBody)
        .then((data) => {
          if (r.ok) {
            r.data = data as T
          } else {
            r.error = data as E
          }
        })
        .catch((e) => {
          r.error = e
        })

      if (cancelToken) {
        this.abortControllers.delete(cancelToken)
      }

      if (!r.ok) throw r
      return r
    })
  }
}

export class Api extends HttpClient {
  methods = {
    /**
     * List racks in the system.
     */
    hardwareRacksGet: (
      query: HardwareRacksGetParams,
      params: RequestParams = {}
    ) =>
      this.request<RackResultsPage, Error>({
        path: `/hardware/racks`,
        method: 'GET',
        query: query,
        ...params,
      }),

    /**
     * Fetch information about a particular rack.
     */
    hardwareRacksGetRack: (
      { rackId }: HardwareRacksGetRackParams,
      params: RequestParams = {}
    ) =>
      this.request<Rack, Error>({
        path: `/hardware/racks/${rackId}`,
        method: 'GET',
        ...params,
      }),

    /**
     * List sleds in the system.
     */
    hardwareSledsGet: (
      query: HardwareSledsGetParams,
      params: RequestParams = {}
    ) =>
      this.request<SledResultsPage, Error>({
        path: `/hardware/sleds`,
        method: 'GET',
        query: query,
        ...params,
      }),

    /**
     * Fetch information about a sled in the system.
     */
    hardwareSledsGetSled: (
      { sledId }: HardwareSledsGetSledParams,
      params: RequestParams = {}
    ) =>
      this.request<Sled, Error>({
        path: `/hardware/sleds/${sledId}`,
        method: 'GET',
        ...params,
      }),

    spoofLogin: (
      query: SpoofLoginParams,
      data: LoginParams,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/login`,
        method: 'POST',
        body: data,
        ...params,
      }),

    logout: (query: LogoutParams, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/logout`,
        method: 'POST',
        ...params,
      }),

    /**
     * List all organizations.
     */
    organizationsGet: (
      query: OrganizationsGetParams,
      params: RequestParams = {}
    ) =>
      this.request<OrganizationResultsPage, Error>({
        path: `/organizations`,
        method: 'GET',
        query: query,
        ...params,
      }),

    /**
     * Create a new organization.
     */
    organizationsPost: (
      query: OrganizationsPostParams,
      data: OrganizationCreate,
      params: RequestParams = {}
    ) =>
      this.request<Organization, Error>({
        path: `/organizations`,
        method: 'POST',
        body: data,
        ...params,
      }),

    /**
     * Fetch a specific organization
     */
    organizationsGetOrganization: (
      { orgName }: OrganizationsGetOrganizationParams,
      params: RequestParams = {}
    ) =>
      this.request<Organization, Error>({
        path: `/organizations/${orgName}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Update a specific organization.
     */
    organizationsPutOrganization: (
      { orgName }: OrganizationsPutOrganizationParams,
      data: OrganizationUpdate,
      params: RequestParams = {}
    ) =>
      this.request<Organization, Error>({
        path: `/organizations/${orgName}`,
        method: 'PUT',
        body: data,
        ...params,
      }),

    /**
     * Delete a specific organization.
     */
    organizationsDeleteOrganization: (
      { orgName }: OrganizationsDeleteOrganizationParams,
      params: RequestParams = {}
    ) =>
      this.request<void, Error>({
        path: `/organizations/${orgName}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * List all projects.
     */
    organizationProjectsGet: (
      { orgName, ...query }: OrganizationProjectsGetParams,
      params: RequestParams = {}
    ) =>
      this.request<ProjectResultsPage, Error>({
        path: `/organizations/${orgName}/projects`,
        method: 'GET',
        query: query,
        ...params,
      }),

    /**
     * Create a new project.
     */
    organizationProjectsPost: (
      { orgName }: OrganizationProjectsPostParams,
      data: ProjectCreate,
      params: RequestParams = {}
    ) =>
      this.request<Project, Error>({
        path: `/organizations/${orgName}/projects`,
        method: 'POST',
        body: data,
        ...params,
      }),

    /**
     * Fetch a specific project
     */
    organizationProjectsGetProject: (
      { orgName, projectName }: OrganizationProjectsGetProjectParams,
      params: RequestParams = {}
    ) =>
      this.request<Project, Error>({
        path: `/organizations/${orgName}/projects/${projectName}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Update a specific project.
     */
    organizationProjectsPutProject: (
      { orgName, projectName }: OrganizationProjectsPutProjectParams,
      data: ProjectUpdate,
      params: RequestParams = {}
    ) =>
      this.request<Project, Error>({
        path: `/organizations/${orgName}/projects/${projectName}`,
        method: 'PUT',
        body: data,
        ...params,
      }),

    /**
     * Delete a specific project.
     */
    organizationProjectsDeleteProject: (
      { orgName, projectName }: OrganizationProjectsDeleteProjectParams,
      params: RequestParams = {}
    ) =>
      this.request<void, Error>({
        path: `/organizations/${orgName}/projects/${projectName}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * List disks in a project.
     */
    projectDisksGet: (
      { orgName, projectName, ...query }: ProjectDisksGetParams,
      params: RequestParams = {}
    ) =>
      this.request<DiskResultsPage, Error>({
        path: `/organizations/${orgName}/projects/${projectName}/disks`,
        method: 'GET',
        query: query,
        ...params,
      }),

    /**
     * Create a disk in a project.
     */
    projectDisksPost: (
      { orgName, projectName }: ProjectDisksPostParams,
      data: DiskCreate,
      params: RequestParams = {}
    ) =>
      this.request<Disk, Error>({
        path: `/organizations/${orgName}/projects/${projectName}/disks`,
        method: 'POST',
        body: data,
        ...params,
      }),

    /**
     * Fetch a single disk in a project.
     */
    projectDisksGetDisk: (
      { diskName, orgName, projectName }: ProjectDisksGetDiskParams,
      params: RequestParams = {}
    ) =>
      this.request<Disk, Error>({
        path: `/organizations/${orgName}/projects/${projectName}/disks/${diskName}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Delete a disk from a project.
     */
    projectDisksDeleteDisk: (
      { diskName, orgName, projectName }: ProjectDisksDeleteDiskParams,
      params: RequestParams = {}
    ) =>
      this.request<void, Error>({
        path: `/organizations/${orgName}/projects/${projectName}/disks/${diskName}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * List instances in a project.
     */
    projectInstancesGet: (
      { orgName, projectName, ...query }: ProjectInstancesGetParams,
      params: RequestParams = {}
    ) =>
      this.request<InstanceResultsPage, Error>({
        path: `/organizations/${orgName}/projects/${projectName}/instances`,
        method: 'GET',
        query: query,
        ...params,
      }),

    /**
     * Create an instance in a project.
     */
    projectInstancesPost: (
      { orgName, projectName }: ProjectInstancesPostParams,
      data: InstanceCreate,
      params: RequestParams = {}
    ) =>
      this.request<Instance, Error>({
        path: `/organizations/${orgName}/projects/${projectName}/instances`,
        method: 'POST',
        body: data,
        ...params,
      }),

    /**
     * Get an instance in a project.
     */
    projectInstancesGetInstance: (
      { instanceName, orgName, projectName }: ProjectInstancesGetInstanceParams,
      params: RequestParams = {}
    ) =>
      this.request<Instance, Error>({
        path: `/organizations/${orgName}/projects/${projectName}/instances/${instanceName}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Delete an instance from a project.
     */
    projectInstancesDeleteInstance: (
      {
        instanceName,
        orgName,
        projectName,
      }: ProjectInstancesDeleteInstanceParams,
      params: RequestParams = {}
    ) =>
      this.request<void, Error>({
        path: `/organizations/${orgName}/projects/${projectName}/instances/${instanceName}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * List disks attached to this instance.
     */
    instanceDisksGet: (
      { instanceName, orgName, projectName, ...query }: InstanceDisksGetParams,
      params: RequestParams = {}
    ) =>
      this.request<DiskResultsPage, Error>({
        path: `/organizations/${orgName}/projects/${projectName}/instances/${instanceName}/disks`,
        method: 'GET',
        query: query,
        ...params,
      }),

    instanceDisksAttach: (
      { instanceName, orgName, projectName }: InstanceDisksAttachParams,
      data: DiskIdentifier,
      params: RequestParams = {}
    ) =>
      this.request<Disk, Error>({
        path: `/organizations/${orgName}/projects/${projectName}/instances/${instanceName}/disks/attach`,
        method: 'POST',
        body: data,
        ...params,
      }),

    instanceDisksDetach: (
      { instanceName, orgName, projectName }: InstanceDisksDetachParams,
      data: DiskIdentifier,
      params: RequestParams = {}
    ) =>
      this.request<Disk, Error>({
        path: `/organizations/${orgName}/projects/${projectName}/instances/${instanceName}/disks/detach`,
        method: 'POST',
        body: data,
        ...params,
      }),

    /**
     * Migrate an instance to a different propolis-server, possibly on a different sled.
     */
    projectInstancesMigrateInstance: (
      {
        instanceName,
        orgName,
        projectName,
      }: ProjectInstancesMigrateInstanceParams,
      data: InstanceMigrate,
      params: RequestParams = {}
    ) =>
      this.request<Instance, Error>({
        path: `/organizations/${orgName}/projects/${projectName}/instances/${instanceName}/migrate`,
        method: 'POST',
        body: data,
        ...params,
      }),

    /**
     * Reboot an instance.
     */
    projectInstancesInstanceReboot: (
      {
        instanceName,
        orgName,
        projectName,
      }: ProjectInstancesInstanceRebootParams,
      params: RequestParams = {}
    ) =>
      this.request<Instance, Error>({
        path: `/organizations/${orgName}/projects/${projectName}/instances/${instanceName}/reboot`,
        method: 'POST',
        ...params,
      }),

    /**
     * Boot an instance.
     */
    projectInstancesInstanceStart: (
      {
        instanceName,
        orgName,
        projectName,
      }: ProjectInstancesInstanceStartParams,
      params: RequestParams = {}
    ) =>
      this.request<Instance, Error>({
        path: `/organizations/${orgName}/projects/${projectName}/instances/${instanceName}/start`,
        method: 'POST',
        ...params,
      }),

    /**
     * Halt an instance.
     */
    projectInstancesInstanceStop: (
      {
        instanceName,
        orgName,
        projectName,
      }: ProjectInstancesInstanceStopParams,
      params: RequestParams = {}
    ) =>
      this.request<Instance, Error>({
        path: `/organizations/${orgName}/projects/${projectName}/instances/${instanceName}/stop`,
        method: 'POST',
        ...params,
      }),

    /**
     * List VPCs in a project.
     */
    projectVpcsGet: (
      { orgName, projectName, ...query }: ProjectVpcsGetParams,
      params: RequestParams = {}
    ) =>
      this.request<VpcResultsPage, Error>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs`,
        method: 'GET',
        query: query,
        ...params,
      }),

    /**
     * Create a VPC in a project.
     */
    projectVpcsPost: (
      { orgName, projectName }: ProjectVpcsPostParams,
      data: VpcCreate,
      params: RequestParams = {}
    ) =>
      this.request<Vpc, Error>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs`,
        method: 'POST',
        body: data,
        ...params,
      }),

    /**
     * Get a VPC in a project.
     */
    projectVpcsGetVpc: (
      { orgName, projectName, vpcName }: ProjectVpcsGetVpcParams,
      params: RequestParams = {}
    ) =>
      this.request<Vpc, Error>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Update a VPC.
     */
    projectVpcsPutVpc: (
      { orgName, projectName, vpcName }: ProjectVpcsPutVpcParams,
      data: VpcUpdate,
      params: RequestParams = {}
    ) =>
      this.request<void, Error>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}`,
        method: 'PUT',
        body: data,
        ...params,
      }),

    /**
     * Delete a vpc from a project.
     */
    projectVpcsDeleteVpc: (
      { orgName, projectName, vpcName }: ProjectVpcsDeleteVpcParams,
      params: RequestParams = {}
    ) =>
      this.request<void, Error>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * List firewall rules for a VPC.
     */
    vpcFirewallRulesGet: (
      { orgName, projectName, vpcName }: VpcFirewallRulesGetParams,
      params: RequestParams = {}
    ) =>
      this.request<VpcFirewallRules, Error>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/firewall/rules`,
        method: 'GET',
        ...params,
      }),

    /**
     * Replace the firewall rules for a VPC
     */
    vpcFirewallRulesPut: (
      { orgName, projectName, vpcName }: VpcFirewallRulesPutParams,
      data: VpcFirewallRuleUpdateParams,
      params: RequestParams = {}
    ) =>
      this.request<VpcFirewallRules, Error>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/firewall/rules`,
        method: 'PUT',
        body: data,
        ...params,
      }),

    /**
     * List VPC Custom and System Routers
     */
    vpcRoutersGet: (
      { orgName, projectName, vpcName, ...query }: VpcRoutersGetParams,
      params: RequestParams = {}
    ) =>
      this.request<VpcRouterResultsPage, Error>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/routers`,
        method: 'GET',
        query: query,
        ...params,
      }),

    /**
     * Create a VPC Router
     */
    vpcRoutersPost: (
      { orgName, projectName, vpcName }: VpcRoutersPostParams,
      data: VpcRouterCreate,
      params: RequestParams = {}
    ) =>
      this.request<VpcRouter, Error>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/routers`,
        method: 'POST',
        body: data,
        ...params,
      }),

    /**
     * Get a VPC Router
     */
    vpcRoutersGetRouter: (
      { orgName, projectName, routerName, vpcName }: VpcRoutersGetRouterParams,
      params: RequestParams = {}
    ) =>
      this.request<VpcRouter, Error>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/routers/${routerName}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Update a VPC Router
     */
    vpcRoutersPutRouter: (
      { orgName, projectName, routerName, vpcName }: VpcRoutersPutRouterParams,
      data: VpcRouterUpdate,
      params: RequestParams = {}
    ) =>
      this.request<void, Error>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/routers/${routerName}`,
        method: 'PUT',
        body: data,
        ...params,
      }),

    /**
     * Delete a router from its VPC
     */
    vpcRoutersDeleteRouter: (
      {
        orgName,
        projectName,
        routerName,
        vpcName,
      }: VpcRoutersDeleteRouterParams,
      params: RequestParams = {}
    ) =>
      this.request<void, Error>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/routers/${routerName}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * List a Router's routes
     */
    routersRoutesGet: (
      {
        orgName,
        projectName,
        routerName,
        vpcName,
        ...query
      }: RoutersRoutesGetParams,
      params: RequestParams = {}
    ) =>
      this.request<RouterRouteResultsPage, Error>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/routers/${routerName}/routes`,
        method: 'GET',
        query: query,
        ...params,
      }),

    /**
     * Create a VPC Router
     */
    routersRoutesPost: (
      { orgName, projectName, routerName, vpcName }: RoutersRoutesPostParams,
      data: RouterRouteCreateParams,
      params: RequestParams = {}
    ) =>
      this.request<RouterRoute, Error>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/routers/${routerName}/routes`,
        method: 'POST',
        body: data,
        ...params,
      }),

    /**
     * Get a VPC Router route
     */
    routersRoutesGetRoute: (
      {
        orgName,
        projectName,
        routeName,
        routerName,
        vpcName,
      }: RoutersRoutesGetRouteParams,
      params: RequestParams = {}
    ) =>
      this.request<RouterRoute, Error>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/routers/${routerName}/routes/${routeName}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Update a Router route
     */
    routersRoutesPutRoute: (
      {
        orgName,
        projectName,
        routeName,
        routerName,
        vpcName,
      }: RoutersRoutesPutRouteParams,
      data: RouterRouteUpdateParams,
      params: RequestParams = {}
    ) =>
      this.request<void, Error>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/routers/${routerName}/routes/${routeName}`,
        method: 'PUT',
        body: data,
        ...params,
      }),

    /**
     * Delete a route from its router
     */
    routersRoutesDeleteRoute: (
      {
        orgName,
        projectName,
        routeName,
        routerName,
        vpcName,
      }: RoutersRoutesDeleteRouteParams,
      params: RequestParams = {}
    ) =>
      this.request<void, Error>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/routers/${routerName}/routes/${routeName}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * List subnets in a VPC.
     */
    vpcSubnetsGet: (
      { orgName, projectName, vpcName, ...query }: VpcSubnetsGetParams,
      params: RequestParams = {}
    ) =>
      this.request<VpcSubnetResultsPage, Error>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/subnets`,
        method: 'GET',
        query: query,
        ...params,
      }),

    /**
     * Create a subnet in a VPC.
     */
    vpcSubnetsPost: (
      { orgName, projectName, vpcName }: VpcSubnetsPostParams,
      data: VpcSubnetCreate,
      params: RequestParams = {}
    ) =>
      this.request<VpcSubnet, Error>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/subnets`,
        method: 'POST',
        body: data,
        ...params,
      }),

    /**
     * Get subnet in a VPC.
     */
    vpcSubnetsGetSubnet: (
      { orgName, projectName, subnetName, vpcName }: VpcSubnetsGetSubnetParams,
      params: RequestParams = {}
    ) =>
      this.request<VpcSubnet, Error>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/subnets/${subnetName}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Update a VPC Subnet.
     */
    vpcSubnetsPutSubnet: (
      { orgName, projectName, subnetName, vpcName }: VpcSubnetsPutSubnetParams,
      data: VpcSubnetUpdate,
      params: RequestParams = {}
    ) =>
      this.request<void, Error>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/subnets/${subnetName}`,
        method: 'PUT',
        body: data,
        ...params,
      }),

    /**
     * Delete a subnet from a VPC.
     */
    vpcSubnetsDeleteSubnet: (
      {
        orgName,
        projectName,
        subnetName,
        vpcName,
      }: VpcSubnetsDeleteSubnetParams,
      params: RequestParams = {}
    ) =>
      this.request<void, Error>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/subnets/${subnetName}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * List IP addresses on a VPC subnet.
     */
    subnetsIpsGet: (
      {
        orgName,
        projectName,
        subnetName,
        vpcName,
        ...query
      }: SubnetsIpsGetParams,
      params: RequestParams = {}
    ) =>
      this.request<NetworkInterfaceResultsPage, Error>({
        path: `/organizations/${orgName}/projects/${projectName}/vpcs/${vpcName}/subnets/${subnetName}/ips`,
        method: 'GET',
        query: query,
        ...params,
      }),

    /**
     * List the built-in roles
     */
    rolesGet: (query: RolesGetParams, params: RequestParams = {}) =>
      this.request<RoleResultsPage, Error>({
        path: `/roles`,
        method: 'GET',
        query: query,
        ...params,
      }),

    /**
     * Fetch a specific built-in role
     */
    rolesGetRole: (
      { roleName }: RolesGetRoleParams,
      params: RequestParams = {}
    ) =>
      this.request<Role, Error>({
        path: `/roles/${roleName}`,
        method: 'GET',
        ...params,
      }),

    /**
     * List all sagas (for debugging)
     */
    sagasGet: (query: SagasGetParams, params: RequestParams = {}) =>
      this.request<SagaResultsPage, Error>({
        path: `/sagas`,
        method: 'GET',
        query: query,
        ...params,
      }),

    /**
     * Fetch information about a single saga (for debugging)
     */
    sagasGetSaga: (
      { sagaId }: SagasGetSagaParams,
      params: RequestParams = {}
    ) =>
      this.request<Saga, Error>({
        path: `/sagas/${sagaId}`,
        method: 'GET',
        ...params,
      }),

    /**
     * Fetch the user associated with the current session
     */
    sessionMe: (query: SessionMeParams, params: RequestParams = {}) =>
      this.request<SessionUser, Error>({
        path: `/session/me`,
        method: 'GET',
        ...params,
      }),

    /**
     * List all timeseries schema
     */
    timeseriesSchemaGet: (
      query: TimeseriesSchemaGetParams,
      params: RequestParams = {}
    ) =>
      this.request<TimeseriesSchemaResultsPage, Error>({
        path: `/timeseries/schema`,
        method: 'GET',
        query: query,
        ...params,
      }),

    /**
     * Refresh update metadata
     */
    updatesRefresh: (query: UpdatesRefreshParams, params: RequestParams = {}) =>
      this.request<void, Error>({
        path: `/updates/refresh`,
        method: 'POST',
        ...params,
      }),

    /**
     * List the built-in system users
     */
    usersGet: (query: UsersGetParams, params: RequestParams = {}) =>
      this.request<UserResultsPage, Error>({
        path: `/users`,
        method: 'GET',
        query: query,
        ...params,
      }),

    /**
     * Fetch a specific built-in system user
     */
    usersGetUser: (
      { userName }: UsersGetUserParams,
      params: RequestParams = {}
    ) =>
      this.request<User, Error>({
        path: `/users/${userName}`,
        method: 'GET',
        ...params,
      }),
  }
}
