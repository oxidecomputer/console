/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useQuery } from '@tanstack/react-query'

import { api, q } from '@oxide/api'
import { Badge } from '@oxide/design-system/ui'

import { SkeletonCell } from './EmptyCell'

/** Resolve a subnet ID to its name. Callers must ensure the query is enabled. */
export const SubnetNameFromId = ({ subnetId }: { subnetId: string }) => {
  const { data: subnet, isError } = useQuery(
    q(api.vpcSubnetView, { path: { subnet: subnetId } }, { throwOnError: false })
  )
  // probably not possible but let's be safe
  if (isError) return <Badge color="neutral">Deleted</Badge>
  if (!subnet) return <SkeletonCell /> // loading
  return <span className="text-default">{subnet.name}</span>
}
