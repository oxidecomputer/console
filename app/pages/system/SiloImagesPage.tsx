import { Outlet } from 'react-router-dom'

import { apiQueryClient } from '@oxide/api'
import { DateCell, SizeCell, useQueryTable } from '@oxide/table'
import { EmptyMessage, Images24Icon, PageHeader, PageTitle } from '@oxide/ui'

const EmptyState = () => (
  <EmptyMessage
    icon={<Images24Icon />}
    title="No images"
    body="You need to promote an image to be able to see it here"
  />
)

SiloImagesPage.loader = async () => {
  await apiQueryClient.prefetchQuery('imageList', {
    query: { limit: 10 },
  })
  return null
}

export function SiloImagesPage() {
  const { Table, Column } = useQueryTable('imageList', {})

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Images24Icon />}>Silo Images</PageTitle>
      </PageHeader>
      <Table emptyState={<EmptyState />}>
        <Column accessor="name" />
        <Column accessor="description" />
        <Column accessor="size" cell={SizeCell} />
        <Column accessor="timeCreated" header="Created" cell={DateCell} />
      </Table>
      <Outlet />
    </>
  )
}
