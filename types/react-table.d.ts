/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { RowData } from '@tanstack/react-table'

import type { MakeActions } from '../app/table/columns/action-col'

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    thClassName?: string
    tdClassName?: string
    /** Set by `getActionsCol`, read by `ActionsCell` */
    makeActions?: MakeActions<TData>
    copyIdLabel?: string
  }
}
