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
import { Slash } from '~/ui/lib/Slash'
import { intersperse } from '~/util/array'

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
  return (
    <div className="flex max-w-full items-center gap-1 overflow-x-scroll">
      {intersperse(
        orderedIps.map((eip) => <CopyableIp ip={eip.ip} key={eip.ip} />),
        <Slash />
      )}
    </div>
  )
}
