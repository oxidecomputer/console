/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { CellContext } from '@tanstack/react-table'

import type { IdentityType } from '@oxide/api'
import { Badge } from '@oxide/ui'

/**
 * Display the user or group name. If the row is for a group, add a GROUP badge.
 */
export const AccessNameCell = <
  RowData extends { name: string; identityType: IdentityType },
>(
  info: CellContext<RowData, string>
) => {
  const name = info.getValue()
  const identityType = info.row.original.identityType
  return (
    <>
      <span>{name}</span>
      {identityType === 'silo_group' ? (
        <Badge color="neutral" className="ml-2">
          Group
        </Badge>
      ) : null}
    </>
  )
}
