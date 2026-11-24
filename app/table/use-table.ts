/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import {
  useReactTable,
  type ColumnDef,
  type ColumnSizingState,
  type RowData,
  type TableOptions,
} from '@tanstack/react-table'

import { setColumnSizing, useColumnSizingStore } from '~/stores/column-sizing'

const MIN_COL_WIDTH = 96

// stable, so unresized tables don't re-render on every store change
const NO_SIZING: ColumnSizingState = {}

/** Approximates TanStack's column id resolution, enough to tell tables apart */
const columnDefId = <TData>(def: ColumnDef<TData, unknown>) =>
  def.id ??
  ('accessorKey' in def ? String(def.accessorKey) : undefined) ??
  (typeof def.header === 'string' ? def.header : '')

const leafColumnIds = <TData>(defs: ColumnDef<TData, unknown>[]): string[] =>
  defs.flatMap((def) =>
    'columns' in def && def.columns ? leafColumnIds(def.columns) : [columnDefId(def)]
  )

/** Tables with identical column ids share widths */
export function useTable<TData extends RowData>(options: TableOptions<TData>) {
  const key = leafColumnIds(options.columns).join('|')
  const columnSizing = useColumnSizingStore((s) => s.byTable[key]) ?? NO_SIZING
  return useReactTable({
    columnResizeMode: 'onChange',
    ...options,
    defaultColumn: { minSize: MIN_COL_WIDTH, ...options.defaultColumn },
    state: { ...options.state, columnSizing },
    onColumnSizingChange: (updater) => setColumnSizing(key, updater),
  })
}
