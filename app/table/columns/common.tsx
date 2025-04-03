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
import { DateTime } from '~/ui/lib/DateTime'
import { Truncate } from '~/ui/lib/Truncate'

// the full type of the info arg is CellContext<Row, Item> from RT, but in these
// cells we only care about the return value of getValue
type Info<T> = { getValue: () => T }

function dateCell(info: Info<Date>) {
  return <DateTime date={info.getValue()} />
}

function idCell(info: Info<string>) {
  return <Truncate text={info.getValue()} maxLength={14} position="middle" hasCopyButton />
}

function instanceStateCell(info: Info<InstanceState>) {
  return <InstanceStateBadge state={info.getValue()} />
}

function sizeCell(info: Info<number>) {
  const size = filesize(info.getValue(), { base: 2, output: 'object' })
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
  size: { cell: sizeCell },
  timeCreated: { header: 'created', cell: dateCell },
  timeModified: { header: 'modified', cell: dateCell },
}
