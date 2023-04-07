import type { InstanceNetworkInterface } from '@oxide/api'

import { instance } from './instance'
import type { Json } from './json-type'
import { vpc, vpcSubnet } from './vpc'

export const networkInterface: Json<InstanceNetworkInterface> = {
  id: 'f6d63297-287c-4035-b262-e8303cfd6a0f',
  name: 'my-nic',
  description: 'a network interface',
  primary: true,
  instance_id: instance.id,
  ip: '172.30.0.10',
  mac: '',
  subnet_id: vpcSubnet.id,
  time_created: new Date().toISOString(),
  time_modified: new Date().toISOString(),
  vpc_id: vpc.id,
}
