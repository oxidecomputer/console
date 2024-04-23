/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useApiQuery } from '@oxide/api'

import { EmptyCell, SkeletonCell } from '~/table/cells/EmptyCell'
import { CopyToClipboard } from '~/ui/lib/CopyToClipboard'
import { intersperse } from '~/util/array'

type InstanceSelector = { project: string; instance: string }

export function ExternalIps({ project, instance }: InstanceSelector) {
  const { data, isPending } = useApiQuery('instanceExternalIpList', {
    path: { instance },
    query: { project },
  })
  if (isPending) return <SkeletonCell />

  const ips = data?.items
    ? intersperse(
        data.items.map((eip) => <IpLink ip={eip.ip} key={eip.ip} />),
        <span className="text-quinary"> / </span>
      )
    : undefined

  return (
    <div className="flex items-center gap-1 text-secondary">
      {ips && ips.length > 0 ? ips : <EmptyCell />}
      {/* If there's exactly one IP here, render a copy to clipboard button */}
      {data?.items.length === 1 && <CopyToClipboard text={data.items[0].ip} />}
    </div>
  )
}

function IpLink({ ip }: { ip: string }) {
  return (
    <a
      className="link-with-underline text-sans-md"
      href={`https://${ip}`}
      target="_blank"
      rel="noreferrer"
    >
      {ip}
    </a>
  )
}
