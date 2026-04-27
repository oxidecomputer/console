/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'

import { api, q } from '@oxide/api'

import { useProjectSelector } from '~/hooks/use-params'
import { pb } from '~/util/path-builder'

import { EmptyCell, SkeletonCell } from './EmptyCell'
import { LinkCell } from './LinkCell'

type InstanceLinkProps = {
  instanceId?: string | null
  tab: 'storage' | 'networking'
  /** Use table cell styling with hover highlight. */
  cell?: boolean
}

export const InstanceLink = ({ instanceId, tab, cell }: InstanceLinkProps) => {
  const { project } = useProjectSelector()
  const { data: instance } = useQuery(
    q(api.instanceView, { path: { instance: instanceId! } }, { enabled: !!instanceId })
  )

  if (!instanceId) return <EmptyCell />
  if (!instance) return <SkeletonCell />

  const params = { project, instance: instance.name }
  const to =
    tab === 'networking' ? pb.instanceNetworking(params) : pb.instanceStorage(params)

  return cell ? (
    <LinkCell to={to}>{instance.name}</LinkCell>
  ) : (
    <Link to={to} className="link-with-underline text-sans-md">
      {instance.name}
    </Link>
  )
}
