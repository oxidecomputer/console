/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { RouteDestination, RouteTarget } from '~/api'

type DestinationItem = { value: RouteDestination['type']; label: string }
export const routerRouteDestinationTypes: DestinationItem[] = [
  { value: 'ip', label: 'IP' },
  { value: 'ip_net', label: 'IP net' },
  { value: 'vpc', label: 'VPC' },
  { value: 'subnet', label: 'subnet' },
]

type TargetItem = { value: RouteTarget['type']; label: string }
export const routerRouteTargetTypes: TargetItem[] = [
  { value: 'ip', label: 'IP' },
  { value: 'vpc', label: 'VPC' },
  { value: 'subnet', label: 'subnet' },
  { value: 'instance', label: 'instance' },
  { value: 'internet_gateway', label: 'Internet gateway' },
  { value: 'drop', label: 'Drop' },
]
