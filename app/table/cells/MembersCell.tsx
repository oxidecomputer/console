/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useQuery } from '@tanstack/react-query'

import { api, q } from '~/api'
import { SkeletonCell } from '~/table/cells/EmptyCell'
import { ButtonCell } from '~/table/cells/LinkCell'
import { ALL_ISH } from '~/util/consts'

type MembersCellProps = {
  groupId: string
  onViewMembers: () => void
}

/**
 * Displays the member count for a group with lazy loading.
 * Shows a loading skeleton while fetching, then displays the count
 * with a "+" suffix if there are more results beyond the limit.
 * TODO: API update in Omicron PR #9495 will provide total count directly.
 */
export const MembersCell = ({ groupId, onViewMembers }: MembersCellProps) => {
  const { data: users } = useQuery(
    q(api.userList, { query: { group: groupId, limit: ALL_ISH } })
  )

  if (!users) return <SkeletonCell />

  const count = users.items.length
  const hasMore = !!users.nextPage
  const displayCount = hasMore ? `${count.toLocaleString()}+` : count.toLocaleString()

  return <ButtonCell onClick={onViewMembers}>{displayCount}</ButtonCell>
}
