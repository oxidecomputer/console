/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useQuery } from '@tanstack/react-query'

import { api, apiqErrorsAllowed } from '~/api'
import { Tooltip } from '~/ui/lib/Tooltip'

import { EmptyCell, SkeletonCell } from './EmptyCell'

export const IpPoolCell = ({ ipPoolId }: { ipPoolId: string }) => {
  const { data: result } = useQuery(
    apiqErrorsAllowed(api.projectIpPoolView, { path: { pool: ipPoolId } })
  )
  if (!result) return <SkeletonCell />
  // this should essentially never happen, but it's probably better than blowing
  // up the whole page if the pool is not found
  if (result.type === 'error') return <EmptyCell />
  const pool = result.data
  return (
    <Tooltip content={pool.description} placement="right">
      <span>{pool.name}</span>
    </Tooltip>
  )
}
