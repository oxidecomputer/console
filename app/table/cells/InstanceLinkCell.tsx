/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useApiQuery } from '@oxide/api'

import { useProjectSelector } from '~/hooks'
import { pb } from '~/util/path-builder'

import { SkeletonCell } from './EmptyCell'
import { LinkCell } from './LinkCell'

export const InstanceLinkCell = ({ instanceId }: { instanceId?: string }) => {
  const { project } = useProjectSelector()
  const { data: instance } = useApiQuery(
    'instanceView',
    { path: { instance: instanceId! } },
    { enabled: !!instanceId }
  )

  // has to be after the hooks because hooks can't be executed conditionally
  if (!instanceId) return null
  if (!instance) return <SkeletonCell />

  return (
    <LinkCell to={pb.instancePage({ project, instance: instance.name })}>
      {instance.name}
    </LinkCell>
  )
}
