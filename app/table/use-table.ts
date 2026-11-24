/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import {
  useReactTable,
  type ColumnSizingState,
  type RowData,
  type TableOptions,
} from '@tanstack/react-table'

import { setColumnSizing, useColumnSizingStore } from '~/stores/column-sizing'

const MIN_COL_WIDTH = 96

// stable, so unresized tables don't re-render on every store change
const NO_SIZING: ColumnSizingState = {}

export type UseTableOptions<TData extends RowData> = TableOptions<TData> & {
  /** Unique per table. Keys the table's column widths in the sizing store. */
  id: string
}

export function useTable<TData extends RowData>({
  id,
  ...options
}: UseTableOptions<TData>) {
  const columnSizing = useColumnSizingStore((s) => s.byTable[id]) ?? NO_SIZING
  return useReactTable({
    // Pagination is server-side, and the reset re-renders whenever `data`
    // changes identity, which loops forever on data derived during render
    autoResetPageIndex: false,
    ...options,
    defaultColumn: { minSize: MIN_COL_WIDTH, ...options.defaultColumn },
    state: { ...options.state, columnSizing },
    onColumnSizingChange: (updater) => setColumnSizing(id, updater),
  })
}
