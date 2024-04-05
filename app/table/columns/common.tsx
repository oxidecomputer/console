/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { format } from 'date-fns/format'
import { filesize } from 'filesize'

import { Truncate } from '~/ui/lib/Truncate'

import { TwoLineCell } from '../cells/TwoLineCell'

// the full type of the info arg is CellContext<Row, Item> from RT, but in these
// cells we only care about the return value of getValue
type Info<T> = { getValue: () => T }

export function dateCell(info: Info<Date>) {
  const date = info.getValue()
  return <TwoLineCell value={[format(date, 'MMM d, yyyy'), format(date, 'p')]} />
}

function sizeCell(info: Info<number>) {
  const size = filesize(info.getValue(), { base: 2, output: 'object' })
  return (
    <span className="text-secondary">
      {size.value} <span className="text-quaternary">{size.unit}</span>
    </span>
  )
}

/** Columns used in a bunch of tables */
export const Columns = {
  /** Truncates text if too long, full text in tooltip */
  description: {
    cell: (info: Info<string>) => <Truncate text={info.getValue()} maxLength={48} />,
  },
  size: { cell: sizeCell },
  timeCreated: { header: 'created', cell: dateCell },
  timeModified: { header: 'modified', cell: dateCell },
}
