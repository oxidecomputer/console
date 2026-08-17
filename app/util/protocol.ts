/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { VpcFirewallRuleProtocol } from '~/api'

// Common suggestions from the IANA ICMP Type Numbers registry. Users may enter
// any valid type number, including types not listed here.
// https://www.iana.org/assignments/icmp-parameters/icmp-parameters.xhtml#icmp-parameters-types
const ICMPV4_TYPES: Record<number, string> = {
  0: 'Echo Reply',
  3: 'Destination Unreachable',
  5: 'Redirect Message',
  8: 'Echo Request',
  9: 'Router Advertisement',
  10: 'Router Solicitation',
  11: 'Time Exceeded',
  12: 'Parameter Problem',
  13: 'Timestamp Request',
  14: 'Timestamp Reply',
}

// Common suggestions from the IANA ICMPv6 Type Numbers registry. Users may enter
// any valid type number, including types not listed here.
// https://www.iana.org/assignments/icmpv6-parameters/icmpv6-parameters.xhtml#icmpv6-parameters-2
const ICMPV6_TYPES: Record<number, string> = {
  1: 'Destination Unreachable',
  2: 'Packet Too Big',
  3: 'Time Exceeded',
  4: 'Parameter Problem',
  128: 'Echo Request',
  129: 'Echo Reply',
  130: 'Multicast Listener Query',
  131: 'Multicast Listener Report',
  132: 'Multicast Listener Done',
  133: 'Router Solicitation',
  134: 'Router Advertisement',
  135: 'Neighbor Solicitation',
  136: 'Neighbor Advertisement',
  137: 'Redirect Message',
}

export const ICMP_TYPES: Record<'icmp' | 'icmp6', Record<number, string>> = {
  icmp: ICMPV4_TYPES,
  icmp6: ICMPV6_TYPES,
}

export const PROTOCOL_LABELS = {
  tcp: 'TCP',
  udp: 'UDP',
  icmp: 'ICMPv4',
  icmp6: 'ICMPv6',
} as const satisfies Record<VpcFirewallRuleProtocol['type'], string>

/** Get a display name for a protocol, including ICMP types and codes */
export const getProtocolDisplayName = (protocol: VpcFirewallRuleProtocol): string => {
  const label = PROTOCOL_LABELS[protocol.type]
  if (protocol.type === 'tcp' || protocol.type === 'udp') return label
  if (protocol.value === null) return `${label} (All types)`
  const typeName =
    ICMP_TYPES[protocol.type][protocol.value.icmpType] || `Type ${protocol.value.icmpType}`
  const codePart = protocol.value.code ? ` | Code ${protocol.value.code}` : ''
  return `${label} ${protocol.value.icmpType} - ${typeName}${codePart}`
}

/**
 * Generate a key for a protocol that can be used in React lists.
 * Relies on callsite logic to ensure uniqueness.
 */
export const getProtocolKey = (protocol: VpcFirewallRuleProtocol): string => {
  if (protocol.type === 'tcp' || protocol.type === 'udp') {
    return protocol.type
  }
  return protocol.value === null
    ? `${protocol.type}|all`
    : `${protocol.type}|${protocol.value.icmpType}|${protocol.value.code || 'all'}`
}
