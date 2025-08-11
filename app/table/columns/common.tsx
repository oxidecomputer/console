/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { filesize } from 'filesize'

import type { InstanceState } from '~/api'
import { InstanceStateBadge } from '~/components/StateBadge'
import { DescriptionCell } from '~/table/cells/DescriptionCell'
import { CopyToClipboard } from '~/ui/lib/CopyToClipboard'
import { DateTime } from '~/ui/lib/DateTime'

// the full type of the info arg is CellContext<Row, Item> from RT, but in these
// cells we only care about the return value of getValue
type Info<T> = { getValue: () => T }

function dateCell(info: Info<Date>) {
  return <DateTime date={info.getValue()} />
}

function idCell(info: Info<string>) {
  const text = info.getValue()
  return (
    <div className="flex items-center gap-0.5 overflow-hidden">
      {text}
      <div className="flex items-center p-0.5">
        <CopyToClipboard text={text} />
      </div>
    </div>
  )
}

function instanceStateCell(info: Info<InstanceState>) {
  return <InstanceStateBadge state={info.getValue()} />
}

// not using Info<number> so this can also be used for minitables
export function sizeCellInner(value: number) {
  const size = filesize(value, { base: 2, output: 'object' })
  return (
    <span className="text-default">
      {size.value} <span className="text-tertiary">{size.unit}</span>
    </span>
  )
}

/** Columns used in a bunch of tables */
export const Columns = {
  /** Truncates text if too long, full text in tooltip */
  description: {
    cell: (info: Info<string | undefined>) => <DescriptionCell text={info.getValue()} />,
  },
  id: { header: 'ID', cell: idCell },
  instanceState: { header: 'state', cell: instanceStateCell },
  size: { cell: (info: Info<number>) => sizeCellInner(info.getValue()) },
  timeCreated: { header: 'created', cell: dateCell },
  timeModified: { header: 'modified', cell: dateCell },
}
