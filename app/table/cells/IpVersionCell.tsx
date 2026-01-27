/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useQuery } from '@tanstack/react-query'

import { api, qErrorsAllowed } from '~/api'
import { IpVersionBadge } from '~/components/IpVersionBadge'

import { EmptyCell, SkeletonCell } from './EmptyCell'

export const IpVersionCell = ({ ipPoolId }: { ipPoolId: string }) => {
  const { data: result } = useQuery(
    qErrorsAllowed(api.projectIpPoolView, { path: { pool: ipPoolId } })
  )
  if (!result) return <SkeletonCell />
  if (result.type === 'error') return <EmptyCell />
  const pool = result.data
  return <IpVersionBadge ipVersion={pool.ipVersion} />
}
