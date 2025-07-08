/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

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

// Does not include ICMP types without specific codes (like Echo Reply, Echo Request, etc.)
export const ICMP_TYPE_CODES: Partial<
  Record<keyof typeof ICMP_TYPES, { code: number; label: string }[]>
> = {
  3: [
    { code: 0, label: 'Network Unreachable' },
    { code: 1, label: 'Host Unreachable' },
    { code: 2, label: 'Protocol Unreachable' },
    { code: 3, label: 'Port Unreachable' },
    { code: 4, label: 'Fragmentation Needed and DF Set' },
    { code: 5, label: 'Source Route Failed' },
    { code: 6, label: 'Destination Network Unknown' },
    { code: 7, label: 'Destination Host Unknown' },
    { code: 8, label: 'Source Host Isolated (obsolete)' },
    { code: 9, label: 'Network Administratively Prohibited' },
    { code: 10, label: 'Host Administratively Prohibited' },
    { code: 13, label: 'Communication Administratively Prohibited' },
    { code: 14, label: 'Host Precedence Violation' },
    { code: 15, label: 'Precedence cutoff in effect' },
  ],
  5: [
    { code: 0, label: 'Redirect Datagram for the Network' },
    { code: 1, label: 'Redirect Datagram for the Host' },
    { code: 2, label: 'Redirect Datagram for the ToS and Network' },
    { code: 3, label: 'Redirect Datagram for the ToS and Host' },
  ],
  9: [
    { code: 0, label: 'Normal Router Advertisement' },
    { code: 16, label: 'Does not route common traffic' },
  ],
  11: [
    { code: 0, label: 'TTL exceeded in transit' },
    { code: 1, label: 'Fragment Reassembly Time Exceeded' },
  ],
  12: [
    { code: 0, label: 'Pointer indicates the error' },
    { code: 1, label: 'Missing required option' },
    { code: 2, label: 'Bad length' },
  ],
  30: [
    { code: 0, label: 'Probe Number' },
    { code: 1, label: 'Hop Count' },
  ],
}

/**
 * Get the human-readable name for an ICMP type
 */
export const getIcmpTypeName = (type: number): string | undefined => ICMP_TYPES[type]

/**
 * Get the available codes for an ICMP type
 * Returns undefined if the type only uses code 0 (no specific codes)
 */
export const getIcmpCodes = (type: number): { code: number; label: string }[] | undefined =>
  ICMP_TYPE_CODES[type]

/**
 * Check if an ICMP type has specific codes beyond the default 0
 */
export const hasIcmpCodes = (type: number): boolean => type in ICMP_TYPE_CODES
