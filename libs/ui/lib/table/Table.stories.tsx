/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Table } from './Table'

export const Default = () => {
  return (
    <Table>
      <Table.Header>
        <Table.HeaderRow>
          <Table.HeadCell>id</Table.HeadCell>
          <Table.HeadCell>name</Table.HeadCell>
          <Table.HeadCell>description</Table.HeadCell>
        </Table.HeaderRow>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell>abc-123</Table.Cell>
          <Table.Cell>A simple thing</Table.Cell>
          <Table.Cell>A thing that is simple</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>xyz-342</Table.Cell>
          <Table.Cell>Another daily</Table.Cell>
          <Table.Cell>An average example</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>xyz-342</Table.Cell>
          <Table.Cell>Another thing</Table.Cell>
          <Table.Cell>Repeated example</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  )
}

export const Selected = () => {
  return (
    <Table>
      <Table.Header>
        <Table.HeaderRow>
          <Table.HeadCell>id</Table.HeadCell>
          <Table.HeadCell>name</Table.HeadCell>
          <Table.HeadCell>description</Table.HeadCell>
        </Table.HeaderRow>
      </Table.Header>
      <Table.Body>
        <Table.Row className="is-selected">
          <Table.Cell>abc-123</Table.Cell>
          <Table.Cell>A simple thing</Table.Cell>
          <Table.Cell>A thing that is simple</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>xyz-342</Table.Cell>
          <Table.Cell>Another daily</Table.Cell>
          <Table.Cell>An average example</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>xyz-342</Table.Cell>
          <Table.Cell>Another thing</Table.Cell>
          <Table.Cell>Repeated example</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  )
}
