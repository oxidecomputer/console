/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

// Minimal subnet pool seed data for external subnet allocation.
// There's no UI for subnet pools themselves yet, but external subnets
// reference them.

export const subnetPool1 = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  name: 'default-v4-subnet-pool',
}

export const subnetPoolMember1 = {
  id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  subnet_pool_id: subnetPool1.id,
  // Range that external subnets are allocated from
  subnet: '10.128.0.0/16',
  min_prefix_length: 20,
  max_prefix_length: 28,
}
