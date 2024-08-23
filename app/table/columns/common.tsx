/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { parseAbsolute } from '@internationalized/date'
import { type Row } from '@tanstack/react-table'
import { filesize } from 'filesize'

import type { DateTimeRange } from '~/components/form/fields/DateTimeRangePicker'
import { DateTime } from '~/ui/lib/DateTime'
import { Truncate } from '~/ui/lib/Truncate'

import { EmptyCell } from '../cells/EmptyCell'

// the full type of the info arg is CellContext<Row, Item> from RT, but in these
// cells we only care about the return value of getValue
type Info<T> = { getValue: () => T }

function dateCell(info: Info<Date>) {
  return <DateTime date={info.getValue()} />
}

function sizeCell(info: Info<number>) {
  const size = filesize(info.getValue(), { base: 2, output: 'object' })
  return (
    <span className="text-secondary">
      {size.value} <span className="text-quaternary">{size.unit}</span>
    </span>
  )
}

export const TruncateCell = ({ text, length = 48 }: { text?: string; length?: number }) =>
  text ? <Truncate text={text} maxLength={length} /> : <EmptyCell />

/** Columns used in a bunch of tables */
export const Columns = {
  /** Truncates text if too long, full text in tooltip */
  name: {
    cell: (info: Info<string | undefined>) => <TruncateCell text={info.getValue()} />,
    size: 200,
  },
  description: {
    cell: (info: Info<string | undefined>) => (
      <TruncateCell text={info.getValue()} length={26} />
    ),
    size: 225,
  },
  size: {
    cell: sizeCell,
    disableGlobalFilter: true,
    size: 125,
    meta: { filterVariant: 'range' as const },
  },
  timeCreated: {
    header: 'created',
    cell: dateCell,
    disableGlobalFilter: true,
    meta: { filterVariant: 'datetime' as const },
    filterFn: dateTimeFilter,
  },
  timeModified: {
    header: 'modified',
    cell: dateCell,
    disableGlobalFilter: true,
    meta: { filterVariant: 'datetime' as const },
    filterFn: dateTimeFilter,
  },
}

function dateTimeFilter<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: DateTimeRange
): boolean {
  const rowDate: Date = row.getValue(columnId)
  const isoString = rowDate.toISOString()

  const rowValue = parseAbsolute(isoString, 'UTC')
  const { start, end } = filterValue

  // we filter the dateTime by day ignorning the hours
  // and minutes to avoid requiring that within the UI
  // may revise if we think the user requires that granularity
  const startOfDay = start.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
  const endOfDay = end.set({ hour: 23, minute: 59, second: 59, millisecond: 999 })

  const rowValueDate = rowValue.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })

  return rowValueDate.compare(startOfDay) >= 0 && rowValueDate.compare(endOfDay) <= 0
}
