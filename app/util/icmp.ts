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

/**
 * Get the human-readable name for an ICMP type
 */
export const getIcmpTypeName = (type: number): string | undefined => ICMP_TYPES[type]
