/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useApiQuery } from '@oxide/api'

import { useProjectSelector } from 'app/hooks'
import { pb } from 'app/util/path-builder'

import { SkeletonCell } from './EmptyCell'
import { LinkCell } from './LinkCell'

export const InstanceLinkCell = ({ value: instanceId }: { value: string | null }) => {
  const { project } = useProjectSelector()
  const { data: instance } = useApiQuery(
    'instanceView',
    { path: { instance: instanceId! } },
    { enabled: !!instanceId }
  )

  if (!instanceId) return null
  if (!instance) return <SkeletonCell />

  return (
    <LinkCell to={pb.instancePage({ project, instance: instance.name })}>
      {instance.name}
    </LinkCell>
  )
}
