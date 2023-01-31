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

SledsTab.loader = async () => {
  await apiQueryClient.prefetchQuery('sledList', {
    query: { limit: 10 },
  })
}

export function SledsTab() {
  const { Table, Column } = useQueryTable('sledList', {}, { keepPreviousData: true })

  return (
    <>
      <Table emptyState={<EmptyState />}>
        <Column accessor="id" cell={IdCell} />
        <Column id="location" accessor={(_, index) => index} header="cubby" />
        <Column accessor="serviceAddress" header="service address" />
        <Column accessor="baseboard.part" header="part number" />
        <Column accessor="baseboard.serial" header="serial number" />
        <Column accessor="baseboard.revision" header="revision" />
      </Table>
    </>
  )
}
