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
