/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { Truncate } from '~/ui/lib/Truncate'

import { DateCell } from '../cells/DateCell'
import { SizeCell } from '../cells/SizeCell'

// the full type of the info arg is CellContext<Row, Item> from RT, but in these
// cells we only care about the return value of getValue
type Info<T> = { getValue: () => T }

/** Columns used in a bunch of tables */
export const Columns = {
  /** Truncates text if too long, full text in tooltip */
  description: {
    cell: (info: Info<string>) => <Truncate text={info.getValue()} maxLength={48} />,
  },
  size: {
    cell: (info: Info<number>) => <SizeCell value={info.getValue()} />,
  },
  timeCreated: {
    header: 'created',
    cell: (info: Info<Date>) => <DateCell value={info.getValue()} />,
  },
  timeModified: {
    header: 'modified',
    cell: (info: Info<Date>) => <DateCell value={info.getValue()} />,
  },
}
