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

import { ipPools } from './ip-pool'
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
  address: '87.114.25.166',
  description: 'the IP address for an internet gateway',
  internet_gateway_id: internetGateway1.id,
  name: 'internet-gateway-ip-1',
  time_created,
  time_modified,
}

const internetGatewayIpAddress2: Json<InternetGatewayIpAddress> = {
  id: 'f1d5e5a1-0b2b-4d5b-8b9d-2d4b3e0c6b9e',
  address: '292a:a05c:3b36:a053:9166:6510:2d6b:3322',
  description: 'an IPv6 address for an internet gateway',
  internet_gateway_id: internetGateway1.id,
  name: 'internet-gateway-ip-2',
  time_created,
  time_modified,
}

const internetGatewayIpAddress3: Json<InternetGatewayIpAddress> = {
  id: 'f1d5e5a1-0b2b-4d5b-8b9d-2d4b3e0c6b9f',
  address: '178.125.253.126',
  description: 'an IPv4 address for internet gateway 2',
  internet_gateway_id: internetGateway2.id,
  name: 'internet-gateway-ip-3',
  time_created,
  time_modified,
}

export const internetGatewayIpAddresses: Json<InternetGatewayIpAddress>[] = [
  internetGatewayIpAddress1,
  internetGatewayIpAddress2,
  internetGatewayIpAddress3,
]

const [defaultIpPool, ipPool1, ipPool2, ipPool3] = ipPools

const defaultInternetGatewayIpPool1: Json<InternetGatewayIpPool> = {
  id: '1d5e5a1f-0b2b-4d5b-8b9d-2d4b3e0c6gb9',
  name: 'default',
  description: 'Default internet gateway IP pool',
  internet_gateway_id: internetGateway1.id,
  ip_pool_id: defaultIpPool.id,
  time_created,
  time_modified,
}

const defaultInternetGatewayIpPool2: Json<InternetGatewayIpPool> = {
  id: 'd5e5a1f1-0b2b-4d5b-8b9d-2d4b3e0c6b9c',
  name: 'default',
  description: 'Default internet gateway IP pool',
  internet_gateway_id: internetGateway2.id,
  ip_pool_id: defaultIpPool.id,
  time_created,
  time_modified,
}

const internetGatewayIpPool1: Json<InternetGatewayIpPool> = {
  id: 'f1d5e5a1-0b2b-4d5b-8b9d-2d4b3e0c6b9g',
  name: 'internet-gateway-ip-pool-1',
  description: 'an IP pool for an internet gateway',
  internet_gateway_id: internetGateway2.id,
  ip_pool_id: ipPool1.id,
  time_created,
  time_modified,
}

const internetGatewayIpPool2: Json<InternetGatewayIpPool> = {
  id: 'f1d5e5a1-0b2b-4d5b-8b9d-2d4b3e0c6b9h',
  name: 'internet-gateway-ip-pool-2',
  description: 'a set of VPN IPs in an IP pool for an internet gateway',
  internet_gateway_id: internetGateway2.id,
  ip_pool_id: ipPool2.id,
  time_created,
  time_modified,
}

const internetGatewayIpPool3: Json<InternetGatewayIpPool> = {
  id: 'f1d5e5a1-0b2b-4d5b-8b9d-2d4b3e0c6b9i',
  name: 'internet-gateway-ip-pool-3',
  description: 'another IP pool for an internet gateway',
  internet_gateway_id: internetGateway2.id,
  ip_pool_id: ipPool3.id,
  time_created,
  time_modified,
}

export const internetGatewayIpPools: Json<InternetGatewayIpPool>[] = [
  defaultInternetGatewayIpPool1,
  defaultInternetGatewayIpPool2,
  internetGatewayIpPool1,
  internetGatewayIpPool2,
  internetGatewayIpPool3,
]
