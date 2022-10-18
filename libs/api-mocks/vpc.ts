import type { RouterRoute } from 'libs/api/__generated__/Api'

import type { Vpc, VpcFirewallRule, VpcRouter, VpcSubnet } from '@oxide/api'

import type { Json } from './json-type'
import { genId } from './msw/util'
import { project } from './project'

const time_created = new Date(2021, 0, 1).toISOString()
const time_modified = new Date(2021, 0, 2).toISOString()

const systemRouterId = genId('system-router-id')

export const vpc: Json<Vpc> = {
  id: genId('mock-vpc'),
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
  id: genId('mock-subnet'),
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
  id: genId('mock-subnet-2'),
  name: 'mock-subnet-2',
  vpc_id: vpc.id,
  ipv4_block: '10.1.1.2/24',
}

export const defaultFirewallRules: Json<VpcFirewallRule[]> = [
  {
    id: genId('allow-internal-inbound'),
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
    id: genId('allow-ssh'),
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
    id: genId('allow-icmp'),
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
    id: genId('allow-rdp'),
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

export const vpcRouter: Json<VpcRouter> = {
  description: 'a vpc router',
  id: systemRouterId,
  kind: 'system',
  name: 'system',
  time_created,
  time_modified,
  vpc_id: vpc.id,
}

export const vpcRouterRoute: Json<RouterRoute> = {
  description: 'a vpc router route',
  id: genId('system'),
  name: 'system',
  kind: 'default',
  target: { type: 'instance', value: 'an-instance' },
  destination: { type: 'vpc', value: 'a-vpc' },
  time_created,
  time_modified,
  vpc_router_id: vpcRouter.id,
}
