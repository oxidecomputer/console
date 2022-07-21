import { useQueryTable } from '@oxide/table'

export function ExistingDisksTableSelectionField() {
  const { Table, Column } = useQueryTable('diskList', {})

  return <Table></Table>
}
