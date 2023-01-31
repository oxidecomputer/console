import type { LoaderFunctionArgs } from 'react-router-dom'

import { apiQueryClient } from '@oxide/api'
import { idCell, useIdExpandToggle, useQueryTable } from '@oxide/table'
import { EmptyMessage, Racks24Icon } from '@oxide/ui'

import { requireSledParams, useRequiredParams } from 'app/hooks'

const EmptyState = () => {
  return (
    <EmptyMessage
      icon={<Racks24Icon />}
      title="Something went wrong"
      body="We expected some racks here, but none were found"
    />
  )
}

DisksTab.loader = async ({ params }: LoaderFunctionArgs) => {
  await apiQueryClient.prefetchQuery('physicalDisksList', {
    path: requireSledParams(params),
    query: { limit: 10 },
  })
}

export function DisksTab() {
  const { sledId } = useRequiredParams('sledId')
  const [idExpanded, toggleIdExpanded] = useIdExpandToggle()

  const { Table, Column } = useQueryTable('physicalDisksList', { path: { sledId } })

  return (
    <>
      <Table emptyState={<EmptyState />}>
        <Column accessor="id" cell={idCell(idExpanded, toggleIdExpanded)} />
        <Column accessor={(_, index) => index} header="location" />
      </Table>
    </>
  )
}
