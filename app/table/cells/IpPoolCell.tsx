/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useApiQuery } from '~/api'
import { Tooltip } from '~/ui/lib/Tooltip'

import { EmptyCell } from './EmptyCell'

export const IpPoolCell = ({ ipPoolId }: { ipPoolId: string }) => {
  const pool = useApiQuery('projectIpPoolView', { path: { pool: ipPoolId } }).data
  if (!pool) return <EmptyCell />
  return (
    <Tooltip content={pool.description} placement="right">
      <span>{pool.name}</span>
    </Tooltip>
  )
}
