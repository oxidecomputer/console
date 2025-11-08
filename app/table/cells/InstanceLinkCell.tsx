/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useQuery } from '@tanstack/react-query'

import { api, apiq } from '@oxide/api'

import { useProjectSelector } from '~/hooks/use-params'
import { pb } from '~/util/path-builder'

import { EmptyCell, SkeletonCell } from './EmptyCell'
import { LinkCell } from './LinkCell'

export const InstanceLinkCell = ({ instanceId }: { instanceId?: string | null }) => {
  const { project } = useProjectSelector()
  const { data: instance } = useQuery(
    apiq(
      api.methods.instanceView,
      { path: { instance: instanceId! } },
      { enabled: !!instanceId }
    )
  )

  // has to be after the hooks because hooks can't be executed conditionally
  if (!instanceId) return <EmptyCell />
  if (!instance) return <SkeletonCell />

  return (
    <LinkCell to={pb.instance({ project, instance: instance.name })}>
      {instance.name}
    </LinkCell>
  )
}
