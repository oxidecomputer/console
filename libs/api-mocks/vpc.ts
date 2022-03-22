import type { Json } from './json-type'
import { project } from './project'
import type {
  Vpc,
  VpcFirewallRule,
  VpcResultsPage,
  VpcSubnet,
  VpcSubnetResultsPage,
} from '@oxide/api'

const time_created = new Date(2021, 0, 1).toISOString()
const time_modified = new Date(2021, 0, 2).toISOString()

export const vpc: Json<Vpc> = {
  id: 'vpc-id',
  name: 'mock-vpc',
  description: 'a fake vpc',
  dns_name: 'mock-vpc',
  project_id: project.id,
  system_router_id: 'router-id', // ???
  ipv6_prefix: 'fdf6:1818:b6e1::/48',
  time_created,
  time_modified,
}

export const vpcs: Json<VpcResultsPage> = { items: [vpc] }

export const vpcSubnet: Json<VpcSubnet> = {
  // this is supposed to be flattened into the top level. will fix in API
  id: 'vpc-subnet-id',
  name: 'mock-subnet',
  description: 'a fake subnet',
  time_created: new Date(2021, 0, 1).toISOString(),
  time_modified: new Date(2021, 0, 2).toISOString(),
  // supposed to be camelcase, will fix in API
  vpc_id: vpc.id,
  ipv4_block: '1.1.1.1/24',
  ipv6_block: 'fd9b:870a:4245::/64',
}

export const vpcSubnet2: Json<VpcSubnet> = {
  ...vpcSubnet,
  id: 'vpc-subnet-id-2',
  name: 'mock-subnet-2',
  vpc_id: vpc.id,
  ipv4_block: '1.1.1.2/24',
}

export const vpcSubnets: Json<VpcSubnetResultsPage> = {
  items: [vpcSubnet],
}

export const defaultFirewallRules: Json<VpcFirewallRule[]> = [
  {
    id: 'firewall-rule-id-1',
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
    id: 'firewall-rule-id-2',
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
    id: 'firewall-rule-id-3',
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
    id: 'firewall-rule-id-4',
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
