import type { NetworkInterface } from '@oxide/api'
import type { Json } from './json-type'
import { instance } from './instance'
import { vpc, vpcSubnet } from './vpc'

export const networkInterface: Json<NetworkInterface> = {
  description: 'a network interface',
  id: 'nic-id',
  instance_id: instance.id,
  ip: '172.30.0.10',
  mac: '',
  name: 'my-nic',
  subnet_id: vpcSubnet.id,
  time_created: new Date().toISOString(),
  time_modified: new Date().toISOString(),
  vpc_id: vpc.id,
}
