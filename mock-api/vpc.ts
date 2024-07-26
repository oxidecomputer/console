/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { RouterRoute, Vpc, VpcFirewallRule, VpcRouter, VpcSubnet } from '@oxide/api'

import type { Json } from './json-type'
import { project, project2 } from './project'

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

export const vpc2: Json<Vpc> = {
  id: 'e54078df-fe72-4673-b36c-a362e3b4e38b',
  name: 'mock-vpc-2',
  description: 'a fake vpc',
  dns_name: 'mock-vpc-2',
  project_id: project2.id,
  system_router_id: systemRouterId,
  ipv6_prefix: 'fdf6:1818:b6e2::/48',
  time_created,
  time_modified,
}

export const vpcs: Json<Vpc[]> = [vpc, vpc2]

export const routerRoutes: Json<Array<RouterRoute>> = [
  {
    id: '51e50342-790f-4efb-8518-10bf01279514',
    name: 'default',
    description: "VPC Subnet route for 'default'",
    time_created: '2024-07-11T17:46:21.161086Z',
    time_modified: '2024-07-11T17:46:21.161086Z',
    vpc_router_id: '6900c1ab-bc8c-4fed-8499-c8312a05d81f',
    kind: 'vpc_subnet',
    target: {
      type: 'subnet',
      value: 'default',
    },
    destination: {
      type: 'subnet',
      value: 'default',
    },
  },
  {
    id: '4c98cd3b-37be-4754-954f-ca960f7a5c3f',
    name: 'default-v4',
    description: 'The default route of a vpc',
    time_created: '2024-07-11T17:46:21.161086Z',
    time_modified: '2024-07-11T17:46:21.161086Z',
    vpc_router_id: '6900c1ab-bc8c-4fed-8499-c8312a05d81f',
    kind: 'default',
    target: {
      type: 'internet_gateway',
      value: 'outbound',
    },
    destination: {
      type: 'ip_net',
      value: '0.0.0.0/0',
    },
  },
  {
    id: '83ee96a3-e418-47fd-912e-e5b22c6a29c6',
    name: 'default-v6',
    description: 'The default route of a vpc',
    time_created: '2024-07-11T17:46:21.161086Z',
    time_modified: '2024-07-11T17:46:21.161086Z',
    vpc_router_id: '6900c1ab-bc8c-4fed-8499-c8312a05d81f',
    kind: 'default',
    target: {
      type: 'internet_gateway',
      value: 'outbound',
    },
    destination: {
      type: 'ip_net',
      value: '::/0',
    },
  },
]

export const vpcRouter: Json<VpcRouter> = {
  id: 'fc59fb4d-baad-44a8-b152-9a3c27ae8aa1',
  name: 'mock-system-router',
  description: 'a fake router',
  time_created: new Date(2024, 0, 1).toISOString(),
  time_modified: new Date(2024, 0, 2).toISOString(),
  vpc_id: vpc.id,
  kind: 'system',
}

export const vpcRouter2: Json<VpcRouter> = {
  id: '7ffc1613-8492-42f1-894b-9ef5c9ba2507',
  name: 'mock-custom-router',
  description: 'a fake custom router',
  time_created: new Date(2024, 1, 1).toISOString(),
  time_modified: new Date(2024, 1, 2).toISOString(),
  vpc_id: vpc.id,
  kind: 'custom',
}

export const vpcRouters: Json<VpcRouter[]> = [vpcRouter, vpcRouter2]

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

export const firewallRules: Json<VpcFirewallRule[]> = [
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
  // second mock VPC in other project, meant to test display with lots  of
  // targets and filters
  {
    id: '097c849e-68c8-43f7-9ceb-b1855c51f178',
    name: 'lots-of-filters',
    status: 'enabled',
    direction: 'inbound',
    targets: [{ type: 'vpc', value: 'default' }],
    description: 'we just want to test with lots of filters',
    filters: {
      ports: ['3389', '45-89'],
      protocols: ['TCP'],
      hosts: [
        { type: 'instance', value: 'hello-friend' },
        { type: 'subnet', value: 'my-subnet' },
        { type: 'ip', value: '148.38.89.5' },
      ],
    },
    action: 'allow',
    priority: 65534,
    time_created,
    time_modified,
    vpc_id: vpc2.id,
  },
  {
    id: '097c849e-68c8-43f7-9ceb-b1855c51f178',
    name: 'lots-of-targets',
    status: 'enabled',
    direction: 'inbound',
    targets: [
      { type: 'instance', value: 'my-inst' },
      { type: 'ip', value: '125.34.25.2' },
      { type: 'subnet', value: 'subsubsub' },
    ],
    description: 'we just want to test with lots of targets',
    filters: { ports: ['80'] },
    action: 'allow',
    priority: 65534,
    time_created,
    time_modified,
    vpc_id: vpc2.id,
  },
]
