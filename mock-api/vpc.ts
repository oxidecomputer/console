/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { v4 as uuid } from 'uuid'

import type {
  InternetGateway,
  InternetGatewayIpPool,
  IpPool,
  IpPoolSiloLink,
  RouterRoute,
  Vpc,
  VpcFirewallRule,
  VpcRouter,
  VpcSubnet,
} from '@oxide/api'

import { ipPools, ipPoolSilos } from './ip-pool'
import type { Json } from './json-type'
import {
  defaultProject,
  project,
  project2,
  projectAdorno,
  projectAnscombe,
  projectKosman,
} from './project'
import { defaultSilo } from './silo'
import { getTimestamps } from './util'

const time_created = new Date(2021, 0, 1).toISOString()
const time_modified = new Date(2021, 0, 2).toISOString()

type Timestamps = { time_created: string; time_modified: string }

/** https://github.com/oxidecomputer/omicron/blob/b62dc0c/nexus/defaults/src/lib.rs#L33-L35 */
const DEFAULT_VPC_SUBNET_IPV4_BLOCK = '172.30.0.0/22'

/**
 * First `/64` of a VPC's `/48` prefix. Both are canonical, so only the width changes.
 * https://github.com/oxidecomputer/omicron/blob/b62dc0c/nexus/src/app/sagas/vpc_create.rs#L355-L362
 */
const firstSubnetBlock = (ipv6Prefix: string) => `${ipv6Prefix.split('/')[0]}/64`

/**
 * A silo's default pools, one per IP version. Multicast pools are excluded even
 * when marked default.
 * https://github.com/oxidecomputer/omicron/blob/b62dc0c/nexus/src/app/sagas/vpc_create.rs#L565-L572
 */
export function defaultUnicastPools(
  siloId: string,
  pools: Json<IpPool>[],
  links: Json<IpPoolSiloLink>[]
) {
  const defaults = links
    .filter((link) => link.silo_id === siloId && link.is_default)
    .map((link) => pools.find((p) => p.id === link.ip_pool_id))
    .filter((p) => !!p)
    .filter((p) => p.pool_type === 'unicast')
  return {
    v4: defaults.find((p) => p.ip_version === 'v4'),
    v6: defaults.find((p) => p.ip_version === 'v6'),
  }
}

/**
 * Subnet route names match the subnet, falling back to the route ID when that
 * would collide with the immutable IGW route names.
 * https://github.com/oxidecomputer/omicron/blob/b62dc0c/nexus/db-model/src/vpc_route.rs#L148-L170
 */
export const subnetRouteName = (subnetName: string, routeId: string) =>
  ['default-v4', 'default-v6'].includes(subnetName)
    ? `conflict-${subnetName}-${routeId}`
    : subnetName

/** The system router route Nexus creates for every VPC subnet */
export function subnetRoute(
  id: string,
  routerId: string,
  subnetName: string,
  timestamps: Timestamps = getTimestamps()
): Json<RouterRoute> {
  return {
    id,
    name: subnetRouteName(subnetName, id),
    description: 'System-managed VPC Subnet route.',
    kind: 'vpc_subnet',
    vpc_router_id: routerId,
    target: { type: 'subnet', value: subnetName },
    destination: { type: 'subnet', value: subnetName },
    ...timestamps,
  }
}

/**
 * Targets and host filters use the VPC's own name, which Nexus substitutes in.
 * https://github.com/oxidecomputer/omicron/blob/b62dc0c/nexus/src/app/vpc.rs#L209-L253
 */
function defaultFirewallRules(
  vpcId: string,
  vpcName: string,
  timestamps: Timestamps = getTimestamps()
): Json<VpcFirewallRule[]> {
  return [
    {
      id: uuid(),
      vpc_id: vpcId,
      name: 'allow-internal-inbound',
      status: 'enabled',
      direction: 'inbound',
      targets: [{ type: 'vpc', value: vpcName }],
      action: 'allow',
      description:
        'allow inbound traffic to all instances within the VPC if originated within the VPC',
      filters: {
        hosts: [{ type: 'vpc', value: vpcName }],
      },
      priority: 65534,
      ...timestamps,
    },
    {
      id: uuid(),
      vpc_id: vpcId,
      name: 'allow-ssh',
      status: 'enabled',
      direction: 'inbound',
      targets: [{ type: 'vpc', value: vpcName }],
      description: 'allow inbound TCP connections on port 22 from anywhere',
      filters: {
        ports: ['22'],
        protocols: [{ type: 'tcp' }],
      },
      action: 'allow',
      priority: 65534,
      ...timestamps,
    },
    {
      id: uuid(),
      vpc_id: vpcId,
      name: 'allow-icmp',
      status: 'enabled',
      direction: 'inbound',
      targets: [{ type: 'vpc', value: vpcName }],
      description: 'allow inbound ICMP traffic from anywhere',
      filters: {
        protocols: [{ type: 'icmp', value: null }],
      },
      action: 'allow',
      priority: 65534,
      ...timestamps,
    },
  ]
}

/** Everything the vpc-create saga creates alongside the VPC itself */
export type VpcDefaults = {
  router: Json<VpcRouter>
  /** `default-v4`, `default-v6`, and the default subnet's route */
  routes: Json<RouterRoute>[]
  subnet: Json<VpcSubnet>
  gateway: Json<InternetGateway>
  gatewayIpPools: Json<InternetGatewayIpPool>[]
  firewallRules: Json<VpcFirewallRule>[]
}

/** IDs the saga generates up front, passed in so seeded fixtures stay stable */
export type VpcDefaultIds = {
  subnet: string
  routeV4: string
  routeV6: string
  subnetRoute: string
  gateway: string
  gatewayPoolV4: string
  gatewayPoolV6: string
}

const randomVpcDefaultIds = (): VpcDefaultIds => ({
  subnet: uuid(),
  routeV4: uuid(),
  routeV6: uuid(),
  subnetRoute: uuid(),
  gateway: uuid(),
  gatewayPoolV4: uuid(),
  gatewayPoolV6: uuid(),
})

/**
 * Builds the whole tree: system router, both default routes, the default subnet
 * and its route, the default internet gateway with one link per default unicast
 * pool, and the default firewall rules. `vpc.system_router_id` becomes the
 * router's ID.
 * https://github.com/oxidecomputer/omicron/blob/b62dc0c/nexus/src/app/sagas/vpc_create.rs
 */
export function vpcDefaults(
  vpc: Json<Vpc>,
  defaultPools: { v4?: Json<IpPool>; v6?: Json<IpPool> },
  ids: VpcDefaultIds = randomVpcDefaultIds(),
  timestamps: Timestamps = getTimestamps()
): VpcDefaults {
  const router: Json<VpcRouter> = {
    id: vpc.system_router_id,
    name: 'system',
    description: 'Routes are automatically added to this router as VPC subnets are created',
    vpc_id: vpc.id,
    kind: 'system',
    ...timestamps,
  }

  const subnet: Json<VpcSubnet> = {
    id: ids.subnet,
    name: 'default',
    description: `The default subnet for VPC ${vpc.name}`,
    vpc_id: vpc.id,
    ipv4_block: DEFAULT_VPC_SUBNET_IPV4_BLOCK,
    ipv6_block: firstSubnetBlock(vpc.ipv6_prefix),
    ...timestamps,
  }

  const gateway: Json<InternetGateway> = {
    id: ids.gateway,
    name: 'default',
    description: 'Automatically created default VPC gateway',
    vpc_id: vpc.id,
    ...timestamps,
  }

  const defaultRoute = (
    id: string,
    name: string,
    destination: string
  ): Json<RouterRoute> => ({
    id,
    name,
    description: 'The default route of a vpc',
    kind: 'default',
    vpc_router_id: router.id,
    target: { type: 'internet_gateway', value: gateway.name },
    destination: { type: 'ip_net', value: destination },
    ...timestamps,
  })

  const poolLink = (
    id: string,
    name: string,
    pool: Json<IpPool>
  ): Json<InternetGatewayIpPool> => ({
    id,
    name,
    description: 'Automatically attached default IP pool',
    internet_gateway_id: gateway.id,
    ip_pool_id: pool.id,
    ...timestamps,
  })

  return {
    router,
    routes: [
      defaultRoute(ids.routeV4, 'default-v4', '0.0.0.0/0'),
      defaultRoute(ids.routeV6, 'default-v6', '::/0'),
      subnetRoute(ids.subnetRoute, router.id, subnet.name, timestamps),
    ],
    subnet,
    gateway,
    // a silo with no default unicast pools gets a gateway with no links
    gatewayIpPools: [
      defaultPools.v4 && poolLink(ids.gatewayPoolV4, 'default-v4', defaultPools.v4),
      defaultPools.v6 && poolLink(ids.gatewayPoolV6, 'default-v6', defaultPools.v6),
    ].filter((link) => !!link),
    firewallRules: defaultFirewallRules(vpc.id, vpc.name, timestamps),
  }
}

const defaultVpcRouterId = '786dcccd-7b19-4281-a087-3228e0f0fedb'

/**
 * The VPC `project-create` makes automatically, faithful to Nexus down to names,
 * descriptions, and blocks.
 * https://github.com/oxidecomputer/omicron/blob/b62dc0c/nexus/src/app/sagas/project_create.rs#L131-L144
 */
export const defaultVpc: Json<Vpc> = {
  id: '04427344-df85-457f-90a5-893d5cdbcaeb',
  name: 'default',
  description: 'Default VPC',
  dns_name: 'default',
  project_id: defaultProject.id,
  system_router_id: defaultVpcRouterId,
  ipv6_prefix: 'fd0d:5b6f:a3c1::/48',
  time_created,
  time_modified,
}

export const defaultVpcTree = vpcDefaults(
  defaultVpc,
  defaultUnicastPools(defaultSilo.id, ipPools, ipPoolSilos),
  {
    subnet: 'df90e03c-47aa-46e5-986c-7e56d865de53',
    routeV4: '507158e4-5446-4a81-8347-e9e50287d45a',
    routeV6: 'ebf6c476-da0d-4a8c-b512-58037cea900b',
    subnetRoute: '7fce0a79-a81e-4e92-840b-3d60b9744da5',
    gateway: '10bf8c43-ffe7-42a9-a5b5-7ba759dcb714',
    gatewayPoolV4: '4481917d-f07c-4798-86ee-9836e2deb317',
    gatewayPoolV6: '031fe3ad-9648-41b0-ab95-84518f2f2599',
  },
  { time_created, time_modified }
)

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

// VPCs for test silos (IP pool configuration testing)
export const vpcKosman: Json<Vpc> = {
  id: 'd1e2f3a4-b5c6-4890-abcd-ef1234567890',
  name: 'kosman-vpc',
  description: 'VPC in myriad silo',
  dns_name: 'kosman-vpc',
  project_id: projectKosman.id,
  system_router_id: systemRouterId,
  ipv6_prefix: 'fdf6:1818:b6e3::/48',
  time_created,
  time_modified,
}

export const vpcAnscombe: Json<Vpc> = {
  id: 'e2f3a4b5-c6d7-4901-bcde-f12345678901',
  name: 'anscombe-vpc',
  description: 'VPC in thrax silo',
  dns_name: 'anscombe-vpc',
  project_id: projectAnscombe.id,
  system_router_id: systemRouterId,
  ipv6_prefix: 'fdf6:1818:b6e4::/48',
  time_created,
  time_modified,
}

export const vpcAdorno: Json<Vpc> = {
  id: 'f3a4b5c6-d7e8-4012-8def-123456789012',
  name: 'adorno-vpc',
  description: 'VPC in pelerines silo',
  dns_name: 'adorno-vpc',
  project_id: projectAdorno.id,
  system_router_id: systemRouterId,
  ipv6_prefix: 'fdf6:1818:b6e5::/48',
  time_created,
  time_modified,
}

export const vpcs: Json<Vpc[]> = [defaultVpc, vpc, vpc2, vpcKosman, vpcAnscombe, vpcAdorno]

export const defaultRouter: Json<VpcRouter> = {
  id: 'fc59fb4d-baad-44a8-b152-9a3c27ae8aa1',
  name: 'mock-system-router',
  description: 'Routes are automatically added to this router as VPC subnets are created',
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

export const vpcRouters: Json<VpcRouter[]> = [
  defaultVpcTree.router,
  defaultRouter,
  customRouter,
]

const routeBase = {
  time_created: '2024-07-11T17:46:21.161086Z',
  time_modified: '2024-07-11T17:46:21.161086Z',
  vpc_router_id: defaultRouter.id,
}

export const routerRoutes: Json<Array<RouterRoute>> = [
  ...defaultVpcTree.routes,
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
  {
    ...routeBase,
    vpc_router_id: customRouter.id,
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'dc2',
    description: 'route to datacenter 2',
    kind: 'custom',
    target: {
      type: 'internet_gateway',
      value: 'internet-gateway-1',
    },
    destination: {
      type: 'ip_net',
      value: '45.154.216.0/24',
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
}

export const vpcSubnet2: Json<VpcSubnet> = {
  ...vpcSubnet,
  id: 'cb001986-1dbe-440c-8872-a769a5c3cda6',
  name: 'mock-subnet-2',
  vpc_id: vpc.id,
  ipv4_block: '10.1.1.2/24',
  custom_router_id: customRouter.id,
}

// Subnets for test silos
export const subnetKosman: Json<VpcSubnet> = {
  id: 'a1b2c3d4-e5f6-4890-9234-567890abcdef',
  name: 'kosman-subnet',
  description: 'subnet in myriad silo',
  time_created,
  time_modified,
  vpc_id: vpcKosman.id,
  ipv4_block: '10.2.1.0/24',
  ipv6_block: 'fd9b:870a:4246::/64',
}

export const subnetAnscombe: Json<VpcSubnet> = {
  id: 'b2c3d4e5-f6a7-4901-a345-67890abcdef1',
  name: 'anscombe-subnet',
  description: 'subnet in thrax silo',
  time_created,
  time_modified,
  vpc_id: vpcAnscombe.id,
  ipv4_block: '10.3.1.0/24',
  ipv6_block: 'fd9b:870a:4247::/64',
}

export const subnetAdorno: Json<VpcSubnet> = {
  id: 'c3d4e5f6-a7b8-4012-b456-7890abcdef12',
  name: 'adorno-subnet',
  description: 'subnet in pelerines silo',
  time_created,
  time_modified,
  vpc_id: vpcAdorno.id,
  ipv4_block: '10.4.1.0/24',
  ipv6_block: 'fd9b:870a:4248::/64',
}

export const vpcSubnets: Json<VpcSubnet[]> = [
  defaultVpcTree.subnet,
  vpcSubnet,
  vpcSubnet2,
  subnetKosman,
  subnetAnscombe,
  subnetAdorno,
]

// usually we try to hard-code resource IDs, but in this case
// we don't rely on them anywhere and it's easier to wrap up if they're dynamic

export const firewallRules: Json<VpcFirewallRule[]> = [
  ...defaultVpcTree.firewallRules,
  ...defaultFirewallRules(vpc.id, vpc.name),
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
      protocols: [
        { type: 'tcp' },
        { type: 'icmp', value: { icmp_type: 5, code: '1-3' } },
        { type: 'icmp6', value: { icmp_type: 128 } },
      ],
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
