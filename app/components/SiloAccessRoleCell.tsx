/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { CellContext } from '@tanstack/react-table'

import type { RoleKey } from '@oxide/api'

import { AccessBadge } from './AccessBadge'

/**
 * Show the silo role for a user or group, formatted in a badge.
 */
export const SiloAccessRoleCell = <RowData extends { effectiveRole: RoleKey }>(
  info: CellContext<RowData, RoleKey>
) => {
  const cellRole = info.getValue()
  return cellRole ? <AccessBadge role={cellRole} labelPrefix="silo" /> : null
}
