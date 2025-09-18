/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

/* eslint-disable */

import { HttpClient, toQueryString, type FetchParams } from './http-client'

export type { ApiConfig, ApiResult, ErrorBody, ErrorResult } from './http-client'

/**
 * An IPv4 subnet
 *
 * An IPv4 subnet, including prefix and prefix length
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
 * Names must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. Names cannot be a UUID, but they may contain a UUID. They can be at most 63 characters long.
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
  /** Optional VLAN ID for this address */
  vlanId?: number | null
}

/**
 * A set of addresses associated with a port configuration.
 */
export type AddressConfig = {
  /** The set of addresses assigned to the port configuration. */
  addresses: Address[]
  /** Link to assign the addresses to. On ports that are not broken out, this is always phy0. On a 2x breakout the options are phy0 and phy1, on 4x phy0-phy3, etc. */
  linkName: Name
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
  nextPage?: string | null
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
  nextPage?: string | null
}

/**
 * An address lot and associated blocks resulting from viewing an address lot.
 */
export type AddressLotViewResponse = {
  /** The address lot blocks. */
  blocks: AddressLotBlock[]
  /** The address lot. */
  lot: AddressLot
}

/**
 * Describes the scope of affinity for the purposes of co-location.
 */
export type FailureDomain = 'sled'

/**
 * Affinity policy used to describe "what to do when a request cannot be satisfied"
 *
 * Used for both Affinity and Anti-Affinity Groups
 */
export type AffinityPolicy =
  /** If the affinity request cannot be satisfied, allow it anyway.

This enables a "best-effort" attempt to satisfy the affinity policy. */
  | 'allow'

  /** If the affinity request cannot be satisfied, fail explicitly. */
  | 'fail'

/**
 * View of an Affinity Group
 */
export type AffinityGroup = {
  /** human-readable free-form text about a resource */
  description: string
  failureDomain: FailureDomain
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** unique, mutable, user-controlled identifier for each resource */
  name: Name
  policy: AffinityPolicy
  projectId: string
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
}

/**
 * Create-time parameters for an `AffinityGroup`
 */
export type AffinityGroupCreate = {
  description: string
  failureDomain: FailureDomain
  name: Name
  policy: AffinityPolicy
}

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
 * A member of an Affinity Group
 *
 * Membership in a group is not exclusive - members may belong to multiple affinity / anti-affinity groups.
 *
 * Affinity Groups can contain up to 32 members.
 */
export type AffinityGroupMember = {
  type: 'instance'
  value: { id: string; name: Name; runState: InstanceState }
}

/**
 * A single page of results
 */
export type AffinityGroupMemberResultsPage = {
  /** list of items on this page of results */
  items: AffinityGroupMember[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string | null
}

/**
 * A single page of results
 */
export type AffinityGroupResultsPage = {
  /** list of items on this page of results */
  items: AffinityGroup[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string | null
}

/**
 * Updateable properties of an `AffinityGroup`
 */
export type AffinityGroupUpdate = { description?: string | null; name?: Name | null }

export type BgpMessageHistory = Record<string, unknown>

/**
 * Identifies switch physical location
 */
export type SwitchLocation =
  /** Switch in upper slot */
  | 'switch0'

  /** Switch in lower slot */
  | 'switch1'

/**
 * BGP message history for a particular switch.
 */
export type SwitchBgpHistory = {
  /** Message history indexed by peer address. */
  history: Record<string, BgpMessageHistory>
  /** Switch this message history is associated with. */
  switch: SwitchLocation
}

/**
 * BGP message history for rack switches.
 */
export type AggregateBgpMessageHistory = {
  /** BGP history organized by switch. */
  switchHistories: SwitchBgpHistory[]
}

/**
 * An alert class.
 */
export type AlertClass = {
  /** A description of what this alert class represents. */
  description: string
  /** The name of the alert class. */
  name: string
}

/**
 * A single page of results
 */
export type AlertClassResultsPage = {
  /** list of items on this page of results */
  items: AlertClass[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string | null
}

/**
 * The response received from a webhook receiver endpoint.
 */
export type WebhookDeliveryResponse = {
  /** The response time of the webhook endpoint, in milliseconds. */
  durationMs: number
  /** The HTTP status code returned from the webhook endpoint. */
  status: number
}

export type WebhookDeliveryAttemptResult =
  /** The webhook event has been delivered successfully. */
  | 'succeeded'

  /** A webhook request was sent to the endpoint, and it returned a HTTP error status code indicating an error. */
  | 'failed_http_error'

  /** The webhook request could not be sent to the receiver endpoint. */
  | 'failed_unreachable'

  /** A connection to the receiver endpoint was successfully established, but no response was received within the delivery timeout. */
  | 'failed_timeout'

/**
 * An individual delivery attempt for a webhook event.
 *
 * This represents a single HTTP request that was sent to the receiver, and its outcome.
 */
export type WebhookDeliveryAttempt = {
  /** The attempt number. */
  attempt: number
  response?: WebhookDeliveryResponse | null
  /** The outcome of this delivery attempt: either the event was delivered successfully, or the request failed for one of several reasons. */
  result: WebhookDeliveryAttemptResult
  /** The time at which the webhook delivery was attempted. */
  timeSent: Date
}

/**
 * A list of attempts to deliver an alert to a receiver.
 *
 * The type of the delivery attempt model depends on the receiver type, as it may contain information specific to that delivery mechanism. For example, webhook delivery attempts contain the HTTP status code of the webhook request.
 */
export type AlertDeliveryAttempts = { webhook: WebhookDeliveryAttempt[] }

/**
 * The state of a webhook delivery attempt.
 */
export type AlertDeliveryState =
  /** The webhook event has not yet been delivered successfully.

Either no delivery attempts have yet been performed, or the delivery has failed at least once but has retries remaining. */
  | 'pending'

  /** The webhook event has been delivered successfully. */
  | 'delivered'

  /** The webhook delivery attempt has failed permanently and will not be retried again. */
  | 'failed'

/**
 * The reason an alert was delivered
 */
export type AlertDeliveryTrigger =
  /** Delivery was triggered by the alert itself. */
  | 'alert'

  /** Delivery was triggered by a request to resend the alert. */
  | 'resend'

  /** This delivery is a liveness probe. */
  | 'probe'

/**
 * A delivery of a webhook event.
 */
export type AlertDelivery = {
  /** The event class. */
  alertClass: string
  /** The UUID of the event. */
  alertId: string
  /** Individual attempts to deliver this webhook event, and their outcomes. */
  attempts: AlertDeliveryAttempts
  /** The UUID of this delivery attempt. */
  id: string
  /** The UUID of the alert receiver that this event was delivered to. */
  receiverId: string
  /** The state of this delivery. */
  state: AlertDeliveryState
  /** The time at which this delivery began (i.e. the event was dispatched to the receiver). */
  timeStarted: Date
  /** Why this delivery was performed. */
  trigger: AlertDeliveryTrigger
}

export type AlertDeliveryId = { deliveryId: string }

/**
 * A single page of results
 */
export type AlertDeliveryResultsPage = {
  /** list of items on this page of results */
  items: AlertDelivery[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string | null
}

/**
 * Data describing the result of an alert receiver liveness probe attempt.
 */
export type AlertProbeResult = {
  /** The outcome of the probe delivery. */
  probe: AlertDelivery
  /** If the probe request succeeded, and resending failed deliveries on success was requested, the number of new delivery attempts started. Otherwise, if the probe did not succeed, or resending failed deliveries was not requested, this is null.

Note that this may be 0, if there were no events found which had not been delivered successfully to this receiver. */
  resendsStarted?: number | null
}

/**
 * A view of a shared secret key assigned to a webhook receiver.
 *
 * Once a secret is created, the value of the secret is not available in the API, as it must remain secret. Instead, secrets are referenced by their unique IDs assigned when they are created.
 */
export type WebhookSecret = {
  /** The public unique ID of the secret. */
  id: string
  /** The UTC timestamp at which this secret was created. */
  timeCreated: Date
}

/**
 * The possible alert delivery mechanisms for an alert receiver.
 */
export type AlertReceiverKind = {
  /** The URL that webhook notification requests are sent to. */
  endpoint: string
  kind: 'webhook'
  secrets: WebhookSecret[]
}

/**
 * A webhook event class subscription
 *
 * A webhook event class subscription matches either a single event class exactly, or a glob pattern including wildcards that may match multiple event classes
 */
export type AlertSubscription = string

/**
 * The configuration for an alert receiver.
 */
export type AlertReceiver = {
  /** human-readable free-form text about a resource */
  description: string
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** Configuration specific to the kind of alert receiver that this is. */
  kind: AlertReceiverKind
  /** unique, mutable, user-controlled identifier for each resource */
  name: Name
  /** The list of alert classes to which this receiver is subscribed. */
  subscriptions: AlertSubscription[]
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
}

/**
 * A single page of results
 */
export type AlertReceiverResultsPage = {
  /** list of items on this page of results */
  items: AlertReceiver[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string | null
}

export type AlertSubscriptionCreate = {
  /** The event class pattern to subscribe to. */
  subscription: AlertSubscription
}

export type AlertSubscriptionCreated = {
  /** The new subscription added to the receiver. */
  subscription: AlertSubscription
}

/**
 * Description of source IPs allowed to reach rack services.
 */
export type AllowedSourceIps =
  /** Allow traffic from any external IP address. */
  | { allow: 'any' }
  /** Restrict access to a specific set of source IP addresses or subnets.

All others are prevented from reaching rack services. */
  | { allow: 'list'; ips: IpNet[] }

/**
 * Allowlist of IPs or subnets that can make requests to user-facing services.
 */
export type AllowList = {
  /** The allowlist of IPs or subnets. */
  allowedIps: AllowedSourceIps
  /** Time the list was created. */
  timeCreated: Date
  /** Time the list was last modified. */
  timeModified: Date
}

/**
 * Parameters for updating allowed source IPs
 */
export type AllowListUpdate = {
  /** The new list of allowed source IPs. */
  allowedIps: AllowedSourceIps
}

/**
 * View of an Anti-Affinity Group
 */
export type AntiAffinityGroup = {
  /** human-readable free-form text about a resource */
  description: string
  failureDomain: FailureDomain
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** unique, mutable, user-controlled identifier for each resource */
  name: Name
  policy: AffinityPolicy
  projectId: string
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
}

/**
 * Create-time parameters for an `AntiAffinityGroup`
 */
export type AntiAffinityGroupCreate = {
  description: string
  failureDomain: FailureDomain
  name: Name
  policy: AffinityPolicy
}

/**
 * A member of an Anti-Affinity Group
 *
 * Membership in a group is not exclusive - members may belong to multiple affinity / anti-affinity groups.
 *
 * Anti-Affinity Groups can contain up to 32 members.
 */
export type AntiAffinityGroupMember = {
  type: 'instance'
  value: { id: string; name: Name; runState: InstanceState }
}

/**
 * A single page of results
 */
export type AntiAffinityGroupMemberResultsPage = {
  /** list of items on this page of results */
  items: AntiAffinityGroupMember[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string | null
}

/**
 * A single page of results
 */
export type AntiAffinityGroupResultsPage = {
  /** list of items on this page of results */
  items: AntiAffinityGroup[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string | null
}

/**
 * Updateable properties of an `AntiAffinityGroup`
 */
export type AntiAffinityGroupUpdate = { description?: string | null; name?: Name | null }

/**
 * An identifier for an artifact.
 */
export type ArtifactId = {
  /** The kind of artifact this is. */
  kind: string
  /** The artifact's name. */
  name: string
  /** The artifact's version. */
  version: string
}

export type AuditLogEntryActor =
  | { kind: 'user_builtin'; userBuiltinId: string }
  | { kind: 'silo_user'; siloId: string; siloUserId: string }
  | { kind: 'unauthenticated' }

/**
 * Result of an audit log entry
 */
export type AuditLogEntryResult =
  /** The operation completed successfully */
  | {
      /** HTTP status code */
      httpStatusCode: number
      kind: 'success'
    }
  /** The operation failed */
  | {
      errorCode?: string | null
      errorMessage: string
      /** HTTP status code */
      httpStatusCode: number
      kind: 'error'
    }
  /** After the logged operation completed, our attempt to write the result to the audit log failed, so it was automatically marked completed later by a background job. This does not imply that the operation itself timed out or failed, only our attempts to log its result. */
  | { kind: 'unknown' }

/**
 * Audit log entry
 */
export type AuditLogEntry = {
  actor: AuditLogEntryActor
  /** How the user authenticated the request. Possible values are "session_cookie" and "access_token". Optional because it will not be defined on unauthenticated requests like login attempts. */
  authMethod?: string | null
  /** Unique identifier for the audit log entry */
  id: string
  /** API endpoint ID, e.g., `project_create` */
  operationId: string
  /** Request ID for tracing requests through the system */
  requestId: string
  /** URI of the request, truncated to 512 characters. Will only include host and scheme for HTTP/2 requests. For HTTP/1.1, the URI will consist of only the path and query. */
  requestUri: string
  /** Result of the operation */
  result: AuditLogEntryResult
  /** IP address that made the request */
  sourceIp: string
  /** Time operation completed */
  timeCompleted: Date
  /** When the request was received */
  timeStarted: Date
  /** User agent string from the request, truncated to 256 characters. */
  userAgent?: string | null
}

/**
 * A single page of results
 */
export type AuditLogEntryResultsPage = {
  /** list of items on this page of results */
  items: AuditLogEntry[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string | null
}

/**
 * Authorization scope for a timeseries.
 *
 * This describes the level at which a user must be authorized to read data from a timeseries. For example, fleet-scoping means the data is only visible to an operator or fleet reader. Project-scoped, on the other hand, indicates that a user will see data limited to the projects on which they have read permissions.
 */
export type AuthzScope =
  /** Timeseries data is limited to fleet readers. */
  | 'fleet'

  /** Timeseries data is limited to the authorized silo for a user. */
  | 'silo'

  /** Timeseries data is limited to the authorized projects for a user. */
  | 'project'

  /** The timeseries is viewable to all without limitation. */
  | 'viewable_to_all'

/**
 * Properties that uniquely identify an Oxide hardware component
 */
export type Baseboard = { part: string; revision: number; serial: string }

/**
 * BFD connection mode.
 */
export type BfdMode = 'single_hop' | 'multi_hop'

/**
 * Information needed to disable a BFD session
 */
export type BfdSessionDisable = {
  /** Address of the remote peer to disable a BFD session for. */
  remote: string
  /** The switch to enable this session on. Must be `switch0` or `switch1`. */
  switch: Name
}

/**
 * Information about a bidirectional forwarding detection (BFD) session.
 */
export type BfdSessionEnable = {
  /** The negotiated Control packet transmission interval, multiplied by this variable, will be the Detection Time for this session (as seen by the remote system) */
  detectionThreshold: number
  /** Address the Oxide switch will listen on for BFD traffic. If `None` then the unspecified address (0.0.0.0 or ::) is used. */
  local?: string | null
  /** Select either single-hop (RFC 5881) or multi-hop (RFC 5883) */
  mode: BfdMode
  /** Address of the remote peer to establish a BFD session with. */
  remote: string
  /** The minimum interval, in microseconds, between received BFD Control packets that this system requires */
  requiredRx: number
  /** The switch to enable this session on. Must be `switch0` or `switch1`. */
  switch: Name
}

export type BfdState =
  /** A stable down state. Non-responsive to incoming messages. */
  | 'admin_down'

  /** The initial state. */
  | 'down'

  /** The peer has detected a remote peer in the down state. */
  | 'init'

  /** The peer has detected a remote peer in the up or init state while in the init state. */
  | 'up'

export type BfdStatus = {
  detectionThreshold: number
  local?: string | null
  mode: BfdMode
  peer: string
  requiredRx: number
  state: BfdState
  switch: Name
}

/**
 * Represents a BGP announce set by id. The id can be used with other API calls to view and manage the announce set.
 */
export type BgpAnnounceSet = {
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
 * A BGP announcement tied to a particular address lot block.
 */
export type BgpAnnouncementCreate = {
  /** Address lot this announcement is drawn from. */
  addressLotBlock: NameOrId
  /** The network being announced. */
  network: IpNet
}

/**
 * Parameters for creating a named set of BGP announcements.
 */
export type BgpAnnounceSetCreate = {
  /** The announcements in this set. */
  announcement: BgpAnnouncementCreate[]
  description: string
  name: Name
}

/**
 * A BGP announcement tied to an address lot block.
 */
export type BgpAnnouncement = {
  /** The address block the IP network being announced is drawn from. */
  addressLotBlockId: string
  /** The id of the set this announcement is a part of. */
  announceSetId: string
  /** The IP network being announced. */
  network: IpNet
}

/**
 * A base BGP configuration.
 */
export type BgpConfig = {
  /** The autonomous system number of this BGP configuration. */
  asn: number
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
  /** Optional virtual routing and forwarding identifier for this BGP configuration. */
  vrf?: string | null
}

/**
 * Parameters for creating a BGP configuration. This includes and autonomous system number (ASN) and a virtual routing and forwarding (VRF) identifier.
 */
export type BgpConfigCreate = {
  /** The autonomous system number of this BGP configuration. */
  asn: number
  bgpAnnounceSetId: NameOrId
  description: string
  name: Name
  /** Optional virtual routing and forwarding identifier for this BGP configuration. */
  vrf?: Name | null
}

/**
 * A single page of results
 */
export type BgpConfigResultsPage = {
  /** list of items on this page of results */
  items: BgpConfig[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string | null
}

/**
 * The current status of a BGP peer.
 */
export type BgpExported = {
  /** Exported routes indexed by peer address. */
  exports: Record<string, Ipv4Net[]>
}

/**
 * A route imported from a BGP peer.
 */
export type BgpImportedRouteIpv4 = {
  /** BGP identifier of the originating router. */
  id: number
  /** The nexthop the prefix is reachable through. */
  nexthop: string
  /** The destination network prefix. */
  prefix: Ipv4Net
  /** Switch the route is imported into. */
  switch: SwitchLocation
}

/**
 * Define policy relating to the import and export of prefixes from a BGP peer.
 */
export type ImportExportPolicy =
  /** Do not perform any filtering. */
  { type: 'no_filtering' } | { type: 'allow'; value: IpNet[] }

/**
 * A BGP peer configuration for an interface. Includes the set of announcements that will be advertised to the peer identified by `addr`. The `bgp_config` parameter is a reference to global BGP parameters. The `interface_name` indicates what interface the peer should be contacted on.
 */
export type BgpPeer = {
  /** The address of the host to peer with. */
  addr: string
  /** Define export policy for a peer. */
  allowedExport: ImportExportPolicy
  /** Define import policy for a peer. */
  allowedImport: ImportExportPolicy
  /** The global BGP configuration used for establishing a session with this peer. */
  bgpConfig: NameOrId
  /** Include the provided communities in updates sent to the peer. */
  communities: number[]
  /** How long to to wait between TCP connection retries (seconds). */
  connectRetry: number
  /** How long to delay sending an open request after establishing a TCP session (seconds). */
  delayOpen: number
  /** Enforce that the first AS in paths received from this peer is the peer's AS. */
  enforceFirstAs: boolean
  /** How long to hold peer connections between keepalives (seconds). */
  holdTime: number
  /** How long to hold a peer in idle before attempting a new session (seconds). */
  idleHoldTime: number
  /** The name of interface to peer on. This is relative to the port configuration this BGP peer configuration is a part of. For example this value could be phy0 to refer to a primary physical interface. Or it could be vlan47 to refer to a VLAN interface. */
  interfaceName: Name
  /** How often to send keepalive requests (seconds). */
  keepalive: number
  /** Apply a local preference to routes received from this peer. */
  localPref?: number | null
  /** Use the given key for TCP-MD5 authentication with the peer. */
  md5AuthKey?: string | null
  /** Require messages from a peer have a minimum IP time to live field. */
  minTtl?: number | null
  /** Apply the provided multi-exit discriminator (MED) updates sent to the peer. */
  multiExitDiscriminator?: number | null
  /** Require that a peer has a specified ASN. */
  remoteAsn?: number | null
  /** Associate a VLAN ID with a peer. */
  vlanId?: number | null
}

export type BgpPeerConfig = {
  /** Link that the peer is reachable on. On ports that are not broken out, this is always phy0. On a 2x breakout the options are phy0 and phy1, on 4x phy0-phy3, etc. */
  linkName: Name
  peers: BgpPeer[]
}

/**
 * The current state of a BGP peer.
 */
export type BgpPeerState =
  /** Initial state. Refuse all incoming BGP connections. No resources allocated to peer. */
  | 'idle'

  /** Waiting for the TCP connection to be completed. */
  | 'connect'

  /** Trying to acquire peer by listening for and accepting a TCP connection. */
  | 'active'

  /** Waiting for open message from peer. */
  | 'open_sent'

  /** Waiting for keepaliave or notification from peer. */
  | 'open_confirm'

  /** Synchronizing with peer. */
  | 'session_setup'

  /** Session established. Able to exchange update, notification and keepalive messages with peers. */
  | 'established'

/**
 * The current status of a BGP peer.
 */
export type BgpPeerStatus = {
  /** IP address of the peer. */
  addr: string
  /** Local autonomous system number. */
  localAsn: number
  /** Remote autonomous system number. */
  remoteAsn: number
  /** State of the peer. */
  state: BgpPeerState
  /** Time of last state change. */
  stateDurationMillis: number
  /** Switch with the peer session. */
  switch: SwitchLocation
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
export type BinRangefloat =
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
export type BinRangeint16 =
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
export type BinRangeint32 =
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
 * A type storing a range over `T`.
 *
 * This type supports ranges similar to the `RangeTo`, `Range` and `RangeFrom` types in the standard library. Those cover `(..end)`, `(start..end)`, and `(start..)` respectively.
 */
export type BinRangeint8 =
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
export type BinRangeuint16 =
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
export type BinRangeuint32 =
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
export type BinRangeuint64 =
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
export type BinRangeuint8 =
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
export type Binfloat = {
  /** The total count of samples in this bin. */
  count: number
  /** The range of the support covered by this bin. */
  range: BinRangefloat
}

/**
 * Type storing bin edges and a count of samples within it.
 */
export type Binint16 = {
  /** The total count of samples in this bin. */
  count: number
  /** The range of the support covered by this bin. */
  range: BinRangeint16
}

/**
 * Type storing bin edges and a count of samples within it.
 */
export type Binint32 = {
  /** The total count of samples in this bin. */
  count: number
  /** The range of the support covered by this bin. */
  range: BinRangeint32
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
 * Type storing bin edges and a count of samples within it.
 */
export type Binint8 = {
  /** The total count of samples in this bin. */
  count: number
  /** The range of the support covered by this bin. */
  range: BinRangeint8
}

/**
 * Type storing bin edges and a count of samples within it.
 */
export type Binuint16 = {
  /** The total count of samples in this bin. */
  count: number
  /** The range of the support covered by this bin. */
  range: BinRangeuint16
}

/**
 * Type storing bin edges and a count of samples within it.
 */
export type Binuint32 = {
  /** The total count of samples in this bin. */
  count: number
  /** The range of the support covered by this bin. */
  range: BinRangeuint32
}

/**
 * Type storing bin edges and a count of samples within it.
 */
export type Binuint64 = {
  /** The total count of samples in this bin. */
  count: number
  /** The range of the support covered by this bin. */
  range: BinRangeuint64
}

/**
 * Type storing bin edges and a count of samples within it.
 */
export type Binuint8 = {
  /** The total count of samples in this bin. */
  count: number
  /** The range of the support covered by this bin. */
  range: BinRangeuint8
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
  /** PEM-formatted string containing public certificate chain */
  cert: string
  /** human-readable free-form text about a resource */
  description: string
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** unique, mutable, user-controlled identifier for each resource */
  name: Name
  /** The service using this certificate */
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
  /** PEM-formatted string containing public certificate chain */
  cert: string
  description: string
  /** PEM-formatted string containing private key */
  key: string
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
  nextPage?: string | null
}

/**
 * View of a console session
 */
export type ConsoleSession = {
  /** A unique, immutable, system-controlled identifier for the session */
  id: string
  timeCreated: Date
  timeLastUsed: Date
}

/**
 * A single page of results
 */
export type ConsoleSessionResultsPage = {
  /** list of items on this page of results */
  items: ConsoleSession[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string | null
}

/**
 * A cumulative or counter data type.
 */
export type Cumulativedouble = { startTime: Date; value: number }

/**
 * A cumulative or counter data type.
 */
export type Cumulativefloat = { startTime: Date; value: number }

/**
 * A cumulative or counter data type.
 */
export type Cumulativeint64 = { startTime: Date; value: number }

/**
 * A cumulative or counter data type.
 */
export type Cumulativeuint64 = { startTime: Date; value: number }

/**
 * Info about the current user
 */
export type CurrentUser = {
  /** Human-readable name that can identify the user */
  displayName: string
  /** Whether this user has the viewer role on the fleet. Used by the web console to determine whether to show system-level UI. */
  fleetViewer: boolean
  id: string
  /** Whether this user has the admin role on their silo. Used by the web console to determine whether to show admin-only UI elements. */
  siloAdmin: boolean
  /** Uuid of the silo to which this user belongs */
  siloId: string
  /** Name of the silo to which this user belongs. */
  siloName: Name
}

/**
 * Structure for estimating the p-quantile of a population.
 *
 * This is based on the P² algorithm for estimating quantiles using constant space.
 *
 * The algorithm consists of maintaining five markers: the minimum, the p/2-, p-, and (1 + p)/2 quantiles, and the maximum.
 */
export type Quantile = {
  /** The desired marker positions. */
  desiredMarkerPositions: number[]
  /** The heights of the markers. */
  markerHeights: number[]
  /** The positions of the markers.

We track sample size in the 5th position, as useful observations won't start until we've filled the heights at the 6th sample anyway This does deviate from the paper, but it's a more useful representation that works according to the paper's algorithm. */
  markerPositions: number[]
  /** The p value for the quantile. */
  p: number
}

/**
 * Histogram metric
 *
 * A histogram maintains the count of any number of samples, over a set of bins. Bins are specified on construction via their _left_ edges, inclusive. There can't be any "gaps" in the bins, and an additional bin may be added to the left, right, or both so that the bins extend to the entire range of the support.
 *
 * Note that any gaps, unsorted bins, or non-finite values will result in an error.
 */
export type Histogramint8 = {
  /** The bins of the histogram. */
  bins: Binint8[]
  /** The maximum value of all samples in the histogram. */
  max: number
  /** The minimum value of all samples in the histogram. */
  min: number
  /** The total number of samples in the histogram. */
  nSamples: number
  /** p50 Quantile */
  p50: Quantile
  /** p95 Quantile */
  p90: Quantile
  /** p99 Quantile */
  p99: Quantile
  /** M2 for Welford's algorithm for variance calculation.

Read about [Welford's algorithm](https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance#Welford's_online_algorithm) for more information on the algorithm. */
  squaredMean: number
  /** The start time of the histogram. */
  startTime: Date
  /** The sum of all samples in the histogram. */
  sumOfSamples: number
}

/**
 * Histogram metric
 *
 * A histogram maintains the count of any number of samples, over a set of bins. Bins are specified on construction via their _left_ edges, inclusive. There can't be any "gaps" in the bins, and an additional bin may be added to the left, right, or both so that the bins extend to the entire range of the support.
 *
 * Note that any gaps, unsorted bins, or non-finite values will result in an error.
 */
export type Histogramuint8 = {
  /** The bins of the histogram. */
  bins: Binuint8[]
  /** The maximum value of all samples in the histogram. */
  max: number
  /** The minimum value of all samples in the histogram. */
  min: number
  /** The total number of samples in the histogram. */
  nSamples: number
  /** p50 Quantile */
  p50: Quantile
  /** p95 Quantile */
  p90: Quantile
  /** p99 Quantile */
  p99: Quantile
  /** M2 for Welford's algorithm for variance calculation.

Read about [Welford's algorithm](https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance#Welford's_online_algorithm) for more information on the algorithm. */
  squaredMean: number
  /** The start time of the histogram. */
  startTime: Date
  /** The sum of all samples in the histogram. */
  sumOfSamples: number
}

/**
 * Histogram metric
 *
 * A histogram maintains the count of any number of samples, over a set of bins. Bins are specified on construction via their _left_ edges, inclusive. There can't be any "gaps" in the bins, and an additional bin may be added to the left, right, or both so that the bins extend to the entire range of the support.
 *
 * Note that any gaps, unsorted bins, or non-finite values will result in an error.
 */
export type Histogramint16 = {
  /** The bins of the histogram. */
  bins: Binint16[]
  /** The maximum value of all samples in the histogram. */
  max: number
  /** The minimum value of all samples in the histogram. */
  min: number
  /** The total number of samples in the histogram. */
  nSamples: number
  /** p50 Quantile */
  p50: Quantile
  /** p95 Quantile */
  p90: Quantile
  /** p99 Quantile */
  p99: Quantile
  /** M2 for Welford's algorithm for variance calculation.

Read about [Welford's algorithm](https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance#Welford's_online_algorithm) for more information on the algorithm. */
  squaredMean: number
  /** The start time of the histogram. */
  startTime: Date
  /** The sum of all samples in the histogram. */
  sumOfSamples: number
}

/**
 * Histogram metric
 *
 * A histogram maintains the count of any number of samples, over a set of bins. Bins are specified on construction via their _left_ edges, inclusive. There can't be any "gaps" in the bins, and an additional bin may be added to the left, right, or both so that the bins extend to the entire range of the support.
 *
 * Note that any gaps, unsorted bins, or non-finite values will result in an error.
 */
export type Histogramuint16 = {
  /** The bins of the histogram. */
  bins: Binuint16[]
  /** The maximum value of all samples in the histogram. */
  max: number
  /** The minimum value of all samples in the histogram. */
  min: number
  /** The total number of samples in the histogram. */
  nSamples: number
  /** p50 Quantile */
  p50: Quantile
  /** p95 Quantile */
  p90: Quantile
  /** p99 Quantile */
  p99: Quantile
  /** M2 for Welford's algorithm for variance calculation.

Read about [Welford's algorithm](https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance#Welford's_online_algorithm) for more information on the algorithm. */
  squaredMean: number
  /** The start time of the histogram. */
  startTime: Date
  /** The sum of all samples in the histogram. */
  sumOfSamples: number
}

/**
 * Histogram metric
 *
 * A histogram maintains the count of any number of samples, over a set of bins. Bins are specified on construction via their _left_ edges, inclusive. There can't be any "gaps" in the bins, and an additional bin may be added to the left, right, or both so that the bins extend to the entire range of the support.
 *
 * Note that any gaps, unsorted bins, or non-finite values will result in an error.
 */
export type Histogramint32 = {
  /** The bins of the histogram. */
  bins: Binint32[]
  /** The maximum value of all samples in the histogram. */
  max: number
  /** The minimum value of all samples in the histogram. */
  min: number
  /** The total number of samples in the histogram. */
  nSamples: number
  /** p50 Quantile */
  p50: Quantile
  /** p95 Quantile */
  p90: Quantile
  /** p99 Quantile */
  p99: Quantile
  /** M2 for Welford's algorithm for variance calculation.

Read about [Welford's algorithm](https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance#Welford's_online_algorithm) for more information on the algorithm. */
  squaredMean: number
  /** The start time of the histogram. */
  startTime: Date
  /** The sum of all samples in the histogram. */
  sumOfSamples: number
}

/**
 * Histogram metric
 *
 * A histogram maintains the count of any number of samples, over a set of bins. Bins are specified on construction via their _left_ edges, inclusive. There can't be any "gaps" in the bins, and an additional bin may be added to the left, right, or both so that the bins extend to the entire range of the support.
 *
 * Note that any gaps, unsorted bins, or non-finite values will result in an error.
 */
export type Histogramuint32 = {
  /** The bins of the histogram. */
  bins: Binuint32[]
  /** The maximum value of all samples in the histogram. */
  max: number
  /** The minimum value of all samples in the histogram. */
  min: number
  /** The total number of samples in the histogram. */
  nSamples: number
  /** p50 Quantile */
  p50: Quantile
  /** p95 Quantile */
  p90: Quantile
  /** p99 Quantile */
  p99: Quantile
  /** M2 for Welford's algorithm for variance calculation.

Read about [Welford's algorithm](https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance#Welford's_online_algorithm) for more information on the algorithm. */
  squaredMean: number
  /** The start time of the histogram. */
  startTime: Date
  /** The sum of all samples in the histogram. */
  sumOfSamples: number
}

/**
 * Histogram metric
 *
 * A histogram maintains the count of any number of samples, over a set of bins. Bins are specified on construction via their _left_ edges, inclusive. There can't be any "gaps" in the bins, and an additional bin may be added to the left, right, or both so that the bins extend to the entire range of the support.
 *
 * Note that any gaps, unsorted bins, or non-finite values will result in an error.
 */
export type Histogramint64 = {
  /** The bins of the histogram. */
  bins: Binint64[]
  /** The maximum value of all samples in the histogram. */
  max: number
  /** The minimum value of all samples in the histogram. */
  min: number
  /** The total number of samples in the histogram. */
  nSamples: number
  /** p50 Quantile */
  p50: Quantile
  /** p95 Quantile */
  p90: Quantile
  /** p99 Quantile */
  p99: Quantile
  /** M2 for Welford's algorithm for variance calculation.

Read about [Welford's algorithm](https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance#Welford's_online_algorithm) for more information on the algorithm. */
  squaredMean: number
  /** The start time of the histogram. */
  startTime: Date
  /** The sum of all samples in the histogram. */
  sumOfSamples: number
}

/**
 * Histogram metric
 *
 * A histogram maintains the count of any number of samples, over a set of bins. Bins are specified on construction via their _left_ edges, inclusive. There can't be any "gaps" in the bins, and an additional bin may be added to the left, right, or both so that the bins extend to the entire range of the support.
 *
 * Note that any gaps, unsorted bins, or non-finite values will result in an error.
 */
export type Histogramuint64 = {
  /** The bins of the histogram. */
  bins: Binuint64[]
  /** The maximum value of all samples in the histogram. */
  max: number
  /** The minimum value of all samples in the histogram. */
  min: number
  /** The total number of samples in the histogram. */
  nSamples: number
  /** p50 Quantile */
  p50: Quantile
  /** p95 Quantile */
  p90: Quantile
  /** p99 Quantile */
  p99: Quantile
  /** M2 for Welford's algorithm for variance calculation.

Read about [Welford's algorithm](https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance#Welford's_online_algorithm) for more information on the algorithm. */
  squaredMean: number
  /** The start time of the histogram. */
  startTime: Date
  /** The sum of all samples in the histogram. */
  sumOfSamples: number
}

/**
 * Histogram metric
 *
 * A histogram maintains the count of any number of samples, over a set of bins. Bins are specified on construction via their _left_ edges, inclusive. There can't be any "gaps" in the bins, and an additional bin may be added to the left, right, or both so that the bins extend to the entire range of the support.
 *
 * Note that any gaps, unsorted bins, or non-finite values will result in an error.
 */
export type Histogramfloat = {
  /** The bins of the histogram. */
  bins: Binfloat[]
  /** The maximum value of all samples in the histogram. */
  max: number
  /** The minimum value of all samples in the histogram. */
  min: number
  /** The total number of samples in the histogram. */
  nSamples: number
  /** p50 Quantile */
  p50: Quantile
  /** p95 Quantile */
  p90: Quantile
  /** p99 Quantile */
  p99: Quantile
  /** M2 for Welford's algorithm for variance calculation.

Read about [Welford's algorithm](https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance#Welford's_online_algorithm) for more information on the algorithm. */
  squaredMean: number
  /** The start time of the histogram. */
  startTime: Date
  /** The sum of all samples in the histogram. */
  sumOfSamples: number
}

/**
 * Histogram metric
 *
 * A histogram maintains the count of any number of samples, over a set of bins. Bins are specified on construction via their _left_ edges, inclusive. There can't be any "gaps" in the bins, and an additional bin may be added to the left, right, or both so that the bins extend to the entire range of the support.
 *
 * Note that any gaps, unsorted bins, or non-finite values will result in an error.
 */
export type Histogramdouble = {
  /** The bins of the histogram. */
  bins: Bindouble[]
  /** The maximum value of all samples in the histogram. */
  max: number
  /** The minimum value of all samples in the histogram. */
  min: number
  /** The total number of samples in the histogram. */
  nSamples: number
  /** p50 Quantile */
  p50: Quantile
  /** p95 Quantile */
  p90: Quantile
  /** p99 Quantile */
  p99: Quantile
  /** M2 for Welford's algorithm for variance calculation.

Read about [Welford's algorithm](https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance#Welford's_online_algorithm) for more information on the algorithm. */
  squaredMean: number
  /** The start time of the histogram. */
  startTime: Date
  /** The sum of all samples in the histogram. */
  sumOfSamples: number
}

/**
 * The type of an individual datum of a metric.
 */
export type DatumType =
  | 'bool'
  | 'i8'
  | 'u8'
  | 'i16'
  | 'u16'
  | 'i32'
  | 'u32'
  | 'i64'
  | 'u64'
  | 'f32'
  | 'f64'
  | 'string'
  | 'bytes'
  | 'cumulative_i64'
  | 'cumulative_u64'
  | 'cumulative_f32'
  | 'cumulative_f64'
  | 'histogram_i8'
  | 'histogram_u8'
  | 'histogram_i16'
  | 'histogram_u16'
  | 'histogram_i32'
  | 'histogram_u32'
  | 'histogram_i64'
  | 'histogram_u64'
  | 'histogram_f32'
  | 'histogram_f64'

export type MissingDatum = { datumType: DatumType; startTime?: Date | null }

/**
 * A `Datum` is a single sampled data point from a metric.
 */
export type Datum =
  | { datum: boolean; type: 'bool' }
  | { datum: number; type: 'i8' }
  | { datum: number; type: 'u8' }
  | { datum: number; type: 'i16' }
  | { datum: number; type: 'u16' }
  | { datum: number; type: 'i32' }
  | { datum: number; type: 'u32' }
  | { datum: number; type: 'i64' }
  | { datum: number; type: 'u64' }
  | { datum: number; type: 'f32' }
  | { datum: number; type: 'f64' }
  | { datum: string; type: 'string' }
  | { datum: number[]; type: 'bytes' }
  | { datum: Cumulativeint64; type: 'cumulative_i64' }
  | { datum: Cumulativeuint64; type: 'cumulative_u64' }
  | { datum: Cumulativefloat; type: 'cumulative_f32' }
  | { datum: Cumulativedouble; type: 'cumulative_f64' }
  | { datum: Histogramint8; type: 'histogram_i8' }
  | { datum: Histogramuint8; type: 'histogram_u8' }
  | { datum: Histogramint16; type: 'histogram_i16' }
  | { datum: Histogramuint16; type: 'histogram_u16' }
  | { datum: Histogramint32; type: 'histogram_i32' }
  | { datum: Histogramuint32; type: 'histogram_u32' }
  | { datum: Histogramint64; type: 'histogram_i64' }
  | { datum: Histogramuint64; type: 'histogram_u64' }
  | { datum: Histogramfloat; type: 'histogram_f32' }
  | { datum: Histogramdouble; type: 'histogram_f64' }
  | { datum: MissingDatum; type: 'missing' }

export type DerEncodedKeyPair = {
  /** request signing RSA private key in PKCS#1 format (base64 encoded der file) */
  privateKey: string
  /** request signing public certificate (base64 encoded der file) */
  publicCert: string
}

/**
 * View of a device access token
 */
export type DeviceAccessToken = {
  /** A unique, immutable, system-controlled identifier for the token. Note that this ID is not the bearer token itself, which starts with "oxide-token-" */
  id: string
  timeCreated: Date
  /** Expiration timestamp. A null value means the token does not automatically expire. */
  timeExpires?: Date | null
}

export type DeviceAccessTokenRequest = {
  clientId: string
  deviceCode: string
  grantType: string
}

/**
 * A single page of results
 */
export type DeviceAccessTokenResultsPage = {
  /** list of items on this page of results */
  items: DeviceAccessToken[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string | null
}

export type DeviceAuthRequest = {
  clientId: string
  /** Optional lifetime for the access token in seconds. If not specified, the silo's max TTL will be used (if set). */
  ttlSeconds?: number | null
}

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
  /** ID of image from which disk was created, if any */
  imageId?: string | null
  /** unique, mutable, user-controlled identifier for each resource */
  name: Name
  projectId: string
  size: ByteCount
  /** ID of snapshot from which disk was created, if any */
  snapshotId?: string | null
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
  /** The initial source for this disk */
  diskSource: DiskSource
  name: Name
  /** The total size of the Disk (in bytes) */
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
  nextPage?: string | null
}

/**
 * A distribution is a sequence of bins and counts in those bins, and some statistical information tracked to compute the mean, standard deviation, and quantile estimates.
 *
 * Min, max, and the p-* quantiles are treated as optional due to the possibility of distribution operations, like subtraction.
 */
export type Distributiondouble = {
  bins: number[]
  counts: number[]
  max?: number | null
  min?: number | null
  p50?: Quantile | null
  p90?: Quantile | null
  p99?: Quantile | null
  squaredMean: number
  sumOfSamples: number
}

/**
 * A distribution is a sequence of bins and counts in those bins, and some statistical information tracked to compute the mean, standard deviation, and quantile estimates.
 *
 * Min, max, and the p-* quantiles are treated as optional due to the possibility of distribution operations, like subtraction.
 */
export type Distributionint64 = {
  bins: number[]
  counts: number[]
  max?: number | null
  min?: number | null
  p50?: Quantile | null
  p90?: Quantile | null
  p99?: Quantile | null
  squaredMean: number
  sumOfSamples: number
}

/**
 * Parameters for creating an ephemeral IP address for an instance.
 */
export type EphemeralIpCreate = {
  /** Name or ID of the IP pool used to allocate an address. If unspecified, the default IP pool will be used. */
  pool?: NameOrId | null
}

export type ExternalIp =
  /** A source NAT IP address.

SNAT addresses are ephemeral addresses used only for outbound connectivity. */
  | {
      /** The first usable port within the IP address. */
      firstPort: number
      /** The IP address. */
      ip: string
      /** ID of the IP Pool from which the address is taken. */
      ipPoolId: string
      kind: 'snat'
      /** The last usable port within the IP address. */
      lastPort: number
    }
  | { ip: string; ipPoolId: string; kind: 'ephemeral' }
  /** A Floating IP is a well-known IP address which can be attached and detached from instances. */
  | {
      /** human-readable free-form text about a resource */
      description: string
      /** unique, immutable, system-controlled identifier for each resource */
      id: string
      /** The ID of the instance that this Floating IP is attached to, if it is presently in use. */
      instanceId?: string | null
      /** The IP address held by this resource. */
      ip: string
      /** The ID of the IP pool this resource belongs to. */
      ipPoolId: string
      kind: 'floating'
      /** unique, mutable, user-controlled identifier for each resource */
      name: Name
      /** The project this resource exists within. */
      projectId: string
      /** timestamp when this resource was created */
      timeCreated: Date
      /** timestamp when this resource was last modified */
      timeModified: Date
    }

/**
 * Parameters for creating an external IP address for instances.
 */
export type ExternalIpCreate =
  /** An IP address providing both inbound and outbound access. The address is automatically assigned from the provided IP pool or the default IP pool if not specified. */
  | { pool?: NameOrId | null; type: 'ephemeral' }
  /** An IP address providing both inbound and outbound access. The address is an existing floating IP object assigned to the current project.

The floating IP must not be in use by another instance or service. */
  | { floatingIp: NameOrId; type: 'floating' }

/**
 * A single page of results
 */
export type ExternalIpResultsPage = {
  /** list of items on this page of results */
  items: ExternalIp[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string | null
}

/**
 * The `FieldType` identifies the data type of a target or metric field.
 */
export type FieldType =
  | 'string'
  | 'i8'
  | 'u8'
  | 'i16'
  | 'u16'
  | 'i32'
  | 'u32'
  | 'i64'
  | 'u64'
  | 'ip_addr'
  | 'uuid'
  | 'bool'

/**
 * The source from which a field is derived, the target or metric.
 */
export type FieldSource = 'target' | 'metric'

/**
 * The name and type information for a field of a timeseries schema.
 */
export type FieldSchema = {
  description: string
  fieldType: FieldType
  name: string
  source: FieldSource
}

/**
 * The `FieldValue` contains the value of a target or metric field.
 */
export type FieldValue =
  | { type: 'string'; value: string }
  | { type: 'i8'; value: number }
  | { type: 'u8'; value: number }
  | { type: 'i16'; value: number }
  | { type: 'u16'; value: number }
  | { type: 'i32'; value: number }
  | { type: 'u32'; value: number }
  | { type: 'i64'; value: number }
  | { type: 'u64'; value: number }
  | { type: 'ip_addr'; value: string }
  | { type: 'uuid'; value: string }
  | { type: 'bool'; value: boolean }

/**
 * Parameters for finalizing a disk
 */
export type FinalizeDisk = {
  /** If specified a snapshot of the disk will be created with the given name during finalization. If not specified, a snapshot for the disk will _not_ be created. A snapshot can be manually created once the disk transitions into the `Detached` state. */
  snapshotName?: Name | null
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
 * A Floating IP is a well-known IP address which can be attached and detached from instances.
 */
export type FloatingIp = {
  /** human-readable free-form text about a resource */
  description: string
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** The ID of the instance that this Floating IP is attached to, if it is presently in use. */
  instanceId?: string | null
  /** The IP address held by this resource. */
  ip: string
  /** The ID of the IP pool this resource belongs to. */
  ipPoolId: string
  /** unique, mutable, user-controlled identifier for each resource */
  name: Name
  /** The project this resource exists within. */
  projectId: string
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
}

/**
 * The type of resource that a floating IP is attached to
 */
export type FloatingIpParentKind = 'instance'

/**
 * Parameters for attaching a floating IP address to another resource
 */
export type FloatingIpAttach = {
  /** The type of `parent`'s resource */
  kind: FloatingIpParentKind
  /** Name or ID of the resource that this IP address should be attached to */
  parent: NameOrId
}

/**
 * Parameters for creating a new floating IP address for instances.
 */
export type FloatingIpCreate = {
  description: string
  /** An IP address to reserve for use as a floating IP. This field is optional: when not set, an address will be automatically chosen from `pool`. If set, then the IP must be available in the resolved `pool`. */
  ip?: string | null
  name: Name
  /** The parent IP pool that a floating IP is pulled from. If unset, the default pool is selected. */
  pool?: NameOrId | null
}

/**
 * A single page of results
 */
export type FloatingIpResultsPage = {
  /** list of items on this page of results */
  items: FloatingIp[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string | null
}

/**
 * Updateable identity-related parameters
 */
export type FloatingIpUpdate = { description?: string | null; name?: Name | null }

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
  nextPage?: string | null
}

/**
 * An RFC-1035-compliant hostname
 *
 * A hostname identifies a host on a network, and is usually a dot-delimited sequence of labels, where each label contains only letters, digits, or the hyphen. See RFCs 1035 and 952 for more details.
 */
export type Hostname = string

/**
 * A range of ICMP(v6) types or codes
 *
 * An inclusive-inclusive range of ICMP(v6) types or codes. The second value may be omitted to represent a single parameter.
 */
export type IcmpParamRange = string

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
  nextPage?: string | null
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
  digest?: Digest | null
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** unique, mutable, user-controlled identifier for each resource */
  name: Name
  /** The family of the operating system like Debian, Ubuntu, etc. */
  os: string
  /** ID of the parent project if the image is a project image */
  projectId?: string | null
  /** total size in bytes */
  size: ByteCount
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
  /** Version of the operating system */
  version: string
}

/**
 * The source of the underlying image.
 */
export type ImageSource = { id: string; type: 'snapshot' }

/**
 * Create-time parameters for an `Image`
 */
export type ImageCreate = {
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
  nextPage?: string | null
}

/**
 * Parameters for importing blocks with a bulk write
 */
export type ImportBlocksBulkWrite = { base64EncodedData: string; offset: number }

/**
 * A policy determining when an instance should be automatically restarted by the control plane.
 */
export type InstanceAutoRestartPolicy =
  /** The instance should not be automatically restarted by the control plane if it fails. */
  | 'never'

  /** If this instance is running and unexpectedly fails (e.g. due to a host software crash or unexpected host reboot), the control plane will make a best-effort attempt to restart it. The control plane may choose not to restart the instance to preserve the overall availability of the system. */
  | 'best_effort'

/**
 * A required CPU platform for an instance.
 *
 * When an instance specifies a required CPU platform:
 *
 * - The system may expose (to the VM) new CPU features that are only present on that platform (or on newer platforms of the same lineage that also support those features). - The instance must run on hosts that have CPUs that support all the features of the supplied platform.
 *
 * That is, the instance is restricted to hosts that have the CPUs which support all features of the required platform, but in exchange the CPU features exposed by the platform are available for the guest to use. Note that this may prevent an instance from starting (if the hosts that could run it are full but there is capacity on other incompatible hosts).
 *
 * If an instance does not specify a required CPU platform, then when it starts, the control plane selects a host for the instance and then supplies the guest with the "minimum" CPU platform supported by that host. This maximizes the number of hosts that can run the VM if it later needs to migrate to another host.
 *
 * In all cases, the CPU features presented by a given CPU platform are a subset of what the corresponding hardware may actually support; features which cannot be used from a virtual environment or do not have full hypervisor support may be masked off. See RFD 314 for specific CPU features in a CPU platform.
 */
export type InstanceCpuPlatform =
  /** An AMD Milan-like CPU platform. */
  | 'amd_milan'

  /** An AMD Turin-like CPU platform. */
  | 'amd_turin'

/**
 * The number of CPUs in an Instance
 */
export type InstanceCpuCount = number

/**
 * View of an Instance
 */
export type Instance = {
  /** The time at which the auto-restart cooldown period for this instance completes, permitting it to be automatically restarted again. If the instance enters the `Failed` state, it will not be restarted until after this time.

If this is not present, then either the instance has never been automatically restarted, or the cooldown period has already expired, allowing the instance to be restarted immediately if it fails. */
  autoRestartCooldownExpiration?: Date | null
  /** `true` if this instance's auto-restart policy will permit the control plane to automatically restart it if it enters the `Failed` state. */
  autoRestartEnabled: boolean
  /** The auto-restart policy configured for this instance, or `null` if no explicit policy has been configured.

This policy determines whether the instance should be automatically restarted by the control plane on failure. If this is `null`, the control plane will use the default policy when determining whether or not to automatically restart this instance, which may or may not allow it to be restarted. The value of the `auto_restart_enabled` field indicates whether the instance will be auto-restarted, based on its current policy or the default if it has no configured policy. */
  autoRestartPolicy?: InstanceAutoRestartPolicy | null
  /** the ID of the disk used to boot this Instance, if a specific one is assigned. */
  bootDiskId?: string | null
  /** The CPU platform for this instance. If this is `null`, the instance requires no particular CPU platform. */
  cpuPlatform?: InstanceCpuPlatform | null
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
  /** The timestamp of the most recent time this instance was automatically restarted by the control plane.

If this is not present, then this instance has not been automatically restarted. */
  timeLastAutoRestarted?: Date | null
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
      /** The initial source for this disk */
      diskSource: DiskSource
      name: Name
      /** The total size of the Disk (in bytes) */
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
  ip?: string | null
  name: Name
  /** The VPC Subnet in which to create the interface. */
  subnetName: Name
  /** A set of additional networks that this interface may send and receive traffic on. */
  transitIps?: IpNet[]
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
  /** Anti-Affinity groups which this instance should be added. */
  antiAffinityGroups?: NameOrId[]
  /** The auto-restart policy for this instance.

This policy determines whether the instance should be automatically restarted by the control plane on failure. If this is `null`, no auto-restart policy will be explicitly configured for this instance, and the control plane will select the default policy when determining whether the instance can be automatically restarted.

Currently, the global default auto-restart policy is "best-effort", so instances with `null` auto-restart policies will be automatically restarted. However, in the future, the default policy may be configurable through other mechanisms, such as on a per-project basis. In that case, any configured default policy will be used if this is `null`. */
  autoRestartPolicy?: InstanceAutoRestartPolicy | null
  /** The disk the instance is configured to boot from.

This disk can either be attached if it already exists or created along with the instance.

Specifying a boot disk is optional but recommended to ensure predictable boot behavior. The boot disk can be set during instance creation or later if the instance is stopped. The boot disk counts against the disk attachment limit.

An instance that does not have a boot disk set will use the boot options specified in its UEFI settings, which are controlled by both the instance's UEFI firmware and the guest operating system. Boot options can change as disks are attached and detached, which may result in an instance that only boots to the EFI shell until a boot disk is set. */
  bootDisk?: InstanceDiskAttachment | null
  /** The CPU platform to be used for this instance. If this is `null`, the instance requires no particular CPU platform; when it is started the instance will have the most general CPU platform supported by the sled it is initially placed on. */
  cpuPlatform?: InstanceCpuPlatform | null
  description: string
  /** A list of disks to be attached to the instance.

Disk attachments of type "create" will be created, while those of type "attach" must already exist.

The order of this list does not guarantee a boot order for the instance. Use the boot_disk attribute to specify a boot disk. When boot_disk is specified it will count against the disk attachment limit. */
  disks?: InstanceDiskAttachment[]
  /** The external IP addresses provided to this instance.

By default, all instances have outbound connectivity, but no inbound connectivity. These external addresses can be used to provide a fixed, known IP address for making inbound connections to the instance. */
  externalIps?: ExternalIpCreate[]
  /** The hostname to be assigned to the instance */
  hostname: Hostname
  /** The amount of RAM (in bytes) to be allocated to the instance */
  memory: ByteCount
  name: Name
  /** The number of vCPUs to be allocated to the instance */
  ncpus: InstanceCpuCount
  /** The network interfaces to be created for this instance. */
  networkInterfaces?: InstanceNetworkInterfaceAttachment
  /** An allowlist of SSH public keys to be transferred to the instance via cloud-init during instance creation.

If not provided, all SSH public keys from the user's profile will be sent. If an empty list is provided, no public keys will be transmitted to the instance. */
  sshPublicKeys?: NameOrId[] | null
  /** Should this instance be started upon creation; true by default. */
  start?: boolean
  /** User data for instance initialization systems (such as cloud-init). Must be a Base64-encoded string, as specified in RFC 4648 § 4 (+ and / characters with padding). Maximum 32 KiB unencoded data. */
  userData?: string
}

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
  /** A set of additional networks that this interface may send and receive traffic on. */
  transitIps?: IpNet[]
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
  nextPage?: string | null
}

/**
 * Parameters for updating an `InstanceNetworkInterface`
 *
 * Note that modifying IP addresses for an interface is not yet supported, a new interface must be created instead.
 */
export type InstanceNetworkInterfaceUpdate = {
  description?: string | null
  name?: Name | null
  /** Make a secondary interface the instance's primary interface.

If applied to a secondary interface, that interface will become the primary on the next reboot of the instance. Note that this may have implications for routing between instances, as the new primary interface will be on a distinct subnet from the previous primary interface.

Note that this can only be used to select a new primary interface for an instance. Requests to change the primary interface into a secondary will return an error. */
  primary?: boolean
  /** A set of additional networks that this interface may send and receive traffic on. */
  transitIps?: IpNet[]
}

/**
 * A single page of results
 */
export type InstanceResultsPage = {
  /** list of items on this page of results */
  items: Instance[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string | null
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
 * Parameters of an `Instance` that can be reconfigured after creation.
 */
export type InstanceUpdate = {
  /** Sets the auto-restart policy for this instance.

This policy determines whether the instance should be automatically restarted by the control plane on failure. If this is `null`, any explicitly configured auto-restart policy will be unset, and the control plane will select the default policy when determining whether the instance can be automatically restarted.

Currently, the global default auto-restart policy is "best-effort", so instances with `null` auto-restart policies will be automatically restarted. However, in the future, the default policy may be configurable through other mechanisms, such as on a per-project basis. In that case, any configured default policy will be used if this is `null`. */
  autoRestartPolicy?: InstanceAutoRestartPolicy | null
  /** Name or ID of the disk the instance should be instructed to boot from.

If not provided, unset the instance's boot disk. */
  bootDisk?: NameOrId | null
  /** The CPU platform to be used for this instance. If this is `null`, the instance requires no particular CPU platform. */
  cpuPlatform?: InstanceCpuPlatform | null
  /** The amount of memory to assign to this instance. */
  memory: ByteCount
  /** The number of CPUs to assign to this instance. */
  ncpus: InstanceCpuCount
}

export type InterfaceNum =
  | { unknown: number }
  | { ifIndex: number }
  | { portNumber: number }

/**
 * An internet gateway provides a path between VPC networks and external networks.
 */
export type InternetGateway = {
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
  /** The VPC to which the gateway belongs. */
  vpcId: string
}

/**
 * Create-time parameters for an `InternetGateway`
 */
export type InternetGatewayCreate = { description: string; name: Name }

/**
 * An IP address that is attached to an internet gateway
 */
export type InternetGatewayIpAddress = {
  /** The associated IP address, */
  address: string
  /** human-readable free-form text about a resource */
  description: string
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** The associated internet gateway. */
  internetGatewayId: string
  /** unique, mutable, user-controlled identifier for each resource */
  name: Name
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
}

/**
 * Create-time identity-related parameters
 */
export type InternetGatewayIpAddressCreate = {
  address: string
  description: string
  name: Name
}

/**
 * A single page of results
 */
export type InternetGatewayIpAddressResultsPage = {
  /** list of items on this page of results */
  items: InternetGatewayIpAddress[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string | null
}

/**
 * An IP pool that is attached to an internet gateway
 */
export type InternetGatewayIpPool = {
  /** human-readable free-form text about a resource */
  description: string
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** The associated internet gateway. */
  internetGatewayId: string
  /** The associated IP pool. */
  ipPoolId: string
  /** unique, mutable, user-controlled identifier for each resource */
  name: Name
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
}

/**
 * Create-time identity-related parameters
 */
export type InternetGatewayIpPoolCreate = {
  description: string
  ipPool: NameOrId
  name: Name
}

/**
 * A single page of results
 */
export type InternetGatewayIpPoolResultsPage = {
  /** list of items on this page of results */
  items: InternetGatewayIpPool[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string | null
}

/**
 * A single page of results
 */
export type InternetGatewayResultsPage = {
  /** list of items on this page of results */
  items: InternetGateway[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string | null
}

/**
 * The IP address version.
 */
export type IpVersion = 'v4' | 'v6'

/**
 * A collection of IP ranges. If a pool is linked to a silo, IP addresses from the pool can be allocated within that silo
 */
export type IpPool = {
  /** human-readable free-form text about a resource */
  description: string
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** The IP version for the pool. */
  ipVersion: IpVersion
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
export type IpPoolCreate = {
  description: string
  /** The IP version of the pool.

The default is IPv4. */
  ipVersion?: IpVersion
  name: Name
}

export type IpPoolLinkSilo = {
  /** When a pool is the default for a silo, floating IPs and instance ephemeral IPs will come from that pool when no other pool is specified. There can be at most one default for a given silo. */
  isDefault: boolean
  silo: NameOrId
}

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

export type IpPoolRange = {
  id: string
  ipPoolId: string
  range: IpRange
  timeCreated: Date
}

/**
 * A single page of results
 */
export type IpPoolRangeResultsPage = {
  /** list of items on this page of results */
  items: IpPoolRange[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string | null
}

/**
 * A single page of results
 */
export type IpPoolResultsPage = {
  /** list of items on this page of results */
  items: IpPool[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string | null
}

/**
 * A link between an IP pool and a silo that allows one to allocate IPs from the pool within the silo
 */
export type IpPoolSiloLink = {
  ipPoolId: string
  /** When a pool is the default for a silo, floating IPs and instance ephemeral IPs will come from that pool when no other pool is specified. There can be at most one default for a given silo. */
  isDefault: boolean
  siloId: string
}

/**
 * A single page of results
 */
export type IpPoolSiloLinkResultsPage = {
  /** list of items on this page of results */
  items: IpPoolSiloLink[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string | null
}

export type IpPoolSiloUpdate = {
  /** When a pool is the default for a silo, floating IPs and instance ephemeral IPs will come from that pool when no other pool is specified. There can be at most one default for a given silo, so when a pool is made default, an existing default will remain linked but will no longer be the default. */
  isDefault: boolean
}

/**
 * Parameters for updating an IP Pool
 */
export type IpPoolUpdate = { description?: string | null; name?: Name | null }

/**
 * The utilization of IP addresses in a pool.
 *
 * Note that both the count of remaining addresses and the total capacity are integers, reported as floating point numbers. This accommodates allocations larger than a 64-bit integer, which is common with IPv6 address spaces. With very large IP Pools (> 2**53 addresses), integer precision will be lost, in exchange for representing the entire range. In such a case the pool still has many available addresses.
 */
export type IpPoolUtilization = {
  /** The total number of addresses in the pool. */
  capacity: number
  /** The number of remaining addresses in the pool. */
  remaining: number
}

/**
 * A range of IP ports
 *
 * An inclusive-inclusive range of IP ports. The second port may be omitted to represent a single port.
 */
export type L4PortRange = string

/**
 * The forward error correction mode of a link.
 */
export type LinkFec =
  /** Firecode forward error correction. */
  | 'firecode'

  /** No forward error correction. */
  | 'none'

  /** Reed-Solomon forward error correction. */
  | 'rs'

/**
 * The LLDP configuration associated with a port.
 */
export type LldpLinkConfigCreate = {
  /** The LLDP chassis identifier TLV. */
  chassisId?: string | null
  /** Whether or not LLDP is enabled. */
  enabled: boolean
  /** The LLDP link description TLV. */
  linkDescription?: string | null
  /** The LLDP link name TLV. */
  linkName?: string | null
  /** The LLDP management IP TLV. */
  managementIp?: string | null
  /** The LLDP system description TLV. */
  systemDescription?: string | null
  /** The LLDP system name TLV. */
  systemName?: string | null
}

/**
 * The speed of a link.
 */
export type LinkSpeed =
  /** Zero gigabits per second. */
  | 'speed0_g'

  /** 1 gigabit per second. */
  | 'speed1_g'

  /** 10 gigabits per second. */
  | 'speed10_g'

  /** 25 gigabits per second. */
  | 'speed25_g'

  /** 40 gigabits per second. */
  | 'speed40_g'

  /** 50 gigabits per second. */
  | 'speed50_g'

  /** 100 gigabits per second. */
  | 'speed100_g'

  /** 200 gigabits per second. */
  | 'speed200_g'

  /** 400 gigabits per second. */
  | 'speed400_g'

/**
 * Per-port tx-eq overrides.  This can be used to fine-tune the transceiver equalization settings to improve signal integrity.
 */
export type TxEqConfig = {
  /** Main tap */
  main?: number | null
  /** Post-cursor tap1 */
  post1?: number | null
  /** Post-cursor tap2 */
  post2?: number | null
  /** Pre-cursor tap1 */
  pre1?: number | null
  /** Pre-cursor tap2 */
  pre2?: number | null
}

/**
 * Switch link configuration.
 */
export type LinkConfigCreate = {
  /** Whether or not to set autonegotiation. */
  autoneg: boolean
  /** The requested forward-error correction method.  If this is not specified, the standard FEC for the underlying media will be applied if it can be determined. */
  fec?: LinkFec | null
  /** Link name. On ports that are not broken out, this is always phy0. On a 2x breakout the options are phy0 and phy1, on 4x phy0-phy3, etc. */
  linkName: Name
  /** The link-layer discovery protocol (LLDP) configuration for the link. */
  lldp: LldpLinkConfigCreate
  /** Maximum transmission unit for the link. */
  mtu: number
  /** The speed of the link. */
  speed: LinkSpeed
  /** Optional tx_eq settings. */
  txEq?: TxEqConfig | null
}

/**
 * A link layer discovery protocol (LLDP) service configuration.
 */
export type LldpLinkConfig = {
  /** The LLDP chassis identifier TLV. */
  chassisId?: string | null
  /** Whether or not the LLDP service is enabled. */
  enabled: boolean
  /** The id of this LLDP service instance. */
  id: string
  /** The LLDP link description TLV. */
  linkDescription?: string | null
  /** The LLDP link name TLV. */
  linkName?: string | null
  /** The LLDP management IP TLV. */
  managementIp?: string | null
  /** The LLDP system description TLV. */
  systemDescription?: string | null
  /** The LLDP system name TLV. */
  systemName?: string | null
}

export type NetworkAddress = { ipAddr: string } | { iEEE802: number[] }

export type ManagementAddress = {
  addr: NetworkAddress
  interfaceNum: InterfaceNum
  oid?: number[] | null
}

/**
 * Information about LLDP advertisements from other network entities directly connected to a switch port.  This structure contains both metadata about when and where the neighbor was seen, as well as the specific information the neighbor was advertising.
 */
export type LldpNeighbor = {
  /** The LLDP chassis identifier advertised by the neighbor */
  chassisId: string
  /** Initial sighting of this LldpNeighbor */
  firstSeen: Date
  /** Most recent sighting of this LldpNeighbor */
  lastSeen: Date
  /** The LLDP link description advertised by the neighbor */
  linkDescription?: string | null
  /** The LLDP link name advertised by the neighbor */
  linkName: string
  /** The port on which the neighbor was seen */
  localPort: string
  /** The LLDP management IP(s) advertised by the neighbor */
  managementIp: ManagementAddress[]
  /** The LLDP system description advertised by the neighbor */
  systemDescription?: string | null
  /** The LLDP system name advertised by the neighbor */
  systemName?: string | null
}

/**
 * A single page of results
 */
export type LldpNeighborResultsPage = {
  /** list of items on this page of results */
  items: LldpNeighbor[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string | null
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
  /** Address is an anycast address. This allows the address to be assigned to multiple locations simultaneously. */
  anycast: boolean
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
  nextPage?: string | null
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
  nextPage?: string | null
}

/**
 * The type of the metric itself, indicating what its values represent.
 */
export type MetricType =
  /** The value represents an instantaneous measurement in time. */
  | 'gauge'

  /** The value represents a difference between two points in time. */
  | 'delta'

  /** The value represents an accumulation between two points in time. */
  | 'cumulative'

/**
 * The type of network interface
 */
export type NetworkInterfaceKind =
  /** A vNIC attached to a guest instance */
  | { id: string; type: 'instance' }
  /** A vNIC associated with an internal service */
  | { id: string; type: 'service' }
  /** A vNIC associated with a probe */
  | { id: string; type: 'probe' }

/**
 * A Geneve Virtual Network Identifier
 */
export type Vni = number

/**
 * Information required to construct a virtual network interface
 */
export type NetworkInterface = {
  id: string
  ip: string
  kind: NetworkInterfaceKind
  mac: MacAddr
  name: Name
  primary: boolean
  slot: number
  subnet: IpNet
  transitIps?: IpNet[]
  vni: Vni
}

/**
 * List of data values for one timeseries.
 *
 * Each element is an option, where `None` represents a missing sample.
 */
export type ValueArray =
  | { type: 'integer'; values: (number | null)[] }
  | { type: 'double'; values: (number | null)[] }
  | { type: 'boolean'; values: (boolean | null)[] }
  | { type: 'string'; values: (string | null)[] }
  | { type: 'integer_distribution'; values: (Distributionint64 | null)[] }
  | { type: 'double_distribution'; values: (Distributiondouble | null)[] }

/**
 * A single list of values, for one dimension of a timeseries.
 */
export type Values = {
  /** The type of this metric. */
  metricType: MetricType
  /** The data values. */
  values: ValueArray
}

/**
 * Timepoints and values for one timeseries.
 */
export type Points = { startTimes?: Date[] | null; timestamps: Date[]; values: Values[] }

/**
 * A timeseries contains a timestamped set of values from one source.
 *
 * This includes the typed key-value pairs that uniquely identify it, and the set of timestamps and data values from it.
 */
export type Timeseries = { fields: Record<string, FieldValue>; points: Points }

/**
 * A table represents one or more timeseries with the same schema.
 *
 * A table is the result of an OxQL query. It contains a name, usually the name of the timeseries schema from which the data is derived, and any number of timeseries, which contain the actual data.
 */
export type OxqlTable = {
  /** The name of the table. */
  name: string
  /** The set of timeseries in the table, ordered by key. */
  timeseries: Timeseries[]
}

/**
 * The result of a successful OxQL query.
 */
export type OxqlQueryResult = {
  /** Tables resulting from the query, each containing timeseries. */
  tables: OxqlTable[]
}

/**
 * A password used to authenticate a user
 *
 * Passwords may be subject to additional constraints.
 */
export type Password = string

/**
 * Describes the form factor of physical disks.
 */
export type PhysicalDiskKind = 'm2' | 'u2'

/**
 * The operator-defined policy of a physical disk.
 */
export type PhysicalDiskPolicy =
  /** The operator has indicated that the disk is in-service. */
  | { kind: 'in_service' }
  /** The operator has indicated that the disk has been permanently removed from service.

This is a terminal state: once a particular disk ID is expunged, it will never return to service. (The actual hardware may be reused, but it will be treated as a brand-new disk.)

An expunged disk is always non-provisionable. */
  | { kind: 'expunged' }

/**
 * The current state of the disk, as determined by Nexus.
 */
export type PhysicalDiskState =
  /** The disk is currently active, and has resources allocated on it. */
  | 'active'

  /** The disk has been permanently removed from service.

This is a terminal state: once a particular disk ID is decommissioned, it will never return to service. (The actual hardware may be reused, but it will be treated as a brand-new disk.) */
  | 'decommissioned'

/**
 * View of a Physical Disk
 *
 * Physical disks reside in a particular sled and are used to store both Instance Disk data as well as internal metadata.
 */
export type PhysicalDisk = {
  formFactor: PhysicalDiskKind
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  model: string
  /** The operator-defined policy for a physical disk. */
  policy: PhysicalDiskPolicy
  serial: string
  /** The sled to which this disk is attached, if any. */
  sledId?: string | null
  /** The current state Nexus believes the disk to be in. */
  state: PhysicalDiskState
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
  nextPage?: string | null
}

export type PingStatus = 'ok'

export type Ping = {
  /** Whether the external API is reachable. Will always be Ok if the endpoint returns anything at all. */
  status: PingStatus
}

/**
 * Identity-related metadata that's included in nearly all public API objects
 */
export type Probe = {
  /** human-readable free-form text about a resource */
  description: string
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** unique, mutable, user-controlled identifier for each resource */
  name: Name
  sled: string
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
}

/**
 * Create time parameters for probes.
 */
export type ProbeCreate = {
  description: string
  ipPool?: NameOrId | null
  name: Name
  sled: string
}

export type ProbeExternalIpKind = 'snat' | 'floating' | 'ephemeral'

export type ProbeExternalIp = {
  firstPort: number
  ip: string
  kind: ProbeExternalIpKind
  lastPort: number
}

export type ProbeInfo = {
  externalIps: ProbeExternalIp[]
  id: string
  interface: NetworkInterface
  name: Name
  sled: string
}

/**
 * A single page of results
 */
export type ProbeInfoResultsPage = {
  /** list of items on this page of results */
  items: ProbeInfo[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string | null
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
  nextPage?: string | null
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
export type ProjectUpdate = { description?: string | null; name?: Name | null }

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
  nextPage?: string | null
}

/**
 * A route to a destination network through a gateway address.
 */
export type Route = {
  /** The route destination. */
  dst: IpNet
  /** The route gateway. */
  gw: string
  /** Route RIB priority. Higher priority indicates precedence within and across protocols. */
  ribPriority?: number | null
  /** VLAN id the gateway is reachable over. */
  vid?: number | null
}

/**
 * Route configuration data associated with a switch port configuration.
 */
export type RouteConfig = {
  /** Link name. On ports that are not broken out, this is always phy0. On a 2x breakout the options are phy0 and phy1, on 4x phy0-phy3, etc. */
  linkName: Name
  /** The set of routes assigned to a switch port. */
  routes: Route[]
}

/**
 * A `RouteDestination` is used to match traffic with a routing rule based on the destination of that traffic.
 *
 * When traffic is to be sent to a destination that is within a given `RouteDestination`, the corresponding `RouterRoute` applies, and traffic will be forward to the `RouteTarget` for that rule.
 */
export type RouteDestination =
  /** Route applies to traffic destined for the specified IP address */
  | { type: 'ip'; value: string }
  /** Route applies to traffic destined for the specified IP subnet */
  | { type: 'ip_net'; value: IpNet }
  /** Route applies to traffic destined for the specified VPC */
  | { type: 'vpc'; value: Name }
  /** Route applies to traffic destined for the specified VPC subnet */
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
  /** Drop matching traffic */
  | { type: 'drop' }

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
  /** Selects which traffic this routing rule will apply to */
  destination: RouteDestination
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** Describes the kind of router. Set at creation. `read-only` */
  kind: RouterRouteKind
  /** unique, mutable, user-controlled identifier for each resource */
  name: Name
  /** The location that matched packets should be forwarded to */
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
  /** Selects which traffic this routing rule will apply to. */
  destination: RouteDestination
  name: Name
  /** The location that matched packets should be forwarded to. */
  target: RouteTarget
}

/**
 * A single page of results
 */
export type RouterRouteResultsPage = {
  /** list of items on this page of results */
  items: RouterRoute[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string | null
}

/**
 * Updateable properties of a `RouterRoute`
 */
export type RouterRouteUpdate = {
  description?: string | null
  /** Selects which traffic this routing rule will apply to. */
  destination: RouteDestination
  name?: Name | null
  /** The location that matched packets should be forwarded to. */
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
  groupAttributeName?: string | null
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** IdP's entity id */
  idpEntityId: string
  /** unique, mutable, user-controlled identifier for each resource */
  name: Name
  /** Optional request signing public certificate (base64 encoded der file) */
  publicCert?: string | null
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
  groupAttributeName?: string | null
  /** idp's entity id */
  idpEntityId: string
  /** the source of an identity provider metadata descriptor */
  idpMetadataSource: IdpMetadataSource
  name: Name
  /** request signing key pair */
  signingKeypair?: DerEncodedKeyPair | null
  /** service provider endpoint where the idp should send log out requests */
  sloUrl: string
  /** sp's client id */
  spClientId: string
  /** customer's technical contact for saml configuration */
  technicalContactEmail: string
}

/**
 * Configuration of inbound ICMP allowed by API services.
 */
export type ServiceIcmpConfig = {
  /** When enabled, Nexus is able to receive ICMP Destination Unreachable type 3 (port unreachable) and type 4 (fragmentation needed), Redirect, and Time Exceeded messages. These enable Nexus to perform Path MTU discovery and better cope with fragmentation issues. Otherwise all inbound ICMP traffic will be dropped. */
  enabled: boolean
}

/**
 * Parameters for PUT requests to `/v1/system/update/target-release`.
 */
export type SetTargetReleaseParams = {
  /** Version of the system software to make the target release. */
  systemVersion: string
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
  /** Optionally, silos can have a group name that is automatically granted the silo admin role. */
  adminGroupName?: string | null
  /** human-readable free-form text about a resource */
  description: string
  /** A silo where discoverable is false can be retrieved only by its id - it will not be part of the "list all silos" output. */
  discoverable: boolean
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** How users and groups are managed in this Silo */
  identityMode: SiloIdentityMode
  /** Mapping of which Fleet roles are conferred by each Silo role

The default is that no Fleet roles are conferred by any Silo roles unless there's a corresponding entry in this map. */
  mappedFleetRoles: Record<string, FleetRole[]>
  /** unique, mutable, user-controlled identifier for each resource */
  name: Name
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
}

/**
 * View of silo authentication settings
 */
export type SiloAuthSettings = {
  /** Maximum lifetime of a device token in seconds. If set to null, users will be able to create tokens that do not expire. */
  deviceTokenMaxTtlSeconds?: number | null
  siloId: string
}

/**
 * Updateable properties of a silo's settings.
 */
export type SiloAuthSettingsUpdate = {
  /** Maximum lifetime of a device token in seconds. If set to null, users will be able to create tokens that do not expire. */
  deviceTokenMaxTtlSeconds: number | null
}

/**
 * The amount of provisionable resources for a Silo
 */
export type SiloQuotasCreate = {
  /** The amount of virtual CPUs available for running instances in the Silo */
  cpus: number
  /** The amount of RAM (in bytes) available for running instances in the Silo */
  memory: ByteCount
  /** The amount of storage (in bytes) available for disks or snapshots */
  storage: ByteCount
}

/**
 * Create-time parameters for a `Silo`
 */
export type SiloCreate = {
  /** If set, this group will be created during Silo creation and granted the "Silo Admin" role. Identity providers can assert that users belong to this group and those users can log in and further initialize the Silo.

Note that if configuring a SAML based identity provider, group_attribute_name must be set for users to be considered part of a group. See `SamlIdentityProviderCreate` for more information. */
  adminGroupName?: string | null
  description: string
  discoverable: boolean
  identityMode: SiloIdentityMode
  /** Mapping of which Fleet roles are conferred by each Silo role

The default is that no Fleet roles are conferred by any Silo roles unless there's a corresponding entry in this map. */
  mappedFleetRoles?: Record<string, FleetRole[]>
  name: Name
  /** Limits the amount of provisionable CPU, memory, and storage in the Silo. CPU and memory are only consumed by running instances, while storage is consumed by any disk or snapshot. A value of 0 means that resource is *not* provisionable. */
  quotas: SiloQuotasCreate
  /** Initial TLS certificates to be used for the new Silo's console and API endpoints.  These should be valid for the Silo's DNS name(s). */
  tlsCertificates: CertificateCreate[]
}

/**
 * An IP pool in the context of a silo
 */
export type SiloIpPool = {
  /** human-readable free-form text about a resource */
  description: string
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** When a pool is the default for a silo, floating IPs and instance ephemeral IPs will come from that pool when no other pool is specified. There can be at most one default for a given silo. */
  isDefault: boolean
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
export type SiloIpPoolResultsPage = {
  /** list of items on this page of results */
  items: SiloIpPool[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string | null
}

/**
 * A collection of resource counts used to set the virtual capacity of a silo
 */
export type SiloQuotas = {
  /** Number of virtual CPUs */
  cpus: number
  /** Amount of memory in bytes */
  memory: ByteCount
  siloId: string
  /** Amount of disk storage in bytes */
  storage: ByteCount
}

/**
 * A single page of results
 */
export type SiloQuotasResultsPage = {
  /** list of items on this page of results */
  items: SiloQuotas[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string | null
}

/**
 * Updateable properties of a Silo's resource limits. If a value is omitted it will not be updated.
 */
export type SiloQuotasUpdate = {
  /** The amount of virtual CPUs available for running instances in the Silo */
  cpus?: number | null
  /** The amount of RAM (in bytes) available for running instances in the Silo */
  memory?: ByteCount | null
  /** The amount of storage (in bytes) available for disks or snapshots */
  storage?: ByteCount | null
}

/**
 * A single page of results
 */
export type SiloResultsPage = {
  /** list of items on this page of results */
  items: Silo[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string | null
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
 * A collection of resource counts used to describe capacity and utilization
 */
export type VirtualResourceCounts = {
  /** Number of virtual CPUs */
  cpus: number
  /** Amount of memory in bytes */
  memory: ByteCount
  /** Amount of disk storage in bytes */
  storage: ByteCount
}

/**
 * View of a silo's resource utilization and capacity
 */
export type SiloUtilization = {
  /** Accounts for the total amount of resources reserved for silos via their quotas */
  allocated: VirtualResourceCounts
  /** Accounts for resources allocated by in silos like CPU or memory for running instances and storage for disks and snapshots Note that CPU and memory resources associated with a stopped instances are not counted here */
  provisioned: VirtualResourceCounts
  siloId: string
  siloName: Name
}

/**
 * A single page of results
 */
export type SiloUtilizationResultsPage = {
  /** list of items on this page of results */
  items: SiloUtilization[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string | null
}

/**
 * The operator-defined provision policy of a sled.
 *
 * This controls whether new resources are going to be provisioned on this sled.
 */
export type SledProvisionPolicy =
  /** New resources will be provisioned on this sled. */
  | 'provisionable'

  /** New resources will not be provisioned on this sled. However, if the sled is currently in service, existing resources will continue to be on this sled unless manually migrated off. */
  | 'non_provisionable'

/**
 * The operator-defined policy of a sled.
 */
export type SledPolicy =
  /** The operator has indicated that the sled is in-service. */
  | {
      kind: 'in_service'
      /** Determines whether new resources can be provisioned onto the sled. */
      provisionPolicy: SledProvisionPolicy
    }
  /** The operator has indicated that the sled has been permanently removed from service.

This is a terminal state: once a particular sled ID is expunged, it will never return to service. (The actual hardware may be reused, but it will be treated as a brand-new sled.)

An expunged sled is always non-provisionable. */
  | { kind: 'expunged' }

/**
 * The current state of the sled.
 */
export type SledState =
  /** The sled is currently active, and has resources allocated on it. */
  | 'active'

  /** The sled has been permanently removed from service.

This is a terminal state: once a particular sled ID is decommissioned, it will never return to service. (The actual hardware may be reused, but it will be treated as a brand-new sled.) */
  | 'decommissioned'

/**
 * An operator's view of a Sled.
 */
export type Sled = {
  baseboard: Baseboard
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** The operator-defined policy of a sled. */
  policy: SledPolicy
  /** The rack to which this Sled is currently attached */
  rackId: string
  /** The current state of the sled. */
  state: SledState
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
 * The unique ID of a sled.
 */
export type SledId = { id: string }

/**
 * An operator's view of an instance running on a given sled
 */
export type SledInstance = {
  activeSledId: string
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  memory: number
  migrationId?: string | null
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
  nextPage?: string | null
}

/**
 * Parameters for `sled_set_provision_policy`.
 */
export type SledProvisionPolicyParams = {
  /** The provision state. */
  state: SledProvisionPolicy
}

/**
 * Response to `sled_set_provision_policy`.
 */
export type SledProvisionPolicyResponse = {
  /** The new provision state. */
  newState: SledProvisionPolicy
  /** The old provision state. */
  oldState: SledProvisionPolicy
}

/**
 * A single page of results
 */
export type SledResultsPage = {
  /** list of items on this page of results */
  items: Sled[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string | null
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
  /** The disk to be snapshotted */
  disk: NameOrId
  name: Name
}

/**
 * A single page of results
 */
export type SnapshotResultsPage = {
  /** list of items on this page of results */
  items: Snapshot[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string | null
}

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
  nextPage?: string | null
}

export type SupportBundleCreate = {
  /** User comment for the support bundle */
  userComment?: string | null
}

export type SupportBundleState =
  /** Support Bundle still actively being collected.

This is the initial state for a Support Bundle, and it will automatically transition to either "Failing" or "Active".

If a user no longer wants to access a Support Bundle, they can request cancellation, which will transition to the "Destroying" state. */
  | 'collecting'

  /** Support Bundle is being destroyed.

Once backing storage has been freed, this bundle is destroyed. */
  | 'destroying'

  /** Support Bundle was not created successfully, or was created and has lost backing storage.

The record of the bundle still exists for readability, but the only valid operation on these bundles is to destroy them. */
  | 'failed'

  /** Support Bundle has been processed, and is ready for usage. */
  | 'active'

export type SupportBundleInfo = {
  id: string
  reasonForCreation: string
  reasonForFailure?: string | null
  state: SupportBundleState
  timeCreated: Date
  userComment?: string | null
}

/**
 * A single page of results
 */
export type SupportBundleInfoResultsPage = {
  /** list of items on this page of results */
  items: SupportBundleInfo[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string | null
}

export type SupportBundleUpdate = {
  /** User comment for the support bundle */
  userComment?: string | null
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
 * Describes the kind of an switch interface.
 */
export type SwitchInterfaceKind2 =
  /** Primary interfaces are associated with physical links. There is exactly one primary interface per physical link. */
  | 'primary'

  /** VLAN interfaces allow physical interfaces to be multiplexed onto multiple logical links, each distinguished by a 12-bit 802.1Q Ethernet tag. */
  | 'vlan'

  /** Loopback interfaces are anchors for IP addresses that are not specific to any particular port. */
  | 'loopback'

/**
 * A switch port interface configuration for a port settings object.
 */
export type SwitchInterfaceConfig = {
  /** A unique identifier for this switch interface. */
  id: string
  /** The name of this switch interface. */
  interfaceName: Name
  /** The switch interface kind. */
  kind: SwitchInterfaceKind2
  /** The port settings object this switch interface configuration belongs to. */
  portSettingsId: string
  /** Whether or not IPv6 is enabled on this interface. */
  v6Enabled: boolean
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
export type SwitchInterfaceConfigCreate = {
  /** What kind of switch interface this configuration represents. */
  kind: SwitchInterfaceKind
  /** Link name. On ports that are not broken out, this is always phy0. On a 2x breakout the options are phy0 and phy1, on 4x phy0-phy3, etc. */
  linkName: Name
  /** Whether or not IPv6 is enabled. */
  v6Enabled: boolean
}

export type SwitchLinkState = Record<string, unknown>

/**
 * A switch port represents a physical external port on a rack switch.
 */
export type SwitchPort = {
  /** The id of the switch port. */
  id: string
  /** The name of this switch port. */
  portName: Name
  /** The primary settings group of this switch port. Will be `None` until this switch port is configured. */
  portSettingsId?: string | null
  /** The rack this switch port belongs to. */
  rackId: string
  /** The switch location of this switch port. */
  switchLocation: string
}

/**
 * An IP address configuration for a port settings object.
 */
export type SwitchPortAddressView = {
  /** The IP address and prefix. */
  address: IpNet
  /** The id of the address lot block this address is drawn from. */
  addressLotBlockId: string
  /** The id of the address lot this address is drawn from. */
  addressLotId: string
  /** The name of the address lot this address is drawn from. */
  addressLotName: Name
  /** The interface name this address belongs to. */
  interfaceName: Name
  /** The port settings object this address configuration belongs to. */
  portSettingsId: string
  /** An optional VLAN ID */
  vlanId?: number | null
}

/**
 * Parameters for applying settings to switch ports.
 */
export type SwitchPortApplySettings = {
  /** A name or id to use when applying switch port settings. */
  portSettings: NameOrId
}

/**
 * The link geometry associated with a switch port.
 */
export type SwitchPortGeometry2 =
  /** The port contains a single QSFP28 link with four lanes. */
  | 'qsfp28x1'

  /** The port contains two QSFP28 links each with two lanes. */
  | 'qsfp28x2'

  /** The port contains four SFP28 links each with one lane. */
  | 'sfp28x4'

/**
 * A physical port configuration for a port settings object.
 */
export type SwitchPortConfig = {
  /** The physical link geometry of the port. */
  geometry: SwitchPortGeometry2
  /** The id of the port settings object this configuration belongs to. */
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
export type SwitchPortConfigCreate = {
  /** Link geometry for the switch port. */
  geometry: SwitchPortGeometry
}

/**
 * Per-port tx-eq overrides.  This can be used to fine-tune the transceiver equalization settings to improve signal integrity.
 */
export type TxEqConfig2 = {
  /** Main tap */
  main?: number | null
  /** Post-cursor tap1 */
  post1?: number | null
  /** Post-cursor tap2 */
  post2?: number | null
  /** Pre-cursor tap1 */
  pre1?: number | null
  /** Pre-cursor tap2 */
  pre2?: number | null
}

/**
 * A link configuration for a port settings object.
 */
export type SwitchPortLinkConfig = {
  /** Whether or not the link has autonegotiation enabled. */
  autoneg: boolean
  /** The requested forward-error correction method.  If this is not specified, the standard FEC for the underlying media will be applied if it can be determined. */
  fec?: LinkFec | null
  /** The name of this link. */
  linkName: Name
  /** The link-layer discovery protocol service configuration for this link. */
  lldpLinkConfig?: LldpLinkConfig | null
  /** The maximum transmission unit for this link. */
  mtu: number
  /** The port settings this link configuration belongs to. */
  portSettingsId: string
  /** The configured speed of the link. */
  speed: LinkSpeed
  /** The tx_eq configuration for this link. */
  txEqConfig?: TxEqConfig2 | null
}

/**
 * A single page of results
 */
export type SwitchPortResultsPage = {
  /** list of items on this page of results */
  items: SwitchPort[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string | null
}

/**
 * A route configuration for a port settings object.
 */
export type SwitchPortRouteConfig = {
  /** The route's destination network. */
  dst: IpNet
  /** The route's gateway address. */
  gw: string
  /** The interface name this route configuration is assigned to. */
  interfaceName: Name
  /** The port settings object this route configuration belongs to. */
  portSettingsId: string
  /** Route RIB priority. Higher priority indicates precedence within and across protocols. */
  ribPriority?: number | null
  /** The VLAN identifier for the route. Use this if the gateway is reachable over an 802.1Q tagged L2 segment. */
  vlanId?: number | null
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
 * A switch port VLAN interface configuration for a port settings object.
 */
export type SwitchVlanInterfaceConfig = {
  /** The switch interface configuration this VLAN interface configuration belongs to. */
  interfaceConfigId: string
  /** The virtual network id for this interface that is used for producing and consuming 802.1Q Ethernet tags. This field has a maximum value of 4095 as 802.1Q tags are twelve bits. */
  vlanId: number
}

/**
 * This structure contains all port settings information in one place. It's a convenience data structure for getting a complete view of a particular port's settings.
 */
export type SwitchPortSettings = {
  /** Layer 3 IP address settings. */
  addresses: SwitchPortAddressView[]
  /** BGP peer settings. */
  bgpPeers: BgpPeer[]
  /** human-readable free-form text about a resource */
  description: string
  /** Switch port settings included from other switch port settings groups. */
  groups: SwitchPortSettingsGroups[]
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** Layer 3 interface settings. */
  interfaces: SwitchInterfaceConfig[]
  /** Layer 2 link settings. */
  links: SwitchPortLinkConfig[]
  /** unique, mutable, user-controlled identifier for each resource */
  name: Name
  /** Layer 1 physical port settings. */
  port: SwitchPortConfig
  /** IP route settings. */
  routes: SwitchPortRouteConfig[]
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
  /** Vlan interface settings. */
  vlanInterfaces: SwitchVlanInterfaceConfig[]
}

/**
 * Parameters for creating switch port settings. Switch port settings are the central data structure for setting up external networking. Switch port settings include link, interface, route, address and dynamic network protocol configuration.
 */
export type SwitchPortSettingsCreate = {
  /** Address configurations. */
  addresses: AddressConfig[]
  /** BGP peer configurations. */
  bgpPeers?: BgpPeerConfig[]
  description: string
  groups?: NameOrId[]
  /** Interface configurations. */
  interfaces?: SwitchInterfaceConfigCreate[]
  /** Link configurations. */
  links: LinkConfigCreate[]
  name: Name
  portConfig: SwitchPortConfigCreate
  /** Route configurations. */
  routes?: RouteConfig[]
}

/**
 * A switch port settings identity whose id may be used to view additional details.
 */
export type SwitchPortSettingsIdentity = {
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
export type SwitchPortSettingsIdentityResultsPage = {
  /** list of items on this page of results */
  items: SwitchPortSettingsIdentity[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string | null
}

/**
 * A single page of results
 */
export type SwitchResultsPage = {
  /** list of items on this page of results */
  items: Switch[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string | null
}

/**
 * Source of a system software target release.
 */
export type TargetReleaseSource =
  /** Unspecified or unknown source (probably MUPdate). */
  | { type: 'unspecified' }
  /** The specified release of the rack's system software. */
  | { type: 'system_version'; version: string }

/**
 * View of a system software target release.
 */
export type TargetRelease = {
  /** The target-release generation number. */
  generation: number
  /** The source of the target release. */
  releaseSource: TargetReleaseSource
  /** The time it was set as the target release. */
  timeRequested: Date
}

/**
 * Text descriptions for the target and metric of a timeseries.
 */
export type TimeseriesDescription = { metric: string; target: string }

/**
 * The name of a timeseries
 *
 * Names are constructed by concatenating the target and metric names with ':'. Target and metric names must be lowercase alphanumeric characters with '_' separating words.
 */
export type TimeseriesName = string

/**
 * A timeseries query string, written in the Oximeter query language.
 */
export type TimeseriesQuery = {
  /** A timeseries query string, written in the Oximeter query language. */
  query: string
}

/**
 * Measurement units for timeseries samples.
 */
export type Units =
  | 'count'
  | 'bytes'
  | 'seconds'
  | 'nanoseconds'
  | 'volts'
  | 'amps'
  | 'watts'
  | 'degrees_celsius'

  /** No meaningful units, e.g. a dimensionless quanity. */
  | 'none'

  /** Rotations per minute. */
  | 'rpm'

/**
 * The schema for a timeseries.
 *
 * This includes the name of the timeseries, as well as the datum type of its metric and the schema for each field.
 */
export type TimeseriesSchema = {
  authzScope: AuthzScope
  created: Date
  datumType: DatumType
  description: TimeseriesDescription
  fieldSchema: FieldSchema[]
  timeseriesName: TimeseriesName
  units: Units
  version: number
}

/**
 * A single page of results
 */
export type TimeseriesSchemaResultsPage = {
  /** list of items on this page of results */
  items: TimeseriesSchema[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string | null
}

/**
 * Metadata about an individual TUF artifact.
 *
 * Found within a `TufRepoDescription`.
 */
export type TufArtifactMeta = {
  /** Contents of the `BORD` field of a Hubris archive caboose. Only applicable to artifacts that are Hubris archives.

This field should always be `Some(_)` if `sign` is `Some(_)`, but the opposite is not true (SP images will have a `board` but not a `sign`). */
  board?: string | null
  /** The hash of the artifact. */
  hash: string
  /** The artifact ID. */
  id: ArtifactId
  /** Contents of the `SIGN` field of a Hubris archive caboose, i.e., an identifier for the set of valid signing keys. Currently only applicable to RoT image and bootloader artifacts, where it will be an LPC55 Root Key Table Hash (RKTH). */
  sign?: number[] | null
  /** The size of the artifact in bytes. */
  size: number
}

/**
 * Metadata about a TUF repository.
 *
 * Found within a `TufRepoDescription`.
 */
export type TufRepoMeta = {
  /** The file name of the repository.

This is purely used for debugging and may not always be correct (e.g. with wicket, we read the file contents from stdin so we don't know the correct file name). */
  fileName: string
  /** The hash of the repository.

This is a slight abuse of `ArtifactHash`, since that's the hash of individual artifacts within the repository. However, we use it here for convenience. */
  hash: string
  /** The system version in artifacts.json. */
  systemVersion: string
  /** The version of the targets role. */
  targetsRoleVersion: number
  /** The time until which the repo is valid. */
  validUntil: Date
}

/**
 * A description of an uploaded TUF repository.
 */
export type TufRepoDescription = {
  /** Information about the artifacts present in the repository. */
  artifacts: TufArtifactMeta[]
  /** Information about the repository. */
  repo: TufRepoMeta
}

/**
 * Data about a successful TUF repo get from Nexus.
 */
export type TufRepoGetResponse = {
  /** The description of the repository. */
  description: TufRepoDescription
}

/**
 * Status of a TUF repo import.
 *
 * Part of `TufRepoInsertResponse`.
 */
export type TufRepoInsertStatus =
  /** The repository already existed in the database. */
  | 'already_exists'

  /** The repository did not exist, and was inserted into the database. */
  | 'inserted'

/**
 * Data about a successful TUF repo import into Nexus.
 */
export type TufRepoInsertResponse = {
  /** The repository as present in the database. */
  recorded: TufRepoDescription
  /** Whether this repository already existed or is new. */
  status: TufRepoInsertStatus
}

/**
 * A sled that has not been added to an initialized rack yet
 */
export type UninitializedSled = { baseboard: Baseboard; cubby: number; rackId: string }

/**
 * The unique hardware ID for a sled
 */
export type UninitializedSledId = { part: string; serial: string }

/**
 * A single page of results
 */
export type UninitializedSledResultsPage = {
  /** list of items on this page of results */
  items: UninitializedSled[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string | null
}

/**
 * Trusted root role used by the update system to verify update repositories.
 */
export type UpdatesTrustRoot = {
  /** The UUID of this trusted root role. */
  id: string
  /** The trusted root role itself, a JSON document as described by The Update Framework. */
  rootRole: Record<string, unknown>
  /** Time the trusted root role was added. */
  timeCreated: Date
}

/**
 * A single page of results
 */
export type UpdatesTrustRootResultsPage = {
  /** list of items on this page of results */
  items: UpdatesTrustRoot[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string | null
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
 * Built-in users are identities internal to the system, used when the control plane performs actions autonomously
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
  nextPage?: string | null
}

/**
 * A username for a local-only user
 *
 * Usernames must begin with a lower case ASCII letter, be composed exclusively of lowercase ASCII, uppercase ASCII, numbers, and '-', and may not end with a '-'. Usernames cannot be a UUID, but they may contain a UUID. They can be at most 63 characters long.
 */
export type UserId = string

/**
 * Parameters for setting a user's password
 */
export type UserPassword =
  /** Sets the user's password to the provided value */
  | { mode: 'password'; value: Password }
  /** Invalidates any current password (disabling password authentication) */
  | { mode: 'login_disallowed' }

/**
 * Create-time parameters for a `User`
 */
export type UserCreate = {
  /** username used to log in */
  externalId: UserId
  /** how to set the user's login password */
  password: UserPassword
}

/**
 * A single page of results
 */
export type UserResultsPage = {
  /** list of items on this page of results */
  items: User[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string | null
}

/**
 * Credentials for local user login
 */
export type UsernamePasswordCredentials = { password: Password; username: UserId }

/**
 * View of the current silo's resource utilization and capacity
 */
export type Utilization = {
  /** The total amount of resources that can be provisioned in this silo Actions that would exceed this limit will fail */
  capacity: VirtualResourceCounts
  /** Accounts for resources allocated to running instances or storage allocated via disks or snapshots Note that CPU and memory resources associated with a stopped instances are not counted here whereas associated disks will still be counted */
  provisioned: VirtualResourceCounts
}

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
  ipv6Prefix?: Ipv6Net | null
  name: Name
}

export type VpcFirewallIcmpFilter = { code?: IcmpParamRange | null; icmpType: number }

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
export type VpcFirewallRuleProtocol =
  | { type: 'tcp' }
  | { type: 'udp' }
  | { type: 'icmp'; value: VpcFirewallIcmpFilter | null }

/**
 * Filters reduce the scope of a firewall rule. Without filters, the rule applies to all packets to the targets (or from the targets, if it's an outbound rule). With multiple filters, the rule applies only to packets matching ALL filters. The maximum number of each type of filter is 256.
 */
export type VpcFirewallRuleFilter = {
  /** If present, host filters match the "other end" of traffic from the target’s perspective: for an inbound rule, they match the source of traffic. For an outbound rule, they match the destination. */
  hosts?: VpcFirewallRuleHostFilter[] | null
  /** If present, the destination ports or port ranges this rule applies to. */
  ports?: L4PortRange[] | null
  /** If present, the networking protocols this rule applies to. */
  protocols?: VpcFirewallRuleProtocol[] | null
}

export type VpcFirewallRuleStatus = 'disabled' | 'enabled'

/**
 * A `VpcFirewallRuleTarget` is used to specify the set of instances to which a firewall rule applies. You can target instances directly by name, or specify a VPC, VPC subnet, IP, or IP subnet, which will apply the rule to traffic going to all matching instances. Targets are additive: the rule applies to instances matching ANY target.
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
  /** Whether traffic matching the rule should be allowed or dropped */
  action: VpcFirewallRuleAction
  /** human-readable free-form text about a resource */
  description: string
  /** Whether this rule is for incoming or outgoing traffic */
  direction: VpcFirewallRuleDirection
  /** Reductions on the scope of the rule */
  filters: VpcFirewallRuleFilter
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** unique, mutable, user-controlled identifier for each resource */
  name: Name
  /** The relative priority of this rule */
  priority: number
  /** Whether this rule is in effect */
  status: VpcFirewallRuleStatus
  /** Determine the set of instances that the rule applies to */
  targets: VpcFirewallRuleTarget[]
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
  /** The VPC to which this rule belongs */
  vpcId: string
}

/**
 * A single rule in a VPC firewall
 */
export type VpcFirewallRuleUpdate = {
  /** Whether traffic matching the rule should be allowed or dropped */
  action: VpcFirewallRuleAction
  /** Human-readable free-form text about a resource */
  description: string
  /** Whether this rule is for incoming or outgoing traffic */
  direction: VpcFirewallRuleDirection
  /** Reductions on the scope of the rule */
  filters: VpcFirewallRuleFilter
  /** Name of the rule, unique to this VPC */
  name: Name
  /** The relative priority of this rule */
  priority: number
  /** Whether this rule is in effect */
  status: VpcFirewallRuleStatus
  /** Determine the set of instances that the rule applies to */
  targets: VpcFirewallRuleTarget[]
}

/**
 * Updated list of firewall rules. Will replace all existing rules.
 */
export type VpcFirewallRuleUpdateParams = { rules?: VpcFirewallRuleUpdate[] }

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
  nextPage?: string | null
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
  nextPage?: string | null
}

/**
 * Updateable properties of a `VpcRouter`
 */
export type VpcRouterUpdate = { description?: string | null; name?: Name | null }

/**
 * A VPC subnet represents a logical grouping for instances that allows network traffic between them, within a IPv4 subnetwork or optionally an IPv6 subnetwork.
 */
export type VpcSubnet = {
  /** ID for an attached custom router. */
  customRouterId?: string | null
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
  /** An optional router, used to direct packets sent from hosts in this subnet to any destination address.

Custom routers apply in addition to the VPC-wide *system* router, and have higher priority than the system router for an otherwise equal-prefix-length match. */
  customRouter?: NameOrId | null
  description: string
  /** The IPv4 address range for this subnet.

It must be allocated from an RFC 1918 private address range, and must not overlap with any other existing subnet in the VPC. */
  ipv4Block: Ipv4Net
  /** The IPv6 address range for this subnet.

It must be allocated from the RFC 4193 Unique Local Address range, with the prefix equal to the parent VPC's prefix. A random `/64` block will be assigned if one is not provided. It must not overlap with any existing subnet in the VPC. */
  ipv6Block?: Ipv6Net | null
  name: Name
}

/**
 * A single page of results
 */
export type VpcSubnetResultsPage = {
  /** list of items on this page of results */
  items: VpcSubnet[]
  /** token used to fetch the next page of results (if any) */
  nextPage?: string | null
}

/**
 * Updateable properties of a `VpcSubnet`
 */
export type VpcSubnetUpdate = {
  /** An optional router, used to direct packets sent from hosts in this subnet to any destination address. */
  customRouter?: NameOrId | null
  description?: string | null
  name?: Name | null
}

/**
 * Updateable properties of a `Vpc`
 */
export type VpcUpdate = {
  description?: string | null
  dnsName?: Name | null
  name?: Name | null
}

/**
 * Create-time identity-related parameters
 */
export type WebhookCreate = {
  description: string
  /** The URL that webhook notification requests should be sent to */
  endpoint: string
  name: Name
  /** A non-empty list of secret keys used to sign webhook payloads. */
  secrets: string[]
  /** A list of webhook event class subscriptions.

If this list is empty or is not included in the request body, the webhook will not be subscribed to any events. */
  subscriptions?: AlertSubscription[]
}

/**
 * The configuration for a webhook alert receiver.
 */
export type WebhookReceiver = {
  /** human-readable free-form text about a resource */
  description: string
  /** The URL that webhook notification requests are sent to. */
  endpoint: string
  /** unique, immutable, system-controlled identifier for each resource */
  id: string
  /** unique, mutable, user-controlled identifier for each resource */
  name: Name
  secrets: WebhookSecret[]
  /** The list of alert classes to which this receiver is subscribed. */
  subscriptions: AlertSubscription[]
  /** timestamp when this resource was created */
  timeCreated: Date
  /** timestamp when this resource was last modified */
  timeModified: Date
}

/**
 * Parameters to update a webhook configuration.
 */
export type WebhookReceiverUpdate = {
  description?: string | null
  /** The URL that webhook notification requests should be sent to */
  endpoint?: string | null
  name?: Name | null
}

export type WebhookSecretCreate = {
  /** The value of the shared secret key. */
  secret: string
}

/**
 * A list of the IDs of secrets associated with a webhook receiver.
 */
export type WebhookSecrets = { secrets: WebhookSecret[] }

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
 * Supported set of sort modes for scanning by timestamp and ID
 */
export type TimeAndIdSortMode =
  /** sort in increasing order of timestamp and ID, i.e., earliest first */
  | 'time_and_id_ascending'

  /** sort in increasing order of timestamp and ID, i.e., most recent first */
  | 'time_and_id_descending'

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
 * The order in which the client wants to page through the requested collection
 */
export type PaginationOrder = 'ascending' | 'descending'

/**
 * Supported set of sort modes for scanning by name only
 *
 * Currently, we only support scanning in ascending order.
 */
export type NameSortMode = 'name_ascending'

export interface ProbeListQueryParams {
  limit?: number | null
  pageToken?: string | null
  project?: NameOrId
  sortBy?: NameOrIdSortMode
}

export interface ProbeCreateQueryParams {
  project: NameOrId
}

export interface ProbeViewPathParams {
  probe: NameOrId
}

export interface ProbeViewQueryParams {
  project: NameOrId
}

export interface ProbeDeletePathParams {
  probe: NameOrId
}

export interface ProbeDeleteQueryParams {
  project: NameOrId
}

export interface SupportBundleListQueryParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: TimeAndIdSortMode
}

export interface SupportBundleViewPathParams {
  bundleId: string
}

export interface SupportBundleUpdatePathParams {
  bundleId: string
}

export interface SupportBundleDeletePathParams {
  bundleId: string
}

export interface SupportBundleDownloadPathParams {
  bundleId: string
}

export interface SupportBundleHeadPathParams {
  bundleId: string
}

export interface SupportBundleDownloadFilePathParams {
  bundleId: string
  file: string
}

export interface SupportBundleHeadFilePathParams {
  bundleId: string
  file: string
}

export interface SupportBundleIndexPathParams {
  bundleId: string
}

export interface LoginSamlPathParams {
  providerName: Name
  siloName: Name
}

export interface AffinityGroupListQueryParams {
  limit?: number | null
  pageToken?: string | null
  project?: NameOrId
  sortBy?: NameOrIdSortMode
}

export interface AffinityGroupCreateQueryParams {
  project: NameOrId
}

export interface AffinityGroupViewPathParams {
  affinityGroup: NameOrId
}

export interface AffinityGroupViewQueryParams {
  project?: NameOrId
}

export interface AffinityGroupUpdatePathParams {
  affinityGroup: NameOrId
}

export interface AffinityGroupUpdateQueryParams {
  project?: NameOrId
}

export interface AffinityGroupDeletePathParams {
  affinityGroup: NameOrId
}

export interface AffinityGroupDeleteQueryParams {
  project?: NameOrId
}

export interface AffinityGroupMemberListPathParams {
  affinityGroup: NameOrId
}

export interface AffinityGroupMemberListQueryParams {
  limit?: number | null
  pageToken?: string | null
  project?: NameOrId
  sortBy?: NameOrIdSortMode
}

export interface AffinityGroupMemberInstanceViewPathParams {
  affinityGroup: NameOrId
  instance: NameOrId
}

export interface AffinityGroupMemberInstanceViewQueryParams {
  project?: NameOrId
}

export interface AffinityGroupMemberInstanceAddPathParams {
  affinityGroup: NameOrId
  instance: NameOrId
}

export interface AffinityGroupMemberInstanceAddQueryParams {
  project?: NameOrId
}

export interface AffinityGroupMemberInstanceDeletePathParams {
  affinityGroup: NameOrId
  instance: NameOrId
}

export interface AffinityGroupMemberInstanceDeleteQueryParams {
  project?: NameOrId
}

export interface AlertClassListQueryParams {
  limit?: number | null
  pageToken?: string | null
  filter?: AlertSubscription
}

export interface AlertReceiverListQueryParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: NameOrIdSortMode
}

export interface AlertReceiverViewPathParams {
  receiver: NameOrId
}

export interface AlertReceiverDeletePathParams {
  receiver: NameOrId
}

export interface AlertDeliveryListPathParams {
  receiver: NameOrId
}

export interface AlertDeliveryListQueryParams {
  delivered?: boolean | null
  failed?: boolean | null
  pending?: boolean | null
  limit?: number | null
  pageToken?: string | null
  sortBy?: TimeAndIdSortMode
}

export interface AlertReceiverProbePathParams {
  receiver: NameOrId
}

export interface AlertReceiverProbeQueryParams {
  resend?: boolean
}

export interface AlertReceiverSubscriptionAddPathParams {
  receiver: NameOrId
}

export interface AlertReceiverSubscriptionRemovePathParams {
  receiver: NameOrId
  subscription: AlertSubscription
}

export interface AlertDeliveryResendPathParams {
  alertId: string
}

export interface AlertDeliveryResendQueryParams {
  receiver: NameOrId
}

export interface AntiAffinityGroupListQueryParams {
  limit?: number | null
  pageToken?: string | null
  project?: NameOrId
  sortBy?: NameOrIdSortMode
}

export interface AntiAffinityGroupCreateQueryParams {
  project: NameOrId
}

export interface AntiAffinityGroupViewPathParams {
  antiAffinityGroup: NameOrId
}

export interface AntiAffinityGroupViewQueryParams {
  project?: NameOrId
}

export interface AntiAffinityGroupUpdatePathParams {
  antiAffinityGroup: NameOrId
}

export interface AntiAffinityGroupUpdateQueryParams {
  project?: NameOrId
}

export interface AntiAffinityGroupDeletePathParams {
  antiAffinityGroup: NameOrId
}

export interface AntiAffinityGroupDeleteQueryParams {
  project?: NameOrId
}

export interface AntiAffinityGroupMemberListPathParams {
  antiAffinityGroup: NameOrId
}

export interface AntiAffinityGroupMemberListQueryParams {
  limit?: number | null
  pageToken?: string | null
  project?: NameOrId
  sortBy?: NameOrIdSortMode
}

export interface AntiAffinityGroupMemberInstanceViewPathParams {
  antiAffinityGroup: NameOrId
  instance: NameOrId
}

export interface AntiAffinityGroupMemberInstanceViewQueryParams {
  project?: NameOrId
}

export interface AntiAffinityGroupMemberInstanceAddPathParams {
  antiAffinityGroup: NameOrId
  instance: NameOrId
}

export interface AntiAffinityGroupMemberInstanceAddQueryParams {
  project?: NameOrId
}

export interface AntiAffinityGroupMemberInstanceDeletePathParams {
  antiAffinityGroup: NameOrId
  instance: NameOrId
}

export interface AntiAffinityGroupMemberInstanceDeleteQueryParams {
  project?: NameOrId
}

export interface CertificateListQueryParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: NameOrIdSortMode
}

export interface CertificateViewPathParams {
  certificate: NameOrId
}

export interface CertificateDeletePathParams {
  certificate: NameOrId
}

export interface DiskListQueryParams {
  limit?: number | null
  pageToken?: string | null
  project?: NameOrId
  sortBy?: NameOrIdSortMode
}

export interface DiskCreateQueryParams {
  project: NameOrId
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

export interface FloatingIpListQueryParams {
  limit?: number | null
  pageToken?: string | null
  project?: NameOrId
  sortBy?: NameOrIdSortMode
}

export interface FloatingIpCreateQueryParams {
  project: NameOrId
}

export interface FloatingIpViewPathParams {
  floatingIp: NameOrId
}

export interface FloatingIpViewQueryParams {
  project?: NameOrId
}

export interface FloatingIpUpdatePathParams {
  floatingIp: NameOrId
}

export interface FloatingIpUpdateQueryParams {
  project?: NameOrId
}

export interface FloatingIpDeletePathParams {
  floatingIp: NameOrId
}

export interface FloatingIpDeleteQueryParams {
  project?: NameOrId
}

export interface FloatingIpAttachPathParams {
  floatingIp: NameOrId
}

export interface FloatingIpAttachQueryParams {
  project?: NameOrId
}

export interface FloatingIpDetachPathParams {
  floatingIp: NameOrId
}

export interface FloatingIpDetachQueryParams {
  project?: NameOrId
}

export interface GroupListQueryParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: IdSortMode
}

export interface GroupViewPathParams {
  groupId: string
}

export interface ImageListQueryParams {
  limit?: number | null
  pageToken?: string | null
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
  project: NameOrId
}

export interface ImagePromotePathParams {
  image: NameOrId
}

export interface ImagePromoteQueryParams {
  project?: NameOrId
}

export interface InstanceListQueryParams {
  limit?: number | null
  pageToken?: string | null
  project?: NameOrId
  sortBy?: NameOrIdSortMode
}

export interface InstanceCreateQueryParams {
  project: NameOrId
}

export interface InstanceViewPathParams {
  instance: NameOrId
}

export interface InstanceViewQueryParams {
  project?: NameOrId
}

export interface InstanceUpdatePathParams {
  instance: NameOrId
}

export interface InstanceUpdateQueryParams {
  project?: NameOrId
}

export interface InstanceDeletePathParams {
  instance: NameOrId
}

export interface InstanceDeleteQueryParams {
  project?: NameOrId
}

export interface InstanceAffinityGroupListPathParams {
  instance: NameOrId
}

export interface InstanceAffinityGroupListQueryParams {
  limit?: number | null
  pageToken?: string | null
  project?: NameOrId
  sortBy?: NameOrIdSortMode
}

export interface InstanceAntiAffinityGroupListPathParams {
  instance: NameOrId
}

export interface InstanceAntiAffinityGroupListQueryParams {
  limit?: number | null
  pageToken?: string | null
  project?: NameOrId
  sortBy?: NameOrIdSortMode
}

export interface InstanceDiskListPathParams {
  instance: NameOrId
}

export interface InstanceDiskListQueryParams {
  limit?: number | null
  pageToken?: string | null
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

export interface InstanceEphemeralIpAttachPathParams {
  instance: NameOrId
}

export interface InstanceEphemeralIpAttachQueryParams {
  project?: NameOrId
}

export interface InstanceEphemeralIpDetachPathParams {
  instance: NameOrId
}

export interface InstanceEphemeralIpDetachQueryParams {
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
  fromStart?: number | null
  maxBytes?: number | null
  mostRecent?: number | null
  project?: NameOrId
}

export interface InstanceSerialConsoleStreamPathParams {
  instance: NameOrId
}

export interface InstanceSerialConsoleStreamQueryParams {
  mostRecent?: number | null
  project?: NameOrId
}

export interface InstanceSshPublicKeyListPathParams {
  instance: NameOrId
}

export interface InstanceSshPublicKeyListQueryParams {
  limit?: number | null
  pageToken?: string | null
  project?: NameOrId
  sortBy?: NameOrIdSortMode
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

export interface InternetGatewayIpAddressListQueryParams {
  gateway?: NameOrId
  limit?: number | null
  pageToken?: string | null
  project?: NameOrId
  sortBy?: NameOrIdSortMode
  vpc?: NameOrId
}

export interface InternetGatewayIpAddressCreateQueryParams {
  gateway: NameOrId
  project?: NameOrId
  vpc?: NameOrId
}

export interface InternetGatewayIpAddressDeletePathParams {
  address: NameOrId
}

export interface InternetGatewayIpAddressDeleteQueryParams {
  cascade?: boolean
  gateway?: NameOrId
  project?: NameOrId
  vpc?: NameOrId
}

export interface InternetGatewayIpPoolListQueryParams {
  gateway?: NameOrId
  limit?: number | null
  pageToken?: string | null
  project?: NameOrId
  sortBy?: NameOrIdSortMode
  vpc?: NameOrId
}

export interface InternetGatewayIpPoolCreateQueryParams {
  gateway: NameOrId
  project?: NameOrId
  vpc?: NameOrId
}

export interface InternetGatewayIpPoolDeletePathParams {
  pool: NameOrId
}

export interface InternetGatewayIpPoolDeleteQueryParams {
  cascade?: boolean
  gateway?: NameOrId
  project?: NameOrId
  vpc?: NameOrId
}

export interface InternetGatewayListQueryParams {
  limit?: number | null
  pageToken?: string | null
  project?: NameOrId
  sortBy?: NameOrIdSortMode
  vpc?: NameOrId
}

export interface InternetGatewayCreateQueryParams {
  project?: NameOrId
  vpc: NameOrId
}

export interface InternetGatewayViewPathParams {
  gateway: NameOrId
}

export interface InternetGatewayViewQueryParams {
  project?: NameOrId
  vpc?: NameOrId
}

export interface InternetGatewayDeletePathParams {
  gateway: NameOrId
}

export interface InternetGatewayDeleteQueryParams {
  cascade?: boolean
  project?: NameOrId
  vpc?: NameOrId
}

export interface ProjectIpPoolListQueryParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: NameOrIdSortMode
}

export interface ProjectIpPoolViewPathParams {
  pool: NameOrId
}

export interface LoginLocalPathParams {
  siloName: Name
}

export interface CurrentUserAccessTokenListQueryParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: IdSortMode
}

export interface CurrentUserAccessTokenDeletePathParams {
  tokenId: string
}

export interface CurrentUserGroupsQueryParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: IdSortMode
}

export interface CurrentUserSshKeyListQueryParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: NameOrIdSortMode
}

export interface CurrentUserSshKeyViewPathParams {
  sshKey: NameOrId
}

export interface CurrentUserSshKeyDeletePathParams {
  sshKey: NameOrId
}

export interface SiloMetricPathParams {
  metricName: SystemMetricName
}

export interface SiloMetricQueryParams {
  endTime?: Date
  limit?: number | null
  order?: PaginationOrder
  pageToken?: string | null
  startTime?: Date
  project?: NameOrId
}

export interface InstanceNetworkInterfaceListQueryParams {
  instance?: NameOrId
  limit?: number | null
  pageToken?: string | null
  project?: NameOrId
  sortBy?: NameOrIdSortMode
}

export interface InstanceNetworkInterfaceCreateQueryParams {
  instance: NameOrId
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
  limit?: number | null
  pageToken?: string | null
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
  limit?: number | null
  pageToken?: string | null
  project?: NameOrId
  sortBy?: NameOrIdSortMode
}

export interface SnapshotCreateQueryParams {
  project: NameOrId
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

export interface AuditLogListQueryParams {
  endTime?: Date | null
  limit?: number | null
  pageToken?: string | null
  sortBy?: TimeAndIdSortMode
  startTime?: Date
}

export interface PhysicalDiskListQueryParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: IdSortMode
}

export interface PhysicalDiskViewPathParams {
  diskId: string
}

export interface NetworkingSwitchPortLldpNeighborsPathParams {
  port: Name
  rackId: string
  switchLocation: Name
}

export interface NetworkingSwitchPortLldpNeighborsQueryParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: IdSortMode
}

export interface RackListQueryParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: IdSortMode
}

export interface RackViewPathParams {
  rackId: string
}

export interface SledListQueryParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: IdSortMode
}

export interface SledViewPathParams {
  sledId: string
}

export interface SledPhysicalDiskListPathParams {
  sledId: string
}

export interface SledPhysicalDiskListQueryParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: IdSortMode
}

export interface SledInstanceListPathParams {
  sledId: string
}

export interface SledInstanceListQueryParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: IdSortMode
}

export interface SledSetProvisionPolicyPathParams {
  sledId: string
}

export interface SledListUninitializedQueryParams {
  limit?: number | null
  pageToken?: string | null
}

export interface NetworkingSwitchPortListQueryParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: IdSortMode
  switchPortId?: string | null
}

export interface NetworkingSwitchPortLldpConfigViewPathParams {
  port: Name
}

export interface NetworkingSwitchPortLldpConfigViewQueryParams {
  rackId: string
  switchLocation: Name
}

export interface NetworkingSwitchPortLldpConfigUpdatePathParams {
  port: Name
}

export interface NetworkingSwitchPortLldpConfigUpdateQueryParams {
  rackId: string
  switchLocation: Name
}

export interface NetworkingSwitchPortApplySettingsPathParams {
  port: Name
}

export interface NetworkingSwitchPortApplySettingsQueryParams {
  rackId: string
  switchLocation: Name
}

export interface NetworkingSwitchPortClearSettingsPathParams {
  port: Name
}

export interface NetworkingSwitchPortClearSettingsQueryParams {
  rackId: string
  switchLocation: Name
}

export interface NetworkingSwitchPortStatusPathParams {
  port: Name
}

export interface NetworkingSwitchPortStatusQueryParams {
  rackId: string
  switchLocation: Name
}

export interface SwitchListQueryParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: IdSortMode
}

export interface SwitchViewPathParams {
  switchId: string
}

export interface SiloIdentityProviderListQueryParams {
  limit?: number | null
  pageToken?: string | null
  silo?: NameOrId
  sortBy?: NameOrIdSortMode
}

export interface LocalIdpUserCreateQueryParams {
  silo: NameOrId
}

export interface LocalIdpUserDeletePathParams {
  userId: string
}

export interface LocalIdpUserDeleteQueryParams {
  silo: NameOrId
}

export interface LocalIdpUserSetPasswordPathParams {
  userId: string
}

export interface LocalIdpUserSetPasswordQueryParams {
  silo: NameOrId
}

export interface SamlIdentityProviderCreateQueryParams {
  silo: NameOrId
}

export interface SamlIdentityProviderViewPathParams {
  provider: NameOrId
}

export interface SamlIdentityProviderViewQueryParams {
  silo?: NameOrId
}

export interface IpPoolListQueryParams {
  limit?: number | null
  pageToken?: string | null
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
  limit?: number | null
  pageToken?: string | null
}

export interface IpPoolRangeAddPathParams {
  pool: NameOrId
}

export interface IpPoolRangeRemovePathParams {
  pool: NameOrId
}

export interface IpPoolSiloListPathParams {
  pool: NameOrId
}

export interface IpPoolSiloListQueryParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: IdSortMode
}

export interface IpPoolSiloLinkPathParams {
  pool: NameOrId
}

export interface IpPoolSiloUpdatePathParams {
  pool: NameOrId
  silo: NameOrId
}

export interface IpPoolSiloUnlinkPathParams {
  pool: NameOrId
  silo: NameOrId
}

export interface IpPoolUtilizationViewPathParams {
  pool: NameOrId
}

export interface IpPoolServiceRangeListQueryParams {
  limit?: number | null
  pageToken?: string | null
}

export interface SystemMetricPathParams {
  metricName: SystemMetricName
}

export interface SystemMetricQueryParams {
  endTime?: Date
  limit?: number | null
  order?: PaginationOrder
  pageToken?: string | null
  startTime?: Date
  silo?: NameOrId
}

export interface NetworkingAddressLotListQueryParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: NameOrIdSortMode
}

export interface NetworkingAddressLotViewPathParams {
  addressLot: NameOrId
}

export interface NetworkingAddressLotDeletePathParams {
  addressLot: NameOrId
}

export interface NetworkingAddressLotBlockListPathParams {
  addressLot: NameOrId
}

export interface NetworkingAddressLotBlockListQueryParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: IdSortMode
}

export interface NetworkingBgpConfigListQueryParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: NameOrIdSortMode
}

export interface NetworkingBgpConfigDeleteQueryParams {
  nameOrId: NameOrId
}

export interface NetworkingBgpAnnounceSetListQueryParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: NameOrIdSortMode
}

export interface NetworkingBgpAnnounceSetDeletePathParams {
  announceSet: NameOrId
}

export interface NetworkingBgpAnnouncementListPathParams {
  announceSet: NameOrId
}

export interface NetworkingBgpMessageHistoryQueryParams {
  asn: number
}

export interface NetworkingBgpImportedRoutesIpv4QueryParams {
  asn: number
}

export interface NetworkingLoopbackAddressListQueryParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: IdSortMode
}

export interface NetworkingLoopbackAddressDeletePathParams {
  address: string
  rackId: string
  subnetMask: number
  switchLocation: Name
}

export interface NetworkingSwitchPortSettingsListQueryParams {
  limit?: number | null
  pageToken?: string | null
  portSettings?: NameOrId
  sortBy?: NameOrIdSortMode
}

export interface NetworkingSwitchPortSettingsDeleteQueryParams {
  portSettings?: NameOrId
}

export interface NetworkingSwitchPortSettingsViewPathParams {
  port: NameOrId
}

export interface SystemQuotasListQueryParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: IdSortMode
}

export interface SiloListQueryParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: NameOrIdSortMode
}

export interface SiloViewPathParams {
  silo: NameOrId
}

export interface SiloDeletePathParams {
  silo: NameOrId
}

export interface SiloIpPoolListPathParams {
  silo: NameOrId
}

export interface SiloIpPoolListQueryParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: NameOrIdSortMode
}

export interface SiloPolicyViewPathParams {
  silo: NameOrId
}

export interface SiloPolicyUpdatePathParams {
  silo: NameOrId
}

export interface SiloQuotasViewPathParams {
  silo: NameOrId
}

export interface SiloQuotasUpdatePathParams {
  silo: NameOrId
}

export interface SystemTimeseriesSchemaListQueryParams {
  limit?: number | null
  pageToken?: string | null
}

export interface SystemUpdatePutRepositoryQueryParams {
  fileName: string
}

export interface SystemUpdateGetRepositoryPathParams {
  systemVersion: string
}

export interface SystemUpdateTrustRootListQueryParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: IdSortMode
}

export interface SystemUpdateTrustRootViewPathParams {
  trustRootId: string
}

export interface SystemUpdateTrustRootDeletePathParams {
  trustRootId: string
}

export interface SiloUserListQueryParams {
  limit?: number | null
  pageToken?: string | null
  silo?: NameOrId
  sortBy?: IdSortMode
}

export interface SiloUserViewPathParams {
  userId: string
}

export interface SiloUserViewQueryParams {
  silo: NameOrId
}

export interface UserBuiltinListQueryParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: NameSortMode
}

export interface UserBuiltinViewPathParams {
  user: NameOrId
}

export interface SiloUtilizationListQueryParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: NameOrIdSortMode
}

export interface SiloUtilizationViewPathParams {
  silo: NameOrId
}

export interface TimeseriesQueryQueryParams {
  project: NameOrId
}

export interface UserListQueryParams {
  group?: string | null
  limit?: number | null
  pageToken?: string | null
  sortBy?: IdSortMode
}

export interface UserViewPathParams {
  userId: string
}

export interface UserTokenListPathParams {
  userId: string
}

export interface UserTokenListQueryParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: IdSortMode
}

export interface UserLogoutPathParams {
  userId: string
}

export interface UserSessionListPathParams {
  userId: string
}

export interface UserSessionListQueryParams {
  limit?: number | null
  pageToken?: string | null
  sortBy?: IdSortMode
}

export interface VpcFirewallRulesViewQueryParams {
  project?: NameOrId
  vpc: NameOrId
}

export interface VpcFirewallRulesUpdateQueryParams {
  project?: NameOrId
  vpc: NameOrId
}

export interface VpcRouterRouteListQueryParams {
  limit?: number | null
  pageToken?: string | null
  project?: NameOrId
  router?: NameOrId
  sortBy?: NameOrIdSortMode
  vpc?: NameOrId
}

export interface VpcRouterRouteCreateQueryParams {
  project?: NameOrId
  router: NameOrId
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
  limit?: number | null
  pageToken?: string | null
  project?: NameOrId
  sortBy?: NameOrIdSortMode
  vpc?: NameOrId
}

export interface VpcRouterCreateQueryParams {
  project?: NameOrId
  vpc: NameOrId
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
  limit?: number | null
  pageToken?: string | null
  project?: NameOrId
  sortBy?: NameOrIdSortMode
  vpc?: NameOrId
}

export interface VpcSubnetCreateQueryParams {
  project?: NameOrId
  vpc: NameOrId
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
  limit?: number | null
  pageToken?: string | null
  project?: NameOrId
  sortBy?: NameOrIdSortMode
  vpc?: NameOrId
}

export interface VpcListQueryParams {
  limit?: number | null
  pageToken?: string | null
  project?: NameOrId
  sortBy?: NameOrIdSortMode
}

export interface VpcCreateQueryParams {
  project: NameOrId
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

export interface WebhookReceiverUpdatePathParams {
  receiver: NameOrId
}

export interface WebhookSecretsListQueryParams {
  receiver: NameOrId
}

export interface WebhookSecretsAddQueryParams {
  receiver: NameOrId
}

export interface WebhookSecretsDeletePathParams {
  secretId: string
}

type EmptyObj = Record<string, never>
export class Api extends HttpClient {
  methods = {
    /**
     * Start an OAuth 2.0 Device Authorization Grant
     */
    deviceAuthRequest: (_: EmptyObj, params: FetchParams = {}) => {
      return this.request<void>({
        path: `/device/auth`,
        method: 'POST',
        ...params,
      })
    },
    /**
     * Confirm an OAuth 2.0 Device Authorization Grant
     */
    deviceAuthConfirm: ({ body }: { body: DeviceAuthVerify }, params: FetchParams = {}) => {
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
    deviceAccessToken: (_: EmptyObj, params: FetchParams = {}) => {
      return this.request<void>({
        path: `/device/token`,
        method: 'POST',
        ...params,
      })
    },
    /**
     * List instrumentation probes
     */
    probeList: (
      { query = {} }: { query?: ProbeListQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<ProbeInfoResultsPage>({
        path: `/experimental/v1/probes`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create instrumentation probe
     */
    probeCreate: (
      { query, body }: { query: ProbeCreateQueryParams; body: ProbeCreate },
      params: FetchParams = {}
    ) => {
      return this.request<Probe>({
        path: `/experimental/v1/probes`,
        method: 'POST',
        body,
        query,
        ...params,
      })
    },
    /**
     * View instrumentation probe
     */
    probeView: (
      { path, query }: { path: ProbeViewPathParams; query: ProbeViewQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<ProbeInfo>({
        path: `/experimental/v1/probes/${path.probe}`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Delete instrumentation probe
     */
    probeDelete: (
      { path, query }: { path: ProbeDeletePathParams; query: ProbeDeleteQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/experimental/v1/probes/${path.probe}`,
        method: 'DELETE',
        query,
        ...params,
      })
    },
    /**
     * List all support bundles
     */
    supportBundleList: (
      { query = {} }: { query?: SupportBundleListQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<SupportBundleInfoResultsPage>({
        path: `/experimental/v1/system/support-bundles`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create a new support bundle
     */
    supportBundleCreate: (
      { body }: { body: SupportBundleCreate },
      params: FetchParams = {}
    ) => {
      return this.request<SupportBundleInfo>({
        path: `/experimental/v1/system/support-bundles`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * View a support bundle
     */
    supportBundleView: (
      { path }: { path: SupportBundleViewPathParams },
      params: FetchParams = {}
    ) => {
      return this.request<SupportBundleInfo>({
        path: `/experimental/v1/system/support-bundles/${path.bundleId}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Update a support bundle
     */
    supportBundleUpdate: (
      { path, body }: { path: SupportBundleUpdatePathParams; body: SupportBundleUpdate },
      params: FetchParams = {}
    ) => {
      return this.request<SupportBundleInfo>({
        path: `/experimental/v1/system/support-bundles/${path.bundleId}`,
        method: 'PUT',
        body,
        ...params,
      })
    },
    /**
     * Delete an existing support bundle
     */
    supportBundleDelete: (
      { path }: { path: SupportBundleDeletePathParams },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/experimental/v1/system/support-bundles/${path.bundleId}`,
        method: 'DELETE',
        ...params,
      })
    },
    /**
     * Download the contents of a support bundle
     */
    supportBundleDownload: (
      { path }: { path: SupportBundleDownloadPathParams },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/experimental/v1/system/support-bundles/${path.bundleId}/download`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Download the metadata of a support bundle
     */
    supportBundleHead: (
      { path }: { path: SupportBundleHeadPathParams },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/experimental/v1/system/support-bundles/${path.bundleId}/download`,
        method: 'HEAD',
        ...params,
      })
    },
    /**
     * Download a file within a support bundle
     */
    supportBundleDownloadFile: (
      { path }: { path: SupportBundleDownloadFilePathParams },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/experimental/v1/system/support-bundles/${path.bundleId}/download/${path.file}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Download the metadata of a file within the support bundle
     */
    supportBundleHeadFile: (
      { path }: { path: SupportBundleHeadFilePathParams },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/experimental/v1/system/support-bundles/${path.bundleId}/download/${path.file}`,
        method: 'HEAD',
        ...params,
      })
    },
    /**
     * Download the index of a support bundle
     */
    supportBundleIndex: (
      { path }: { path: SupportBundleIndexPathParams },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/experimental/v1/system/support-bundles/${path.bundleId}/index`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Authenticate a user via SAML
     */
    loginSaml: ({ path }: { path: LoginSamlPathParams }, params: FetchParams = {}) => {
      return this.request<void>({
        path: `/login/${path.siloName}/saml/${path.providerName}`,
        method: 'POST',
        ...params,
      })
    },
    /**
     * List affinity groups
     */
    affinityGroupList: (
      { query = {} }: { query?: AffinityGroupListQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<AffinityGroupResultsPage>({
        path: `/v1/affinity-groups`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create affinity group
     */
    affinityGroupCreate: (
      { query, body }: { query: AffinityGroupCreateQueryParams; body: AffinityGroupCreate },
      params: FetchParams = {}
    ) => {
      return this.request<AffinityGroup>({
        path: `/v1/affinity-groups`,
        method: 'POST',
        body,
        query,
        ...params,
      })
    },
    /**
     * Fetch affinity group
     */
    affinityGroupView: (
      {
        path,
        query = {},
      }: { path: AffinityGroupViewPathParams; query?: AffinityGroupViewQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<AffinityGroup>({
        path: `/v1/affinity-groups/${path.affinityGroup}`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Update affinity group
     */
    affinityGroupUpdate: (
      {
        path,
        query = {},
        body,
      }: {
        path: AffinityGroupUpdatePathParams
        query?: AffinityGroupUpdateQueryParams
        body: AffinityGroupUpdate
      },
      params: FetchParams = {}
    ) => {
      return this.request<AffinityGroup>({
        path: `/v1/affinity-groups/${path.affinityGroup}`,
        method: 'PUT',
        body,
        query,
        ...params,
      })
    },
    /**
     * Delete affinity group
     */
    affinityGroupDelete: (
      {
        path,
        query = {},
      }: { path: AffinityGroupDeletePathParams; query?: AffinityGroupDeleteQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/affinity-groups/${path.affinityGroup}`,
        method: 'DELETE',
        query,
        ...params,
      })
    },
    /**
     * List affinity group members
     */
    affinityGroupMemberList: (
      {
        path,
        query = {},
      }: {
        path: AffinityGroupMemberListPathParams
        query?: AffinityGroupMemberListQueryParams
      },
      params: FetchParams = {}
    ) => {
      return this.request<AffinityGroupMemberResultsPage>({
        path: `/v1/affinity-groups/${path.affinityGroup}/members`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Fetch affinity group member
     */
    affinityGroupMemberInstanceView: (
      {
        path,
        query = {},
      }: {
        path: AffinityGroupMemberInstanceViewPathParams
        query?: AffinityGroupMemberInstanceViewQueryParams
      },
      params: FetchParams = {}
    ) => {
      return this.request<AffinityGroupMember>({
        path: `/v1/affinity-groups/${path.affinityGroup}/members/instance/${path.instance}`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Add member to affinity group
     */
    affinityGroupMemberInstanceAdd: (
      {
        path,
        query = {},
      }: {
        path: AffinityGroupMemberInstanceAddPathParams
        query?: AffinityGroupMemberInstanceAddQueryParams
      },
      params: FetchParams = {}
    ) => {
      return this.request<AffinityGroupMember>({
        path: `/v1/affinity-groups/${path.affinityGroup}/members/instance/${path.instance}`,
        method: 'POST',
        query,
        ...params,
      })
    },
    /**
     * Remove member from affinity group
     */
    affinityGroupMemberInstanceDelete: (
      {
        path,
        query = {},
      }: {
        path: AffinityGroupMemberInstanceDeletePathParams
        query?: AffinityGroupMemberInstanceDeleteQueryParams
      },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/affinity-groups/${path.affinityGroup}/members/instance/${path.instance}`,
        method: 'DELETE',
        query,
        ...params,
      })
    },
    /**
     * List alert classes
     */
    alertClassList: (
      { query = {} }: { query?: AlertClassListQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<AlertClassResultsPage>({
        path: `/v1/alert-classes`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * List alert receivers
     */
    alertReceiverList: (
      { query = {} }: { query?: AlertReceiverListQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<AlertReceiverResultsPage>({
        path: `/v1/alert-receivers`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Fetch alert receiver
     */
    alertReceiverView: (
      { path }: { path: AlertReceiverViewPathParams },
      params: FetchParams = {}
    ) => {
      return this.request<AlertReceiver>({
        path: `/v1/alert-receivers/${path.receiver}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Delete alert receiver
     */
    alertReceiverDelete: (
      { path }: { path: AlertReceiverDeletePathParams },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/alert-receivers/${path.receiver}`,
        method: 'DELETE',
        ...params,
      })
    },
    /**
     * List delivery attempts to alert receiver
     */
    alertDeliveryList: (
      {
        path,
        query = {},
      }: { path: AlertDeliveryListPathParams; query?: AlertDeliveryListQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<AlertDeliveryResultsPage>({
        path: `/v1/alert-receivers/${path.receiver}/deliveries`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Send liveness probe to alert receiver
     */
    alertReceiverProbe: (
      {
        path,
        query = {},
      }: { path: AlertReceiverProbePathParams; query?: AlertReceiverProbeQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<AlertProbeResult>({
        path: `/v1/alert-receivers/${path.receiver}/probe`,
        method: 'POST',
        query,
        ...params,
      })
    },
    /**
     * Add alert receiver subscription
     */
    alertReceiverSubscriptionAdd: (
      {
        path,
        body,
      }: { path: AlertReceiverSubscriptionAddPathParams; body: AlertSubscriptionCreate },
      params: FetchParams = {}
    ) => {
      return this.request<AlertSubscriptionCreated>({
        path: `/v1/alert-receivers/${path.receiver}/subscriptions`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Remove alert receiver subscription
     */
    alertReceiverSubscriptionRemove: (
      { path }: { path: AlertReceiverSubscriptionRemovePathParams },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/alert-receivers/${path.receiver}/subscriptions/${path.subscription}`,
        method: 'DELETE',
        ...params,
      })
    },
    /**
     * Request re-delivery of alert
     */
    alertDeliveryResend: (
      {
        path,
        query,
      }: { path: AlertDeliveryResendPathParams; query: AlertDeliveryResendQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<AlertDeliveryId>({
        path: `/v1/alerts/${path.alertId}/resend`,
        method: 'POST',
        query,
        ...params,
      })
    },
    /**
     * List anti-affinity groups
     */
    antiAffinityGroupList: (
      { query = {} }: { query?: AntiAffinityGroupListQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<AntiAffinityGroupResultsPage>({
        path: `/v1/anti-affinity-groups`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create anti-affinity group
     */
    antiAffinityGroupCreate: (
      {
        query,
        body,
      }: { query: AntiAffinityGroupCreateQueryParams; body: AntiAffinityGroupCreate },
      params: FetchParams = {}
    ) => {
      return this.request<AntiAffinityGroup>({
        path: `/v1/anti-affinity-groups`,
        method: 'POST',
        body,
        query,
        ...params,
      })
    },
    /**
     * Fetch anti-affinity group
     */
    antiAffinityGroupView: (
      {
        path,
        query = {},
      }: {
        path: AntiAffinityGroupViewPathParams
        query?: AntiAffinityGroupViewQueryParams
      },
      params: FetchParams = {}
    ) => {
      return this.request<AntiAffinityGroup>({
        path: `/v1/anti-affinity-groups/${path.antiAffinityGroup}`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Update anti-affinity group
     */
    antiAffinityGroupUpdate: (
      {
        path,
        query = {},
        body,
      }: {
        path: AntiAffinityGroupUpdatePathParams
        query?: AntiAffinityGroupUpdateQueryParams
        body: AntiAffinityGroupUpdate
      },
      params: FetchParams = {}
    ) => {
      return this.request<AntiAffinityGroup>({
        path: `/v1/anti-affinity-groups/${path.antiAffinityGroup}`,
        method: 'PUT',
        body,
        query,
        ...params,
      })
    },
    /**
     * Delete anti-affinity group
     */
    antiAffinityGroupDelete: (
      {
        path,
        query = {},
      }: {
        path: AntiAffinityGroupDeletePathParams
        query?: AntiAffinityGroupDeleteQueryParams
      },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/anti-affinity-groups/${path.antiAffinityGroup}`,
        method: 'DELETE',
        query,
        ...params,
      })
    },
    /**
     * List anti-affinity group members
     */
    antiAffinityGroupMemberList: (
      {
        path,
        query = {},
      }: {
        path: AntiAffinityGroupMemberListPathParams
        query?: AntiAffinityGroupMemberListQueryParams
      },
      params: FetchParams = {}
    ) => {
      return this.request<AntiAffinityGroupMemberResultsPage>({
        path: `/v1/anti-affinity-groups/${path.antiAffinityGroup}/members`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Fetch anti-affinity group member
     */
    antiAffinityGroupMemberInstanceView: (
      {
        path,
        query = {},
      }: {
        path: AntiAffinityGroupMemberInstanceViewPathParams
        query?: AntiAffinityGroupMemberInstanceViewQueryParams
      },
      params: FetchParams = {}
    ) => {
      return this.request<AntiAffinityGroupMember>({
        path: `/v1/anti-affinity-groups/${path.antiAffinityGroup}/members/instance/${path.instance}`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Add member to anti-affinity group
     */
    antiAffinityGroupMemberInstanceAdd: (
      {
        path,
        query = {},
      }: {
        path: AntiAffinityGroupMemberInstanceAddPathParams
        query?: AntiAffinityGroupMemberInstanceAddQueryParams
      },
      params: FetchParams = {}
    ) => {
      return this.request<AntiAffinityGroupMember>({
        path: `/v1/anti-affinity-groups/${path.antiAffinityGroup}/members/instance/${path.instance}`,
        method: 'POST',
        query,
        ...params,
      })
    },
    /**
     * Remove member from anti-affinity group
     */
    antiAffinityGroupMemberInstanceDelete: (
      {
        path,
        query = {},
      }: {
        path: AntiAffinityGroupMemberInstanceDeletePathParams
        query?: AntiAffinityGroupMemberInstanceDeleteQueryParams
      },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/anti-affinity-groups/${path.antiAffinityGroup}/members/instance/${path.instance}`,
        method: 'DELETE',
        query,
        ...params,
      })
    },
    /**
     * Fetch current silo's auth settings
     */
    authSettingsView: (_: EmptyObj, params: FetchParams = {}) => {
      return this.request<SiloAuthSettings>({
        path: `/v1/auth-settings`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Update current silo's auth settings
     */
    authSettingsUpdate: (
      { body }: { body: SiloAuthSettingsUpdate },
      params: FetchParams = {}
    ) => {
      return this.request<SiloAuthSettings>({
        path: `/v1/auth-settings`,
        method: 'PUT',
        body,
        ...params,
      })
    },
    /**
     * List certificates for external endpoints
     */
    certificateList: (
      { query = {} }: { query?: CertificateListQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<CertificateResultsPage>({
        path: `/v1/certificates`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create new system-wide x.509 certificate
     */
    certificateCreate: (
      { body }: { body: CertificateCreate },
      params: FetchParams = {}
    ) => {
      return this.request<Certificate>({
        path: `/v1/certificates`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Fetch certificate
     */
    certificateView: (
      { path }: { path: CertificateViewPathParams },
      params: FetchParams = {}
    ) => {
      return this.request<Certificate>({
        path: `/v1/certificates/${path.certificate}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Delete certificate
     */
    certificateDelete: (
      { path }: { path: CertificateDeletePathParams },
      params: FetchParams = {}
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
      params: FetchParams = {}
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
      { query, body }: { query: DiskCreateQueryParams; body: DiskCreate },
      params: FetchParams = {}
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
     * Fetch disk
     */
    diskView: (
      { path, query = {} }: { path: DiskViewPathParams; query?: DiskViewQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<Disk>({
        path: `/v1/disks/${path.disk}`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Delete disk
     */
    diskDelete: (
      { path, query = {} }: { path: DiskDeletePathParams; query?: DiskDeleteQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/disks/${path.disk}`,
        method: 'DELETE',
        query,
        ...params,
      })
    },
    /**
     * Import blocks into disk
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
      params: FetchParams = {}
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
     * Start importing blocks into disk
     */
    diskBulkWriteImportStart: (
      {
        path,
        query = {},
      }: {
        path: DiskBulkWriteImportStartPathParams
        query?: DiskBulkWriteImportStartQueryParams
      },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/disks/${path.disk}/bulk-write-start`,
        method: 'POST',
        query,
        ...params,
      })
    },
    /**
     * Stop importing blocks into disk
     */
    diskBulkWriteImportStop: (
      {
        path,
        query = {},
      }: {
        path: DiskBulkWriteImportStopPathParams
        query?: DiskBulkWriteImportStopQueryParams
      },
      params: FetchParams = {}
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
      params: FetchParams = {}
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
     * List floating IPs
     */
    floatingIpList: (
      { query = {} }: { query?: FloatingIpListQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<FloatingIpResultsPage>({
        path: `/v1/floating-ips`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create floating IP
     */
    floatingIpCreate: (
      { query, body }: { query: FloatingIpCreateQueryParams; body: FloatingIpCreate },
      params: FetchParams = {}
    ) => {
      return this.request<FloatingIp>({
        path: `/v1/floating-ips`,
        method: 'POST',
        body,
        query,
        ...params,
      })
    },
    /**
     * Fetch floating IP
     */
    floatingIpView: (
      {
        path,
        query = {},
      }: { path: FloatingIpViewPathParams; query?: FloatingIpViewQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<FloatingIp>({
        path: `/v1/floating-ips/${path.floatingIp}`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Update floating IP
     */
    floatingIpUpdate: (
      {
        path,
        query = {},
        body,
      }: {
        path: FloatingIpUpdatePathParams
        query?: FloatingIpUpdateQueryParams
        body: FloatingIpUpdate
      },
      params: FetchParams = {}
    ) => {
      return this.request<FloatingIp>({
        path: `/v1/floating-ips/${path.floatingIp}`,
        method: 'PUT',
        body,
        query,
        ...params,
      })
    },
    /**
     * Delete floating IP
     */
    floatingIpDelete: (
      {
        path,
        query = {},
      }: { path: FloatingIpDeletePathParams; query?: FloatingIpDeleteQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/floating-ips/${path.floatingIp}`,
        method: 'DELETE',
        query,
        ...params,
      })
    },
    /**
     * Attach floating IP
     */
    floatingIpAttach: (
      {
        path,
        query = {},
        body,
      }: {
        path: FloatingIpAttachPathParams
        query?: FloatingIpAttachQueryParams
        body: FloatingIpAttach
      },
      params: FetchParams = {}
    ) => {
      return this.request<FloatingIp>({
        path: `/v1/floating-ips/${path.floatingIp}/attach`,
        method: 'POST',
        body,
        query,
        ...params,
      })
    },
    /**
     * Detach floating IP
     */
    floatingIpDetach: (
      {
        path,
        query = {},
      }: { path: FloatingIpDetachPathParams; query?: FloatingIpDetachQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<FloatingIp>({
        path: `/v1/floating-ips/${path.floatingIp}/detach`,
        method: 'POST',
        query,
        ...params,
      })
    },
    /**
     * List groups
     */
    groupList: (
      { query = {} }: { query?: GroupListQueryParams },
      params: FetchParams = {}
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
    groupView: ({ path }: { path: GroupViewPathParams }, params: FetchParams = {}) => {
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
      params: FetchParams = {}
    ) => {
      return this.request<ImageResultsPage>({
        path: `/v1/images`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create image
     */
    imageCreate: (
      { query = {}, body }: { query?: ImageCreateQueryParams; body: ImageCreate },
      params: FetchParams = {}
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
     * Fetch image
     */
    imageView: (
      { path, query = {} }: { path: ImageViewPathParams; query?: ImageViewQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<Image>({
        path: `/v1/images/${path.image}`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Delete image
     */
    imageDelete: (
      { path, query = {} }: { path: ImageDeletePathParams; query?: ImageDeleteQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/images/${path.image}`,
        method: 'DELETE',
        query,
        ...params,
      })
    },
    /**
     * Demote silo image
     */
    imageDemote: (
      { path, query }: { path: ImageDemotePathParams; query: ImageDemoteQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<Image>({
        path: `/v1/images/${path.image}/demote`,
        method: 'POST',
        query,
        ...params,
      })
    },
    /**
     * Promote project image
     */
    imagePromote: (
      {
        path,
        query = {},
      }: { path: ImagePromotePathParams; query?: ImagePromoteQueryParams },
      params: FetchParams = {}
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
      params: FetchParams = {}
    ) => {
      return this.request<InstanceResultsPage>({
        path: `/v1/instances`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create instance
     */
    instanceCreate: (
      { query, body }: { query: InstanceCreateQueryParams; body: InstanceCreate },
      params: FetchParams = {}
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
     * Fetch instance
     */
    instanceView: (
      {
        path,
        query = {},
      }: { path: InstanceViewPathParams; query?: InstanceViewQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<Instance>({
        path: `/v1/instances/${path.instance}`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Update instance
     */
    instanceUpdate: (
      {
        path,
        query = {},
        body,
      }: {
        path: InstanceUpdatePathParams
        query?: InstanceUpdateQueryParams
        body: InstanceUpdate
      },
      params: FetchParams = {}
    ) => {
      return this.request<Instance>({
        path: `/v1/instances/${path.instance}`,
        method: 'PUT',
        body,
        query,
        ...params,
      })
    },
    /**
     * Delete instance
     */
    instanceDelete: (
      {
        path,
        query = {},
      }: { path: InstanceDeletePathParams; query?: InstanceDeleteQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/instances/${path.instance}`,
        method: 'DELETE',
        query,
        ...params,
      })
    },
    /**
     * List affinity groups containing instance
     */
    instanceAffinityGroupList: (
      {
        path,
        query = {},
      }: {
        path: InstanceAffinityGroupListPathParams
        query?: InstanceAffinityGroupListQueryParams
      },
      params: FetchParams = {}
    ) => {
      return this.request<AffinityGroupResultsPage>({
        path: `/v1/instances/${path.instance}/affinity-groups`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * List anti-affinity groups containing instance
     */
    instanceAntiAffinityGroupList: (
      {
        path,
        query = {},
      }: {
        path: InstanceAntiAffinityGroupListPathParams
        query?: InstanceAntiAffinityGroupListQueryParams
      },
      params: FetchParams = {}
    ) => {
      return this.request<AntiAffinityGroupResultsPage>({
        path: `/v1/instances/${path.instance}/anti-affinity-groups`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * List disks for instance
     */
    instanceDiskList: (
      {
        path,
        query = {},
      }: { path: InstanceDiskListPathParams; query?: InstanceDiskListQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<DiskResultsPage>({
        path: `/v1/instances/${path.instance}/disks`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Attach disk to instance
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
      params: FetchParams = {}
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
     * Detach disk from instance
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
      params: FetchParams = {}
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
      params: FetchParams = {}
    ) => {
      return this.request<ExternalIpResultsPage>({
        path: `/v1/instances/${path.instance}/external-ips`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Allocate and attach ephemeral IP to instance
     */
    instanceEphemeralIpAttach: (
      {
        path,
        query = {},
        body,
      }: {
        path: InstanceEphemeralIpAttachPathParams
        query?: InstanceEphemeralIpAttachQueryParams
        body: EphemeralIpCreate
      },
      params: FetchParams = {}
    ) => {
      return this.request<ExternalIp>({
        path: `/v1/instances/${path.instance}/external-ips/ephemeral`,
        method: 'POST',
        body,
        query,
        ...params,
      })
    },
    /**
     * Detach and deallocate ephemeral IP from instance
     */
    instanceEphemeralIpDetach: (
      {
        path,
        query = {},
      }: {
        path: InstanceEphemeralIpDetachPathParams
        query?: InstanceEphemeralIpDetachQueryParams
      },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/instances/${path.instance}/external-ips/ephemeral`,
        method: 'DELETE',
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
      params: FetchParams = {}
    ) => {
      return this.request<Instance>({
        path: `/v1/instances/${path.instance}/reboot`,
        method: 'POST',
        query,
        ...params,
      })
    },
    /**
     * Fetch instance serial console
     */
    instanceSerialConsole: (
      {
        path,
        query = {},
      }: {
        path: InstanceSerialConsolePathParams
        query?: InstanceSerialConsoleQueryParams
      },
      params: FetchParams = {}
    ) => {
      return this.request<InstanceSerialConsoleData>({
        path: `/v1/instances/${path.instance}/serial-console`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * List SSH public keys for instance
     */
    instanceSshPublicKeyList: (
      {
        path,
        query = {},
      }: {
        path: InstanceSshPublicKeyListPathParams
        query?: InstanceSshPublicKeyListQueryParams
      },
      params: FetchParams = {}
    ) => {
      return this.request<SshKeyResultsPage>({
        path: `/v1/instances/${path.instance}/ssh-public-keys`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Boot instance
     */
    instanceStart: (
      {
        path,
        query = {},
      }: { path: InstanceStartPathParams; query?: InstanceStartQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<Instance>({
        path: `/v1/instances/${path.instance}/start`,
        method: 'POST',
        query,
        ...params,
      })
    },
    /**
     * Stop instance
     */
    instanceStop: (
      {
        path,
        query = {},
      }: { path: InstanceStopPathParams; query?: InstanceStopQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<Instance>({
        path: `/v1/instances/${path.instance}/stop`,
        method: 'POST',
        query,
        ...params,
      })
    },
    /**
     * List IP addresses attached to internet gateway
     */
    internetGatewayIpAddressList: (
      { query = {} }: { query?: InternetGatewayIpAddressListQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<InternetGatewayIpAddressResultsPage>({
        path: `/v1/internet-gateway-ip-addresses`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Attach IP address to internet gateway
     */
    internetGatewayIpAddressCreate: (
      {
        query,
        body,
      }: {
        query: InternetGatewayIpAddressCreateQueryParams
        body: InternetGatewayIpAddressCreate
      },
      params: FetchParams = {}
    ) => {
      return this.request<InternetGatewayIpAddress>({
        path: `/v1/internet-gateway-ip-addresses`,
        method: 'POST',
        body,
        query,
        ...params,
      })
    },
    /**
     * Detach IP address from internet gateway
     */
    internetGatewayIpAddressDelete: (
      {
        path,
        query = {},
      }: {
        path: InternetGatewayIpAddressDeletePathParams
        query?: InternetGatewayIpAddressDeleteQueryParams
      },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/internet-gateway-ip-addresses/${path.address}`,
        method: 'DELETE',
        query,
        ...params,
      })
    },
    /**
     * List IP pools attached to internet gateway
     */
    internetGatewayIpPoolList: (
      { query = {} }: { query?: InternetGatewayIpPoolListQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<InternetGatewayIpPoolResultsPage>({
        path: `/v1/internet-gateway-ip-pools`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Attach IP pool to internet gateway
     */
    internetGatewayIpPoolCreate: (
      {
        query,
        body,
      }: {
        query: InternetGatewayIpPoolCreateQueryParams
        body: InternetGatewayIpPoolCreate
      },
      params: FetchParams = {}
    ) => {
      return this.request<InternetGatewayIpPool>({
        path: `/v1/internet-gateway-ip-pools`,
        method: 'POST',
        body,
        query,
        ...params,
      })
    },
    /**
     * Detach IP pool from internet gateway
     */
    internetGatewayIpPoolDelete: (
      {
        path,
        query = {},
      }: {
        path: InternetGatewayIpPoolDeletePathParams
        query?: InternetGatewayIpPoolDeleteQueryParams
      },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/internet-gateway-ip-pools/${path.pool}`,
        method: 'DELETE',
        query,
        ...params,
      })
    },
    /**
     * List internet gateways
     */
    internetGatewayList: (
      { query = {} }: { query?: InternetGatewayListQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<InternetGatewayResultsPage>({
        path: `/v1/internet-gateways`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create VPC internet gateway
     */
    internetGatewayCreate: (
      {
        query,
        body,
      }: { query: InternetGatewayCreateQueryParams; body: InternetGatewayCreate },
      params: FetchParams = {}
    ) => {
      return this.request<InternetGateway>({
        path: `/v1/internet-gateways`,
        method: 'POST',
        body,
        query,
        ...params,
      })
    },
    /**
     * Fetch internet gateway
     */
    internetGatewayView: (
      {
        path,
        query = {},
      }: { path: InternetGatewayViewPathParams; query?: InternetGatewayViewQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<InternetGateway>({
        path: `/v1/internet-gateways/${path.gateway}`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Delete internet gateway
     */
    internetGatewayDelete: (
      {
        path,
        query = {},
      }: {
        path: InternetGatewayDeletePathParams
        query?: InternetGatewayDeleteQueryParams
      },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/internet-gateways/${path.gateway}`,
        method: 'DELETE',
        query,
        ...params,
      })
    },
    /**
     * List IP pools
     */
    projectIpPoolList: (
      { query = {} }: { query?: ProjectIpPoolListQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<SiloIpPoolResultsPage>({
        path: `/v1/ip-pools`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Fetch IP pool
     */
    projectIpPoolView: (
      { path }: { path: ProjectIpPoolViewPathParams },
      params: FetchParams = {}
    ) => {
      return this.request<SiloIpPool>({
        path: `/v1/ip-pools/${path.pool}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Authenticate a user via username and password
     */
    loginLocal: (
      { path, body }: { path: LoginLocalPathParams; body: UsernamePasswordCredentials },
      params: FetchParams = {}
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
    logout: (_: EmptyObj, params: FetchParams = {}) => {
      return this.request<void>({
        path: `/v1/logout`,
        method: 'POST',
        ...params,
      })
    },
    /**
     * Fetch user for current session
     */
    currentUserView: (_: EmptyObj, params: FetchParams = {}) => {
      return this.request<CurrentUser>({
        path: `/v1/me`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * List access tokens
     */
    currentUserAccessTokenList: (
      { query = {} }: { query?: CurrentUserAccessTokenListQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<DeviceAccessTokenResultsPage>({
        path: `/v1/me/access-tokens`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Delete access token
     */
    currentUserAccessTokenDelete: (
      { path }: { path: CurrentUserAccessTokenDeletePathParams },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/me/access-tokens/${path.tokenId}`,
        method: 'DELETE',
        ...params,
      })
    },
    /**
     * Fetch current user's groups
     */
    currentUserGroups: (
      { query = {} }: { query?: CurrentUserGroupsQueryParams },
      params: FetchParams = {}
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
      params: FetchParams = {}
    ) => {
      return this.request<SshKeyResultsPage>({
        path: `/v1/me/ssh-keys`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create SSH public key
     */
    currentUserSshKeyCreate: (
      { body }: { body: SshKeyCreate },
      params: FetchParams = {}
    ) => {
      return this.request<SshKey>({
        path: `/v1/me/ssh-keys`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Fetch SSH public key
     */
    currentUserSshKeyView: (
      { path }: { path: CurrentUserSshKeyViewPathParams },
      params: FetchParams = {}
    ) => {
      return this.request<SshKey>({
        path: `/v1/me/ssh-keys/${path.sshKey}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Delete SSH public key
     */
    currentUserSshKeyDelete: (
      { path }: { path: CurrentUserSshKeyDeletePathParams },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/me/ssh-keys/${path.sshKey}`,
        method: 'DELETE',
        ...params,
      })
    },
    /**
     * View metrics
     */
    siloMetric: (
      { path, query = {} }: { path: SiloMetricPathParams; query?: SiloMetricQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<MeasurementResultsPage>({
        path: `/v1/metrics/${path.metricName}`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * List network interfaces
     */
    instanceNetworkInterfaceList: (
      { query = {} }: { query?: InstanceNetworkInterfaceListQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<InstanceNetworkInterfaceResultsPage>({
        path: `/v1/network-interfaces`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create network interface
     */
    instanceNetworkInterfaceCreate: (
      {
        query,
        body,
      }: {
        query: InstanceNetworkInterfaceCreateQueryParams
        body: InstanceNetworkInterfaceCreate
      },
      params: FetchParams = {}
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
     * Fetch network interface
     */
    instanceNetworkInterfaceView: (
      {
        path,
        query = {},
      }: {
        path: InstanceNetworkInterfaceViewPathParams
        query?: InstanceNetworkInterfaceViewQueryParams
      },
      params: FetchParams = {}
    ) => {
      return this.request<InstanceNetworkInterface>({
        path: `/v1/network-interfaces/${path.interface}`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Update network interface
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
      params: FetchParams = {}
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
     * Delete network interface
     */
    instanceNetworkInterfaceDelete: (
      {
        path,
        query = {},
      }: {
        path: InstanceNetworkInterfaceDeletePathParams
        query?: InstanceNetworkInterfaceDeleteQueryParams
      },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/network-interfaces/${path.interface}`,
        method: 'DELETE',
        query,
        ...params,
      })
    },
    /**
     * Ping API
     */
    ping: (_: EmptyObj, params: FetchParams = {}) => {
      return this.request<Ping>({
        path: `/v1/ping`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Fetch current silo's IAM policy
     */
    policyView: (_: EmptyObj, params: FetchParams = {}) => {
      return this.request<SiloRolePolicy>({
        path: `/v1/policy`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Update current silo's IAM policy
     */
    policyUpdate: ({ body }: { body: SiloRolePolicy }, params: FetchParams = {}) => {
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
      params: FetchParams = {}
    ) => {
      return this.request<ProjectResultsPage>({
        path: `/v1/projects`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create project
     */
    projectCreate: ({ body }: { body: ProjectCreate }, params: FetchParams = {}) => {
      return this.request<Project>({
        path: `/v1/projects`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Fetch project
     */
    projectView: ({ path }: { path: ProjectViewPathParams }, params: FetchParams = {}) => {
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
      params: FetchParams = {}
    ) => {
      return this.request<Project>({
        path: `/v1/projects/${path.project}`,
        method: 'PUT',
        body,
        ...params,
      })
    },
    /**
     * Delete project
     */
    projectDelete: (
      { path }: { path: ProjectDeletePathParams },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/projects/${path.project}`,
        method: 'DELETE',
        ...params,
      })
    },
    /**
     * Fetch project's IAM policy
     */
    projectPolicyView: (
      { path }: { path: ProjectPolicyViewPathParams },
      params: FetchParams = {}
    ) => {
      return this.request<ProjectRolePolicy>({
        path: `/v1/projects/${path.project}/policy`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Update project's IAM policy
     */
    projectPolicyUpdate: (
      { path, body }: { path: ProjectPolicyUpdatePathParams; body: ProjectRolePolicy },
      params: FetchParams = {}
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
      params: FetchParams = {}
    ) => {
      return this.request<SnapshotResultsPage>({
        path: `/v1/snapshots`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create snapshot
     */
    snapshotCreate: (
      { query, body }: { query: SnapshotCreateQueryParams; body: SnapshotCreate },
      params: FetchParams = {}
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
     * Fetch snapshot
     */
    snapshotView: (
      {
        path,
        query = {},
      }: { path: SnapshotViewPathParams; query?: SnapshotViewQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<Snapshot>({
        path: `/v1/snapshots/${path.snapshot}`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Delete snapshot
     */
    snapshotDelete: (
      {
        path,
        query = {},
      }: { path: SnapshotDeletePathParams; query?: SnapshotDeleteQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/snapshots/${path.snapshot}`,
        method: 'DELETE',
        query,
        ...params,
      })
    },
    /**
     * View audit log
     */
    auditLogList: (
      { query = {} }: { query?: AuditLogListQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<AuditLogEntryResultsPage>({
        path: `/v1/system/audit-log`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * List physical disks
     */
    physicalDiskList: (
      { query = {} }: { query?: PhysicalDiskListQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<PhysicalDiskResultsPage>({
        path: `/v1/system/hardware/disks`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Get a physical disk
     */
    physicalDiskView: (
      { path }: { path: PhysicalDiskViewPathParams },
      params: FetchParams = {}
    ) => {
      return this.request<PhysicalDisk>({
        path: `/v1/system/hardware/disks/${path.diskId}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Fetch the LLDP neighbors seen on a switch port
     */
    networkingSwitchPortLldpNeighbors: (
      {
        path,
        query = {},
      }: {
        path: NetworkingSwitchPortLldpNeighborsPathParams
        query?: NetworkingSwitchPortLldpNeighborsQueryParams
      },
      params: FetchParams = {}
    ) => {
      return this.request<LldpNeighborResultsPage>({
        path: `/v1/system/hardware/rack-switch-port/${path.rackId}/${path.switchLocation}/${path.port}/lldp/neighbors`,
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
      params: FetchParams = {}
    ) => {
      return this.request<RackResultsPage>({
        path: `/v1/system/hardware/racks`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Fetch rack
     */
    rackView: ({ path }: { path: RackViewPathParams }, params: FetchParams = {}) => {
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
      params: FetchParams = {}
    ) => {
      return this.request<SledResultsPage>({
        path: `/v1/system/hardware/sleds`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Add sled to initialized rack
     */
    sledAdd: ({ body }: { body: UninitializedSledId }, params: FetchParams = {}) => {
      return this.request<SledId>({
        path: `/v1/system/hardware/sleds`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Fetch sled
     */
    sledView: ({ path }: { path: SledViewPathParams }, params: FetchParams = {}) => {
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
      params: FetchParams = {}
    ) => {
      return this.request<PhysicalDiskResultsPage>({
        path: `/v1/system/hardware/sleds/${path.sledId}/disks`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * List instances running on given sled
     */
    sledInstanceList: (
      {
        path,
        query = {},
      }: { path: SledInstanceListPathParams; query?: SledInstanceListQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<SledInstanceResultsPage>({
        path: `/v1/system/hardware/sleds/${path.sledId}/instances`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Set sled provision policy
     */
    sledSetProvisionPolicy: (
      {
        path,
        body,
      }: { path: SledSetProvisionPolicyPathParams; body: SledProvisionPolicyParams },
      params: FetchParams = {}
    ) => {
      return this.request<SledProvisionPolicyResponse>({
        path: `/v1/system/hardware/sleds/${path.sledId}/provision-policy`,
        method: 'PUT',
        body,
        ...params,
      })
    },
    /**
     * List uninitialized sleds
     */
    sledListUninitialized: (
      { query = {} }: { query?: SledListUninitializedQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<UninitializedSledResultsPage>({
        path: `/v1/system/hardware/sleds-uninitialized`,
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
      params: FetchParams = {}
    ) => {
      return this.request<SwitchPortResultsPage>({
        path: `/v1/system/hardware/switch-port`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Fetch the LLDP configuration for a switch port
     */
    networkingSwitchPortLldpConfigView: (
      {
        path,
        query,
      }: {
        path: NetworkingSwitchPortLldpConfigViewPathParams
        query: NetworkingSwitchPortLldpConfigViewQueryParams
      },
      params: FetchParams = {}
    ) => {
      return this.request<LldpLinkConfig>({
        path: `/v1/system/hardware/switch-port/${path.port}/lldp/config`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Update the LLDP configuration for a switch port
     */
    networkingSwitchPortLldpConfigUpdate: (
      {
        path,
        query,
        body,
      }: {
        path: NetworkingSwitchPortLldpConfigUpdatePathParams
        query: NetworkingSwitchPortLldpConfigUpdateQueryParams
        body: LldpLinkConfig
      },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/system/hardware/switch-port/${path.port}/lldp/config`,
        method: 'POST',
        body,
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
        query,
        body,
      }: {
        path: NetworkingSwitchPortApplySettingsPathParams
        query: NetworkingSwitchPortApplySettingsQueryParams
        body: SwitchPortApplySettings
      },
      params: FetchParams = {}
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
        query,
      }: {
        path: NetworkingSwitchPortClearSettingsPathParams
        query: NetworkingSwitchPortClearSettingsQueryParams
      },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/system/hardware/switch-port/${path.port}/settings`,
        method: 'DELETE',
        query,
        ...params,
      })
    },
    /**
     * Get switch port status
     */
    networkingSwitchPortStatus: (
      {
        path,
        query,
      }: {
        path: NetworkingSwitchPortStatusPathParams
        query: NetworkingSwitchPortStatusQueryParams
      },
      params: FetchParams = {}
    ) => {
      return this.request<SwitchLinkState>({
        path: `/v1/system/hardware/switch-port/${path.port}/status`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * List switches
     */
    switchList: (
      { query = {} }: { query?: SwitchListQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<SwitchResultsPage>({
        path: `/v1/system/hardware/switches`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Fetch switch
     */
    switchView: ({ path }: { path: SwitchViewPathParams }, params: FetchParams = {}) => {
      return this.request<Switch>({
        path: `/v1/system/hardware/switches/${path.switchId}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * List identity providers for silo
     */
    siloIdentityProviderList: (
      { query = {} }: { query?: SiloIdentityProviderListQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<IdentityProviderResultsPage>({
        path: `/v1/system/identity-providers`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create user
     */
    localIdpUserCreate: (
      { query, body }: { query: LocalIdpUserCreateQueryParams; body: UserCreate },
      params: FetchParams = {}
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
     * Delete user
     */
    localIdpUserDelete: (
      {
        path,
        query,
      }: { path: LocalIdpUserDeletePathParams; query: LocalIdpUserDeleteQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/system/identity-providers/local/users/${path.userId}`,
        method: 'DELETE',
        query,
        ...params,
      })
    },
    /**
     * Set or invalidate user's password
     */
    localIdpUserSetPassword: (
      {
        path,
        query,
        body,
      }: {
        path: LocalIdpUserSetPasswordPathParams
        query: LocalIdpUserSetPasswordQueryParams
        body: UserPassword
      },
      params: FetchParams = {}
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
     * Create SAML identity provider
     */
    samlIdentityProviderCreate: (
      {
        query,
        body,
      }: { query: SamlIdentityProviderCreateQueryParams; body: SamlIdentityProviderCreate },
      params: FetchParams = {}
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
     * Fetch SAML identity provider
     */
    samlIdentityProviderView: (
      {
        path,
        query = {},
      }: {
        path: SamlIdentityProviderViewPathParams
        query?: SamlIdentityProviderViewQueryParams
      },
      params: FetchParams = {}
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
      params: FetchParams = {}
    ) => {
      return this.request<IpPoolResultsPage>({
        path: `/v1/system/ip-pools`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create IP pool
     */
    ipPoolCreate: ({ body }: { body: IpPoolCreate }, params: FetchParams = {}) => {
      return this.request<IpPool>({
        path: `/v1/system/ip-pools`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Fetch IP pool
     */
    ipPoolView: ({ path }: { path: IpPoolViewPathParams }, params: FetchParams = {}) => {
      return this.request<IpPool>({
        path: `/v1/system/ip-pools/${path.pool}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Update IP pool
     */
    ipPoolUpdate: (
      { path, body }: { path: IpPoolUpdatePathParams; body: IpPoolUpdate },
      params: FetchParams = {}
    ) => {
      return this.request<IpPool>({
        path: `/v1/system/ip-pools/${path.pool}`,
        method: 'PUT',
        body,
        ...params,
      })
    },
    /**
     * Delete IP pool
     */
    ipPoolDelete: (
      { path }: { path: IpPoolDeletePathParams },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/system/ip-pools/${path.pool}`,
        method: 'DELETE',
        ...params,
      })
    },
    /**
     * List ranges for IP pool
     */
    ipPoolRangeList: (
      {
        path,
        query = {},
      }: { path: IpPoolRangeListPathParams; query?: IpPoolRangeListQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<IpPoolRangeResultsPage>({
        path: `/v1/system/ip-pools/${path.pool}/ranges`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Add range to IP pool
     */
    ipPoolRangeAdd: (
      { path, body }: { path: IpPoolRangeAddPathParams; body: IpRange },
      params: FetchParams = {}
    ) => {
      return this.request<IpPoolRange>({
        path: `/v1/system/ip-pools/${path.pool}/ranges/add`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Remove range from IP pool
     */
    ipPoolRangeRemove: (
      { path, body }: { path: IpPoolRangeRemovePathParams; body: IpRange },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/system/ip-pools/${path.pool}/ranges/remove`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * List IP pool's linked silos
     */
    ipPoolSiloList: (
      {
        path,
        query = {},
      }: { path: IpPoolSiloListPathParams; query?: IpPoolSiloListQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<IpPoolSiloLinkResultsPage>({
        path: `/v1/system/ip-pools/${path.pool}/silos`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Link IP pool to silo
     */
    ipPoolSiloLink: (
      { path, body }: { path: IpPoolSiloLinkPathParams; body: IpPoolLinkSilo },
      params: FetchParams = {}
    ) => {
      return this.request<IpPoolSiloLink>({
        path: `/v1/system/ip-pools/${path.pool}/silos`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Make IP pool default for silo
     */
    ipPoolSiloUpdate: (
      { path, body }: { path: IpPoolSiloUpdatePathParams; body: IpPoolSiloUpdate },
      params: FetchParams = {}
    ) => {
      return this.request<IpPoolSiloLink>({
        path: `/v1/system/ip-pools/${path.pool}/silos/${path.silo}`,
        method: 'PUT',
        body,
        ...params,
      })
    },
    /**
     * Unlink IP pool from silo
     */
    ipPoolSiloUnlink: (
      { path }: { path: IpPoolSiloUnlinkPathParams },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/system/ip-pools/${path.pool}/silos/${path.silo}`,
        method: 'DELETE',
        ...params,
      })
    },
    /**
     * Fetch IP pool utilization
     */
    ipPoolUtilizationView: (
      { path }: { path: IpPoolUtilizationViewPathParams },
      params: FetchParams = {}
    ) => {
      return this.request<IpPoolUtilization>({
        path: `/v1/system/ip-pools/${path.pool}/utilization`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Fetch Oxide service IP pool
     */
    ipPoolServiceView: (_: EmptyObj, params: FetchParams = {}) => {
      return this.request<IpPool>({
        path: `/v1/system/ip-pools-service`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * List IP ranges for the Oxide service pool
     */
    ipPoolServiceRangeList: (
      { query = {} }: { query?: IpPoolServiceRangeListQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<IpPoolRangeResultsPage>({
        path: `/v1/system/ip-pools-service/ranges`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Add IP range to Oxide service pool
     */
    ipPoolServiceRangeAdd: ({ body }: { body: IpRange }, params: FetchParams = {}) => {
      return this.request<IpPoolRange>({
        path: `/v1/system/ip-pools-service/ranges/add`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Remove IP range from Oxide service pool
     */
    ipPoolServiceRangeRemove: ({ body }: { body: IpRange }, params: FetchParams = {}) => {
      return this.request<void>({
        path: `/v1/system/ip-pools-service/ranges/remove`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * View metrics
     */
    systemMetric: (
      {
        path,
        query = {},
      }: { path: SystemMetricPathParams; query?: SystemMetricQueryParams },
      params: FetchParams = {}
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
      params: FetchParams = {}
    ) => {
      return this.request<AddressLotResultsPage>({
        path: `/v1/system/networking/address-lot`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create address lot
     */
    networkingAddressLotCreate: (
      { body }: { body: AddressLotCreate },
      params: FetchParams = {}
    ) => {
      return this.request<AddressLotCreateResponse>({
        path: `/v1/system/networking/address-lot`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Fetch address lot
     */
    networkingAddressLotView: (
      { path }: { path: NetworkingAddressLotViewPathParams },
      params: FetchParams = {}
    ) => {
      return this.request<AddressLotViewResponse>({
        path: `/v1/system/networking/address-lot/${path.addressLot}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Delete address lot
     */
    networkingAddressLotDelete: (
      { path }: { path: NetworkingAddressLotDeletePathParams },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/system/networking/address-lot/${path.addressLot}`,
        method: 'DELETE',
        ...params,
      })
    },
    /**
     * List blocks in address lot
     */
    networkingAddressLotBlockList: (
      {
        path,
        query = {},
      }: {
        path: NetworkingAddressLotBlockListPathParams
        query?: NetworkingAddressLotBlockListQueryParams
      },
      params: FetchParams = {}
    ) => {
      return this.request<AddressLotBlockResultsPage>({
        path: `/v1/system/networking/address-lot/${path.addressLot}/blocks`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Get user-facing services IP allowlist
     */
    networkingAllowListView: (_: EmptyObj, params: FetchParams = {}) => {
      return this.request<AllowList>({
        path: `/v1/system/networking/allow-list`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Update user-facing services IP allowlist
     */
    networkingAllowListUpdate: (
      { body }: { body: AllowListUpdate },
      params: FetchParams = {}
    ) => {
      return this.request<AllowList>({
        path: `/v1/system/networking/allow-list`,
        method: 'PUT',
        body,
        ...params,
      })
    },
    /**
     * Disable a BFD session
     */
    networkingBfdDisable: (
      { body }: { body: BfdSessionDisable },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/system/networking/bfd-disable`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Enable a BFD session
     */
    networkingBfdEnable: (
      { body }: { body: BfdSessionEnable },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/system/networking/bfd-enable`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Get BFD status
     */
    networkingBfdStatus: (_: EmptyObj, params: FetchParams = {}) => {
      return this.request<BfdStatus[]>({
        path: `/v1/system/networking/bfd-status`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * List BGP configurations
     */
    networkingBgpConfigList: (
      { query = {} }: { query?: NetworkingBgpConfigListQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<BgpConfigResultsPage>({
        path: `/v1/system/networking/bgp`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create new BGP configuration
     */
    networkingBgpConfigCreate: (
      { body }: { body: BgpConfigCreate },
      params: FetchParams = {}
    ) => {
      return this.request<BgpConfig>({
        path: `/v1/system/networking/bgp`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Delete BGP configuration
     */
    networkingBgpConfigDelete: (
      { query }: { query: NetworkingBgpConfigDeleteQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/system/networking/bgp`,
        method: 'DELETE',
        query,
        ...params,
      })
    },
    /**
     * List BGP announce sets
     */
    networkingBgpAnnounceSetList: (
      { query = {} }: { query?: NetworkingBgpAnnounceSetListQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<BgpAnnounceSet[]>({
        path: `/v1/system/networking/bgp-announce-set`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Update BGP announce set
     */
    networkingBgpAnnounceSetUpdate: (
      { body }: { body: BgpAnnounceSetCreate },
      params: FetchParams = {}
    ) => {
      return this.request<BgpAnnounceSet>({
        path: `/v1/system/networking/bgp-announce-set`,
        method: 'PUT',
        body,
        ...params,
      })
    },
    /**
     * Delete BGP announce set
     */
    networkingBgpAnnounceSetDelete: (
      { path }: { path: NetworkingBgpAnnounceSetDeletePathParams },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/system/networking/bgp-announce-set/${path.announceSet}`,
        method: 'DELETE',
        ...params,
      })
    },
    /**
     * Get originated routes for a specified BGP announce set
     */
    networkingBgpAnnouncementList: (
      { path }: { path: NetworkingBgpAnnouncementListPathParams },
      params: FetchParams = {}
    ) => {
      return this.request<BgpAnnouncement[]>({
        path: `/v1/system/networking/bgp-announce-set/${path.announceSet}/announcement`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Get BGP exported routes
     */
    networkingBgpExported: (_: EmptyObj, params: FetchParams = {}) => {
      return this.request<BgpExported>({
        path: `/v1/system/networking/bgp-exported`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Get BGP router message history
     */
    networkingBgpMessageHistory: (
      { query }: { query: NetworkingBgpMessageHistoryQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<AggregateBgpMessageHistory>({
        path: `/v1/system/networking/bgp-message-history`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Get imported IPv4 BGP routes
     */
    networkingBgpImportedRoutesIpv4: (
      { query }: { query: NetworkingBgpImportedRoutesIpv4QueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<BgpImportedRouteIpv4[]>({
        path: `/v1/system/networking/bgp-routes-ipv4`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Get BGP peer status
     */
    networkingBgpStatus: (_: EmptyObj, params: FetchParams = {}) => {
      return this.request<BgpPeerStatus[]>({
        path: `/v1/system/networking/bgp-status`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Return whether API services can receive limited ICMP traffic
     */
    networkingInboundIcmpView: (_: EmptyObj, params: FetchParams = {}) => {
      return this.request<ServiceIcmpConfig>({
        path: `/v1/system/networking/inbound-icmp`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Set whether API services can receive limited ICMP traffic
     */
    networkingInboundIcmpUpdate: (
      { body }: { body: ServiceIcmpConfig },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/system/networking/inbound-icmp`,
        method: 'PUT',
        body,
        ...params,
      })
    },
    /**
     * List loopback addresses
     */
    networkingLoopbackAddressList: (
      { query = {} }: { query?: NetworkingLoopbackAddressListQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<LoopbackAddressResultsPage>({
        path: `/v1/system/networking/loopback-address`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create loopback address
     */
    networkingLoopbackAddressCreate: (
      { body }: { body: LoopbackAddressCreate },
      params: FetchParams = {}
    ) => {
      return this.request<LoopbackAddress>({
        path: `/v1/system/networking/loopback-address`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Delete loopback address
     */
    networkingLoopbackAddressDelete: (
      { path }: { path: NetworkingLoopbackAddressDeletePathParams },
      params: FetchParams = {}
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
      params: FetchParams = {}
    ) => {
      return this.request<SwitchPortSettingsIdentityResultsPage>({
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
      params: FetchParams = {}
    ) => {
      return this.request<SwitchPortSettings>({
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
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/system/networking/switch-port-settings`,
        method: 'DELETE',
        query,
        ...params,
      })
    },
    /**
     * Get information about switch port
     */
    networkingSwitchPortSettingsView: (
      { path }: { path: NetworkingSwitchPortSettingsViewPathParams },
      params: FetchParams = {}
    ) => {
      return this.request<SwitchPortSettings>({
        path: `/v1/system/networking/switch-port-settings/${path.port}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Fetch top-level IAM policy
     */
    systemPolicyView: (_: EmptyObj, params: FetchParams = {}) => {
      return this.request<FleetRolePolicy>({
        path: `/v1/system/policy`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Update top-level IAM policy
     */
    systemPolicyUpdate: ({ body }: { body: FleetRolePolicy }, params: FetchParams = {}) => {
      return this.request<FleetRolePolicy>({
        path: `/v1/system/policy`,
        method: 'PUT',
        body,
        ...params,
      })
    },
    /**
     * Lists resource quotas for all silos
     */
    systemQuotasList: (
      { query = {} }: { query?: SystemQuotasListQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<SiloQuotasResultsPage>({
        path: `/v1/system/silo-quotas`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * List silos
     */
    siloList: (
      { query = {} }: { query?: SiloListQueryParams },
      params: FetchParams = {}
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
    siloCreate: ({ body }: { body: SiloCreate }, params: FetchParams = {}) => {
      return this.request<Silo>({
        path: `/v1/system/silos`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Fetch silo
     */
    siloView: ({ path }: { path: SiloViewPathParams }, params: FetchParams = {}) => {
      return this.request<Silo>({
        path: `/v1/system/silos/${path.silo}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Delete a silo
     */
    siloDelete: ({ path }: { path: SiloDeletePathParams }, params: FetchParams = {}) => {
      return this.request<void>({
        path: `/v1/system/silos/${path.silo}`,
        method: 'DELETE',
        ...params,
      })
    },
    /**
     * List IP pools linked to silo
     */
    siloIpPoolList: (
      {
        path,
        query = {},
      }: { path: SiloIpPoolListPathParams; query?: SiloIpPoolListQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<SiloIpPoolResultsPage>({
        path: `/v1/system/silos/${path.silo}/ip-pools`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Fetch silo IAM policy
     */
    siloPolicyView: (
      { path }: { path: SiloPolicyViewPathParams },
      params: FetchParams = {}
    ) => {
      return this.request<SiloRolePolicy>({
        path: `/v1/system/silos/${path.silo}/policy`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Update silo IAM policy
     */
    siloPolicyUpdate: (
      { path, body }: { path: SiloPolicyUpdatePathParams; body: SiloRolePolicy },
      params: FetchParams = {}
    ) => {
      return this.request<SiloRolePolicy>({
        path: `/v1/system/silos/${path.silo}/policy`,
        method: 'PUT',
        body,
        ...params,
      })
    },
    /**
     * Fetch resource quotas for silo
     */
    siloQuotasView: (
      { path }: { path: SiloQuotasViewPathParams },
      params: FetchParams = {}
    ) => {
      return this.request<SiloQuotas>({
        path: `/v1/system/silos/${path.silo}/quotas`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Update resource quotas for silo
     */
    siloQuotasUpdate: (
      { path, body }: { path: SiloQuotasUpdatePathParams; body: SiloQuotasUpdate },
      params: FetchParams = {}
    ) => {
      return this.request<SiloQuotas>({
        path: `/v1/system/silos/${path.silo}/quotas`,
        method: 'PUT',
        body,
        ...params,
      })
    },
    /**
     * Run timeseries query
     */
    systemTimeseriesQuery: (
      { body }: { body: TimeseriesQuery },
      params: FetchParams = {}
    ) => {
      return this.request<OxqlQueryResult>({
        path: `/v1/system/timeseries/query`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * List timeseries schemas
     */
    systemTimeseriesSchemaList: (
      { query = {} }: { query?: SystemTimeseriesSchemaListQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<TimeseriesSchemaResultsPage>({
        path: `/v1/system/timeseries/schemas`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Upload system release repository
     */
    systemUpdatePutRepository: (
      { query }: { query: SystemUpdatePutRepositoryQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<TufRepoInsertResponse>({
        path: `/v1/system/update/repository`,
        method: 'PUT',
        query,
        ...params,
      })
    },
    /**
     * Fetch system release repository description by version
     */
    systemUpdateGetRepository: (
      { path }: { path: SystemUpdateGetRepositoryPathParams },
      params: FetchParams = {}
    ) => {
      return this.request<TufRepoGetResponse>({
        path: `/v1/system/update/repository/${path.systemVersion}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Get the current target release of the rack's system software
     */
    targetReleaseView: (_: EmptyObj, params: FetchParams = {}) => {
      return this.request<TargetRelease>({
        path: `/v1/system/update/target-release`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Set the current target release of the rack's system software
     */
    targetReleaseUpdate: (
      { body }: { body: SetTargetReleaseParams },
      params: FetchParams = {}
    ) => {
      return this.request<TargetRelease>({
        path: `/v1/system/update/target-release`,
        method: 'PUT',
        body,
        ...params,
      })
    },
    /**
     * List root roles in the updates trust store
     */
    systemUpdateTrustRootList: (
      { query = {} }: { query?: SystemUpdateTrustRootListQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<UpdatesTrustRootResultsPage>({
        path: `/v1/system/update/trust-roots`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Add trusted root role to updates trust store
     */
    systemUpdateTrustRootCreate: (_: EmptyObj, params: FetchParams = {}) => {
      return this.request<UpdatesTrustRoot>({
        path: `/v1/system/update/trust-roots`,
        method: 'POST',
        ...params,
      })
    },
    /**
     * Fetch trusted root role
     */
    systemUpdateTrustRootView: (
      { path }: { path: SystemUpdateTrustRootViewPathParams },
      params: FetchParams = {}
    ) => {
      return this.request<UpdatesTrustRoot>({
        path: `/v1/system/update/trust-roots/${path.trustRootId}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Delete trusted root role
     */
    systemUpdateTrustRootDelete: (
      { path }: { path: SystemUpdateTrustRootDeletePathParams },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/system/update/trust-roots/${path.trustRootId}`,
        method: 'DELETE',
        ...params,
      })
    },
    /**
     * List built-in (system) users in silo
     */
    siloUserList: (
      { query = {} }: { query?: SiloUserListQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<UserResultsPage>({
        path: `/v1/system/users`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Fetch built-in (system) user
     */
    siloUserView: (
      { path, query }: { path: SiloUserViewPathParams; query: SiloUserViewQueryParams },
      params: FetchParams = {}
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
      params: FetchParams = {}
    ) => {
      return this.request<UserBuiltinResultsPage>({
        path: `/v1/system/users-builtin`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Fetch built-in user
     */
    userBuiltinView: (
      { path }: { path: UserBuiltinViewPathParams },
      params: FetchParams = {}
    ) => {
      return this.request<UserBuiltin>({
        path: `/v1/system/users-builtin/${path.user}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * List current utilization state for all silos
     */
    siloUtilizationList: (
      { query = {} }: { query?: SiloUtilizationListQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<SiloUtilizationResultsPage>({
        path: `/v1/system/utilization/silos`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Fetch current utilization for given silo
     */
    siloUtilizationView: (
      { path }: { path: SiloUtilizationViewPathParams },
      params: FetchParams = {}
    ) => {
      return this.request<SiloUtilization>({
        path: `/v1/system/utilization/silos/${path.silo}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * Run project-scoped timeseries query
     */
    timeseriesQuery: (
      { query, body }: { query: TimeseriesQueryQueryParams; body: TimeseriesQuery },
      params: FetchParams = {}
    ) => {
      return this.request<OxqlQueryResult>({
        path: `/v1/timeseries/query`,
        method: 'POST',
        body,
        query,
        ...params,
      })
    },
    /**
     * List users
     */
    userList: (
      { query = {} }: { query?: UserListQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<UserResultsPage>({
        path: `/v1/users`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Fetch user
     */
    userView: ({ path }: { path: UserViewPathParams }, params: FetchParams = {}) => {
      return this.request<User>({
        path: `/v1/users/${path.userId}`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * List user's access tokens
     */
    userTokenList: (
      {
        path,
        query = {},
      }: { path: UserTokenListPathParams; query?: UserTokenListQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<DeviceAccessTokenResultsPage>({
        path: `/v1/users/${path.userId}/access-tokens`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Log user out
     */
    userLogout: ({ path }: { path: UserLogoutPathParams }, params: FetchParams = {}) => {
      return this.request<void>({
        path: `/v1/users/${path.userId}/logout`,
        method: 'POST',
        ...params,
      })
    },
    /**
     * List user's console sessions
     */
    userSessionList: (
      {
        path,
        query = {},
      }: { path: UserSessionListPathParams; query?: UserSessionListQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<ConsoleSessionResultsPage>({
        path: `/v1/users/${path.userId}/sessions`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Fetch resource utilization for user's current silo
     */
    utilizationView: (_: EmptyObj, params: FetchParams = {}) => {
      return this.request<Utilization>({
        path: `/v1/utilization`,
        method: 'GET',
        ...params,
      })
    },
    /**
     * List firewall rules
     */
    vpcFirewallRulesView: (
      { query }: { query: VpcFirewallRulesViewQueryParams },
      params: FetchParams = {}
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
        query,
        body,
      }: { query: VpcFirewallRulesUpdateQueryParams; body: VpcFirewallRuleUpdateParams },
      params: FetchParams = {}
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
      params: FetchParams = {}
    ) => {
      return this.request<RouterRouteResultsPage>({
        path: `/v1/vpc-router-routes`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create route
     */
    vpcRouterRouteCreate: (
      { query, body }: { query: VpcRouterRouteCreateQueryParams; body: RouterRouteCreate },
      params: FetchParams = {}
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
     * Fetch route
     */
    vpcRouterRouteView: (
      {
        path,
        query = {},
      }: { path: VpcRouterRouteViewPathParams; query?: VpcRouterRouteViewQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<RouterRoute>({
        path: `/v1/vpc-router-routes/${path.route}`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Update route
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
      params: FetchParams = {}
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
     * Delete route
     */
    vpcRouterRouteDelete: (
      {
        path,
        query = {},
      }: { path: VpcRouterRouteDeletePathParams; query?: VpcRouterRouteDeleteQueryParams },
      params: FetchParams = {}
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
      params: FetchParams = {}
    ) => {
      return this.request<VpcRouterResultsPage>({
        path: `/v1/vpc-routers`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create VPC router
     */
    vpcRouterCreate: (
      { query, body }: { query: VpcRouterCreateQueryParams; body: VpcRouterCreate },
      params: FetchParams = {}
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
     * Fetch router
     */
    vpcRouterView: (
      {
        path,
        query = {},
      }: { path: VpcRouterViewPathParams; query?: VpcRouterViewQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<VpcRouter>({
        path: `/v1/vpc-routers/${path.router}`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Update router
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
      params: FetchParams = {}
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
     * Delete router
     */
    vpcRouterDelete: (
      {
        path,
        query = {},
      }: { path: VpcRouterDeletePathParams; query?: VpcRouterDeleteQueryParams },
      params: FetchParams = {}
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
      params: FetchParams = {}
    ) => {
      return this.request<VpcSubnetResultsPage>({
        path: `/v1/vpc-subnets`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create subnet
     */
    vpcSubnetCreate: (
      { query, body }: { query: VpcSubnetCreateQueryParams; body: VpcSubnetCreate },
      params: FetchParams = {}
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
     * Fetch subnet
     */
    vpcSubnetView: (
      {
        path,
        query = {},
      }: { path: VpcSubnetViewPathParams; query?: VpcSubnetViewQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<VpcSubnet>({
        path: `/v1/vpc-subnets/${path.subnet}`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Update subnet
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
      params: FetchParams = {}
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
     * Delete subnet
     */
    vpcSubnetDelete: (
      {
        path,
        query = {},
      }: { path: VpcSubnetDeletePathParams; query?: VpcSubnetDeleteQueryParams },
      params: FetchParams = {}
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
      params: FetchParams = {}
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
    vpcList: ({ query = {} }: { query?: VpcListQueryParams }, params: FetchParams = {}) => {
      return this.request<VpcResultsPage>({
        path: `/v1/vpcs`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Create VPC
     */
    vpcCreate: (
      { query, body }: { query: VpcCreateQueryParams; body: VpcCreate },
      params: FetchParams = {}
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
     * Fetch VPC
     */
    vpcView: (
      { path, query = {} }: { path: VpcViewPathParams; query?: VpcViewQueryParams },
      params: FetchParams = {}
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
      params: FetchParams = {}
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
     * Delete VPC
     */
    vpcDelete: (
      { path, query = {} }: { path: VpcDeletePathParams; query?: VpcDeleteQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/vpcs/${path.vpc}`,
        method: 'DELETE',
        query,
        ...params,
      })
    },
    /**
     * Create webhook receiver
     */
    webhookReceiverCreate: (
      { body }: { body: WebhookCreate },
      params: FetchParams = {}
    ) => {
      return this.request<WebhookReceiver>({
        path: `/v1/webhook-receivers`,
        method: 'POST',
        body,
        ...params,
      })
    },
    /**
     * Update webhook receiver
     */
    webhookReceiverUpdate: (
      {
        path,
        body,
      }: { path: WebhookReceiverUpdatePathParams; body: WebhookReceiverUpdate },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/webhook-receivers/${path.receiver}`,
        method: 'PUT',
        body,
        ...params,
      })
    },
    /**
     * List webhook receiver secret IDs
     */
    webhookSecretsList: (
      { query }: { query: WebhookSecretsListQueryParams },
      params: FetchParams = {}
    ) => {
      return this.request<WebhookSecrets>({
        path: `/v1/webhook-secrets`,
        method: 'GET',
        query,
        ...params,
      })
    },
    /**
     * Add secret to webhook receiver
     */
    webhookSecretsAdd: (
      { query, body }: { query: WebhookSecretsAddQueryParams; body: WebhookSecretCreate },
      params: FetchParams = {}
    ) => {
      return this.request<WebhookSecret>({
        path: `/v1/webhook-secrets`,
        method: 'POST',
        body,
        query,
        ...params,
      })
    },
    /**
     * Remove secret from webhook receiver
     */
    webhookSecretsDelete: (
      { path }: { path: WebhookSecretsDeletePathParams },
      params: FetchParams = {}
    ) => {
      return this.request<void>({
        path: `/v1/webhook-secrets/${path.secretId}`,
        method: 'DELETE',
        ...params,
      })
    },
  }
  ws = {
    /**
     * Stream instance serial console
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

export default Api
