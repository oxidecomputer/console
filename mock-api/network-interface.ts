/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { InstanceNetworkInterface } from '@oxide/api'

import { defaultProjectInstance, instance, stoppedInstance } from './instance'
import type { Json } from './json-type'
import { defaultVpc, defaultVpcTree, vpc, vpcSubnet } from './vpc'

/**
 * Primary NIC for a default dual-stack attachment: `net0`, a guest-range MAC, and
 * the first assignable address in the subnet (the first five are reserved).
 * https://github.com/oxidecomputer/omicron/blob/b62dc0c/nexus/src/app/sagas/instance_create.rs#L739-L760
 */
export const defaultProjectNic: Json<InstanceNetworkInterface> = {
  id: '1feb4adf-351d-409e-b6df-ea872b4a1c9d',
  name: 'net0',
  description: `default primary NIC for project ${defaultProjectInstance.name}`,
  primary: true,
  instance_id: defaultProjectInstance.id,
  ip_stack: {
    type: 'dual_stack',
    value: {
      v4: { ip: '172.30.0.5', transit_ips: [] },
      v6: { ip: 'fd0d:5b6f:a3c1::5', transit_ips: [] },
    },
  },
  mac: 'A8:40:25:F1:2C:0B',
  subnet_id: defaultVpcTree.subnet.id,
  vpc_id: defaultVpc.id,
  time_created: new Date(2021, 0, 1).toISOString(),
  time_modified: new Date(2021, 0, 1).toISOString(),
}

export const networkInterface: Json<InstanceNetworkInterface> = {
  id: 'f6d63297-287c-4035-b262-e8303cfd6a0f',
  name: 'my-nic',
  description: 'a network interface',
  primary: true,
  instance_id: instance.id,
  ip_stack: {
    type: 'dual_stack',
    value: {
      v4: {
        ip: '172.30.0.10',
        transit_ips: ['172.30.0.0/22'],
      },
      v6: {
        ip: '::1',
        transit_ips: ['::/64'],
      },
    },
  },
  mac: '',
  subnet_id: vpcSubnet.id,
  time_created: new Date().toISOString(),
  time_modified: new Date().toISOString(),
  vpc_id: vpc.id,
}

export const stoppedInstanceNic: Json<InstanceNetworkInterface> = {
  id: '0864924b-17b0-4467-9dd1-f2461bb84b9a',
  name: 'my-nic',
  description: 'a network interface',
  primary: true,
  instance_id: stoppedInstance.id,
  ip_stack: {
    type: 'dual_stack',
    value: {
      v4: { ip: '172.30.0.11', transit_ips: ['172.30.0.0/22'] },
      v6: { ip: '::2', transit_ips: ['::/64'] },
    },
  },
  mac: '',
  subnet_id: vpcSubnet.id,
  time_created: new Date().toISOString(),
  time_modified: new Date().toISOString(),
  vpc_id: vpc.id,
}
