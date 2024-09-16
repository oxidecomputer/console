/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import Error16Icon from '@oxide/design-system/icons/react/Error16Icon'

import { classed } from '~/util/classed'

import { Table as BigTable } from './Table'

type Children = { children: React.ReactNode }

export const Table = classed.table`ox-mini-table w-full border-separate text-sans-md`

type HeaderProps = { columns: string[]; canRemove?: boolean }
export const Header = ({ columns, canRemove }: HeaderProps) => (
  <BigTable.Header>
    <BigTable.HeaderRow>
      {columns.map((column) => (
        <BigTable.HeadCell key={column}>{column}</BigTable.HeadCell>
      ))}
      {canRemove && <BigTable.HeadCell className="w-12" />}
    </BigTable.HeaderRow>
  </BigTable.Header>
)

export const HeadCell = BigTable.HeadCell

export const Body = classed.tbody``

export const Row = classed.tr`is-selected children:border-default first:children:border-l children:last:border-b last:children:border-r`

export const Cell = ({ children }: Children) => {
  return (
    <td>
      <div>{children}</div>
    </td>
  )
}

// followed this for icon in button best practices
// https://www.sarasoueidan.com/blog/accessible-icon-buttons/
export const RemoveCell = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <Cell>
    <button type="button" onClick={onClick} aria-label={label}>
      <Error16Icon aria-hidden focusable="false" />
    </button>
  </Cell>
)
