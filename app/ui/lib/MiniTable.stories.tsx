/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import * as MiniTable from './MiniTable'

export const Default = () => (
  <MiniTable.Table>
    <MiniTable.Header>
      <MiniTable.HeadCell>Name</MiniTable.HeadCell>
      <MiniTable.HeadCell>Source Type</MiniTable.HeadCell>
      <MiniTable.HeadCell>Size</MiniTable.HeadCell>
    </MiniTable.Header>
    <MiniTable.Body>
      <MiniTable.Row>
        <MiniTable.Cell>disk-1</MiniTable.Cell>
        <MiniTable.Cell>Blank</MiniTable.Cell>
        <MiniTable.Cell>
          128 <span className="text-secondary">GiB</span>
        </MiniTable.Cell>
      </MiniTable.Row>
      <MiniTable.Row>
        <MiniTable.Cell>disk-2</MiniTable.Cell>
        <MiniTable.Cell>Blank</MiniTable.Cell>
        <MiniTable.Cell>
          128 <span className="text-secondary">GiB</span>
        </MiniTable.Cell>
      </MiniTable.Row>
    </MiniTable.Body>
  </MiniTable.Table>
)
