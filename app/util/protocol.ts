/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { match } from 'ts-pattern'

import type { VpcFirewallRuleProtocol } from '~/api'

export const ICMPV4_TYPES: Record<number, string> = {
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

// ICMPv6 type assignments per RFC 4443 and related RFCs.
export const ICMPV6_TYPES: Record<number, string> = {
  1: 'Destination Unreachable',
  2: 'Packet Too Big',
  3: 'Time Exceeded',
  4: 'Parameter Problem',
  128: 'Echo Request',
  129: 'Echo Reply',
  133: 'Router Solicitation',
  134: 'Router Advertisement',
  135: 'Neighbor Solicitation',
  136: 'Neighbor Advertisement',
  137: 'Redirect Message',
}

export type IcmpVariant = 'icmp' | 'icmp6'

const typesFor = (variant: IcmpVariant) =>
  match(variant)
    .with('icmp', () => ICMPV4_TYPES)
    .with('icmp6', () => ICMPV6_TYPES)
    .exhaustive()

export const getIcmpLabel = (variant: IcmpVariant) =>
  match(variant)
    .with('icmp', () => 'ICMPv4' as const)
    .with('icmp6', () => 'ICMPv6' as const)
    .exhaustive()

/**
 * Get the human-readable name for an ICMP type
 */
export const getIcmpTypeName = (variant: IcmpVariant, type: number): string | undefined =>
  typesFor(variant)[type]

/**
 * Get a display name for a protocol, including ICMP types and codes
 */
export const getProtocolDisplayName = (protocol: VpcFirewallRuleProtocol): string => {
  if (protocol.type === 'tcp' || protocol.type === 'udp') {
    return protocol.type.toUpperCase()
  }
  const label = getIcmpLabel(protocol.type)
  if (protocol.value === null) {
    return `${label} (All types)`
  }
  const typeName =
    typesFor(protocol.type)[protocol.value.icmpType] || `Type ${protocol.value.icmpType}`
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
