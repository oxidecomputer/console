/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { VpcFirewallRuleProtocol } from '~/api'

export const ICMP_TYPES: Record<number, string> = {
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

/**
 * Get the human-readable name for an ICMP type
 */
export const getIcmpTypeName = (type: number): string | undefined => ICMP_TYPES[type]

/**
 * Get a display name for a protocol, including ICMP types and codes
 */
export const getProtocolDisplayName = (protocol: VpcFirewallRuleProtocol): string => {
  if (protocol.type === 'icmp') {
    if (protocol.value === null) {
      return 'ICMP (All types)'
    } else {
      const typeName =
        ICMP_TYPES[protocol.value.icmpType] || `Type ${protocol.value.icmpType}`
      const codePart = protocol.value.code ? ` | Code ${protocol.value.code}` : ''
      return `ICMP ${protocol.value.icmpType} - ${typeName}${codePart}`
    }
  }
  return protocol.type.toUpperCase()
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
    ? 'icmp|all'
    : `icmp|${protocol.value.icmpType}|${protocol.value.code || 'all'}`
}
