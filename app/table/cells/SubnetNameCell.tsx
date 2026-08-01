/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useQuery } from '@tanstack/react-query'

import { api, q } from '@oxide/api'

import { Truncate } from '~/ui/lib/Truncate'

import { SkeletonCell } from './EmptyCell'

/** Resolve a subnet ID to its name. Callers must ensure the query is enabled. */
export const SubnetNameFromId = ({ subnetId }: { subnetId: string }) => {
  const { data: subnet, isError } = useQuery(
    q(api.vpcSubnetView, { path: { subnet: subnetId } }, { throwOnError: false })
  )
  // If fetch fails, just show ID instead of name
  if (isError) return <Truncate text={subnetId} maxLength={32} />
  if (!subnet) return <SkeletonCell /> // loading
  return <span className="text-default">{subnet.name}</span>
}
