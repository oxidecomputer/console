import { apiQueryClient } from '@oxide/api'
import { IdCell, useQueryTable } from '@oxide/table'
import { EmptyMessage, Racks24Icon } from '@oxide/ui'

const EmptyState = () => {
  return (
    <EmptyMessage
      icon={<Racks24Icon />}
      title="Something went wrong"
      body="We expected some racks here, but none were found"
    />
  )
}

DisksTab.loader = async () => {
  await apiQueryClient.prefetchQuery('physicalDiskList', {
    query: { limit: 10 },
  })
  return null
}

export function DisksTab() {
  const { Table, Column } = useQueryTable('physicalDiskList', {})

  return (
    <>
      <Table emptyState={<EmptyState />}>
        <Column accessor="id" cell={IdCell} />
        <Column accessor="sledId" header="sled" cell={IdCell} />
        <Column id="slot" accessor={(_, index) => index} header="slot" />
        <Column accessor="model" header="model number" />
        <Column accessor="serial" header="serial number" />
      </Table>
    </>
  )
}
