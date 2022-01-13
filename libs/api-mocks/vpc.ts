import { project } from './project'
import type {
  Vpc,
  VpcResultsPage,
  VpcSubnet,
  VpcSubnetResultsPage,
} from '@oxide/api'

export const vpc: Vpc = {
  id: 'vpc-id',
  name: 'mock-vpc',
  description: 'a fake vpc',
  dnsName: 'mock-vpc',
  timeCreated: new Date(2021, 0, 1).toISOString(),
  timeModified: new Date(2021, 0, 2).toISOString(),
  projectId: project.id,
  systemRouterId: 'router-id', // ???
}

export const vpcs: VpcResultsPage = { items: [vpc] }

export const vpcSubnet: VpcSubnet = {
  // this is supposed to be flattened into the top level. will fix in API
  id: 'vpc-subnet-id',
  name: 'mock-subnet',
  description: 'a fake subnet',
  timeCreated: new Date(2021, 0, 1).toISOString(),
  timeModified: new Date(2021, 0, 2).toISOString(),
  // supposed to be camelcase, will fix in API
  vpcId: vpc.id,
  ipv4Block: '1.1.1.1/24',
}

export const vpcSubnet2: VpcSubnet = {
  ...vpcSubnet,
  id: 'vpc-subnet-id-2',
  name: 'mock-subnet-2',
  vpcId: vpc.id,
  ipv4Block: '1.1.1.2/24',
}

export const vpcSubnets: VpcSubnetResultsPage = {
  items: [vpcSubnet],
}
