/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useQuery } from '@tanstack/react-query'

import { groupMemberList } from '~/api'
import { ErrorCell, SkeletonCell } from '~/table/cells/EmptyCell'

export function MemberCountCell({ groupId }: { groupId: string }) {
  // The loader prefetches member lists without awaiting them, so they may not
  // be in cache at render time
  const { data, isError } = useQuery(groupMemberList({ groupId }))
  if (isError) return <ErrorCell />
  if (!data) return <SkeletonCell />
  return <>{data.items.length}</>
}
