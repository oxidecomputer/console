/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { CellContext } from '@tanstack/react-table'

import type { IdentityType } from '@oxide/api'

/**
 * Display whether this row displays a User or Group.
 */
export const AccessTypeCell = <RowData extends { identityType: IdentityType }>(
  info: CellContext<RowData, IdentityType>
) => {
  return <>{info.getValue() === 'silo_group' ? 'Group' : 'User'}</>
}
