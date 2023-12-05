/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { Vpc, VpcFirewallRule, VpcSubnet } from '@oxide/api'

import type { Json } from './json-type'
import { project } from './project'

const time_created = new Date(2021, 0, 1).toISOString()
const time_modified = new Date(2021, 0, 2).toISOString()

const systemRouterId = 'b5af837b-b986-4a0a-b775-516d76c84ec3'

export const vpc: Json<Vpc> = {
  id: '87774ff3-c6c1-475b-b920-ba2954f390fe',
  name: 'mock-vpc',
  description: 'a fake vpc',
  dns_name: 'mock-vpc',
  project_id: project.id,
  system_router_id: systemRouterId,
  ipv6_prefix: 'fdf6:1818:b6e1::/48',
  time_created,
  time_modified,
}

export const vpcSubnet: Json<VpcSubnet> = {
  // this is supposed to be flattened into the top level. will fix in API
  id: 'd12bf934-d2bf-40e9-8596-bb42a7793749',
  name: 'mock-subnet',
  description: 'a fake subnet',
  time_created: new Date(2021, 0, 1).toISOString(),
  time_modified: new Date(2021, 0, 2).toISOString(),
  // supposed to be camelcase, will fix in API
  vpc_id: vpc.id,
  ipv4_block: '10.1.1.1/24',
  ipv6_block: 'fd9b:870a:4245::/64',
}

export const vpcSubnet2: Json<VpcSubnet> = {
  ...vpcSubnet,
  id: 'cb001986-1dbe-440c-8872-a769a5c3cda6',
  name: 'mock-subnet-2',
  vpc_id: vpc.id,
  ipv4_block: '10.1.1.2/24',
}

export const defaultFirewallRules: Json<VpcFirewallRule[]> = [
  {
    id: 'b74aeea8-1201-4efd-b6ec-011f10a0b176',
    name: 'allow-internal-inbound',
    status: 'enabled',
    direction: 'inbound',
    targets: [{ type: 'vpc', value: 'default' }],
    action: 'allow',
    description:
      'allow inbound traffic to all instances within the VPC if originated within the VPC',
    filters: {
      hosts: [{ type: 'vpc', value: 'default' }],
    },
    priority: 65534,
    time_created,
    time_modified,
    vpc_id: vpc.id,
  },
  {
    id: '9802cd8e-1e59-4fdf-9b40-99c189f7a19b',
    name: 'allow-ssh',
    status: 'enabled',
    direction: 'inbound',
    targets: [{ type: 'vpc', value: 'default' }],
    description: 'allow inbound TCP connections on port 22 from anywhere',
    filters: {
      ports: ['22'],
      protocols: ['TCP'],
    },
    action: 'allow',
    priority: 65534,
    time_created,
    time_modified,
    vpc_id: vpc.id,
  },
  {
    id: 'cde07d86-b8c0-49ed-8754-55f1bdee20fe',
    name: 'allow-icmp',
    status: 'enabled',
    direction: 'inbound',
    targets: [{ type: 'vpc', value: 'default' }],
    description: 'allow inbound ICMP traffic from anywhere',
    filters: {
      protocols: ['ICMP'],
    },
    action: 'allow',
    priority: 65534,
    time_created,
    time_modified,
    vpc_id: vpc.id,
  },
  {
    id: '5ed562d9-2566-496d-b7b3-7976b04a0b80',
    name: 'allow-rdp',
    status: 'enabled',
    direction: 'inbound',
    targets: [{ type: 'vpc', value: 'default' }],
    description: 'allow inbound TCP connections on port 3389 from anywhere',
    filters: {
      ports: ['3389'],
      protocols: ['TCP'],
    },
    action: 'allow',
    priority: 65534,
    time_created,
    time_modified,
    vpc_id: vpc.id,
  },
]
