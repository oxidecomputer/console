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

/**
 * Resolve a subnet ID to its name. Nexus refuses to delete a subnet while a live
 * NIC references it, so the error branch should be unreachable — it falls back to
 * the ID rather than taking down the page if that turns out to be wrong.
 * https://github.com/oxidecomputer/omicron/blob/7a15082/nexus/db-queries/src/db/datastore/vpc.rs#L1015-L1031
 */
export const SubnetNameFromId = ({ subnetId }: { subnetId: string }) => {
  const { data: subnet, isError } = useQuery(
    q(api.vpcSubnetView, { path: { subnet: subnetId } }, { throwOnError: false })
  )
  if (isError) return <Truncate text={subnetId} position="middle" className="max-w-48" />
  if (!subnet) return <SkeletonCell /> // loading
  return <span className="text-default">{subnet.name}</span>
}
