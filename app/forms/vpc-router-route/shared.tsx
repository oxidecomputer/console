/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { RouteDestination, RouteTarget } from '~/api'

const destTypes: Record<RouteDestination['type'], string> = {
  ip: 'IP',
  ip_net: 'IP net',
  vpc: 'VPC',
  subnet: 'subnet',
}

// Subnets cannot be used as a target in custom routers
const targetTypes: Record<Exclude<RouteTarget['type'], 'subnet'>, string> = {
  ip: 'IP',
  vpc: 'VPC',
  instance: 'instance',
  internet_gateway: 'Internet gateway',
  drop: 'Drop',
}

const toItems = (mapping: Record<string, string>) =>
  Object.entries(mapping).map(([value, label]) => ({ value, label }))

export const fields = {
  destType: {
    name: 'destination.type' as const,
    items: toItems(destTypes),
    label: 'Destination type',
    placeholder: 'Select a destination type',
    required: true,
  },
  destValue: {
    name: 'destination.value' as const,
    label: 'Destination value',
    placeholder: 'Enter a destination value',
    required: true,
  },
  targetType: {
    name: 'target.type' as const,
    items: toItems(targetTypes),
    label: 'Target type',
    placeholder: 'Select a target type',
    required: true,
  },
  targetValue: {
    name: 'target.value' as const,
    label: 'Target value',
    placeholder: 'Enter a target value',
    required: true,
  },
}

export const routeError = {
  vpcSubnetNotModifiable:
    'Routes of type VPC Subnet within the system router are not modifiable',
}
