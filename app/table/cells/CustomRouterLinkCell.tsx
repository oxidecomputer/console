import { useApiQuery } from '~/api'
import { useVpcSelector } from '~/hooks'
import { Badge } from '~/ui/lib/Badge'
import { pb } from '~/util/path-builder'

import { EmptyCell, SkeletonCell } from './EmptyCell'
import { LinkCell } from './LinkCell'

/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

export const CustomRouterLinkCell = ({ value }: { value?: string }) => {
  const { project, vpc } = useVpcSelector()
  const { data: subnet, isError } = useApiQuery('vpcRouterView', {
    path: { router: value || '' },
    query: { project, vpc },
  })
  if (!value) return <EmptyCell />
  // probably not possible but let’s be safe
  if (isError) return <Badge color="neutral">Deleted</Badge>
  if (!subnet) return <SkeletonCell /> // loading
  return (
    <LinkCell to={pb.vpcRouter({ project, vpc, router: subnet.name })}>
      {subnet.name}
    </LinkCell>
  )
}
