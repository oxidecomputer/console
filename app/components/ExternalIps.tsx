/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { Link } from 'react-router-dom'

import { useApiQuery } from '@oxide/api'

import { EmptyCell, SkeletonCell } from '~/table/cells/EmptyCell'
import { Badge } from '~/ui/lib/Badge'
import { CopyableIp } from '~/ui/lib/CopyableIp'
import { Slash } from '~/ui/lib/Slash'
import { intersperse } from '~/util/array'
import { pb } from '~/util/path-builder'

type InstanceSelector = { project: string; instance: string }

export function ExternalIps({ project, instance }: InstanceSelector) {
  const { data, isPending } = useApiQuery('instanceExternalIpList', {
    path: { instance },
    query: { project },
  })
  if (isPending) return <SkeletonCell />

  const ips = data?.items
  if (!ips || ips.length === 0) return <EmptyCell />
  // create a copy of ips so we don't mutate the original; move ephemeral ip to the end
  const orderedIps = [...ips].sort((a) => (a.kind === 'ephemeral' ? 1 : -1))
  const toShow = orderedIps.slice(0, 2)
  const overflowCount = orderedIps.length - toShow.length
  return (
    <div className="flex max-w-full items-center gap-1">
      {intersperse(
        toShow.map((eip) => <CopyableIp ip={eip.ip} key={eip.ip} />),
        <Slash />
      )}
      {overflowCount > 0 && (
        <Link to={pb.instanceNetworking({ project, instance })}>
          <Badge>+{overflowCount}</Badge>
        </Link>
      )}
    </div>
  )
}
