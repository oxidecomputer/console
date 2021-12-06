/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/**
* A count of bytes, typically used either for memory or storage capacity

The maximum supported byte count is [`i64::MAX`].  This makes it somewhat inconvenient to define constructors: a u32 constructor can be infallible, but an i64 constructor can fail (if the value is negative) and a u64 constructor can fail (if the value is larger than i64::MAX).  We provide all of these for consumers' convenience.
* @format uint64
* @min 0
*/
export type ByteCount = number

/**
 * Client view of an [`Disk`]
 */
export interface Disk {
  /** human-readable free-form text about a resource */
  description: string
  devicePath: string

  /**
   * unique, immutable, system-controlled identifier for each resource
   * @format uuid
   */
  id: string

  /** unique, mutable, user-controlled identifier for each resource */
  name: Name

  /** @format uuid */
  projectId: string

  /**
   * A count of bytes, typically used either for memory or storage capacity
   *
   * The maximum supported byte count is [`i64::MAX`].  This makes it somewhat inconvenient to define constructors: a u32 constructor can be infallible, but an i64 constructor can fail (if the value is negative) and a u64 constructor can fail (if the value is larger than i64::MAX).  We provide all of these for consumers' convenience.
   */
  size: ByteCount

  /** @format uuid */
  snapshotId?: string | null

  /** State of a Disk (primarily: attached or not) */
  state: DiskState

  /**
   * timestamp when this resource was created
   * @format date-time
   */
  timeCreated: string

  /**
   * timestamp when this resource was last modified
   * @format date-time
   */
  timeModified: string
}

/**
 * Describes a Disk's attachment to an Instance
 */
export interface DiskAttachment {
  /** @format uuid */
  diskId: string

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  diskName: Name

  /** State of a Disk (primarily: attached or not) */
  diskState: DiskState

  /** @format uuid */
  instanceId: string
}

/**
 * Create-time parameters for a [`Disk`]
 */
export interface DiskCreate {
  description: string

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  name: Name

  /** size of the Disk */
  size: ByteCount

  /**
   * id for snapshot from which the Disk should be created, if any
   * @format uuid
   */
  snapshotId?: string | null
}

/**
 * A single page of results
 */
export interface DiskResultsPage {
  /** list of items on this page of results */
  items: Disk[]

  /** token used to fetch the next page of results (if any) */
  next_page?: string | null
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
 * Identity-related metadata that's included in nearly all public API objects
 */
export interface IdentityMetadata {
  /** human-readable free-form text about a resource */
  description: string

  /**
   * unique, immutable, system-controlled identifier for each resource
   * @format uuid
   */
  id: string

  /** unique, mutable, user-controlled identifier for each resource */
  name: Name

  /**
   * timestamp when this resource was created
   * @format date-time
   */
  timeCreated: string

  /**
   * timestamp when this resource was last modified
   * @format date-time
   */
  timeModified: string
}

/**
 * Client view of an [`Instance`]
 */
export interface Instance {
  /** human-readable free-form text about a resource */
  description: string

  /** RFC1035-compliant hostname for the Instance. */
  hostname: string

  /**
   * unique, immutable, system-controlled identifier for each resource
   * @format uuid
   */
  id: string

  /** memory allocated for this Instance */
  memory: ByteCount

  /** unique, mutable, user-controlled identifier for each resource */
  name: Name

  /** number of CPUs allocated for this Instance */
  ncpus: InstanceCpuCount

  /**
   * id for the project containing this Instance
   * @format uuid
   */
  projectId: string

  /**
   * Running state of an Instance (primarily: booted or stopped)
   *
   * This typically reflects whether it's starting, running, stopping, or stopped, but also includes states related to the Instance's lifecycle
   */
  runState: InstanceState

  /**
   * timestamp when this resource was created
   * @format date-time
   */
  timeCreated: string

  /**
   * timestamp when this resource was last modified
   * @format date-time
   */
  timeModified: string

  /** @format date-time */
  timeRunStateUpdated: string
}

/**
 * The number of CPUs in an Instance
 * @format uint16
 * @min 0
 */
export type InstanceCpuCount = number

/**
 * Create-time parameters for an [`Instance`]
 */
export interface InstanceCreate {
  description: string
  hostname: string

  /**
   * A count of bytes, typically used either for memory or storage capacity
   *
   * The maximum supported byte count is [`i64::MAX`].  This makes it somewhat inconvenient to define constructors: a u32 constructor can be infallible, but an i64 constructor can fail (if the value is negative) and a u64 constructor can fail (if the value is larger than i64::MAX).  We provide all of these for consumers' convenience.
   */
  memory: ByteCount

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  name: Name

  /** The number of CPUs in an Instance */
  ncpus: InstanceCpuCount
}

/**
 * A single page of results
 */
export interface InstanceResultsPage {
  /** list of items on this page of results */
  items: Instance[]

  /** token used to fetch the next page of results (if any) */
  next_page?: string | null
}

/**
* Running state of an Instance (primarily: booted or stopped)

This typically reflects whether it's starting, running, stopping, or stopped, but also includes states related to the Instance's lifecycle
*/
export enum InstanceState {
  Creating = 'creating',
  Starting = 'starting',
  Running = 'running',
  Stopping = 'stopping',
  Stopped = 'stopped',
  Rebooting = 'rebooting',
  Repairing = 'repairing',
  Failed = 'failed',
  Destroyed = 'destroyed',
}

/**
 * An IPv4 subnet, including prefix and subnet mask
 * @pattern ^(10\.(25[0-5]|[1-2][0-4][0-9]|[1-9][0-9]|[0-9]\.){2}(25[0-5]|[1-2][0-4][0-9]|[1-9][0-9]|[0-9])/(1[0-9]|2[0-8]|[8-9]))$^(172\.16\.(25[0-5]|[1-2][0-4][0-9]|[1-9][0-9]|[0-9])\.(25[0-5]|[1-2][0-4][0-9]|[1-9][0-9]|[0-9])/(1[2-9]|2[0-8]))$^(192\.168\.(25[0-5]|[1-2][0-4][0-9]|[1-9][0-9]|[0-9])\.(25[0-5]|[1-2][0-4][0-9]|[1-9][0-9]|[0-9])/(1[6-9]|2[0-8]))$
 */
export type Ipv4Net = string

/**
 * An IPv6 subnet, including prefix and subnet mask
 * @pattern ^(fd|FD)00:((([0-9a-fA-F]{1,4}\:){6}[0-9a-fA-F]{1,4})|(([0-9a-fA-F]{1,4}:){1,6}:))/(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-6])$
 */
export type Ipv6Net = string

/**
 * An inclusive-inclusive range of IP ports. The second port may be omitted to represent a single port
 * @pattern ^[0-9]{1,5}(-[0-9]{1,5})?$
 */
export type L4PortRange = string

export interface LoginParams {
  username: string
}

/**
 * Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'.
 * @pattern [a-z](|[a-zA-Z0-9-]*[a-zA-Z0-9])
 */
export type Name = string

/**
 * Client view of an [`Organization`]
 */
export interface Organization {
  /** human-readable free-form text about a resource */
  description: string

  /**
   * unique, immutable, system-controlled identifier for each resource
   * @format uuid
   */
  id: string

  /** unique, mutable, user-controlled identifier for each resource */
  name: Name

  /**
   * timestamp when this resource was created
   * @format date-time
   */
  timeCreated: string

  /**
   * timestamp when this resource was last modified
   * @format date-time
   */
  timeModified: string
}

/**
 * Create-time parameters for an [`Organization`]
 */
export interface OrganizationCreate {
  description: string

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  name: Name
}

/**
 * A single page of results
 */
export interface OrganizationResultsPage {
  /** list of items on this page of results */
  items: Organization[]

  /** token used to fetch the next page of results (if any) */
  next_page?: string | null
}

/**
 * Updateable properties of an [`Organization`]
 */
export interface OrganizationUpdate {
  description?: string | null
  name?: Name | null
}

/**
 * Client view of a [`Project`]
 */
export interface Project {
  /** human-readable free-form text about a resource */
  description: string

  /**
   * unique, immutable, system-controlled identifier for each resource
   * @format uuid
   */
  id: string

  /** unique, mutable, user-controlled identifier for each resource */
  name: Name

  /** @format uuid */
  organizationId: string

  /**
   * timestamp when this resource was created
   * @format date-time
   */
  timeCreated: string

  /**
   * timestamp when this resource was last modified
   * @format date-time
   */
  timeModified: string
}

/**
 * Create-time parameters for an [`Project`]
 */
export interface ProjectCreate {
  description: string

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  name: Name
}

/**
 * A single page of results
 */
export interface ProjectResultsPage {
  /** list of items on this page of results */
  items: Project[]

  /** token used to fetch the next page of results (if any) */
  next_page?: string | null
}

/**
 * Updateable properties of an [`Project`]
 */
export interface ProjectUpdate {
  description?: string | null
  name?: Name | null
}

/**
 * Client view of an [`Rack`]
 */
export interface Rack {
  /** Identity-related metadata that's included in nearly all public API objects */
  identity: IdentityMetadata
}

/**
 * A single page of results
 */
export interface RackResultsPage {
  /** list of items on this page of results */
  items: Rack[]

  /** token used to fetch the next page of results (if any) */
  next_page?: string | null
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
  | { type: 'internetGateway'; value: Name }

/**
 * A route defines a rule that governs where traffic should be sent based on its destination.
 */
export interface RouterRoute {
  /** A subset of [`NetworkTarget`], `RouteDestination` specifies the kind of network traffic that will be matched to be forwarded to the [`RouteTarget`]. */
  destination: RouteDestination

  /** common identifying metadata */
  identity: IdentityMetadata

  /** Describes the kind of router. Set at creation. `read-only` */
  kind: RouterRouteKind

  /**
   * The VPC Router to which the route belongs.
   * @format uuid
   */
  router_id: string

  /** A subset of [`NetworkTarget`], `RouteTarget` specifies all possible targets that a route can forward to. */
  target: RouteTarget
}

/**
 * Create-time parameters for a [`RouterRoute`]
 */
export interface RouterRouteCreateParams {
  description: string

  /** A subset of [`NetworkTarget`], `RouteDestination` specifies the kind of network traffic that will be matched to be forwarded to the [`RouteTarget`]. */
  destination: RouteDestination

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  name: Name

  /** A subset of [`NetworkTarget`], `RouteTarget` specifies all possible targets that a route can forward to. */
  target: RouteTarget
}

/**
* The classification of a [`RouterRoute`] as defined by the system. The kind determines certain attributes such as if the route is modifiable and describes how or where the route was created.

See [RFD-21](https://rfd.shared.oxide.computer/rfd/0021#concept-router) for more context
*/
export enum RouterRouteKind {
  Default = 'Default',
  VpcSubnet = 'VpcSubnet',
  VpcPeering = 'VpcPeering',
  Custom = 'Custom',
}

/**
 * A single page of results
 */
export interface RouterRouteResultsPage {
  /** list of items on this page of results */
  items: RouterRoute[]

  /** token used to fetch the next page of results (if any) */
  next_page?: string | null
}

/**
 * Updateable properties of a [`RouterRoute`]
 */
export interface RouterRouteUpdateParams {
  description?: string | null

  /** A subset of [`NetworkTarget`], `RouteDestination` specifies the kind of network traffic that will be matched to be forwarded to the [`RouteTarget`]. */
  destination: RouteDestination
  name?: Name | null

  /** A subset of [`NetworkTarget`], `RouteTarget` specifies all possible targets that a route can forward to. */
  target: RouteTarget
}

export interface Saga {
  /** @format uuid */
  id: string
  state: SagaState
}

export type SagaErrorInfo =
  | { error: 'actionFailed'; source_error: any }
  | { error: 'deserializeFailed'; message: string }
  | { error: 'injectedError' }
  | { error: 'serializeFailed'; message: string }
  | { error: 'subsagaCreateFailed'; message: string }

/**
 * A single page of results
 */
export interface SagaResultsPage {
  /** list of items on this page of results */
  items: Saga[]

  /** token used to fetch the next page of results (if any) */
  next_page?: string | null
}

export type SagaState =
  | { state: 'running' }
  | { state: 'succeeded' }
  | { error_info: SagaErrorInfo; error_node_name: string; state: 'failed' }

/**
 * Client view of an [`Sled`]
 */
export interface Sled {
  /** human-readable free-form text about a resource */
  description: string

  /**
   * unique, immutable, system-controlled identifier for each resource
   * @format uuid
   */
  id: string

  /** unique, mutable, user-controlled identifier for each resource */
  name: Name
  serviceAddress: string

  /**
   * timestamp when this resource was created
   * @format date-time
   */
  timeCreated: string

  /**
   * timestamp when this resource was last modified
   * @format date-time
   */
  timeModified: string
}

/**
 * A single page of results
 */
export interface SledResultsPage {
  /** list of items on this page of results */
  items: Sled[]

  /** token used to fetch the next page of results (if any) */
  next_page?: string | null
}

/**
 * Client view of a [`Vpc`]
 */
export interface Vpc {
  /** human-readable free-form text about a resource */
  description: string

  /** The name used for the VPC in DNS. */
  dnsName: Name

  /**
   * unique, immutable, system-controlled identifier for each resource
   * @format uuid
   */
  id: string

  /** unique, mutable, user-controlled identifier for each resource */
  name: Name

  /**
   * id for the project containing this VPC
   * @format uuid
   */
  projectId: string

  /**
   * id for the system router where subnet default routes are registered
   * @format uuid
   */
  systemRouterId: string

  /**
   * timestamp when this resource was created
   * @format date-time
   */
  timeCreated: string

  /**
   * timestamp when this resource was last modified
   * @format date-time
   */
  timeModified: string
}

/**
 * Create-time parameters for a [`Vpc`]
 */
export interface VpcCreate {
  description: string

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  dnsName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  name: Name
}

/**
 * A single rule in a VPC firewall
 */
export interface VpcFirewallRule {
  /** whether traffic matching the rule should be allowed or dropped */
  action: VpcFirewallRuleAction

  /** whether this rule is for incoming or outgoing traffic */
  direction: VpcFirewallRuleDirection

  /** reductions on the scope of the rule */
  filters: VpcFirewallRuleFilter

  /** common identifying metadata */
  identity: IdentityMetadata

  /**
   * the relative priority of this rule
   * @format uint16
   * @min 0
   */
  priority: number

  /** whether this rule is in effect */
  status: VpcFirewallRuleStatus

  /** list of sets of instances that the rule applies to */
  targets: VpcFirewallRuleTarget[]
}

export enum VpcFirewallRuleAction {
  Allow = 'allow',
  Deny = 'deny',
}

export enum VpcFirewallRuleDirection {
  Inbound = 'inbound',
  Outbound = 'outbound',
}

/**
 * Filter for a firewall rule. A given packet must match every field that is present for the rule to apply to it. A packet matches a field if any entry in that field matches the packet.
 */
export interface VpcFirewallRuleFilter {
  /** If present, the sources (if incoming) or destinations (if outgoing) this rule applies to. */
  hosts?: VpcFirewallRuleHostFilter[] | null

  /** If present, the destination ports this rule applies to. */
  ports?: L4PortRange[] | null

  /** If present, the networking protocols this rule applies to. */
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
  | { type: 'internetGateway'; value: Name }

/**
 * The protocols that may be specified in a firewall rule's filter
 */
export enum VpcFirewallRuleProtocol {
  TCP = 'TCP',
  UDP = 'UDP',
  ICMP = 'ICMP',
}

/**
 * A single page of results
 */
export interface VpcFirewallRuleResultsPage {
  /** list of items on this page of results */
  items: VpcFirewallRule[]

  /** token used to fetch the next page of results (if any) */
  next_page?: string | null
}

export enum VpcFirewallRuleStatus {
  Disabled = 'disabled',
  Enabled = 'enabled',
}

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
export interface VpcFirewallRuleUpdate {
  /** whether traffic matching the rule should be allowed or dropped */
  action: VpcFirewallRuleAction

  /** human-readable free-form text about a resource */
  description: string

  /** whether this rule is for incoming or outgoing traffic */
  direction: VpcFirewallRuleDirection

  /** reductions on the scope of the rule */
  filters: VpcFirewallRuleFilter

  /**
   * the relative priority of this rule
   * @format uint16
   * @min 0
   */
  priority: number

  /** whether this rule is in effect */
  status: VpcFirewallRuleStatus

  /** list of sets of instances that the rule applies to */
  targets: VpcFirewallRuleTarget[]
}

/**
 * Updateable properties of a [`Vpc`]'s firewall Note that VpcFirewallRules are implicitly created along with a Vpc, so there is no explicit creation.
 */
export type VpcFirewallRuleUpdateParams = Record<string, VpcFirewallRuleUpdate>

/**
 * Response to an update replacing [`Vpc`]'s firewall
 */
export type VpcFirewallRuleUpdateResult = Record<string, VpcFirewallRule>

/**
 * A single page of results
 */
export interface VpcResultsPage {
  /** list of items on this page of results */
  items: Vpc[]

  /** token used to fetch the next page of results (if any) */
  next_page?: string | null
}

/**
 * A VPC router defines a series of rules that indicate where traffic should be sent depending on its destination.
 */
export interface VpcRouter {
  /** common identifying metadata */
  identity: IdentityMetadata
  kind: VpcRouterKind

  /**
   * The VPC to which the router belongs.
   * @format uuid
   */
  vpc_id: string
}

/**
 * Create-time parameters for a [`VpcRouter`]
 */
export interface VpcRouterCreate {
  description: string

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  name: Name
}

export enum VpcRouterKind {
  System = 'system',
  Custom = 'custom',
}

/**
 * A single page of results
 */
export interface VpcRouterResultsPage {
  /** list of items on this page of results */
  items: VpcRouter[]

  /** token used to fetch the next page of results (if any) */
  next_page?: string | null
}

/**
 * Updateable properties of a [`VpcRouter`]
 */
export interface VpcRouterUpdate {
  description?: string | null
  name?: Name | null
}

/**
 * A VPC subnet represents a logical grouping for instances that allows network traffic between them, within a IPv4 subnetwork or optionall an IPv6 subnetwork.
 */
export interface VpcSubnet {
  /** common identifying metadata */
  identity: IdentityMetadata

  /** The IPv4 subnet CIDR block. */
  ipv4_block?: Ipv4Net | null

  /** The IPv6 subnet CIDR block. */
  ipv6_block?: Ipv6Net | null

  /**
   * The VPC to which the subnet belongs.
   * @format uuid
   */
  vpc_id: string
}

/**
 * Create-time parameters for a [`VpcSubnet`]
 */
export interface VpcSubnetCreate {
  description: string
  ipv4Block?: Ipv4Net | null
  ipv6Block?: Ipv6Net | null

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  name: Name
}

/**
 * A single page of results
 */
export interface VpcSubnetResultsPage {
  /** list of items on this page of results */
  items: VpcSubnet[]

  /** token used to fetch the next page of results (if any) */
  next_page?: string | null
}

/**
 * Updateable properties of a [`VpcSubnet`]
 */
export interface VpcSubnetUpdate {
  description?: string | null
  ipv4Block?: Ipv4Net | null
  ipv6Block?: Ipv6Net | null
  name?: Name | null
}

/**
 * Updateable properties of a [`Vpc`]
 */
export interface VpcUpdate {
  description?: string | null
  dnsName?: Name | null
  name?: Name | null
}

/**
* Supported set of sort modes for scanning by id only.

Currently, we only support scanning in ascending order.
*/
export enum IdSortMode {
  IdAscending = 'id-ascending',
}

/**
 * Supported set of sort modes for scanning by name or id
 */
export enum NameOrIdSortMode {
  NameAscending = 'name-ascending',
  NameDescending = 'name-descending',
  IdAscending = 'id-ascending',
}

/**
* Supported set of sort modes for scanning by name only

Currently, we only support scanning in ascending order.
*/
export enum NameSortMode {
  NameAscending = 'name-ascending',
}

export interface HardwareRacksGetParams {
  /**
   * Maximum number of items returned by a single call
   * @format uint32
   * @min 1
   */
  limit?: number | null

  /** Token returned by previous call to retreive the subsequent page */
  page_token?: string | null

  /**
   * Supported set of sort modes for scanning by id only.
   *
   * Currently, we only support scanning in ascending order.
   */
  sort_by?: IdSortMode
}

export interface HardwareRacksGetRackParams {
  /**
   * The rack's unique ID.
   * @format uuid
   */
  rackId: string
}

export interface HardwareSledsGetParams {
  /**
   * Maximum number of items returned by a single call
   * @format uint32
   * @min 1
   */
  limit?: number | null

  /** Token returned by previous call to retreive the subsequent page */
  page_token?: string | null

  /**
   * Supported set of sort modes for scanning by id only.
   *
   * Currently, we only support scanning in ascending order.
   */
  sort_by?: IdSortMode
}

export interface HardwareSledsGetSledParams {
  /**
   * The sled's unique ID.
   * @format uuid
   */
  sledId: string
}

export type SpoofLoginParams = object

export type LogoutParams = object

export interface OrganizationsGetParams {
  /**
   * Maximum number of items returned by a single call
   * @format uint32
   * @min 1
   */
  limit?: number | null

  /** Token returned by previous call to retreive the subsequent page */
  page_token?: string | null

  /** Supported set of sort modes for scanning by name or id */
  sort_by?: NameOrIdSortMode
}

export type OrganizationsPostParams = object

export interface OrganizationsGetOrganizationParams {
  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name
}

export interface OrganizationsPutOrganizationParams {
  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name
}

export interface OrganizationsDeleteOrganizationParams {
  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name
}

export interface OrganizationProjectsGetParams {
  /**
   * Maximum number of items returned by a single call
   * @format uint32
   * @min 1
   */
  limit?: number | null

  /** Token returned by previous call to retreive the subsequent page */
  page_token?: string | null

  /** Supported set of sort modes for scanning by name or id */
  sort_by?: NameOrIdSortMode

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name
}

export interface OrganizationProjectsPostParams {
  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name
}

export interface OrganizationProjectsGetProjectParams {
  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  projectName: Name
}

export interface OrganizationProjectsPutProjectParams {
  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  projectName: Name
}

export interface OrganizationProjectsDeleteProjectParams {
  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  projectName: Name
}

export interface ProjectDisksGetParams {
  /**
   * Maximum number of items returned by a single call
   * @format uint32
   * @min 1
   */
  limit?: number | null

  /** Token returned by previous call to retreive the subsequent page */
  page_token?: string | null

  /**
   * Supported set of sort modes for scanning by name only
   *
   * Currently, we only support scanning in ascending order.
   */
  sort_by?: NameSortMode

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  projectName: Name
}

export interface ProjectDisksPostParams {
  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  projectName: Name
}

export interface ProjectDisksGetDiskParams {
  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  diskName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  projectName: Name
}

export interface ProjectDisksDeleteDiskParams {
  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  diskName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  projectName: Name
}

export interface ProjectInstancesGetParams {
  /**
   * Maximum number of items returned by a single call
   * @format uint32
   * @min 1
   */
  limit?: number | null

  /** Token returned by previous call to retreive the subsequent page */
  page_token?: string | null

  /**
   * Supported set of sort modes for scanning by name only
   *
   * Currently, we only support scanning in ascending order.
   */
  sort_by?: NameSortMode

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  projectName: Name
}

export interface ProjectInstancesPostParams {
  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  projectName: Name
}

export interface ProjectInstancesGetInstanceParams {
  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  instanceName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  projectName: Name
}

export interface ProjectInstancesDeleteInstanceParams {
  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  instanceName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  projectName: Name
}

export interface InstanceDisksGetParams {
  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  instanceName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  projectName: Name
}

export interface InstanceDisksGetDiskParams {
  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  diskName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  instanceName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  projectName: Name
}

export interface InstanceDisksPutDiskParams {
  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  diskName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  instanceName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  projectName: Name
}

export interface InstanceDisksDeleteDiskParams {
  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  diskName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  instanceName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  projectName: Name
}

export interface ProjectInstancesInstanceRebootParams {
  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  instanceName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  projectName: Name
}

export interface ProjectInstancesInstanceStartParams {
  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  instanceName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  projectName: Name
}

export interface ProjectInstancesInstanceStopParams {
  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  instanceName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  projectName: Name
}

export interface ProjectVpcsGetParams {
  /**
   * Maximum number of items returned by a single call
   * @format uint32
   * @min 1
   */
  limit?: number | null

  /** Token returned by previous call to retreive the subsequent page */
  page_token?: string | null

  /**
   * Supported set of sort modes for scanning by name only
   *
   * Currently, we only support scanning in ascending order.
   */
  sort_by?: NameSortMode

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  projectName: Name
}

export interface ProjectVpcsPostParams {
  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  projectName: Name
}

export interface ProjectVpcsGetVpcParams {
  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  projectName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  vpcName: Name
}

export interface ProjectVpcsPutVpcParams {
  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  projectName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  vpcName: Name
}

export interface ProjectVpcsDeleteVpcParams {
  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  projectName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  vpcName: Name
}

export interface VpcFirewallRulesGetParams {
  /**
   * Maximum number of items returned by a single call
   * @format uint32
   * @min 1
   */
  limit?: number | null

  /** Token returned by previous call to retreive the subsequent page */
  page_token?: string | null

  /**
   * Supported set of sort modes for scanning by name only
   *
   * Currently, we only support scanning in ascending order.
   */
  sort_by?: NameSortMode

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  projectName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  vpcName: Name
}

export interface VpcFirewallRulesPutParams {
  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  projectName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  vpcName: Name
}

export interface VpcRoutersGetParams {
  /**
   * Maximum number of items returned by a single call
   * @format uint32
   * @min 1
   */
  limit?: number | null

  /** Token returned by previous call to retreive the subsequent page */
  page_token?: string | null

  /**
   * Supported set of sort modes for scanning by name only
   *
   * Currently, we only support scanning in ascending order.
   */
  sort_by?: NameSortMode

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  projectName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  vpcName: Name
}

export interface VpcRoutersPostParams {
  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  projectName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  vpcName: Name
}

export interface VpcRoutersGetRouterParams {
  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  projectName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  routerName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  vpcName: Name
}

export interface VpcRoutersPutRouterParams {
  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  projectName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  routerName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  vpcName: Name
}

export interface VpcRoutersDeleteRouterParams {
  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  projectName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  routerName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  vpcName: Name
}

export interface RoutersRoutesGetParams {
  /**
   * Maximum number of items returned by a single call
   * @format uint32
   * @min 1
   */
  limit?: number | null

  /** Token returned by previous call to retreive the subsequent page */
  page_token?: string | null

  /**
   * Supported set of sort modes for scanning by name only
   *
   * Currently, we only support scanning in ascending order.
   */
  sort_by?: NameSortMode

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  projectName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  routerName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  vpcName: Name
}

export interface RoutersRoutesPostParams {
  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  projectName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  routerName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  vpcName: Name
}

export interface RoutersRoutesGetRouteParams {
  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  projectName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  routeName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  routerName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  vpcName: Name
}

export interface RoutersRoutesPutRouteParams {
  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  projectName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  routeName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  routerName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  vpcName: Name
}

export interface RoutersRoutesDeleteRouteParams {
  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  projectName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  routeName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  routerName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  vpcName: Name
}

export interface VpcSubnetsGetParams {
  /**
   * Maximum number of items returned by a single call
   * @format uint32
   * @min 1
   */
  limit?: number | null

  /** Token returned by previous call to retreive the subsequent page */
  page_token?: string | null

  /**
   * Supported set of sort modes for scanning by name only
   *
   * Currently, we only support scanning in ascending order.
   */
  sort_by?: NameSortMode

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  projectName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  vpcName: Name
}

export interface VpcSubnetsPostParams {
  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  projectName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  vpcName: Name
}

export interface VpcSubnetsGetSubnetParams {
  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  projectName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  subnetName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  vpcName: Name
}

export interface VpcSubnetsPutSubnetParams {
  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  projectName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  subnetName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  vpcName: Name
}

export interface VpcSubnetsDeleteSubnetParams {
  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  organizationName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  projectName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  subnetName: Name

  /** Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. */
  vpcName: Name
}

export interface SagasGetParams {
  /**
   * Maximum number of items returned by a single call
   * @format uint32
   * @min 1
   */
  limit?: number | null

  /** Token returned by previous call to retreive the subsequent page */
  page_token?: string | null

  /**
   * Supported set of sort modes for scanning by id only.
   *
   * Currently, we only support scanning in ascending order.
   */
  sort_by?: IdSortMode
}

export interface SagasGetSagaParams {
  /** @format uuid */
  sagaId: string
}

export type QueryParamsType = Record<string | number, any>
export type ResponseFormat = keyof Omit<Body, 'body' | 'bodyUsed'>

export interface FullRequestParams extends Omit<RequestInit, 'body'> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean
  /** request path */
  path: string
  /** content type of request body */
  type?: ContentType
  /** query params */
  query?: QueryParamsType
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat
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

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string
  baseApiParams?: Omit<RequestParams, 'baseUrl' | 'cancelToken' | 'signal'>
  securityWorker?: (
    securityData: SecurityDataType | null
  ) => Promise<RequestParams | void> | RequestParams | void
  customFetch?: typeof fetch
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D
  error: E
}

type CancelToken = Symbol | string | number

export enum ContentType {
  Json = 'application/json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = ''
  private securityData: SecurityDataType | null = null
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker']
  private abortControllers = new Map<CancelToken, AbortController>()
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams)

  private baseApiParams: RequestParams = {
    credentials: 'same-origin',
    headers: {},
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
  }

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig)
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data
  }

  private encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key)
    return `${encodedKey}=${encodeURIComponent(
      typeof value === 'number' ? value : `${value}`
    )}`
  }

  private addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key])
  }

  private addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key]
    return value.map((v: any) => this.encodeQueryParam(key, v)).join('&')
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {}
    const keys = Object.keys(query).filter(
      (key) => 'undefined' !== typeof query[key]
    )
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key)
      )
      .join('&')
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery)
    return queryString ? `?${queryString}` : ''
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === 'object' || typeof input === 'string')
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key]
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === 'object' && property !== null
            ? JSON.stringify(property)
            : `${property}`
        )
        return formData
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  }

  private mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
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
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {}
    const requestParams = this.mergeRequestParams(params, secureParams)
    const queryString = query && this.toQueryString(query)
    const payloadFormatter = this.contentFormatters[type || ContentType.Json]
    const responseFormat = format || requestParams.format

    return this.customFetch(
      `${baseUrl || this.baseUrl || ''}${path}${
        queryString ? `?${queryString}` : ''
      }`,
      {
        ...requestParams,
        headers: {
          ...(type && type !== ContentType.FormData
            ? { 'Content-Type': type }
            : {}),
          ...(requestParams.headers || {}),
        },
        signal: cancelToken ? this.createAbortSignal(cancelToken) : void 0,
        body:
          typeof body === 'undefined' || body === null
            ? null
            : payloadFormatter(body),
      }
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>
      r.data = null as unknown as T
      r.error = null as unknown as E

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data
              } else {
                r.error = data
              }
              return r
            })
            .catch((e) => {
              r.error = e
              return r
            })

      if (cancelToken) {
        this.abortControllers.delete(cancelToken)
      }

      if (!response.ok) throw data
      return data
    })
  }
}

/**
 * @title Oxide Region API
 * @version 0.0.1
 * @contact <api@oxide.computer> (https://oxide.computer)
 *
 * API for interacting with the Oxide control plane
 */
export class Api<
  SecurityDataType extends unknown
> extends HttpClient<SecurityDataType> {
  methods = {
    /**
     * @description List racks in the system.
     *
     * @name HardwareRacksGet
     * @request GET:/hardware/racks
     */
    hardwareRacksGet: (
      query: HardwareRacksGetParams,
      params: RequestParams = {}
    ) =>
      this.request<RackResultsPage, any>({
        path: `/hardware/racks`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Fetch information about a particular rack.
     *
     * @name HardwareRacksGetRack
     * @request GET:/hardware/racks/{rack_id}
     */
    hardwareRacksGetRack: (
      { rackId }: HardwareRacksGetRackParams,
      params: RequestParams = {}
    ) =>
      this.request<Rack, any>({
        path: `/hardware/racks/${rackId}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description List sleds in the system.
     *
     * @name HardwareSledsGet
     * @request GET:/hardware/sleds
     */
    hardwareSledsGet: (
      query: HardwareSledsGetParams,
      params: RequestParams = {}
    ) =>
      this.request<SledResultsPage, any>({
        path: `/hardware/sleds`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Fetch information about a sled in the system.
     *
     * @name HardwareSledsGetSled
     * @request GET:/hardware/sleds/{sled_id}
     */
    hardwareSledsGetSled: (
      { sledId }: HardwareSledsGetSledParams,
      params: RequestParams = {}
    ) =>
      this.request<Sled, any>({
        path: `/hardware/sleds/${sledId}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @name SpoofLogin
     * @request POST:/login
     */
    spoofLogin: (
      query: SpoofLoginParams,
      data: LoginParams,
      params: RequestParams = {}
    ) =>
      this.request<any, any>({
        path: `/login`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @name Logout
     * @request POST:/logout
     */
    logout: (query: LogoutParams, params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/logout`,
        method: 'POST',
        ...params,
      }),

    /**
     * @description List all organizations.
     *
     * @name OrganizationsGet
     * @request GET:/organizations
     */
    organizationsGet: (
      query: OrganizationsGetParams,
      params: RequestParams = {}
    ) =>
      this.request<OrganizationResultsPage, any>({
        path: `/organizations`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create a new organization.
     *
     * @name OrganizationsPost
     * @request POST:/organizations
     */
    organizationsPost: (
      query: OrganizationsPostParams,
      data: OrganizationCreate,
      params: RequestParams = {}
    ) =>
      this.request<Organization, any>({
        path: `/organizations`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Fetch a specific organization
     *
     * @name OrganizationsGetOrganization
     * @request GET:/organizations/{organization_name}
     */
    organizationsGetOrganization: (
      { organizationName }: OrganizationsGetOrganizationParams,
      params: RequestParams = {}
    ) =>
      this.request<Organization, any>({
        path: `/organizations/${organizationName}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Update a specific organization. * TODO-correctness: Is it valid for PUT to accept application/json that's a subset of what the resource actually represents?  If not, is that a problem? (HTTP may require that this be idempotent.)  If so, can we get around that having this be a slightly different content-type (e.g., "application/json-patch")?  We should see what other APIs do.
     *
     * @name OrganizationsPutOrganization
     * @request PUT:/organizations/{organization_name}
     */
    organizationsPutOrganization: (
      { organizationName }: OrganizationsPutOrganizationParams,
      data: OrganizationUpdate,
      params: RequestParams = {}
    ) =>
      this.request<Organization, any>({
        path: `/organizations/${organizationName}`,
        method: 'PUT',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Delete a specific organization.
     *
     * @name OrganizationsDeleteOrganization
     * @request DELETE:/organizations/{organization_name}
     */
    organizationsDeleteOrganization: (
      { organizationName }: OrganizationsDeleteOrganizationParams,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/organizations/${organizationName}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * @description List all projects.
     *
     * @name OrganizationProjectsGet
     * @request GET:/organizations/{organization_name}/projects
     */
    organizationProjectsGet: (
      { organizationName, ...query }: OrganizationProjectsGetParams,
      params: RequestParams = {}
    ) =>
      this.request<ProjectResultsPage, any>({
        path: `/organizations/${organizationName}/projects`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create a new project.
     *
     * @name OrganizationProjectsPost
     * @request POST:/organizations/{organization_name}/projects
     */
    organizationProjectsPost: (
      { organizationName }: OrganizationProjectsPostParams,
      data: ProjectCreate,
      params: RequestParams = {}
    ) =>
      this.request<Project, any>({
        path: `/organizations/${organizationName}/projects`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Fetch a specific project
     *
     * @name OrganizationProjectsGetProject
     * @request GET:/organizations/{organization_name}/projects/{project_name}
     */
    organizationProjectsGetProject: (
      { organizationName, projectName }: OrganizationProjectsGetProjectParams,
      params: RequestParams = {}
    ) =>
      this.request<Project, any>({
        path: `/organizations/${organizationName}/projects/${projectName}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Update a specific project. * TODO-correctness: Is it valid for PUT to accept application/json that's a subset of what the resource actually represents?  If not, is that a problem? (HTTP may require that this be idempotent.)  If so, can we get around that having this be a slightly different content-type (e.g., "application/json-patch")?  We should see what other APIs do.
     *
     * @name OrganizationProjectsPutProject
     * @request PUT:/organizations/{organization_name}/projects/{project_name}
     */
    organizationProjectsPutProject: (
      { organizationName, projectName }: OrganizationProjectsPutProjectParams,
      data: ProjectUpdate,
      params: RequestParams = {}
    ) =>
      this.request<Project, any>({
        path: `/organizations/${organizationName}/projects/${projectName}`,
        method: 'PUT',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Delete a specific project.
     *
     * @name OrganizationProjectsDeleteProject
     * @request DELETE:/organizations/{organization_name}/projects/{project_name}
     */
    organizationProjectsDeleteProject: (
      {
        organizationName,
        projectName,
      }: OrganizationProjectsDeleteProjectParams,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/organizations/${organizationName}/projects/${projectName}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * @description List disks in a project.
     *
     * @name ProjectDisksGet
     * @request GET:/organizations/{organization_name}/projects/{project_name}/disks
     */
    projectDisksGet: (
      { organizationName, projectName, ...query }: ProjectDisksGetParams,
      params: RequestParams = {}
    ) =>
      this.request<DiskResultsPage, any>({
        path: `/organizations/${organizationName}/projects/${projectName}/disks`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create a disk in a project. * TODO-correctness See note about instance create.  This should be async.
     *
     * @name ProjectDisksPost
     * @request POST:/organizations/{organization_name}/projects/{project_name}/disks
     */
    projectDisksPost: (
      { organizationName, projectName }: ProjectDisksPostParams,
      data: DiskCreate,
      params: RequestParams = {}
    ) =>
      this.request<Disk, any>({
        path: `/organizations/${organizationName}/projects/${projectName}/disks`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Fetch a single disk in a project.
     *
     * @name ProjectDisksGetDisk
     * @request GET:/organizations/{organization_name}/projects/{project_name}/disks/{disk_name}
     */
    projectDisksGetDisk: (
      { diskName, organizationName, projectName }: ProjectDisksGetDiskParams,
      params: RequestParams = {}
    ) =>
      this.request<Disk, any>({
        path: `/organizations/${organizationName}/projects/${projectName}/disks/${diskName}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Delete a disk from a project.
     *
     * @name ProjectDisksDeleteDisk
     * @request DELETE:/organizations/{organization_name}/projects/{project_name}/disks/{disk_name}
     */
    projectDisksDeleteDisk: (
      { diskName, organizationName, projectName }: ProjectDisksDeleteDiskParams,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/organizations/${organizationName}/projects/${projectName}/disks/${diskName}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * @description List instances in a project.
     *
     * @name ProjectInstancesGet
     * @request GET:/organizations/{organization_name}/projects/{project_name}/instances
     */
    projectInstancesGet: (
      { organizationName, projectName, ...query }: ProjectInstancesGetParams,
      params: RequestParams = {}
    ) =>
      this.request<InstanceResultsPage, any>({
        path: `/organizations/${organizationName}/projects/${projectName}/instances`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create an instance in a project. * TODO-correctness This is supposed to be async.  Is that right?  We can create the instance immediately -- it's just not booted yet.  Maybe the boot operation is what's a separate operation_id.  What about the response code (201 Created vs 202 Accepted)?  Is that orthogonal?  Things can return a useful response, including an operation id, with either response code.  Maybe a "reboot" operation would return a 202 Accepted because there's no actual resource created?
     *
     * @name ProjectInstancesPost
     * @request POST:/organizations/{organization_name}/projects/{project_name}/instances
     */
    projectInstancesPost: (
      { organizationName, projectName }: ProjectInstancesPostParams,
      data: InstanceCreate,
      params: RequestParams = {}
    ) =>
      this.request<Instance, any>({
        path: `/organizations/${organizationName}/projects/${projectName}/instances`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get an instance in a project.
     *
     * @name ProjectInstancesGetInstance
     * @request GET:/organizations/{organization_name}/projects/{project_name}/instances/{instance_name}
     */
    projectInstancesGetInstance: (
      {
        instanceName,
        organizationName,
        projectName,
      }: ProjectInstancesGetInstanceParams,
      params: RequestParams = {}
    ) =>
      this.request<Instance, any>({
        path: `/organizations/${organizationName}/projects/${projectName}/instances/${instanceName}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Delete an instance from a project.
     *
     * @name ProjectInstancesDeleteInstance
     * @request DELETE:/organizations/{organization_name}/projects/{project_name}/instances/{instance_name}
     */
    projectInstancesDeleteInstance: (
      {
        instanceName,
        organizationName,
        projectName,
      }: ProjectInstancesDeleteInstanceParams,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/organizations/${organizationName}/projects/${projectName}/instances/${instanceName}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * @description List disks attached to this instance.
     *
     * @name InstanceDisksGet
     * @request GET:/organizations/{organization_name}/projects/{project_name}/instances/{instance_name}/disks
     */
    instanceDisksGet: (
      { instanceName, organizationName, projectName }: InstanceDisksGetParams,
      params: RequestParams = {}
    ) =>
      this.request<DiskAttachment[], any>({
        path: `/organizations/${organizationName}/projects/${projectName}/instances/${instanceName}/disks`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Fetch a description of the attachment of this disk to this instance.
     *
     * @name InstanceDisksGetDisk
     * @request GET:/organizations/{organization_name}/projects/{project_name}/instances/{instance_name}/disks/{disk_name}
     */
    instanceDisksGetDisk: (
      {
        diskName,
        instanceName,
        organizationName,
        projectName,
      }: InstanceDisksGetDiskParams,
      params: RequestParams = {}
    ) =>
      this.request<DiskAttachment, any>({
        path: `/organizations/${organizationName}/projects/${projectName}/instances/${instanceName}/disks/${diskName}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Attach a disk to this instance.
     *
     * @name InstanceDisksPutDisk
     * @request PUT:/organizations/{organization_name}/projects/{project_name}/instances/{instance_name}/disks/{disk_name}
     */
    instanceDisksPutDisk: (
      {
        diskName,
        instanceName,
        organizationName,
        projectName,
      }: InstanceDisksPutDiskParams,
      params: RequestParams = {}
    ) =>
      this.request<DiskAttachment, any>({
        path: `/organizations/${organizationName}/projects/${projectName}/instances/${instanceName}/disks/${diskName}`,
        method: 'PUT',
        format: 'json',
        ...params,
      }),

    /**
     * @description Detach a disk from this instance.
     *
     * @name InstanceDisksDeleteDisk
     * @request DELETE:/organizations/{organization_name}/projects/{project_name}/instances/{instance_name}/disks/{disk_name}
     */
    instanceDisksDeleteDisk: (
      {
        diskName,
        instanceName,
        organizationName,
        projectName,
      }: InstanceDisksDeleteDiskParams,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/organizations/${organizationName}/projects/${projectName}/instances/${instanceName}/disks/${diskName}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * @description Reboot an instance.
     *
     * @name ProjectInstancesInstanceReboot
     * @request POST:/organizations/{organization_name}/projects/{project_name}/instances/{instance_name}/reboot
     */
    projectInstancesInstanceReboot: (
      {
        instanceName,
        organizationName,
        projectName,
      }: ProjectInstancesInstanceRebootParams,
      params: RequestParams = {}
    ) =>
      this.request<Instance, any>({
        path: `/organizations/${organizationName}/projects/${projectName}/instances/${instanceName}/reboot`,
        method: 'POST',
        format: 'json',
        ...params,
      }),

    /**
     * @description Boot an instance.
     *
     * @name ProjectInstancesInstanceStart
     * @request POST:/organizations/{organization_name}/projects/{project_name}/instances/{instance_name}/start
     */
    projectInstancesInstanceStart: (
      {
        instanceName,
        organizationName,
        projectName,
      }: ProjectInstancesInstanceStartParams,
      params: RequestParams = {}
    ) =>
      this.request<Instance, any>({
        path: `/organizations/${organizationName}/projects/${projectName}/instances/${instanceName}/start`,
        method: 'POST',
        format: 'json',
        ...params,
      }),

    /**
     * @description Halt an instance.
     *
     * @name ProjectInstancesInstanceStop
     * @request POST:/organizations/{organization_name}/projects/{project_name}/instances/{instance_name}/stop
     */
    projectInstancesInstanceStop: (
      {
        instanceName,
        organizationName,
        projectName,
      }: ProjectInstancesInstanceStopParams,
      params: RequestParams = {}
    ) =>
      this.request<Instance, any>({
        path: `/organizations/${organizationName}/projects/${projectName}/instances/${instanceName}/stop`,
        method: 'POST',
        format: 'json',
        ...params,
      }),

    /**
     * @description List VPCs in a project.
     *
     * @name ProjectVpcsGet
     * @request GET:/organizations/{organization_name}/projects/{project_name}/vpcs
     */
    projectVpcsGet: (
      { organizationName, projectName, ...query }: ProjectVpcsGetParams,
      params: RequestParams = {}
    ) =>
      this.request<VpcResultsPage, any>({
        path: `/organizations/${organizationName}/projects/${projectName}/vpcs`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create a VPC in a project.
     *
     * @name ProjectVpcsPost
     * @request POST:/organizations/{organization_name}/projects/{project_name}/vpcs
     */
    projectVpcsPost: (
      { organizationName, projectName }: ProjectVpcsPostParams,
      data: VpcCreate,
      params: RequestParams = {}
    ) =>
      this.request<Vpc, any>({
        path: `/organizations/${organizationName}/projects/${projectName}/vpcs`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get a VPC in a project.
     *
     * @name ProjectVpcsGetVpc
     * @request GET:/organizations/{organization_name}/projects/{project_name}/vpcs/{vpc_name}
     */
    projectVpcsGetVpc: (
      { organizationName, projectName, vpcName }: ProjectVpcsGetVpcParams,
      params: RequestParams = {}
    ) =>
      this.request<Vpc, any>({
        path: `/organizations/${organizationName}/projects/${projectName}/vpcs/${vpcName}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Update a VPC.
     *
     * @name ProjectVpcsPutVpc
     * @request PUT:/organizations/{organization_name}/projects/{project_name}/vpcs/{vpc_name}
     */
    projectVpcsPutVpc: (
      { organizationName, projectName, vpcName }: ProjectVpcsPutVpcParams,
      data: VpcUpdate,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/organizations/${organizationName}/projects/${projectName}/vpcs/${vpcName}`,
        method: 'PUT',
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Delete a vpc from a project.
     *
     * @name ProjectVpcsDeleteVpc
     * @request DELETE:/organizations/{organization_name}/projects/{project_name}/vpcs/{vpc_name}
     */
    projectVpcsDeleteVpc: (
      { organizationName, projectName, vpcName }: ProjectVpcsDeleteVpcParams,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/organizations/${organizationName}/projects/${projectName}/vpcs/${vpcName}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * @description List firewall rules for a VPC.
     *
     * @name VpcFirewallRulesGet
     * @request GET:/organizations/{organization_name}/projects/{project_name}/vpcs/{vpc_name}/firewall/rules
     */
    vpcFirewallRulesGet: (
      {
        organizationName,
        projectName,
        vpcName,
        ...query
      }: VpcFirewallRulesGetParams,
      params: RequestParams = {}
    ) =>
      this.request<VpcFirewallRuleResultsPage, any>({
        path: `/organizations/${organizationName}/projects/${projectName}/vpcs/${vpcName}/firewall/rules`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Replace the firewall rules for a VPC
     *
     * @name VpcFirewallRulesPut
     * @request PUT:/organizations/{organization_name}/projects/{project_name}/vpcs/{vpc_name}/firewall/rules
     */
    vpcFirewallRulesPut: (
      { organizationName, projectName, vpcName }: VpcFirewallRulesPutParams,
      data: VpcFirewallRuleUpdateParams,
      params: RequestParams = {}
    ) =>
      this.request<VpcFirewallRuleUpdateResult, any>({
        path: `/organizations/${organizationName}/projects/${projectName}/vpcs/${vpcName}/firewall/rules`,
        method: 'PUT',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description List VPC Custom and System Routers
     *
     * @name VpcRoutersGet
     * @request GET:/organizations/{organization_name}/projects/{project_name}/vpcs/{vpc_name}/routers
     */
    vpcRoutersGet: (
      { organizationName, projectName, vpcName, ...query }: VpcRoutersGetParams,
      params: RequestParams = {}
    ) =>
      this.request<VpcRouterResultsPage, any>({
        path: `/organizations/${organizationName}/projects/${projectName}/vpcs/${vpcName}/routers`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create a VPC Router
     *
     * @name VpcRoutersPost
     * @request POST:/organizations/{organization_name}/projects/{project_name}/vpcs/{vpc_name}/routers
     */
    vpcRoutersPost: (
      { organizationName, projectName, vpcName }: VpcRoutersPostParams,
      data: VpcRouterCreate,
      params: RequestParams = {}
    ) =>
      this.request<VpcRouter, any>({
        path: `/organizations/${organizationName}/projects/${projectName}/vpcs/${vpcName}/routers`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get a VPC Router
     *
     * @name VpcRoutersGetRouter
     * @request GET:/organizations/{organization_name}/projects/{project_name}/vpcs/{vpc_name}/routers/{router_name}
     */
    vpcRoutersGetRouter: (
      {
        organizationName,
        projectName,
        routerName,
        vpcName,
      }: VpcRoutersGetRouterParams,
      params: RequestParams = {}
    ) =>
      this.request<VpcRouter, any>({
        path: `/organizations/${organizationName}/projects/${projectName}/vpcs/${vpcName}/routers/${routerName}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Update a VPC Router
     *
     * @name VpcRoutersPutRouter
     * @request PUT:/organizations/{organization_name}/projects/{project_name}/vpcs/{vpc_name}/routers/{router_name}
     */
    vpcRoutersPutRouter: (
      {
        organizationName,
        projectName,
        routerName,
        vpcName,
      }: VpcRoutersPutRouterParams,
      data: VpcRouterUpdate,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/organizations/${organizationName}/projects/${projectName}/vpcs/${vpcName}/routers/${routerName}`,
        method: 'PUT',
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Delete a router from its VPC
     *
     * @name VpcRoutersDeleteRouter
     * @request DELETE:/organizations/{organization_name}/projects/{project_name}/vpcs/{vpc_name}/routers/{router_name}
     */
    vpcRoutersDeleteRouter: (
      {
        organizationName,
        projectName,
        routerName,
        vpcName,
      }: VpcRoutersDeleteRouterParams,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/organizations/${organizationName}/projects/${projectName}/vpcs/${vpcName}/routers/${routerName}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * @description List a Router's routes
     *
     * @name RoutersRoutesGet
     * @request GET:/organizations/{organization_name}/projects/{project_name}/vpcs/{vpc_name}/routers/{router_name}/routes
     */
    routersRoutesGet: (
      {
        organizationName,
        projectName,
        routerName,
        vpcName,
        ...query
      }: RoutersRoutesGetParams,
      params: RequestParams = {}
    ) =>
      this.request<RouterRouteResultsPage, any>({
        path: `/organizations/${organizationName}/projects/${projectName}/vpcs/${vpcName}/routers/${routerName}/routes`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create a VPC Router
     *
     * @name RoutersRoutesPost
     * @request POST:/organizations/{organization_name}/projects/{project_name}/vpcs/{vpc_name}/routers/{router_name}/routes
     */
    routersRoutesPost: (
      {
        organizationName,
        projectName,
        routerName,
        vpcName,
      }: RoutersRoutesPostParams,
      data: RouterRouteCreateParams,
      params: RequestParams = {}
    ) =>
      this.request<RouterRoute, any>({
        path: `/organizations/${organizationName}/projects/${projectName}/vpcs/${vpcName}/routers/${routerName}/routes`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get a VPC Router route
     *
     * @name RoutersRoutesGetRoute
     * @request GET:/organizations/{organization_name}/projects/{project_name}/vpcs/{vpc_name}/routers/{router_name}/routes/{route_name}
     */
    routersRoutesGetRoute: (
      {
        organizationName,
        projectName,
        routeName,
        routerName,
        vpcName,
      }: RoutersRoutesGetRouteParams,
      params: RequestParams = {}
    ) =>
      this.request<RouterRoute, any>({
        path: `/organizations/${organizationName}/projects/${projectName}/vpcs/${vpcName}/routers/${routerName}/routes/${routeName}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Update a Router route
     *
     * @name RoutersRoutesPutRoute
     * @request PUT:/organizations/{organization_name}/projects/{project_name}/vpcs/{vpc_name}/routers/{router_name}/routes/{route_name}
     */
    routersRoutesPutRoute: (
      {
        organizationName,
        projectName,
        routeName,
        routerName,
        vpcName,
      }: RoutersRoutesPutRouteParams,
      data: RouterRouteUpdateParams,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/organizations/${organizationName}/projects/${projectName}/vpcs/${vpcName}/routers/${routerName}/routes/${routeName}`,
        method: 'PUT',
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Delete a route from its router
     *
     * @name RoutersRoutesDeleteRoute
     * @request DELETE:/organizations/{organization_name}/projects/{project_name}/vpcs/{vpc_name}/routers/{router_name}/routes/{route_name}
     */
    routersRoutesDeleteRoute: (
      {
        organizationName,
        projectName,
        routeName,
        routerName,
        vpcName,
      }: RoutersRoutesDeleteRouteParams,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/organizations/${organizationName}/projects/${projectName}/vpcs/${vpcName}/routers/${routerName}/routes/${routeName}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * @description List subnets in a VPC.
     *
     * @name VpcSubnetsGet
     * @request GET:/organizations/{organization_name}/projects/{project_name}/vpcs/{vpc_name}/subnets
     */
    vpcSubnetsGet: (
      { organizationName, projectName, vpcName, ...query }: VpcSubnetsGetParams,
      params: RequestParams = {}
    ) =>
      this.request<VpcSubnetResultsPage, any>({
        path: `/organizations/${organizationName}/projects/${projectName}/vpcs/${vpcName}/subnets`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create a subnet in a VPC.
     *
     * @name VpcSubnetsPost
     * @request POST:/organizations/{organization_name}/projects/{project_name}/vpcs/{vpc_name}/subnets
     */
    vpcSubnetsPost: (
      { organizationName, projectName, vpcName }: VpcSubnetsPostParams,
      data: VpcSubnetCreate,
      params: RequestParams = {}
    ) =>
      this.request<VpcSubnet, any>({
        path: `/organizations/${organizationName}/projects/${projectName}/vpcs/${vpcName}/subnets`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get subnet in a VPC.
     *
     * @name VpcSubnetsGetSubnet
     * @request GET:/organizations/{organization_name}/projects/{project_name}/vpcs/{vpc_name}/subnets/{subnet_name}
     */
    vpcSubnetsGetSubnet: (
      {
        organizationName,
        projectName,
        subnetName,
        vpcName,
      }: VpcSubnetsGetSubnetParams,
      params: RequestParams = {}
    ) =>
      this.request<VpcSubnet, any>({
        path: `/organizations/${organizationName}/projects/${projectName}/vpcs/${vpcName}/subnets/${subnetName}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Update a VPC Subnet.
     *
     * @name VpcSubnetsPutSubnet
     * @request PUT:/organizations/{organization_name}/projects/{project_name}/vpcs/{vpc_name}/subnets/{subnet_name}
     */
    vpcSubnetsPutSubnet: (
      {
        organizationName,
        projectName,
        subnetName,
        vpcName,
      }: VpcSubnetsPutSubnetParams,
      data: VpcSubnetUpdate,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/organizations/${organizationName}/projects/${projectName}/vpcs/${vpcName}/subnets/${subnetName}`,
        method: 'PUT',
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Delete a subnet from a VPC.
     *
     * @name VpcSubnetsDeleteSubnet
     * @request DELETE:/organizations/{organization_name}/projects/{project_name}/vpcs/{vpc_name}/subnets/{subnet_name}
     */
    vpcSubnetsDeleteSubnet: (
      {
        organizationName,
        projectName,
        subnetName,
        vpcName,
      }: VpcSubnetsDeleteSubnetParams,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/organizations/${organizationName}/projects/${projectName}/vpcs/${vpcName}/subnets/${subnetName}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * @description List all sagas (for debugging)
     *
     * @name SagasGet
     * @request GET:/sagas
     */
    sagasGet: (query: SagasGetParams, params: RequestParams = {}) =>
      this.request<SagaResultsPage, any>({
        path: `/sagas`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Fetch information about a single saga (for debugging)
     *
     * @name SagasGetSaga
     * @request GET:/sagas/{saga_id}
     */
    sagasGetSaga: (
      { sagaId }: SagasGetSagaParams,
      params: RequestParams = {}
    ) =>
      this.request<Saga, any>({
        path: `/sagas/${sagaId}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),
  }
}
