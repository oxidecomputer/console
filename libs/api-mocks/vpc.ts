import type { Json } from './json-type'
import { project } from './project'
import type {
  Vpc,
  VpcResultsPage,
  VpcSubnet,
  VpcSubnetResultsPage,
} from '@oxide/api'

export const vpc: Json<Vpc> = {
  id: 'vpc-id',
  name: 'mock-vpc',
  description: 'a fake vpc',
  dns_name: 'mock-vpc',
  time_created: new Date(2021, 0, 1).toISOString(),
  time_modified: new Date(2021, 0, 2).toISOString(),
  project_id: project.id,
  system_router_id: 'router-id', // ???
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
