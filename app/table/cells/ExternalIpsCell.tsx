/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useQuery } from '@tanstack/react-query'

import { api, q } from '@oxide/api'

import { ListPlusOverflow } from '~/components/ListPlusCell'
import { EmptyCell, SkeletonCell } from '~/table/cells/EmptyCell'
import { CopyableIp } from '~/ui/lib/CopyableIp'
import { orderIps } from '~/util/ip'
import type * as PP from '~/util/path-params'

// Shows the instance's first external IP (copyable), plus a `+N` tooltip.
// SNAT IPs are excluded because they can't receive inbound traffic, so are
// rarely the "external IP" a user is looking for. This might change with
// https://github.com/oxidecomputer/omicron/issues/4317
export function ExternalIpsCell({ project, instance }: PP.Instance) {
  const { data, isPending } = useQuery(
    q(api.instanceExternalIpList, { path: { instance }, query: { project } })
  )
  if (isPending) return <SkeletonCell />

  const [first, ...rest] = orderIps((data?.items || []).filter((ip) => ip.kind !== 'snat'))
  if (!first) return <EmptyCell />

  return (
    <div className="flex items-center gap-1">
      {/* only the leading IP is copyable; the rest live in the +N tooltip */}
      <CopyableIp ip={first.ip} />
      <ListPlusOverflow tooltipTitle="Other external IPs">
        {rest.map((ip) => (
          <div key={ip.ip}>{ip.ip}</div>
        ))}
      </ListPlusOverflow>
    </div>
  )
}
