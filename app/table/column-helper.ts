/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import {
  // oxlint-disable-next-line no-restricted-imports -- the one place it's wrapped
  createColumnHelper as createTanstackColumnHelper,
  type AccessorFn,
  type AccessorFnColumnDef,
  type AccessorKeyColumnDef,
  type ColumnHelper as TanstackColumnHelper,
  type DeepKeys,
  type DeepValue,
  type DisplayColumnDef,
  type IdentifiedColumnDef,
  type RowData,
} from '@tanstack/react-table'

/** Px, or `'flex'` to share whatever width the fixed columns leave */
export type ColumnWidth = number | 'flex'

type Sized<TDef> = TDef & { meta: { width: ColumnWidth } }

export type ColumnHelper<TData extends RowData> = {
  accessor: <
    TAccessor extends AccessorFn<TData> | DeepKeys<TData>,
    TValue extends (TAccessor extends AccessorFn<TData, infer TReturn>
      ? TReturn
      : TAccessor extends DeepKeys<TData>
        ? DeepValue<TData, TAccessor>
        : never),
  >(
    accessor: TAccessor,
    column: Sized<
      TAccessor extends AccessorFn<TData>
        ? DisplayColumnDef<TData, TValue>
        : IdentifiedColumnDef<TData, TValue>
    >
  ) => TAccessor extends AccessorFn<TData>
    ? AccessorFnColumnDef<TData, TValue>
    : AccessorKeyColumnDef<TData, TValue>
  display: (column: Sized<DisplayColumnDef<TData>>) => DisplayColumnDef<TData, unknown>
  // a group is as wide as its columns
  group: TanstackColumnHelper<TData>['group']
}

/** TanStack's `createColumnHelper`, but every column must set `meta.width` */
export const createColumnHelper = <TData extends RowData>(): ColumnHelper<TData> =>
  createTanstackColumnHelper<TData>()
