/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type {
  InternetGateway,
  InternetGatewayIpAddress,
  InternetGatewayIpPool,
} from '@oxide/api'

import { ipPool1, ipPool2 } from './ip-pool'
import type { Json } from './json-type'
import { vpc, vpc2 } from './vpc'

const time_created = new Date(2021, 0, 1).toISOString()
const time_modified = new Date(2021, 0, 2).toISOString()

// An internet gateway for VPC 1
const internetGateway1: Json<InternetGateway> = {
  id: 'f1d5e5a1-0b2b-4d5b-8b9d-2d4b3e0c6b9a',
  name: 'internet-gateway-1',
  description: 'internet gateway 1',
  vpc_id: vpc.id,
  time_created,
  time_modified,
}

// Another internet gateway for VPC 1
const internetGateway2: Json<InternetGateway> = {
  id: 'f1d5e5a1-0b2b-4d5b-8b9d-2d4b3e0c6b9b',
  name: 'internet-gateway-2',
  description: 'internet gateway 2',
  vpc_id: vpc.id,
  time_created,
  time_modified,
}

// An internet gateway for VPC 2
const internetGateway3: Json<InternetGateway> = {
  id: 'f1d5e5a1-0b2b-4d5b-8b9d-2d4b3e0c6b9c',
  name: 'internet-gateway-3',
  description: 'internet gateway 3',
  vpc_id: vpc2.id,
  time_created,
  time_modified,
}

export const internetGateways: Json<InternetGateway>[] = [
  internetGateway1,
  internetGateway2,
  internetGateway3,
]

const internetGatewayIpAddress1: Json<InternetGatewayIpAddress> = {
  id: 'f1d5e5a1-0b2b-4d5b-8b9d-2d4b3e0c6b9d',
  name: 'internet-gateway-address-1',
  address: '87.114.25.166',
  description: 'the IP address for an internet gateway',
  internet_gateway_id: internetGateway1.id,
  time_created,
  time_modified,
}

const internetGatewayIpAddress2: Json<InternetGatewayIpAddress> = {
  id: 'f1d5e5a1-0b2b-4d5b-8b9d-2d4b3e0c6b9e',
  name: 'internet-gateway-address-2',
  address: '292a:a05c:3b36:a053:9166:6510:2d6b:3322',
  description: 'an IPv6 address for an internet gateway',
  internet_gateway_id: internetGateway1.id,
  time_created,
  time_modified,
}

const internetGatewayIpAddress3: Json<InternetGatewayIpAddress> = {
  id: 'f1d5e5a1-0b2b-4d5b-8b9d-2d4b3e0c6b9f',
  name: 'internet-gateway-address-3',
  address: '178.125.253.126',
  description: 'an IPv4 address for internet gateway 2',
  internet_gateway_id: internetGateway2.id,
  time_created,
  time_modified,
}

export const internetGatewayIpAddresses: Json<InternetGatewayIpAddress>[] = [
  internetGatewayIpAddress1,
  internetGatewayIpAddress2,
  internetGatewayIpAddress3,
]

const internetGatewayIpPool1: Json<InternetGatewayIpPool> = {
  id: '1d5e5a1f-0b2b-4d5b-8b9d-2d4b3e0c6gb9',
  name: 'internet-gateway-pool-1',
  description: 'Default internet gateway IP pool',
  internet_gateway_id: internetGateway1.id,
  ip_pool_id: ipPool1.id,
  time_created,
  time_modified,
}

const internetGatewayIpPool2: Json<InternetGatewayIpPool> = {
  id: 'd5e5a1f1-0b2b-4d5b-8b9d-2d4b3e0c6b9c',
  name: 'interent-gateway-pool-2',
  description: 'Default internet gateway IP pool',
  internet_gateway_id: internetGateway2.id,
  ip_pool_id: ipPool1.id,
  time_created,
  time_modified,
}

const internetGatewayIpPool3: Json<InternetGatewayIpPool> = {
  id: 'f1d5e5a1-0b2b-4d5b-8b9d-2d4b3e0c6b9g',
  name: 'internet-gateway-pool-3',
  description: 'an IP pool for an internet gateway',
  internet_gateway_id: internetGateway2.id,
  ip_pool_id: ipPool1.id,
  time_created,
  time_modified,
}

const internetGatewayIpPool4: Json<InternetGatewayIpPool> = {
  id: 'f1d5e5a1-0b2b-4d5b-8b9d-2d4b3e0c6b9h',
  name: 'internet-gateway-pool-4',
  description: 'a set of VPN IPs in an IP pool for an internet gateway',
  internet_gateway_id: internetGateway2.id,
  ip_pool_id: ipPool2.id,
  time_created,
  time_modified,
}

export const internetGatewayIpPools: Json<InternetGatewayIpPool>[] = [
  internetGatewayIpPool1,
  internetGatewayIpPool2,
  internetGatewayIpPool3,
  internetGatewayIpPool4,
]
