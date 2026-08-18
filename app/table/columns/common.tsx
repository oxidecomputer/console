/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { InstanceState } from '~/api'
import { InstanceStateBadge } from '~/components/StateBadge'
import { DescriptionCell } from '~/table/cells/DescriptionCell'
import { CopyToClipboard } from '~/ui/lib/CopyToClipboard'
import { DateTime } from '~/ui/lib/DateTime'
import { Truncate } from '~/ui/lib/Truncate'
import { Size } from '~/ui/lib/ValueUnit'

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

// 12 works out to 5 characters on either side of the ellipsis, enough to tell
// UUIDs apart at a glance without the 36-character column a full one demands
function shortIdCell(info: Info<string>) {
  return <Truncate text={info.getValue()} maxLength={12} position="middle" hasCopyButton />
}

function instanceStateCell(info: Info<InstanceState>) {
  return <InstanceStateBadge state={info.getValue()} />
}

/** Columns used in a bunch of tables */
export const Columns = {
  /** Truncates text if too long, full text in tooltip */
  description: {
    cell: (info: Info<string | undefined>) => <DescriptionCell text={info.getValue()} />,
  },
  id: { header: 'ID', cell: idCell },
  /**
   * Like `id`, but middle-truncated, with the full value in a tooltip and on
   * the copy button. For tables too crowded to give an ID its full width, or
   * that show more than one ID per row.
   */
  shortId: { header: 'ID', cell: shortIdCell },
  instanceState: { header: 'state', cell: instanceStateCell },
  size: { cell: (info: Info<number>) => <Size bytes={info.getValue()} /> },
  timeCreated: { header: 'created', cell: dateCell },
  timeModified: { header: 'modified', cell: dateCell },
}
