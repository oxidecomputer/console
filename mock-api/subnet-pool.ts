/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { SiloSubnetPool, SubnetPoolMember } from '@oxide/api'

import type { Json } from './json-type'

// Minimal subnet pool seed data for external subnet allocation.
// There's no UI for subnet pools themselves yet, but external subnets
// reference them.

export const subnetPool1: Json<SiloSubnetPool> = {
  id: '41e54fcd-c45b-43ed-90fb-4b9faf24e167',
  name: 'default-v4-subnet-pool',
  description: 'Default IPv4 subnet pool',
  ip_version: 'v4',
  is_default: true,
  time_created: new Date().toISOString(),
  time_modified: new Date().toISOString(),
}

export const subnetPool2: Json<SiloSubnetPool> = {
  id: '9283ee19-7277-4946-918a-6748de31386c',
  name: 'secondary-v4-subnet-pool',
  description: 'Secondary IPv4 subnet pool',
  ip_version: 'v4',
  is_default: false,
  time_created: new Date().toISOString(),
  time_modified: new Date().toISOString(),
}

export const subnetPool3: Json<SiloSubnetPool> = {
  id: 'c7bdc035-dfe2-40d0-9794-76f78b4898c2',
  name: 'ipv6-subnet-pool',
  description: 'IPv6 subnet pool',
  ip_version: 'v6',
  is_default: false,
  time_created: new Date().toISOString(),
  time_modified: new Date().toISOString(),
}

export const subnetPools = [subnetPool1, subnetPool2, subnetPool3]

export const subnetPoolMember1: Json<SubnetPoolMember> = {
  id: '0466eafd-2922-4360-a0ee-e4c99b370c04',
  subnet_pool_id: subnetPool1.id,
  // Range that external subnets are allocated from
  subnet: '10.128.0.0/16',
  min_prefix_length: 20,
  max_prefix_length: 28,
  time_created: new Date().toISOString(),
}

export const subnetPoolMember2: Json<SubnetPoolMember> = {
  id: '814310a1-d3fb-4a4a-9dd4-9300727ba3e6',
  subnet_pool_id: subnetPool2.id,
  subnet: '172.20.0.0/16',
  min_prefix_length: 20,
  max_prefix_length: 28,
  time_created: new Date().toISOString(),
}

export const subnetPoolMember3: Json<SubnetPoolMember> = {
  id: 'b60cb98d-0f52-4367-834a-9ca37edce66d',
  subnet_pool_id: subnetPool3.id,
  subnet: 'fd00:1000::/32',
  min_prefix_length: 48,
  max_prefix_length: 64,
  time_created: new Date().toISOString(),
}

export const subnetPoolMembers = [subnetPoolMember1, subnetPoolMember2, subnetPoolMember3]
