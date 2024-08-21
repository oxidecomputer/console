/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { v4 as uuid } from 'uuid'

import type { RouterRoute, Vpc, VpcFirewallRule, VpcRouter, VpcSubnet } from '@oxide/api'

import type { Json } from './json-type'
import { project, project2 } from './project'
import { getTimestamps } from './util'

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

export const defaultRouter: Json<VpcRouter> = {
  id: 'fc59fb4d-baad-44a8-b152-9a3c27ae8aa1',
  name: 'mock-system-router',
  description: 'a fake router',
  time_created: new Date(2024, 0, 1).toISOString(),
  time_modified: new Date(2024, 0, 2).toISOString(),
  vpc_id: vpc.id,
  kind: 'system',
}

export const customRouter: Json<VpcRouter> = {
  id: '7ffc1613-8492-42f1-894b-9ef5c9ba2507',
  name: 'mock-custom-router',
  description: 'a fake custom router',
  time_created: new Date(2024, 1, 1).toISOString(),
  time_modified: new Date(2024, 1, 2).toISOString(),
  vpc_id: vpc.id,
  kind: 'custom',
}

export const customRouter2: Json<VpcRouter> = {
  id: '1ce32917-c940-4d3f-ad97-c62e11901f39',
  name: 'mock-custom-router-2',
  description: 'another fake custom router',
  time_created: new Date(2024, 2, 1).toISOString(),
  time_modified: new Date(2024, 2, 2).toISOString(),
  vpc_id: vpc.id,
  kind: 'custom',
}

export const vpcRouters: Json<VpcRouter[]> = [defaultRouter, customRouter, customRouter2]

const routeBase = {
  time_created: '2024-07-11T17:46:21.161086Z',
  time_modified: '2024-07-11T17:46:21.161086Z',
  vpc_router_id: defaultRouter.id,
}

export const routerRoutes: Json<Array<RouterRoute>> = [
  {
    ...routeBase,
    id: '51e50342-790f-4efb-8518-10bf01279514',
    name: 'default',
    description: "VPC Subnet route for 'default'",
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
    ...routeBase,
    id: '4c98cd3b-37be-4754-954f-ca960f7a5c3f',
    name: 'default-v4',
    description: 'The default route of a vpc',
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
    ...routeBase,
    id: '83ee96a3-e418-47fd-912e-e5b22c6a29c6',
    name: 'default-v6',
    description: 'The default route of a vpc',
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
  {
    ...routeBase,
    vpc_router_id: customRouter.id,
    id: '51e50342-790f-4efb-8518-10bf01279515',
    name: 'drop-local',
    description: 'Drop all local traffic',
    kind: 'custom',
    destination: {
      type: 'ip',
      value: '192.168.1.1',
    },
    target: {
      type: 'drop',
    },
  },
]

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
  custom_router_id: customRouter.id,
}

export const vpcSubnet2: Json<VpcSubnet> = {
  ...vpcSubnet,
  id: 'cb001986-1dbe-440c-8872-a769a5c3cda6',
  name: 'mock-subnet-2',
  vpc_id: vpc.id,
  ipv4_block: '10.1.1.2/24',
}

export function defaultFirewallRules(vpcId: string): Json<VpcFirewallRule[]> {
  return [
    {
      id: uuid(),
      vpc_id: vpcId,
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
      ...getTimestamps(),
    },
    {
      id: uuid(),
      vpc_id: vpcId,
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
      ...getTimestamps(),
    },
    {
      id: uuid(),
      vpc_id: vpcId,
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
      ...getTimestamps(),
    },
  ]
}

// usually we try to hard-code resource IDs, but in this case
// we don't rely on them anywhere and it's easier to wrap up if they're dynamic

export const firewallRules: Json<VpcFirewallRule[]> = [
  ...defaultFirewallRules(vpc.id),
  // second mock VPC in other project, meant to test display with lots  of
  // targets and filters
  {
    id: uuid(),
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
    id: uuid(),
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
