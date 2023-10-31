/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable as useReactTableOrig,
  type CellContext,
  type RowData,
  type TableOptions,
} from '@tanstack/react-table'

/**
 * Exactly the same as the default `useReactTable` except it handles
 * `getCoreRowModel` for you.
 */
export const useReactTable = <TData extends RowData>(
  options: Omit<TableOptions<TData>, 'getCoreRowModel'>
) => useReactTableOrig({ ...options, getCoreRowModel: getCoreRowModel() })

// The goal here is to re-export everything we need from RT in app/ so we can
// import from here only. If you find yourself importing from RT directly, add
// that export here.

export { createColumnHelper }

export type { CellContext }
