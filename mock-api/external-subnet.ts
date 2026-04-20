/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { ExternalSubnet } from '@oxide/api'

import { instance } from './instance'
import type { Json } from './json-type'
import { project } from './project'
import { subnetPool1, subnetPoolMember1 } from './subnet-pool'

export const externalSubnet1: Json<ExternalSubnet> = {
  id: 'f3a0768c-5334-486c-a99b-1d564bb910b7',
  name: 'web-subnet',
  description: 'Subnet for web services',
  project_id: project.id,
  instance_id: undefined,
  subnet: '10.128.1.0/24',
  subnet_pool_id: subnetPool1.id,
  subnet_pool_member_id: subnetPoolMember1.id,
  time_created: new Date().toISOString(),
  time_modified: new Date().toISOString(),
}

export const externalSubnet2: Json<ExternalSubnet> = {
  id: '4f395c54-2dca-4c7f-a52e-a1bb86e7acbd',
  name: 'db-subnet',
  description: 'Subnet for database tier',
  project_id: project.id,
  instance_id: instance.id,
  subnet: '10.128.2.0/24',
  subnet_pool_id: subnetPool1.id,
  subnet_pool_member_id: subnetPoolMember1.id,
  time_created: new Date().toISOString(),
  time_modified: new Date().toISOString(),
}

export const externalSubnet3: Json<ExternalSubnet> = {
  id: '8b406f20-fe14-40e8-8d21-3ebc0efd15b6',
  name: 'staging-subnet',
  description: 'Staging environment subnet',
  project_id: project.id,
  instance_id: undefined,
  subnet: '10.128.3.0/28',
  subnet_pool_id: subnetPool1.id,
  subnet_pool_member_id: subnetPoolMember1.id,
  time_created: new Date().toISOString(),
  time_modified: new Date().toISOString(),
}

export const externalSubnets = [externalSubnet1, externalSubnet2, externalSubnet3]
