import type { NetworkInterface } from '@oxide/api'

import { instance } from './instance'
import type { Json } from './json-type'
import { genId } from './msw/util'
import { vpc, vpcSubnet } from './vpc'

export const networkInterface: Json<NetworkInterface> = {
  id: genId('my-nic'),
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
