/* eslint-disable */

/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { z, ZodType } from 'zod'

import { processResponseBody, uniqueItems } from './util'

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
 * An IPv4 subnet
 *
 * An IPv4 subnet, including prefix and subnet mask
 */
export const Ipv4Net = z.preprocess(
  processResponseBody,
  z
    .string()
    .regex(
      /^(([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\/([0-9]|1[0-9]|2[0-9]|3[0-2])$/
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
      /^([fF][dD])[0-9a-fA-F]{2}:(([0-9a-fA-F]{1,4}:){6}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,6}:)([0-9a-fA-F]{1,4})?\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8])$/
    )
)

export const IpNet = z.preprocess(processResponseBody, z.union([Ipv4Net, Ipv6Net]))

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
      /^(?![0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$)^[a-z]([a-zA-Z0-9-]*[a-zA-Z0-9]+)?$/
    )
)

export const NameOrId = z.preprocess(
  processResponseBody,
  z.union([z.string().uuid(), Name])
)

/**
 * An address tied to an address lot.
 */
export const Address = z.preprocess(
  processResponseBody,
  z.object({ address: IpNet, addressLot: NameOrId })
)

/**
 * A set of addresses associated with a port configuration.
 */
export const AddressConfig = z.preprocess(
  processResponseBody,
  z.object({ addresses: Address.array() })
)

/**
 * The kind associated with an address lot.
 */
export const AddressLotKind = z.preprocess(processResponseBody, z.enum(['infra', 'pool']))

/**
 * Represents an address lot object, containing the id of the lot that can be used in other API calls.
 */
export const AddressLot = z.preprocess(
  processResponseBody,
  z.object({
    description: z.string(),
    id: z.string().uuid(),
    kind: AddressLotKind,
    name: Name,
    timeCreated: z.coerce.date(),
    timeModified: z.coerce.date(),
  })
)

/**
 * An address lot block is a part of an address lot and contains a range of addresses. The range is inclusive.
 */
export const AddressLotBlock = z.preprocess(
  processResponseBody,
  z.object({
    firstAddress: z.string().ip(),
    id: z.string().uuid(),
    lastAddress: z.string().ip(),
  })
)

/**
 * Parameters for creating an address lot block. Fist and last addresses are inclusive.
 */
export const AddressLotBlockCreate = z.preprocess(
  processResponseBody,
  z.object({ firstAddress: z.string().ip(), lastAddress: z.string().ip() })
)

/**
 * A single page of results
 */
export const AddressLotBlockResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: AddressLotBlock.array(), nextPage: z.string().optional() })
)

/**
 * Parameters for creating an address lot.
 */
export const AddressLotCreate = z.preprocess(
  processResponseBody,
  z.object({
    blocks: AddressLotBlockCreate.array(),
    description: z.string(),
    kind: AddressLotKind,
    name: Name,
  })
)

/**
 * An address lot and associated blocks resulting from creating an address lot.
 */
export const AddressLotCreateResponse = z.preprocess(
  processResponseBody,
  z.object({ blocks: AddressLotBlock.array(), lot: AddressLot })
)

/**
 * A single page of results
 */
export const AddressLotResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: AddressLot.array(), nextPage: z.string().optional() })
)

/**
 * Properties that uniquely identify an Oxide hardware component
 */
export const Baseboard = z.preprocess(
  processResponseBody,
  z.object({ part: z.string(), revision: z.number(), serial: z.string() })
)

/**
 * Represents a BGP announce set by id. The id can be used with other API calls to view and manage the announce set.
 */
export const BgpAnnounceSet = z.preprocess(
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
 * A BGP announcement tied to a particular address lot block.
 */
export const BgpAnnouncementCreate = z.preprocess(
  processResponseBody,
  z.object({ addressLotBlock: NameOrId, network: IpNet })
)

/**
 * Parameters for creating a named set of BGP announcements.
 */
export const BgpAnnounceSetCreate = z.preprocess(
  processResponseBody,
  z.object({
    announcement: BgpAnnouncementCreate.array(),
    description: z.string(),
    name: Name,
  })
)

/**
 * A BGP announcement tied to an address lot block.
 */
export const BgpAnnouncement = z.preprocess(
  processResponseBody,
  z.object({
    addressLotBlockId: z.string().uuid(),
    announceSetId: z.string().uuid(),
    network: IpNet,
  })
)

/**
 * A base BGP configuration.
 */
export const BgpConfig = z.preprocess(
  processResponseBody,
  z.object({
    asn: z.number().min(0).max(4294967295),
    description: z.string(),
    id: z.string().uuid(),
    name: Name,
    timeCreated: z.coerce.date(),
    timeModified: z.coerce.date(),
    vrf: z.string().optional(),
  })
)

/**
 * Parameters for creating a BGP configuration. This includes and autonomous system number (ASN) and a virtual routing and forwarding (VRF) identifier.
 */
export const BgpConfigCreate = z.preprocess(
  processResponseBody,
  z.object({
    asn: z.number().min(0).max(4294967295),
    bgpAnnounceSetId: NameOrId,
    description: z.string(),
    name: Name,
    vrf: Name.optional(),
  })
)

/**
 * A single page of results
 */
export const BgpConfigResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: BgpConfig.array(), nextPage: z.string().optional() })
)

/**
 * Identifies switch physical location
 */
export const SwitchLocation = z.preprocess(
  processResponseBody,
  z.enum(['switch0', 'switch1'])
)

/**
 * A route imported from a BGP peer.
 */
export const BgpImportedRouteIpv4 = z.preprocess(
  processResponseBody,
  z.object({
    id: z.number().min(0).max(4294967295),
    nexthop: z.string(),
    prefix: Ipv4Net,
    switch: SwitchLocation,
  })
)

/**
 * A BGP peer configuration for an interface. Includes the set of announcements that will be advertised to the peer identified by `addr`. The `bgp_config` parameter is a reference to global BGP parameters. The `interface_name` indicates what interface the peer should be contacted on.
 */
export const BgpPeer = z.preprocess(
  processResponseBody,
  z.object({
    addr: z.string().ip(),
    bgpAnnounceSet: NameOrId,
    bgpConfig: NameOrId,
    connectRetry: z.number().min(0).max(4294967295),
    delayOpen: z.number().min(0).max(4294967295),
    holdTime: z.number().min(0).max(4294967295),
    idleHoldTime: z.number().min(0).max(4294967295),
    interfaceName: z.string(),
    keepalive: z.number().min(0).max(4294967295),
  })
)

export const BgpPeerConfig = z.preprocess(
  processResponseBody,
  z.object({ peers: BgpPeer.array() })
)

/**
 * The current state of a BGP peer.
 */
export const BgpPeerState = z.preprocess(
  processResponseBody,
  z.enum([
    'idle',
    'connect',
    'active',
    'open_sent',
    'open_confirm',
    'session_setup',
    'established',
  ])
)

/**
 * The current status of a BGP peer.
 */
export const BgpPeerStatus = z.preprocess(
  processResponseBody,
  z.object({
    addr: z.string().ip(),
    localAsn: z.number().min(0).max(4294967295),
    remoteAsn: z.number().min(0).max(4294967295),
    state: BgpPeerState,
    stateDurationMillis: z.number().min(0),
    switch: SwitchLocation,
  })
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
export const BinRangefloat = z.preprocess(
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
export const BinRangeint16 = z.preprocess(
  processResponseBody,
  z.union([
    z.object({ end: z.number().min(-32767).max(32767), type: z.enum(['range_to']) }),
    z.object({
      end: z.number().min(-32767).max(32767),
      start: z.number().min(-32767).max(32767),
      type: z.enum(['range']),
    }),
    z.object({ start: z.number().min(-32767).max(32767), type: z.enum(['range_from']) }),
  ])
)

/**
 * A type storing a range over `T`.
 *
 * This type supports ranges similar to the `RangeTo`, `Range` and `RangeFrom` types in the standard library. Those cover `(..end)`, `(start..end)`, and `(start..)` respectively.
 */
export const BinRangeint32 = z.preprocess(
  processResponseBody,
  z.union([
    z.object({
      end: z.number().min(-2147483647).max(2147483647),
      type: z.enum(['range_to']),
    }),
    z.object({
      end: z.number().min(-2147483647).max(2147483647),
      start: z.number().min(-2147483647).max(2147483647),
      type: z.enum(['range']),
    }),
    z.object({
      start: z.number().min(-2147483647).max(2147483647),
      type: z.enum(['range_from']),
    }),
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
 * A type storing a range over `T`.
 *
 * This type supports ranges similar to the `RangeTo`, `Range` and `RangeFrom` types in the standard library. Those cover `(..end)`, `(start..end)`, and `(start..)` respectively.
 */
export const BinRangeint8 = z.preprocess(
  processResponseBody,
  z.union([
    z.object({ end: z.number().min(-127).max(127), type: z.enum(['range_to']) }),
    z.object({
      end: z.number().min(-127).max(127),
      start: z.number().min(-127).max(127),
      type: z.enum(['range']),
    }),
    z.object({ start: z.number().min(-127).max(127), type: z.enum(['range_from']) }),
  ])
)

/**
 * A type storing a range over `T`.
 *
 * This type supports ranges similar to the `RangeTo`, `Range` and `RangeFrom` types in the standard library. Those cover `(..end)`, `(start..end)`, and `(start..)` respectively.
 */
export const BinRangeuint16 = z.preprocess(
  processResponseBody,
  z.union([
    z.object({ end: z.number().min(0).max(65535), type: z.enum(['range_to']) }),
    z.object({
      end: z.number().min(0).max(65535),
      start: z.number().min(0).max(65535),
      type: z.enum(['range']),
    }),
    z.object({ start: z.number().min(0).max(65535), type: z.enum(['range_from']) }),
  ])
)

/**
 * A type storing a range over `T`.
 *
 * This type supports ranges similar to the `RangeTo`, `Range` and `RangeFrom` types in the standard library. Those cover `(..end)`, `(start..end)`, and `(start..)` respectively.
 */
export const BinRangeuint32 = z.preprocess(
  processResponseBody,
  z.union([
    z.object({ end: z.number().min(0).max(4294967295), type: z.enum(['range_to']) }),
    z.object({
      end: z.number().min(0).max(4294967295),
      start: z.number().min(0).max(4294967295),
      type: z.enum(['range']),
    }),
    z.object({ start: z.number().min(0).max(4294967295), type: z.enum(['range_from']) }),
  ])
)

/**
 * A type storing a range over `T`.
 *
 * This type supports ranges similar to the `RangeTo`, `Range` and `RangeFrom` types in the standard library. Those cover `(..end)`, `(start..end)`, and `(start..)` respectively.
 */
export const BinRangeuint64 = z.preprocess(
  processResponseBody,
  z.union([
    z.object({ end: z.number().min(0), type: z.enum(['range_to']) }),
    z.object({ end: z.number().min(0), start: z.number().min(0), type: z.enum(['range']) }),
    z.object({ start: z.number().min(0), type: z.enum(['range_from']) }),
  ])
)

/**
 * A type storing a range over `T`.
 *
 * This type supports ranges similar to the `RangeTo`, `Range` and `RangeFrom` types in the standard library. Those cover `(..end)`, `(start..end)`, and `(start..)` respectively.
 */
export const BinRangeuint8 = z.preprocess(
  processResponseBody,
  z.union([
    z.object({ end: z.number().min(0).max(255), type: z.enum(['range_to']) }),
    z.object({
      end: z.number().min(0).max(255),
      start: z.number().min(0).max(255),
      type: z.enum(['range']),
    }),
    z.object({ start: z.number().min(0).max(255), type: z.enum(['range_from']) }),
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
export const Binfloat = z.preprocess(
  processResponseBody,
  z.object({ count: z.number().min(0), range: BinRangefloat })
)

/**
 * Type storing bin edges and a count of samples within it.
 */
export const Binint16 = z.preprocess(
  processResponseBody,
  z.object({ count: z.number().min(0), range: BinRangeint16 })
)

/**
 * Type storing bin edges and a count of samples within it.
 */
export const Binint32 = z.preprocess(
  processResponseBody,
  z.object({ count: z.number().min(0), range: BinRangeint32 })
)

/**
 * Type storing bin edges and a count of samples within it.
 */
export const Binint64 = z.preprocess(
  processResponseBody,
  z.object({ count: z.number().min(0), range: BinRangeint64 })
)

/**
 * Type storing bin edges and a count of samples within it.
 */
export const Binint8 = z.preprocess(
  processResponseBody,
  z.object({ count: z.number().min(0), range: BinRangeint8 })
)

/**
 * Type storing bin edges and a count of samples within it.
 */
export const Binuint16 = z.preprocess(
  processResponseBody,
  z.object({ count: z.number().min(0), range: BinRangeuint16 })
)

/**
 * Type storing bin edges and a count of samples within it.
 */
export const Binuint32 = z.preprocess(
  processResponseBody,
  z.object({ count: z.number().min(0), range: BinRangeuint32 })
)

/**
 * Type storing bin edges and a count of samples within it.
 */
export const Binuint64 = z.preprocess(
  processResponseBody,
  z.object({ count: z.number().min(0), range: BinRangeuint64 })
)

/**
 * Type storing bin edges and a count of samples within it.
 */
export const Binuint8 = z.preprocess(
  processResponseBody,
  z.object({ count: z.number().min(0), range: BinRangeuint8 })
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
    cert: z.string(),
    description: z.string(),
    key: z.string(),
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
export const Cumulativefloat = z.preprocess(
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
 * A cumulative or counter data type.
 */
export const Cumulativeuint64 = z.preprocess(
  processResponseBody,
  z.object({ startTime: z.coerce.date(), value: z.number().min(0) })
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
export const Histogramint8 = z.preprocess(
  processResponseBody,
  z.object({
    bins: Binint8.array(),
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
export const Histogramuint8 = z.preprocess(
  processResponseBody,
  z.object({
    bins: Binuint8.array(),
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
export const Histogramint16 = z.preprocess(
  processResponseBody,
  z.object({
    bins: Binint16.array(),
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
export const Histogramuint16 = z.preprocess(
  processResponseBody,
  z.object({
    bins: Binuint16.array(),
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
export const Histogramint32 = z.preprocess(
  processResponseBody,
  z.object({
    bins: Binint32.array(),
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
export const Histogramuint32 = z.preprocess(
  processResponseBody,
  z.object({
    bins: Binuint32.array(),
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
export const Histogramuint64 = z.preprocess(
  processResponseBody,
  z.object({
    bins: Binuint64.array(),
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
export const Histogramfloat = z.preprocess(
  processResponseBody,
  z.object({
    bins: Binfloat.array(),
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
 * The type of an individual datum of a metric.
 */
export const DatumType = z.preprocess(
  processResponseBody,
  z.enum([
    'bool',
    'i8',
    'u8',
    'i16',
    'u16',
    'i32',
    'u32',
    'i64',
    'u64',
    'f32',
    'f64',
    'string',
    'bytes',
    'cumulative_i64',
    'cumulative_u64',
    'cumulative_f32',
    'cumulative_f64',
    'histogram_i8',
    'histogram_u8',
    'histogram_i16',
    'histogram_u16',
    'histogram_i32',
    'histogram_u32',
    'histogram_i64',
    'histogram_u64',
    'histogram_f32',
    'histogram_f64',
  ])
)

export const MissingDatum = z.preprocess(
  processResponseBody,
  z.object({ datumType: DatumType, startTime: z.coerce.date().optional() })
)

/**
 * A `Datum` is a single sampled data point from a metric.
 */
export const Datum = z.preprocess(
  processResponseBody,
  z.union([
    z.object({ datum: SafeBoolean, type: z.enum(['bool']) }),
    z.object({ datum: z.number().min(-127).max(127), type: z.enum(['i8']) }),
    z.object({ datum: z.number().min(0).max(255), type: z.enum(['u8']) }),
    z.object({ datum: z.number().min(-32767).max(32767), type: z.enum(['i16']) }),
    z.object({ datum: z.number().min(0).max(65535), type: z.enum(['u16']) }),
    z.object({ datum: z.number().min(-2147483647).max(2147483647), type: z.enum(['i32']) }),
    z.object({ datum: z.number().min(0).max(4294967295), type: z.enum(['u32']) }),
    z.object({ datum: z.number(), type: z.enum(['i64']) }),
    z.object({ datum: z.number().min(0), type: z.enum(['u64']) }),
    z.object({ datum: z.number(), type: z.enum(['f32']) }),
    z.object({ datum: z.number(), type: z.enum(['f64']) }),
    z.object({ datum: z.string(), type: z.enum(['string']) }),
    z.object({ datum: z.number().min(0).max(255).array(), type: z.enum(['bytes']) }),
    z.object({ datum: Cumulativeint64, type: z.enum(['cumulative_i64']) }),
    z.object({ datum: Cumulativeuint64, type: z.enum(['cumulative_u64']) }),
    z.object({ datum: Cumulativefloat, type: z.enum(['cumulative_f32']) }),
    z.object({ datum: Cumulativedouble, type: z.enum(['cumulative_f64']) }),
    z.object({ datum: Histogramint8, type: z.enum(['histogram_i8']) }),
    z.object({ datum: Histogramuint8, type: z.enum(['histogram_u8']) }),
    z.object({ datum: Histogramint16, type: z.enum(['histogram_i16']) }),
    z.object({ datum: Histogramuint16, type: z.enum(['histogram_u16']) }),
    z.object({ datum: Histogramint32, type: z.enum(['histogram_i32']) }),
    z.object({ datum: Histogramuint32, type: z.enum(['histogram_u32']) }),
    z.object({ datum: Histogramint64, type: z.enum(['histogram_i64']) }),
    z.object({ datum: Histogramuint64, type: z.enum(['histogram_u64']) }),
    z.object({ datum: Histogramfloat, type: z.enum(['histogram_f32']) }),
    z.object({ datum: Histogramdouble, type: z.enum(['histogram_f64']) }),
    z.object({ datum: MissingDatum, type: z.enum(['missing']) }),
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
  z.object({
    description: z.string(),
    diskSource: DiskSource,
    name: Name,
    size: ByteCount,
  })
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
  z.object({
    errorCode: z.string().optional(),
    message: z.string(),
    requestId: z.string(),
  })
)

/**
 * The kind of an external IP address for an instance
 */
export const IpKind = z.preprocess(processResponseBody, z.enum(['ephemeral', 'floating']))

export const ExternalIp = z.preprocess(
  processResponseBody,
  z.object({ ip: z.string().ip(), kind: IpKind })
)

/**
 * Parameters for creating an external IP address for instances.
 */
export const ExternalIpCreate = z.preprocess(
  processResponseBody,
  z.union([
    z.object({ poolName: Name.optional(), type: z.enum(['ephemeral']) }),
    z.object({ floatingIpName: Name, type: z.enum(['floating']) }),
  ])
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
 * A Floating IP is a well-known IP address which can be attached and detached from instances.
 */
export const FloatingIp = z.preprocess(
  processResponseBody,
  z.object({
    description: z.string(),
    id: z.string().uuid(),
    instanceId: z.string().uuid().optional(),
    ip: z.string().ip(),
    name: Name,
    projectId: z.string().uuid(),
    timeCreated: z.coerce.date(),
    timeModified: z.coerce.date(),
  })
)

/**
 * Parameters for creating a new floating IP address for instances.
 */
export const FloatingIpCreate = z.preprocess(
  processResponseBody,
  z.object({
    address: z.string().ip().optional(),
    description: z.string(),
    name: Name,
    pool: NameOrId.optional(),
  })
)

/**
 * A single page of results
 */
export const FloatingIpResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: FloatingIp.array(), nextPage: z.string().optional() })
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
 * View of an image
 *
 * If `project_id` is present then the image is only visible inside that project. If it's not present then the image is visible to all projects in the silo.
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
    version: z.string(),
  })
)

/**
 * The source of the underlying image.
 */
export const ImageSource = z.preprocess(
  processResponseBody,
  z.union([
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
    ip: z.string().ip().optional(),
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
    ip: z.string().ip(),
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
 * A collection of IP ranges. If a pool is linked to a silo, IP addresses from the pool can be allocated within that silo
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
  z.object({
    id: z.string().uuid(),
    ipPoolId: z.string().uuid(),
    range: IpRange,
    timeCreated: z.coerce.date(),
  })
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
 * A link between an IP pool and a silo that allows one to allocate IPs from the pool within the silo
 */
export const IpPoolSilo = z.preprocess(
  processResponseBody,
  z.object({
    ipPoolId: z.string().uuid(),
    isDefault: SafeBoolean,
    siloId: z.string().uuid(),
  })
)

export const IpPoolSiloLink = z.preprocess(
  processResponseBody,
  z.object({ isDefault: SafeBoolean, silo: NameOrId })
)

/**
 * A single page of results
 */
export const IpPoolSiloResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: IpPoolSilo.array(), nextPage: z.string().optional() })
)

export const IpPoolSiloUpdate = z.preprocess(
  processResponseBody,
  z.object({ isDefault: SafeBoolean })
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
 * The forward error correction mode of a link.
 */
export const LinkFec = z.preprocess(processResponseBody, z.enum(['firecode', 'none', 'rs']))

/**
 * The LLDP configuration associated with a port. LLDP may be either enabled or disabled, if enabled, an LLDP configuration must be provided by name or id.
 */
export const LldpServiceConfigCreate = z.preprocess(
  processResponseBody,
  z.object({ enabled: SafeBoolean, lldpConfig: NameOrId.optional() })
)

/**
 * The speed of a link.
 */
export const LinkSpeed = z.preprocess(
  processResponseBody,
  z.enum([
    'speed0_g',
    'speed1_g',
    'speed10_g',
    'speed25_g',
    'speed40_g',
    'speed50_g',
    'speed100_g',
    'speed200_g',
    'speed400_g',
  ])
)

/**
 * Switch link configuration.
 */
export const LinkConfigCreate = z.preprocess(
  processResponseBody,
  z.object({
    autoneg: SafeBoolean,
    fec: LinkFec,
    lldp: LldpServiceConfigCreate,
    mtu: z.number().min(0).max(65535),
    speed: LinkSpeed,
  })
)

/**
 * A link layer discovery protocol (LLDP) service configuration.
 */
export const LldpServiceConfig = z.preprocess(
  processResponseBody,
  z.object({
    enabled: SafeBoolean,
    id: z.string().uuid(),
    lldpConfigId: z.string().uuid().optional(),
  })
)

/**
 * A loopback address is an address that is assigned to a rack switch but is not associated with any particular port.
 */
export const LoopbackAddress = z.preprocess(
  processResponseBody,
  z.object({
    address: IpNet,
    addressLotBlockId: z.string().uuid(),
    id: z.string().uuid(),
    rackId: z.string().uuid(),
    switchLocation: z.string(),
  })
)

/**
 * Parameters for creating a loopback address on a particular rack switch.
 */
export const LoopbackAddressCreate = z.preprocess(
  processResponseBody,
  z.object({
    address: z.string().ip(),
    addressLot: NameOrId,
    anycast: SafeBoolean,
    mask: z.number().min(0).max(255),
    rackId: z.string().uuid(),
    switchLocation: Name,
  })
)

/**
 * A single page of results
 */
export const LoopbackAddressResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: LoopbackAddress.array(), nextPage: z.string().optional() })
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

/**
 * Describes the form factor of physical disks.
 */
export const PhysicalDiskKind = z.preprocess(processResponseBody, z.enum(['m2', 'u2']))

/**
 * View of a Physical Disk
 *
 * Physical disks reside in a particular sled and are used to store both Instance Disk data as well as internal metadata.
 */
export const PhysicalDisk = z.preprocess(
  processResponseBody,
  z.object({
    formFactor: PhysicalDiskKind,
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

export const PingStatus = z.preprocess(processResponseBody, z.enum(['ok']))

export const Ping = z.preprocess(processResponseBody, z.object({ status: PingStatus }))

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
 * A route to a destination network through a gateway address.
 */
export const Route = z.preprocess(
  processResponseBody,
  z.object({
    dst: IpNet,
    gw: z.string().ip(),
    vid: z.number().min(0).max(65535).optional(),
  })
)

/**
 * Route configuration data associated with a switch port configuration.
 */
export const RouteConfig = z.preprocess(
  processResponseBody,
  z.object({ routes: Route.array() })
)

/**
 * Identity-related metadata that's included in nearly all public API objects
 */
export const SamlIdentityProvider = z.preprocess(
  processResponseBody,
  z.object({
    acsUrl: z.string(),
    description: z.string(),
    groupAttributeName: z.string().optional(),
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
    mappedFleetRoles: z.record(z.string().min(1), FleetRole.array().refine(...uniqueItems)),
    name: Name,
    timeCreated: z.coerce.date(),
    timeModified: z.coerce.date(),
  })
)

/**
 * The amount of provisionable resources for a Silo
 */
export const SiloQuotasCreate = z.preprocess(
  processResponseBody,
  z.object({ cpus: z.number(), memory: ByteCount, storage: ByteCount })
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
    mappedFleetRoles: z
      .record(z.string().min(1), FleetRole.array().refine(...uniqueItems))
      .optional(),
    name: Name,
    quotas: SiloQuotasCreate,
    tlsCertificates: CertificateCreate.array(),
  })
)

/**
 * A collection of resource counts used to set the virtual capacity of a silo
 */
export const SiloQuotas = z.preprocess(
  processResponseBody,
  z.object({
    cpus: z.number(),
    memory: ByteCount,
    siloId: z.string().uuid(),
    storage: ByteCount,
  })
)

/**
 * A single page of results
 */
export const SiloQuotasResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: SiloQuotas.array(), nextPage: z.string().optional() })
)

/**
 * Updateable properties of a Silo's resource limits. If a value is omitted it will not be updated.
 */
export const SiloQuotasUpdate = z.preprocess(
  processResponseBody,
  z.object({
    cpus: z.number().optional(),
    memory: ByteCount.optional(),
    storage: ByteCount.optional(),
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
 * A collection of resource counts used to describe capacity and utilization
 */
export const VirtualResourceCounts = z.preprocess(
  processResponseBody,
  z.object({ cpus: z.number(), memory: ByteCount, storage: ByteCount })
)

/**
 * View of a silo's resource utilization and capacity
 */
export const SiloUtilization = z.preprocess(
  processResponseBody,
  z.object({
    allocated: VirtualResourceCounts,
    provisioned: VirtualResourceCounts,
    siloId: z.string().uuid(),
    siloName: Name,
  })
)

/**
 * A single page of results
 */
export const SiloUtilizationResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: SiloUtilization.array(), nextPage: z.string().optional() })
)

/**
 * The provision state of a sled.
 *
 * This controls whether new resources are going to be provisioned on this sled.
 */
export const SledProvisionState = z.preprocess(
  processResponseBody,
  z.enum(['provisionable', 'non_provisionable'])
)

/**
 * An operator's view of a Sled.
 */
export const Sled = z.preprocess(
  processResponseBody,
  z.object({
    baseboard: Baseboard,
    id: z.string().uuid(),
    provisionState: SledProvisionState,
    rackId: z.string().uuid(),
    timeCreated: z.coerce.date(),
    timeModified: z.coerce.date(),
    usableHardwareThreads: z.number().min(0).max(4294967295),
    usablePhysicalRam: ByteCount,
  })
)

/**
 * An operator's view of an instance running on a given sled
 */
export const SledInstance = z.preprocess(
  processResponseBody,
  z.object({
    activeSledId: z.string().uuid(),
    id: z.string().uuid(),
    memory: z.number(),
    migrationId: z.string().uuid().optional(),
    name: Name,
    ncpus: z.number(),
    projectName: Name,
    siloName: Name,
    state: InstanceState,
    timeCreated: z.coerce.date(),
    timeModified: z.coerce.date(),
  })
)

/**
 * A single page of results
 */
export const SledInstanceResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: SledInstance.array(), nextPage: z.string().optional() })
)

/**
 * Parameters for `sled_set_provision_state`.
 */
export const SledProvisionStateParams = z.preprocess(
  processResponseBody,
  z.object({ state: SledProvisionState })
)

/**
 * Response to `sled_set_provision_state`.
 */
export const SledProvisionStateResponse = z.preprocess(
  processResponseBody,
  z.object({ newState: SledProvisionState, oldState: SledProvisionState })
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
  z.object({ description: z.string(), disk: NameOrId, name: Name })
)

/**
 * A single page of results
 */
export const SnapshotResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: Snapshot.array(), nextPage: z.string().optional() })
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
 * An operator's view of a Switch.
 */
export const Switch = z.preprocess(
  processResponseBody,
  z.object({
    baseboard: Baseboard,
    id: z.string().uuid(),
    rackId: z.string().uuid(),
    timeCreated: z.coerce.date(),
    timeModified: z.coerce.date(),
  })
)

/**
 * Describes the kind of an switch interface.
 */
export const SwitchInterfaceKind2 = z.preprocess(
  processResponseBody,
  z.enum(['primary', 'vlan', 'loopback'])
)

/**
 * A switch port interface configuration for a port settings object.
 */
export const SwitchInterfaceConfig = z.preprocess(
  processResponseBody,
  z.object({
    id: z.string().uuid(),
    interfaceName: z.string(),
    kind: SwitchInterfaceKind2,
    portSettingsId: z.string().uuid(),
    v6Enabled: SafeBoolean,
  })
)

/**
 * Indicates the kind for a switch interface.
 */
export const SwitchInterfaceKind = z.preprocess(
  processResponseBody,
  z.union([
    z.object({ type: z.enum(['primary']) }),
    z.object({ type: z.enum(['vlan']), vid: z.number().min(0).max(65535) }),
    z.object({ type: z.enum(['loopback']) }),
  ])
)

/**
 * A layer-3 switch interface configuration. When IPv6 is enabled, a link local address will be created for the interface.
 */
export const SwitchInterfaceConfigCreate = z.preprocess(
  processResponseBody,
  z.object({ kind: SwitchInterfaceKind, v6Enabled: SafeBoolean })
)

/**
 * A switch port represents a physical external port on a rack switch.
 */
export const SwitchPort = z.preprocess(
  processResponseBody,
  z.object({
    id: z.string().uuid(),
    portName: z.string(),
    portSettingsId: z.string().uuid().optional(),
    rackId: z.string().uuid(),
    switchLocation: z.string(),
  })
)

/**
 * An IP address configuration for a port settings object.
 */
export const SwitchPortAddressConfig = z.preprocess(
  processResponseBody,
  z.object({
    address: IpNet,
    addressLotBlockId: z.string().uuid(),
    interfaceName: z.string(),
    portSettingsId: z.string().uuid(),
  })
)

/**
 * Parameters for applying settings to switch ports.
 */
export const SwitchPortApplySettings = z.preprocess(
  processResponseBody,
  z.object({ portSettings: NameOrId })
)

/**
 * A BGP peer configuration for a port settings object.
 */
export const SwitchPortBgpPeerConfig = z.preprocess(
  processResponseBody,
  z.object({
    addr: z.string().ip(),
    bgpConfigId: z.string().uuid(),
    interfaceName: z.string(),
    portSettingsId: z.string().uuid(),
  })
)

/**
 * The link geometry associated with a switch port.
 */
export const SwitchPortGeometry2 = z.preprocess(
  processResponseBody,
  z.enum(['qsfp28x1', 'qsfp28x2', 'sfp28x4'])
)

/**
 * A physical port configuration for a port settings object.
 */
export const SwitchPortConfig = z.preprocess(
  processResponseBody,
  z.object({ geometry: SwitchPortGeometry2, portSettingsId: z.string().uuid() })
)

/**
 * The link geometry associated with a switch port.
 */
export const SwitchPortGeometry = z.preprocess(
  processResponseBody,
  z.enum(['qsfp28x1', 'qsfp28x2', 'sfp28x4'])
)

/**
 * Physical switch port configuration.
 */
export const SwitchPortConfigCreate = z.preprocess(
  processResponseBody,
  z.object({ geometry: SwitchPortGeometry })
)

/**
 * A link configuration for a port settings object.
 */
export const SwitchPortLinkConfig = z.preprocess(
  processResponseBody,
  z.object({
    linkName: z.string(),
    lldpServiceConfigId: z.string().uuid(),
    mtu: z.number().min(0).max(65535),
    portSettingsId: z.string().uuid(),
  })
)

/**
 * A single page of results
 */
export const SwitchPortResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: SwitchPort.array(), nextPage: z.string().optional() })
)

/**
 * A route configuration for a port settings object.
 */
export const SwitchPortRouteConfig = z.preprocess(
  processResponseBody,
  z.object({
    dst: IpNet,
    gw: IpNet,
    interfaceName: z.string(),
    portSettingsId: z.string().uuid(),
    vlanId: z.number().min(0).max(65535).optional(),
  })
)

/**
 * A switch port settings identity whose id may be used to view additional details.
 */
export const SwitchPortSettings = z.preprocess(
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
 * Parameters for creating switch port settings. Switch port settings are the central data structure for setting up external networking. Switch port settings include link, interface, route, address and dynamic network protocol configuration.
 */
export const SwitchPortSettingsCreate = z.preprocess(
  processResponseBody,
  z.object({
    addresses: z.record(z.string().min(1), AddressConfig),
    bgpPeers: z.record(z.string().min(1), BgpPeerConfig),
    description: z.string(),
    groups: NameOrId.array(),
    interfaces: z.record(z.string().min(1), SwitchInterfaceConfigCreate),
    links: z.record(z.string().min(1), LinkConfigCreate),
    name: Name,
    portConfig: SwitchPortConfigCreate,
    routes: z.record(z.string().min(1), RouteConfig),
  })
)

/**
 * This structure maps a port settings object to a port settings groups. Port settings objects may inherit settings from groups. This mapping defines the relationship between settings objects and the groups they reference.
 */
export const SwitchPortSettingsGroups = z.preprocess(
  processResponseBody,
  z.object({ portSettingsGroupId: z.string().uuid(), portSettingsId: z.string().uuid() })
)

/**
 * A single page of results
 */
export const SwitchPortSettingsResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: SwitchPortSettings.array(), nextPage: z.string().optional() })
)

/**
 * A switch port VLAN interface configuration for a port settings object.
 */
export const SwitchVlanInterfaceConfig = z.preprocess(
  processResponseBody,
  z.object({ interfaceConfigId: z.string().uuid(), vlanId: z.number().min(0).max(65535) })
)

/**
 * This structure contains all port settings information in one place. It's a convenience data structure for getting a complete view of a particular port's settings.
 */
export const SwitchPortSettingsView = z.preprocess(
  processResponseBody,
  z.object({
    addresses: SwitchPortAddressConfig.array(),
    bgpPeers: SwitchPortBgpPeerConfig.array(),
    groups: SwitchPortSettingsGroups.array(),
    interfaces: SwitchInterfaceConfig.array(),
    linkLldp: LldpServiceConfig.array(),
    links: SwitchPortLinkConfig.array(),
    port: SwitchPortConfig,
    routes: SwitchPortRouteConfig.array(),
    settings: SwitchPortSettings,
    vlanInterfaces: SwitchVlanInterfaceConfig.array(),
  })
)

/**
 * A single page of results
 */
export const SwitchResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: Switch.array(), nextPage: z.string().optional() })
)

/**
 * A sled that has not been added to an initialized rack yet
 */
export const UninitializedSled = z.preprocess(
  processResponseBody,
  z.object({
    baseboard: Baseboard,
    cubby: z.number().min(0).max(65535),
    rackId: z.string().uuid(),
  })
)

/**
 * The unique hardware ID for a sled
 */
export const UninitializedSledId = z.preprocess(
  processResponseBody,
  z.object({ part: z.string(), serial: z.string() })
)

/**
 * A single page of results
 */
export const UninitializedSledResultsPage = z.preprocess(
  processResponseBody,
  z.object({ items: UninitializedSled.array(), nextPage: z.string().optional() })
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
      /^(?![0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$)^[a-z]([a-zA-Z0-9-]*[a-zA-Z0-9]+)?$/
    )
)

/**
 * Parameters for setting a user's password
 */
export const UserPassword = z.preprocess(
  processResponseBody,
  z.union([
    z.object({ mode: z.enum(['password']), value: Password }),
    z.object({ mode: z.enum(['login_disallowed']) }),
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
 * View of the current silo's resource utilization and capacity
 */
export const Utilization = z.preprocess(
  processResponseBody,
  z.object({ capacity: VirtualResourceCounts, provisioned: VirtualResourceCounts })
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
    z.object({ type: z.enum(['ip']), value: z.string().ip() }),
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
    z.object({ type: z.enum(['ip']), value: z.string().ip() }),
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
 * The order in which the client wants to page through the requested collection
 */
export const PaginationOrder = z.preprocess(
  processResponseBody,
  z.enum(['ascending', 'descending'])
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
      project: NameOrId,
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
      order: PaginationOrder.optional(),
      pageToken: z.string().optional(),
      startTime: z.coerce.date().optional(),
      project: NameOrId.optional(),
    }),
  })
)

export const FloatingIpListParams = z.preprocess(
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

export const FloatingIpCreateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      project: NameOrId,
    }),
  })
)

export const FloatingIpViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      floatingIp: NameOrId,
    }),
    query: z.object({
      project: NameOrId.optional(),
    }),
  })
)

export const FloatingIpDeleteParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      floatingIp: NameOrId,
    }),
    query: z.object({
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
      groupId: z.string().uuid(),
    }),
    query: z.object({}),
  })
)

export const ImageListParams = z.preprocess(
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

export const ImageDemoteParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      image: NameOrId,
    }),
    query: z.object({
      project: NameOrId,
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
      project: NameOrId,
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

export const ProjectIpPoolListParams = z.preprocess(
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

export const ProjectIpPoolViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      pool: NameOrId,
    }),
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

export const LogoutParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({}),
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

export const SiloMetricParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      metricName: SystemMetricName,
    }),
    query: z.object({
      endTime: z.coerce.date().optional(),
      limit: z.number().min(1).max(4294967295).optional(),
      order: PaginationOrder.optional(),
      pageToken: z.string().optional(),
      startTime: z.coerce.date().optional(),
      project: NameOrId.optional(),
    }),
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
      instance: NameOrId,
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

export const PingParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({}),
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
      project: NameOrId,
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

export const SledAddParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({}),
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

export const SledInstanceListParams = z.preprocess(
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

export const SledSetProvisionStateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      sledId: z.string().uuid(),
    }),
    query: z.object({}),
  })
)

export const SledListUninitializedParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
    }),
  })
)

export const NetworkingSwitchPortListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      sortBy: IdSortMode.optional(),
      switchPortId: z.string().uuid().optional(),
    }),
  })
)

export const NetworkingSwitchPortApplySettingsParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      port: Name,
    }),
    query: z.object({
      rackId: z.string().uuid(),
      switchLocation: Name,
    }),
  })
)

export const NetworkingSwitchPortClearSettingsParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      port: Name,
    }),
    query: z.object({
      rackId: z.string().uuid(),
      switchLocation: Name,
    }),
  })
)

export const SwitchListParams = z.preprocess(
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

export const SwitchViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      switchId: z.string().uuid(),
    }),
    query: z.object({}),
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
      silo: NameOrId,
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
      silo: NameOrId,
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
      silo: NameOrId,
    }),
  })
)

export const SamlIdentityProviderCreateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      silo: NameOrId,
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
      silo: NameOrId,
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

export const IpPoolSiloListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      pool: NameOrId,
    }),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      sortBy: IdSortMode.optional(),
    }),
  })
)

export const IpPoolSiloLinkParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      pool: NameOrId,
    }),
    query: z.object({}),
  })
)

export const IpPoolSiloUpdateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      pool: NameOrId,
      silo: NameOrId,
    }),
    query: z.object({}),
  })
)

export const IpPoolSiloUnlinkParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      pool: NameOrId,
      silo: NameOrId,
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
      limit: z.number().min(1).max(4294967295).optional(),
      order: PaginationOrder.optional(),
      pageToken: z.string().optional(),
      startTime: z.coerce.date().optional(),
      silo: NameOrId.optional(),
    }),
  })
)

export const NetworkingAddressLotListParams = z.preprocess(
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

export const NetworkingAddressLotCreateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({}),
  })
)

export const NetworkingAddressLotDeleteParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      addressLot: NameOrId,
    }),
    query: z.object({}),
  })
)

export const NetworkingAddressLotBlockListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      addressLot: NameOrId,
    }),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      sortBy: IdSortMode.optional(),
    }),
  })
)

export const NetworkingBgpConfigListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      nameOrId: NameOrId.optional(),
      pageToken: z.string().optional(),
      sortBy: NameOrIdSortMode.optional(),
    }),
  })
)

export const NetworkingBgpConfigCreateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({}),
  })
)

export const NetworkingBgpConfigDeleteParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      nameOrId: NameOrId,
    }),
  })
)

export const NetworkingBgpAnnounceSetListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      nameOrId: NameOrId,
    }),
  })
)

export const NetworkingBgpAnnounceSetCreateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({}),
  })
)

export const NetworkingBgpAnnounceSetDeleteParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      nameOrId: NameOrId,
    }),
  })
)

export const NetworkingBgpImportedRoutesIpv4Params = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      asn: z.number().min(0).max(4294967295),
    }),
  })
)

export const NetworkingBgpStatusParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({}),
  })
)

export const NetworkingLoopbackAddressListParams = z.preprocess(
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

export const NetworkingLoopbackAddressCreateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({}),
  })
)

export const NetworkingLoopbackAddressDeleteParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      address: z.string().ip(),
      rackId: z.string().uuid(),
      subnetMask: z.number().min(0).max(255),
      switchLocation: Name,
    }),
    query: z.object({}),
  })
)

export const NetworkingSwitchPortSettingsListParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      limit: z.number().min(1).max(4294967295).optional(),
      pageToken: z.string().optional(),
      portSettings: NameOrId.optional(),
      sortBy: NameOrIdSortMode.optional(),
    }),
  })
)

export const NetworkingSwitchPortSettingsCreateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({}),
  })
)

export const NetworkingSwitchPortSettingsDeleteParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      portSettings: NameOrId.optional(),
    }),
  })
)

export const NetworkingSwitchPortSettingsViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      port: NameOrId,
    }),
    query: z.object({}),
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

export const SystemQuotasListParams = z.preprocess(
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

export const SiloQuotasViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      silo: NameOrId,
    }),
    query: z.object({}),
  })
)

export const SiloQuotasUpdateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      silo: NameOrId,
    }),
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
      silo: NameOrId,
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

export const SiloUtilizationListParams = z.preprocess(
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

export const SiloUtilizationViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({
      silo: NameOrId,
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

export const UtilizationViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({}),
  })
)

export const VpcFirewallRulesViewParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      project: NameOrId.optional(),
      vpc: NameOrId,
    }),
  })
)

export const VpcFirewallRulesUpdateParams = z.preprocess(
  processResponseBody,
  z.object({
    path: z.object({}),
    query: z.object({
      project: NameOrId.optional(),
      vpc: NameOrId,
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
      vpc: NameOrId,
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
      project: NameOrId,
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
