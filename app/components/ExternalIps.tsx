/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useApiQuery } from '@oxide/api'

import { EmptyCell, SkeletonCell } from '~/table/cells/EmptyCell'
import { CopyableIp } from '~/ui/lib/CopyableIp'
import { intersperse } from '~/util/array'
import type * as PP from '~/util/path-params'

export function ExternalIps({ project, instance }: PP.Instance) {
  const { data, isPending } = useApiQuery('instanceExternalIpList', {
    path: { instance },
    query: { project },
  })
  if (isPending) return <SkeletonCell />

  const ips = data?.items
  if (!ips || ips.length === 0) return <EmptyCell />
  return (
    <div className="flex items-center gap-1">
      {intersperse(
        ips.map((eip) => <CopyableIp ip={eip.ip} key={eip.ip} />),
        <span className="text-quaternary"> / </span>
      )}
    </div>
  )
}
