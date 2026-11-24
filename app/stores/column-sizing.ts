/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import {
  functionalUpdate,
  type ColumnSizingState,
  type Updater,
} from '@tanstack/react-table'
import { create } from 'zustand'

/** Keyed by table (see `useTable`). Not persisted on purpose: a refresh resets widths. */
export const useColumnSizingStore = create<{ byTable: Record<string, ColumnSizingState> }>(
  () => ({ byTable: {} })
)

export const setColumnSizing = (tableKey: string, updater: Updater<ColumnSizingState>) =>
  useColumnSizingStore.setState(({ byTable }) => ({
    byTable: { ...byTable, [tableKey]: functionalUpdate(updater, byTable[tableKey] ?? {}) },
  }))
