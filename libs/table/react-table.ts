import type { CellContext, RowData, TableOptions } from '@tanstack/react-table'
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable as useReactTableOrig,
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
