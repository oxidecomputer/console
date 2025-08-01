/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { Link } from 'react-router'
import * as R from 'remeda'

import { useApiQuery, type ExternalIp } from '@oxide/api'

import { EmptyCell, SkeletonCell } from '~/table/cells/EmptyCell'
import { CopyableIp } from '~/ui/lib/CopyableIp'
import { Slash } from '~/ui/lib/Slash'
import { intersperse } from '~/util/array'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

/** Order IPs: floating first, then ephemeral, then SNAT */
export const orderIps = (ips: ExternalIp[]) =>
  R.sortBy(ips, (a) => {
    if (a.kind === 'floating') return 0
    if (a.kind === 'ephemeral') return 1
    if (a.kind === 'snat') return 2
    // This should never happen, but just in case
    return 3
  })

export function ExternalIps({ project, instance }: PP.Instance) {
  const { data, isPending } = useApiQuery('instanceExternalIpList', {
    path: { instance },
    query: { project },
  })
  if (isPending) return <SkeletonCell />

  const ips = data?.items.filter((ip) => ip.kind !== 'snat')
  if (!ips || ips.length === 0) return <EmptyCell />
  const orderedIps = orderIps(ips)
  const ipsToShow = orderedIps.slice(0, 2)
  const overflowCount = orderedIps.length - ipsToShow.length

  // create a list of CopyableIp components
  const links = ipsToShow.map((eip) => <CopyableIp ip={eip.ip} key={eip.ip} />)

  return (
    <div className="flex max-w-full items-center">
      {intersperse(links, <Slash className="ml-0.5 mr-1.5" />)}
      {/* if there are more than 2 ips, add a link to the instance networking page */}
      {overflowCount > 0 && (
        <>
          <Slash className="ml-0.5 mr-1.5" />
          <Link
            to={pb.instanceNetworking({ project, instance })}
            className="hover:link-with-underline -m-2 self-center p-2 text-tertiary"
          >
            …
          </Link>
        </>
      )}
    </div>
  )
}
