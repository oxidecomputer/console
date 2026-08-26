/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useQuery } from '@tanstack/react-query'

import { api, q } from '~/api'
import { ALL_ISH } from '~/util/consts'

export function MemberCountCell({ groupId }: { groupId: string }) {
  const { data } = useQuery(q(api.userList, { query: { group: groupId, limit: ALL_ISH } }))
  return data ? <>{data.items.length}</> : null
}
