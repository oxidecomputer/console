/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useApiQuery } from '~/api'
import { useVpcSelector } from '~/hooks/use-params'
import { Badge } from '~/ui/lib/Badge'
import { pb } from '~/util/path-builder'

import { EmptyCell, SkeletonCell } from './EmptyCell'
import { LinkCell } from './LinkCell'

export const RouterLinkCell = ({ routerId }: { routerId?: string }) => {
  const { project, vpc } = useVpcSelector()
  const { data: router, isError } = useApiQuery(
    'vpcRouterView',
    { path: { router: routerId! } }, // it's an ID, so no parent selector
    { enabled: !!routerId }
  )
  if (!routerId) return <EmptyCell />
  // probably not possible but let’s be safe
  if (isError) return <Badge color="neutral">Deleted</Badge>
  if (!router) return <SkeletonCell /> // loading
  return (
    <LinkCell to={pb.vpcRouter({ project, vpc, router: router.name })}>
      {router.name}
    </LinkCell>
  )
}
