/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { type IpPool } from '~/api'
import { Tooltip } from '~/ui/lib/Tooltip'

import { EmptyCell } from './EmptyCell'

export const IpPoolCell = ({
  ipPoolId,
  ipPools,
}: {
  ipPoolId: string
  ipPools: IpPool[]
}) => {
  const pool = ipPools.find((item) => item.id === ipPoolId)
  if (!pool) return <EmptyCell />
  return pool.description ? (
    <Tooltip content={pool.description} placement="right">
      <span>{pool.name}</span>
    </Tooltip>
  ) : (
    <>{pool.name}</>
  )
}
