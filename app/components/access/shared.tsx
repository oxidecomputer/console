/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { IdentityFilter } from '~/types/access'
import { identityTypeLabel } from '~/util/access'

/**
 * Returns a label based on the current filter (e.g., "user or group", "user", "group")
 */
export const getFilterEntityLabel = (filter: IdentityFilter) =>
  filter === 'all' ? 'user or group' : filter === 'users' ? 'user' : 'group'

/**
 * Shared identity type column definition for use in both silo and project tables
 */
export const identityTypeColumnDef = {
  header: 'Type',
  cell: (info: { getValue: () => keyof typeof identityTypeLabel }) =>
    identityTypeLabel[info.getValue()],
}
