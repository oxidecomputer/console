/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { Link } from 'react-router'

import { useApiQuery, type ExternalIp } from '@oxide/api'

import { EmptyCell, SkeletonCell } from '~/table/cells/EmptyCell'
import { CopyableIp } from '~/ui/lib/CopyableIp'
import { Slash } from '~/ui/lib/Slash'
import { intersperse } from '~/util/array'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

/** Move ephemeral IP (if present) to the end of the list of external IPs */
export const orderIps = (ips: ExternalIp[]) =>
  ips.sort((a) => (a.kind === 'ephemeral' ? 1 : -1))

export function ExternalIps({ project, instance }: PP.Instance) {
  const { data, isPending } = useApiQuery('instanceExternalIpList', {
    path: { instance },
    query: { project },
  })
  if (isPending) return <SkeletonCell />

  const ips = data?.items
  if (!ips || ips.length === 0) return <EmptyCell />
  // create a copy of ips so we don't mutate the original; move ephemeral ip to the end
  const orderedIps = orderIps(ips)
  const ipsToShow = orderedIps.slice(0, 2)
  const overflowCount = orderedIps.length - ipsToShow.length

  // create a list of CopyableIp components
  const links = ipsToShow.map((eip) => <CopyableIp ip={eip.ip} key={eip.ip} />)

  // if there are more than 2 ips, add a link to the instance networking page
  if (overflowCount > 0) {
    links.push(
      <Link
        to={pb.instanceNetworking({ project, instance })}
        className="link-with-underline text-sans-md"
      >
        +{overflowCount}
      </Link>
    )
  }

  return (
    <div className="flex max-w-full items-center gap-1">
      {intersperse(links, <Slash />)}
    </div>
  )
}
