/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { classed } from '@oxide/util'

import { Table as BigTable } from './Table'

import './mini-table.css'

type Children = { children: React.ReactNode }

export const Table = classed.table`ox-mini-table w-full border-separate text-sans-md`

export const Header = ({ children }: Children) => (
  <BigTable.Header>
    <BigTable.HeaderRow>{children}</BigTable.HeaderRow>
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
