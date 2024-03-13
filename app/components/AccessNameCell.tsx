/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { CellContext } from '@tanstack/react-table'

/**
 * Display the user or group name. If the row is for a group, add a GROUP badge.
 */
export const AccessNameCell = <RowData extends { name: string }>(
  info: CellContext<RowData, string>
) => <span>{info.getValue()}</span>
